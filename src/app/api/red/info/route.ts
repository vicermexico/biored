import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const invitado_id = searchParams.get('invitado_id')
  if (!invitado_id) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { data: invitado } = await supabase
    .from('usuarios')
    .select('nombre, celular')
    .eq('id', invitado_id)
    .single()

  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1).toISOString()

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id')
    .eq('usuario_id', invitado_id)
    .eq('estado', 'entregado')
    .gte('created_at', inicioMes)
    .lt('created_at', finMes)

  let productos_mes = 0
  if (pedidos && pedidos.length > 0) {
    const { data: detalles } = await supabase
      .from('detalle_pedidos')
      .select('cantidad')
      .in('pedido_id', pedidos.map((p: any) => p.id))
    productos_mes = (detalles || []).reduce((sum: number, d: any) => sum + (d.cantidad || 0), 0)
  }

  const tokens_generados = Math.floor(productos_mes / 12)

  return NextResponse.json({
    nombre: invitado?.nombre || '',
    celular: invitado?.celular || '',
    productos_mes,
    tokens_generados,
  })
}
