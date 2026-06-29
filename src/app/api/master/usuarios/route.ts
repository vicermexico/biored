import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
export async function GET() {
  const { data, error } = await supabase.from('usuarios').select('id, nombre, celular, correo, activo, created_at').order('created_at', { ascending: false })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}
export async function PATCH(request: Request) {
  const { id, activo } = await request.json()
  const { error } = await supabase.from('usuarios').update({ activo }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
export async function DELETE(request: Request) {
  const { id } = await request.json()
  const { error } = await supabase.from('usuarios').update({ activo: false }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  return NextResponse.json({ ok: true })
}