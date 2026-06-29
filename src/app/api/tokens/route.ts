import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json({ saldo: 0 }, { status: 400 })
  const { data, error } = await supabase.from('tokens').select('saldo').eq('usuario_id', usuario_id).single()
  if (error) return NextResponse.json({ saldo: 0 })
  return NextResponse.json({ saldo: data.saldo })
}