import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  const { usuario_id, tipo } = await request.json()
  if (!usuario_id || !tipo) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  // Verificar que no se haya reclamado antes
  const { data: existente } = await supabase
    .from('juego_historial')
    .select('id')
    .eq('usuario_id', usuario_id)
    .eq('tipo', tipo)
    .single()

  if (existente) return NextResponse.json({ error: 'Ya reclamado' }, { status: 409 })

  // Obtener cantidad de tokens configurada
  const { data: config } = await supabase.from('configuracion').select('juego_tokens').single()
  const tokensGanados = config?.juego_tokens || 0

  // Actualizar saldo de tokens (upsert manual)
  const { data: tokenActual } = await supabase
    .from('tokens')
    .select('saldo')
    .eq('usuario_id', usuario_id)
    .single()

  const nuevoSaldo = (tokenActual?.saldo || 0) + tokensGanados
  if (tokenActual) {
    await supabase.from('tokens').update({ saldo: nuevoSaldo }).eq('usuario_id', usuario_id)
  } else {
    await supabase.from('tokens').insert({ usuario_id, saldo: tokensGanados })
  }

  // Registrar en historial_tokens
  await supabase.from('historial_tokens').insert({
    usuario_id,
    cantidad: tokensGanados,
    motivo: tipo === 'compra' ? 'Juego - por compra de productos' : 'Juego - por invitado que compra',
    fecha: new Date().toISOString(),
  })

  // Registrar en juego_historial
  await supabase.from('juego_historial').insert({
    usuario_id,
    tipo,
    tokens_recibidos: tokensGanados,
  })

  return NextResponse.json({ ok: true, tokens: tokensGanados })
}
