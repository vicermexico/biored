import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json([], { status: 400 })

  const { data, error } = await supabase
    .from('historial_tokens')
    .select('id, motivo, cantidad, fecha')
    .eq('usuario_id', usuario_id)
    .order('fecha', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data || [])
}
