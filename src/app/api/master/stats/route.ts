import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function GET() {
  try {
    const { count: usuarios } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('activo', true)
    const { data: tokensData } = await supabase.from('tokens').select('saldo')
    const tokens = tokensData?.reduce((sum, t) => sum + t.saldo, 0) || 0
    const { count: pedidosBiored } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('tipo', 'biored')
    const { count: pedidosBiotokens } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('tipo', 'biotokens')
    return NextResponse.json({ usuarios: usuarios || 0, tokens, pedidosBiored: pedidosBiored || 0, pedidosBiotokens: pedidosBiotokens || 0 })
  } catch (e) {
    return NextResponse.json({ usuarios: 0, tokens: 0, pedidosBiored: 0, pedidosBiotokens: 0 })
  }
}