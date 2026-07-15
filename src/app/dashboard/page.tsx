'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NavBar from '@/components/NavBar'
import VideoInformativoModal from '@/components/VideoInformativoModal'

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null)
  const [tokens, setTokens] = useState(0)
  const [videos, setVideos] = useState<any[]>([])
  const [mostrarVideos, setMostrarVideos] = useState(false)
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

    const yaVioVideos = sessionStorage.getItem('videos_vistos_' + usr.id)
    if (!yaVioVideos) {
      fetch('/api/videos-informativos?usuario_id=' + usr.id).then(r => r.json()).then(d => {
        if (d.length > 0) {
          setVideos(d)
          setMostrarVideos(true)
          sessionStorage.setItem('videos_informativos_activos', '1')
        }
      }).catch(() => {})
    }
  }, [])

  const handleTerminarVideos = () => {
    setMostrarVideos(false)
    if (usuario) sessionStorage.setItem('videos_vistos_' + usuario.id, '1')
    sessionStorage.removeItem('videos_informativos_activos')
    window.dispatchEvent(new CustomEvent('biored:videos-informativos-terminados'))
  }

  const handleSalir = () => {
    if (confirm('Seguro que quieres cerrar sesion?')) {
      localStorage.removeItem('usuario')
      localStorage.removeItem('carrito')
      sessionStorage.clear()
      router.push('/')
    }
  }

  if (!usuario) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Cargando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {mostrarVideos && videos.length > 0 && (
        <VideoInformativoModal
          videos={videos}
          usuario_id={usuario.id}
          onTerminar={handleTerminarVideos}
        />
      )}

      <div className="bg-green-700 px-6 pt-10 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Hola, {usuario.nombre}</h1>
          <p className="text-green-200 text-sm">Bienvenido a BIORED</p>
        </div>
        <button onClick={handleSalir} className="bg-white text-green-700 font-bold px-4 py-2 rounded-xl text-sm">Salir</button>
      </div>
      <div className="px-6 py-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
            <p className="text-xs text-gray-400">Mis Tokens</p>
            <p className="text-3xl font-bold text-green-700">{tokens}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
            <p className="text-xs text-gray-400">Invitados activos</p>
            <p className="text-3xl font-bold text-green-700">0</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-3">Pedidos recientes</p>
          <p className="text-sm text-gray-400 text-center py-4">Aun no tienes pedidos</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/catalogo">
            <Button className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl">Catalogo BIORED</Button>
          </Link>
          <Link href="/biotokens">
            <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-2xl">Catalogo BioTokens</Button>
          </Link>
        </div>
      </div>
      <NavBar />
    </main>
  )
}