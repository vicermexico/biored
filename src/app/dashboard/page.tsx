'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/NavBar'
import JuegoModal from '@/components/JuegoModal'

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null)
  const [tokens, setTokens] = useState(0)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [juego, setJuego] = useState<{ video_url: string; tokens: number; tipo: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) { router.push('/login'); return }
    const usr = JSON.parse(u)
    setUsuario(usr)
    fetch('/api/tokens/saldo?usuario_id=' + usr.id).then(r => r.json()).then(d => setTokens(d.saldo || 0)).catch(() => {})
    fetch('/api/auth/perfil?id=' + usr.id).then(r => r.json()).then(d => {
      if (d.usuario) {
        setUsuario(d.usuario)
        localStorage.setItem('usuario', JSON.stringify(d.usuario))
      }
    }).catch(() => {})
    fetch('/api/pedidos?usuario_id=' + usr.id).then(r => r.json()).then(d => setPedidos(Array.isArray(d) ? d : [])).catch(() => {})

    if (!sessionStorage.getItem('juego_visto')) {
      fetch('/api/juego/verificar?usuario_id=' + usr.id)
        .then(r => r.json())
        .then(d => { if (d.aplica) setJuego({ video_url: d.video_url, tokens: d.tokens, tipo: d.tipo }) })
        .catch(() => {})
    }
  }, [])

  const handleCerrarJuego = () => {
    sessionStorage.setItem('juego_visto', '1')
    setJuego(null)
    const u = localStorage.getItem('usuario')
    if (u) {
      const usr = JSON.parse(u)
      fetch('/api/tokens/saldo?usuario_id=' + usr.id)
        .then(r => r.json())
        .then(d => setTokens(d.saldo || 0))
        .catch(() => {})
    }
  }

  const count = (estado: string) => pedidos.filter(p => p.estado === estado).length

  if (!usuario) return <div className='min-h-screen flex items-center justify-center'><p className='text-gray-400'>Cargando...</p></div>
  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      {juego && (
        <JuegoModal
          video_url={juego.video_url}
          tokens={juego.tokens}
          tipo={juego.tipo}
          usuario_id={usuario.id}
          onCerrar={handleCerrarJuego}
        />
      )}
      <div className='bg-gray-900 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Hola, {usuario.nombre}</h1>
        <p className='text-gray-300 text-sm'>Bienvenido a BIORED</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-red-50 rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-500'>Mis Tokens</p>
            <p className='text-3xl font-bold text-gray-900'>{tokens}</p>
          </div>
          <div className='bg-yellow-50 rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-500'>Sin recoger</p>
            <p className='text-3xl font-bold text-gray-900'>{count('pendiente')}</p>
          </div>
          <div className='bg-yellow-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-500'>Listos para recoger</p>
            <p className='text-3xl font-bold text-gray-900'>{count('separado')}</p>
          </div>
          <div className='bg-green-50 rounded-2xl p-4 flex flex-col gap-1 shadow-sm'>
            <p className='text-xs text-gray-500'>Entregados</p>
            <p className='text-3xl font-bold text-gray-900'>{count('entregado')}</p>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <Link href='/catalogo'>
            <Button className='w-full bg-gray-900 hover:bg-black text-white font-semibold py-6 rounded-2xl'>Catalogo BIORED</Button>
          </Link>
          <Link href='/biotokens'>
            <Button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl'>Catalogo BioTokens</Button>
          </Link>
        </div>
      </div>
      <NavBar />
    </main>
  )
}
