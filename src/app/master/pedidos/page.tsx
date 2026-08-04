'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MasterPedidos() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('hoy')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { cargar() }, [filtro])

  const cargar = () => {
    setCargando(true)
    fetch('/api/master/pedidos?filtro=' + filtro)
      .then(r => r.json())
      .then(d => { setPedidos(d); setCargando(false) })
      .catch(() => setCargando(false))
  }

  const pedidosFiltrados = pedidos.filter(p =>
    p.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.usuario_celular?.includes(busqueda)
  )

  const colorEstado = (estado: string) => {
    if (estado === 'entregado') return 'bg-green-100 text-green-700'
    if (estado === 'cancelado') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-green-700 px-6 pt-10 pb-6">
        <button onClick={() => router.push('/master')} className="text-green-200 text-sm mb-2 block">Panel Master</button>
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <p className="text-green-200 text-sm">{pedidosFiltrados.length} pedidos</p>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {['hoy', 'semana', 'mes', 'todos'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize ${filtro === f ? 'bg-green-700 text-white' : 'bg-white text-gray-600'}`}>
              {f}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o celular..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 bg-white"
        />

        {cargando ? (
          <div className="bg-gray-200 rounded-2xl h-20 animate-pulse" />
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-sm">No hay pedidos</p>
          </div>
        ) : (
          pedidosFiltrados.map(p => {
            const esBiored = p.tipo === 'biored'
            const subtotal = (p.items || []).reduce((acc: number, item: any) => acc + (item.precio_unitario || 0) * item.cantidad, 0)
            const descuento = esBiored ? Math.round(subtotal * 0.40 * 100) / 100 : 0
            const total = p.total || (subtotal - descuento)

            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{p.usuario_nombre}</p>
                    <p className="text-xs text-gray-400">{p.usuario_celular}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-xl ${colorEstado(p.estado)}`}>
                    {p.estado}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="uppercase font-medium">{p.tipo}</span>
                  <span>{new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex flex-col gap-1">
                  {(p.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.nombre_producto} x{item.cantidad}</span>
                      <span className="text-gray-500">
                        {esBiored ? `$${((item.precio_unitario || 0) * item.cantidad).toFixed(2)}` : `${(item.precio_tokens_unitario || 0) * item.cantidad} tokens`}
                      </span>
                    </div>
                  ))}
                </div>
                {esBiored && (
                  <div className="border-t border-gray-100 pt-2 flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Descuento 40%</span>
                      <span>-${descuento.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {!esBiored && (
                  <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span>{p.total_tokens} tokens</span>
                  </div>
                )}
                <p className="text-xs text-gray-400">Sucursal: {p.sucursal_nombre || 'N/A'}</p>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}