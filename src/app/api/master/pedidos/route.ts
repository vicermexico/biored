import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filtro = searchParams.get('filtro') || 'hoy'
  const usuario_id = searchParams.get('usuario_id')

  const ahora = new Date()
  let desde: Date | null = null

  if (filtro === 'hoy') {
    desde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  } else if (filtro === 'semana') {
    desde = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (filtro === 'mes') {
    desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
  }

  let query = supabase
    .from('pedidos')
    .select('*, usuarios(nombre, celular), detalle_pedidos(*)')
    .order('created_at', { ascending: false })

  if (desde) query = query.gte('created_at', desde.toISOString())
  if (usuario_id) query = query.eq('usuario_id', usuario_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const pedidos = (data || []).map((p: any) => ({
    ...p,
    usuario_nombre: p.usuarios?.nombre,
    usuario_celular: p.usuarios?.celular,
    items: p.detalle_pedidos || [],
  }))

  return NextResponse.json(pedidos)
}