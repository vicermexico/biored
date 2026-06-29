import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
  const { data, error } = await supabase.from('productos_biored').insert({ nombre: 'Test', precio: 100, activo: true }).select().single()
  return NextResponse.json({ data, error })
}