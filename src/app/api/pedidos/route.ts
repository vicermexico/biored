import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json([], { status: 400 })
  const { data, error } = await supabase.from('pedidos').select('*, detalle_pedidos(*)').eq('usuario_id', usuario_id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { usuario_id, tipo, sucursal_id, sucursal_nombre, items, total, total_tokens } = await request.json()
  const nip_entrega = Math.floor(1000 + Math.random() * 9000).toString()
  const { data: pedido, error } = await supabase.from('pedidos').insert({ usuario_id, tipo, sucursal_id, sucursal_nombre, nip_entrega, estado: 'pendiente', total, total_tokens }).select().single()
  if (error) return NextResponse.json({ error: error.message, details: error.details }, { status: 500 })
  const detalles = items.map((item: any) => ({ pedido_id: pedido.id, producto_id: item.id, tipo, nombre_producto: item.nombre, cantidad: item.cantidad, precio_unitario: item.precio, precio_tokens_unitario: item.precio_tokens }))
  const { error: errorDetalle } = await supabase.from('detalle_pedidos').insert(detalles)
  if (errorDetalle) return NextResponse.json({ error: errorDetalle.message }, { status: 500 })

  // Notificación a drbioescaner.com — espera máximo 3s, si tarda más o falla igual retorna el pedido
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('nombre, celular')
      .eq('id', usuario_id)
      .single()

    const productos = detalles.map((d: any) => ({ nombre: d.nombre_producto, cantidad: d.cantidad }))

    await Promise.race([
      fetch('https://drbioescaner.com/api/integracion/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.DRBIOESCANER_API_KEY! },
        body: JSON.stringify({
          pedido_id: String(pedido.numero).padStart(4, '0'),
          usuario_nombre: usuario?.nombre ?? '',
          usuario_celular: usuario?.celular ?? '',
          sucursal_id,
          productos,
          total,
          tipo,
          nip_entrega,
        }),
      }),
      new Promise(resolve => setTimeout(resolve, 3000)),
    ])
  } catch (e) {
    console.error('[drbioescaner] Error notificando pedido:', e)
  }

  return NextResponse.json(pedido)
}
