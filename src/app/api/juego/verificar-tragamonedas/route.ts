import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json({ aplica: false })

  const { data: config } = await supabase.from('tragamonedas_config').select('*').eq('id', 1).single()
  if (!config || !config.activo) return NextResponse.json({ aplica: false })

  const { data: configJuego } = await supabase.from('configuracion').select('juego_por_compra_cantidad').single()
  const productosRequeridos = configJuego?.juego_por_compra_cantidad || 12

  const { data: pedidos } = await supabase
    .from('pedidos').select('id')
    .eq('usuario_id', usuario_id)
    .eq('estado', 'entregado')
    .eq('tipo', 'biored')

  let totalProductos = 0
  if (pedidos && pedidos.length > 0) {
    const { data: detalles } = await supabase
      .from('detalle_pedidos').select('cantidad')
      .in('pedido_id', pedidos.map((p: any) => p.id))
    totalProductos = (detalles || []).reduce((sum: number, d: any) => sum + d.cantidad, 0)
  }

  const { data: historial } = await supabase
    .from('juego_historial').select('id')
    .eq('usuario_id', usuario_id)
    .in('tipo', ['compra', 'tragamonedas'])

  const tirosUsados = historial?.length || 0
  const tirosCorresponden = Math.floor(totalProductos / productosRequeridos)

  if (tirosCorresponden > tirosUsados) {
    return NextResponse.json({ aplica: true })
  }

  return NextResponse.json({ aplica: false })
}