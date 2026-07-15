import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  const { usuario_id, tipo } = await request.json()
  if (!usuario_id || !tipo) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data: config } = await supabase.from('configuracion').select('juego_tokens, juego_por_compra_cantidad').single()
  const tokensGanados = config?.juego_tokens || 0

  const { data: tokenActual } = await supabase.from('tokens').select('saldo').eq('usuario_id', usuario_id).single()
  const nuevoSaldo = (tokenActual?.saldo || 0) + tokensGanados

  if (tokenActual) {
    await supabase.from('tokens').update({ saldo: nuevoSaldo }).eq('usuario_id', usuario_id)
  } else {
    await supabase.from('tokens').insert({ usuario_id, saldo: tokensGanados })
  }

  await supabase.from('historial_tokens').insert({
    usuario_id,
    cantidad: tokensGanados,
    motivo: tipo === 'compra' ? 'Juego - por compra de productos' : 'Juego - por invitado que compra',
    fecha: new Date().toISOString(),
  })

  await supabase.from('juego_historial').insert({
    usuario_id,
    tipo,
    tokens_recibidos: tokensGanados,
  })

  return NextResponse.json({ ok: true, tokens: tokensGanados, nuevoSaldo })
}