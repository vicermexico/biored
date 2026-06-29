import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json([], { status: 400 })
  const { data, error } = await supabase.from('red_afiliados').select('usuario_id, usuarios!red_afiliados_usuario_id_fkey(id, nombre, celular, activo)').eq('referidor_id', usuario_id)
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}
