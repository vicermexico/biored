import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  const { data } = await supabase.from('tragamonedas_config').select('*').eq('id', 1).single()
  return NextResponse.json(data || {})
}

export async function PATCH(request: Request) {
  const { activo, jugadas_para_ganar, tokens_premio } = await request.json()
  const { error } = await supabase.from('tragamonedas_config').update({ activo, jugadas_para_ganar, tokens_premio }).eq('id', 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const { usuario_id } = await request.json()
  if (!usuario_id) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data: config } = await supabase.from('tragamonedas_config').select('*').eq('id', 1).single()
  if (!config || !config.activo) return NextResponse.json({ error: 'Tragamonedas no activa' }, { status: 400 })

  const { data: configJuego } = await supabase.from('configuracion').select('juego_por_compra_cantidad').single()
  const productosRequeridos = configJuego?.juego_por_compra_cantidad || 12

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

  const { data: historial } = await supabase
    .from('juego_historial')
    .select('id')
    .eq('usuario_id', usuario_id)
    .in('tipo', ['compra', 'tragamonedas'])

  const tirosUsados = historial?.length || 0
  const tirosCorresponden = Math.floor(totalProductos / productosRequeridos)

  if (tirosUsados >= tirosCorresponden) {
    return NextResponse.json({ error: 'Ya usaste tu tiro' }, { status: 400 })
  }

  const jugadas_actuales = config.jugadas_actuales + 1
  const gano = jugadas_actuales >= config.jugadas_para_ganar
  const nuevasJugadas = gano ? 0 : jugadas_actuales

  const { error: updateError } = await supabase
    .from('tragamonedas_config')
    .update({ jugadas_actuales: nuevasJugadas })
    .eq('id', 1)
    .eq('jugadas_actuales', config.jugadas_actuales)

  if (updateError) {
    return NextResponse.json({ gano: false, jugada_numero: jugadas_actuales })
  }

  const tokensGanados = gano ? config.tokens_premio : 0
  let nuevoSaldo = 0

  if (gano) {
    const { data: tokenActual } = await supabase.from('tokens').select('saldo').eq('usuario_id', usuario_id).single()
    nuevoSaldo = (tokenActual?.saldo || 0) + tokensGanados
    await supabase.from('tokens').update({ saldo: nuevoSaldo }).eq('usuario_id', usuario_id)
    await supabase.from('historial_tokens').insert({
      usuario_id,
      cantidad: tokensGanados,
      motivo: 'Tragamonedas - premio',
      fecha: new Date().toISOString()
    })
  }

  await supabase.from('juego_historial').insert({
    usuario_id,
    tipo: 'tragamonedas',
    tokens_recibidos: tokensGanados,
  })

  await supabase.from('tragamonedas_historial').insert({
    usuario_id,
    gano,
    tokens_ganados: tokensGanados,
    jugada_numero: jugadas_actuales
  })

  return NextResponse.json({ gano, tokens_ganados: tokensGanados, jugada_numero: jugadas_actuales, nuevoSaldo: gano ? nuevoSaldo : undefined })
}