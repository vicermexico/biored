import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  const { data } = await supabase.from('tragamonedas_config').select('*').eq('id', 1).single()
  return NextResponse.json(data || {})
}

export async function PATCH(request: Request) {
  const { activo, jugadas_para_ganar, tokens_premio, tiradas_por_evento, videos_no_ganador, videos_ganador } = await request.json()
  const { error } = await supabase.from('tragamonedas_config').update({ activo, jugadas_para_ganar, tokens_premio, tiradas_por_evento, videos_no_ganador, videos_ganador }).eq('id', 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const { usuario_id, tirada_oficial } = await request.json()
  if (!usuario_id) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data: config } = await supabase.from('tragamonedas_config').select('*').eq('id', 1).single()
  if (!config || !config.activo) return NextResponse.json({ error: 'Tragamonedas no activa' }, { status: 400 })

  if (!tirada_oficial) {
    const videos_no_ganador = config.videos_no_ganador || []
    const video_url = videos_no_ganador.length > 0 ? videos_no_ganador[Math.floor(Math.random() * videos_no_ganador.length)] : ''
    return NextResponse.json({ gano: false, oficial: false, video_url })
  }

  const { data: configJuego } = await supabase.from('configuracion').select('juego_por_compra_cantidad').single()
  const productosRequeridos = configJuego?.juego_por_compra_cantidad || 12

  const { data: pedidos } = await supabase.from('pedidos').select('id').eq('usuario_id', usuario_id).eq('estado', 'entregado').eq('tipo', 'biored')

  let totalProductos = 0
  if (pedidos && pedidos.length > 0) {
    const { data: detalles } = await supabase.from('detalle_pedidos').select('cantidad').in('pedido_id', pedidos.map((p: any) => p.id))
    totalProductos = (detalles || []).reduce((sum: number, d: any) => sum + d.cantidad, 0)
  }

  const { data: historial } = await supabase.from('juego_historial').select('id').eq('usuario_id', usuario_id).in('tipo', ['compra', 'tragamonedas'])
  const tirosUsados = historial?.length || 0
  const tirosCorresponden = Math.floor(totalProductos / productosRequeridos)

  if (tirosUsados >= tirosCorresponden) {
    const videos_no_ganador = config.videos_no_ganador || []
    const video_url = videos_no_ganador.length > 0 ? videos_no_ganador[Math.floor(Math.random() * videos_no_ganador.length)] : ''
    return NextResponse.json({ gano: false, oficial: true, video_url })
  }

  const jugadas_actuales = config.jugadas_actuales + 1
  const gano = jugadas_actuales >= config.jugadas_para_ganar
  const nuevasJugadas = gano ? 0 : jugadas_actuales

  const { error: updateError } = await supabase.from('tragamonedas_config').update({ jugadas_actuales: nuevasJugadas }).eq('id', 1).eq('jugadas_actuales', config.jugadas_actuales)

  if (updateError) {
    const videos_no_ganador = config.videos_no_ganador || []
    const video_url = videos_no_ganador.length > 0 ? videos_no_ganador[Math.floor(Math.random() * videos_no_ganador.length)] : ''
    return NextResponse.json({ gano: false, oficial: true, video_url })
  }

  const tokensGanados = gano ? config.tokens_premio : 0
  let nuevoSaldo = 0
  let video_url = ''

  if (gano) {
    const videos_ganador = config.videos_ganador || []
    const usados = config.videos_ganador_usados || []
    const disponibles = videos_ganador.filter((v: string) => !usados.includes(v))
    const lista = disponibles.length > 0 ? disponibles : videos_ganador
    video_url = lista[Math.floor(Math.random() * lista.length)] || ''
    const nuevosUsados = disponibles.length > 1 ? [...usados, video_url] : []
    await supabase.from('tragamonedas_config').update({ videos_ganador_usados: nuevosUsados }).eq('id', 1)

    const { data: tokenActual } = await supabase.from('tokens').select('saldo').eq('usuario_id', usuario_id).single()
    nuevoSaldo = (tokenActual?.saldo || 0) + tokensGanados
    await supabase.from('tokens').update({ saldo: nuevoSaldo }).eq('usuario_id', usuario_id)
    await supabase.from('historial_tokens').insert({ usuario_id, cantidad: tokensGanados, motivo: 'Tragamonedas - premio', fecha: new Date().toISOString() })
  } else {
    const videos_no_ganador = config.videos_no_ganador || []
    video_url = videos_no_ganador.length > 0 ? videos_no_ganador[Math.floor(Math.random() * videos_no_ganador.length)] : ''
  }

  await supabase.from('juego_historial').insert({ usuario_id, tipo: 'tragamonedas', tokens_recibidos: tokensGanados })
  await supabase.from('tragamonedas_historial').insert({ usuario_id, gano, tokens_ganados: tokensGanados, jugada_numero: jugadas_actuales })

  return NextResponse.json({ gano, oficial: true, tokens_ganados: tokensGanados, video_url, nuevoSaldo: gano ? nuevoSaldo : undefined })
}