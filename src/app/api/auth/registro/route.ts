import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  try {
    const { nombre, celular, correo, nip, ref } = await request.json()
    if (!nombre || !celular || !nip) return NextResponse.json({ error: 'Nombre, celular y NIP requeridos' }, { status: 400 })
    if (nip.length !== 4) return NextResponse.json({ error: 'NIP debe ser de 4 digitos' }, { status: 400 })
    const { data: existe } = await supabase.from('usuarios').select('id').eq('celular', celular).single()
    if (existe) return NextResponse.json({ error: 'Este celular ya esta registrado' }, { status: 409 })
    const nip_hash = await bcrypt.hash(nip, 10)
    const { data: usuario, error } = await supabase.from('usuarios').insert({ nombre, celular, correo: correo || null, nip_hash }).select().single()
    if (error) return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    if (ref) {
      const { data: invitador } = await supabase.from('usuarios').select('id').eq('id', ref).single()
      if (invitador) await supabase.from('red_afiliados').insert({ usuario_id: usuario.id, referidor_id: invitador.id })
    }
    await supabase.from('tokens').insert({ usuario_id: usuario.id, saldo: 0 })
    return NextResponse.json({ usuario: { id: usuario.id, nombre: usuario.nombre, celular: usuario.celular } })
  } catch (e) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
