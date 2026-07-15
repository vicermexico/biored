import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json({ aplica: false }, { status: 400 })

  const { data: config } = await supabase.from('configuracion').select('*').single()
  if (!config) return NextResponse.json({ aplica: false })

  const video_url = config.juego_video_url || ''
  const tokens = config.juego_tokens || 0

  // Condicion 1: por compra acumulada de productos
  if (config.juego_por_compra_activo) {
    const cantidad_requerida = config.juego_por_compra_cantidad || 0

    if (!cantidad_requerida) {
      return NextResponse.json({ aplica: true, tipo: 'compra', video_url, tokens })
    }

    // Total de productos entregados del usuario
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('estado', 'entregado')
      .eq('tipo', 'biored')

    let totalProductos = 0
    if (pedidos && pedidos.length > 0) {
      const { data: detalles } = await supabase
        .from('detalle_pedidos')
        .select('cantidad')
        .in('pedido_id', pedidos.map((p: any) => p.id))
      totalProductos = (detalles || []).reduce((sum: number, d: any) => sum + d.cantidad, 0)
    }

    // Cuantas ruletas ya se dieron por compra
    const { data: historial } = await supabase
      .from('juego_historial')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('tipo', 'compra')

    const ruletasDadas = historial?.length || 0
    const ruletasCorresponden = Math.floor(totalProductos / cantidad_requerida)

    if (ruletasCorresponden > ruletasDadas) {
      return NextResponse.json({ aplica: true, tipo: 'compra', video_url, tokens })
    }
  }

  // Condicion 2: por invitado que compra por primera vez
  if (config.juego_por_invitado_activo) {
    const { data: yaReclamado } = await supabase
      .from('juego_historial')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('tipo', 'invitado')
      .single()

    if (!yaReclamado) {
      const { data: invitados } = await supabase
        .from('red_afiliados')
        .select('usuario_id')
        .eq('referidor_id', usuario_id)

      if (invitados && invitados.length > 0) {
        for (const invitado of invitados) {
          const { data: pedidosInvitado } = await supabase
            .from('pedidos')
            .select('id')
            .eq('usuario_id', invitado.usuario_id)
            .eq('estado', 'entregado')

          if (pedidosInvitado && pedidosInvitado.length > 0) {
            const { data: detalles } = await supabase
              .from('detalle_pedidos')
              .select('cantidad')
              .in('pedido_id', pedidosInvitado.map((p: any) => p.id))
            const total = (detalles || []).reduce((sum: number, d: any) => sum + d.cantidad, 0)
            if (total >= 6) {
              return NextResponse.json({ aplica: true, tipo: 'invitado', video_url, tokens })
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ aplica: false })
}