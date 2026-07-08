import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function PATCH(request: Request, ctx: RouteContext<'/api/pedidos/[id]'>) {
  const { id } = await ctx.params
  const { estado } = await request.json()

  // Busca por UUID primero; si no encuentra, busca por numero secuencial
  let { data: existente } = await supabase
    .from('pedidos')
    .select('id')
    .eq('id', id)
    .single()

  if (!existente) {
    const numero = parseInt(id, 10)
    if (!isNaN(numero)) {
      const { data } = await supabase
        .from('pedidos')
        .select('id')
        .eq('numero', numero)
        .single()
      existente = data
    }
  }

  if (!existente) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .update({ estado })
    .eq('id', existente.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(pedido)
}
