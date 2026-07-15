'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MasterTragamonedas() {
  const router = useRouter()
  const [config, setConfig] = useState<any>(null)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [subiendo, setSubiendo] = useState('')
  const inputNoGanadorRef = useRef<HTMLInputElement>(null)
  const inputGanadorRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/tragamonedas').then(r => r.json()).then(d => setConfig(d))
  }, [])

  const subirVideo = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'ganador' | 'no_ganador') => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendo(tipo)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', 'tragamonedas')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      if (tipo === 'no_ganador') {
        const lista = [...(config.videos_no_ganador || []), data.url]
        setConfig((c: any) => ({ ...c, videos_no_ganador: lista }))
      } else {
        const lista = [...(config.videos_ganador || []), data.url]
        setConfig((c: any) => ({ ...c, videos_ganador: lista }))
      }
    }
    setSubiendo('')
  }

  const eliminarVideo = (tipo: 'ganador' | 'no_ganador', idx: number) => {
    if (tipo === 'no_ganador') {
      const lista = (config.videos_no_ganador || []).filter((_: any, i: number) => i !== idx)
      setConfig((c: any) => ({ ...c, videos_no_ganador: lista }))
    } else {
      const lista = (config.videos_ganador || []).filter((_: any, i: number) => i !== idx)
      setConfig((c: any) => ({ ...c, videos_ganador: lista }))
    }
  }

  const handleGuardar = async () => {
    setGuardando(true)
    await fetch('/api/tragamonedas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  if (!config) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Cargando...</p></div>

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-green-700 px-6 pt-10 pb-6">
        <button onClick={() => router.push('/master')} className="text-green-200 text-sm mb-2 block">Panel Master</button>
        <h1 className="text-2xl font-bold text-white">Tragamonedas</h1>
        <p className="text-green-200 text-sm">Configuracion del juego</p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-4">
        {guardado && <p className="text-green-600 text-sm text-center font-medium bg-green-50 py-3 rounded-xl">Guardado correctamente</p>}

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700">Estado</p>
            <button onClick={() => setConfig({ ...config, activo: !config.activo })} className={`px-4 py-2 rounded-xl text-sm font-medium ${config.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {config.activo ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Jugadas globales para ganar</label>
            <input type="number" min={1} value={config.jugadas_para_ganar} onChange={e => setConfig({ ...config, jugadas_para_ganar: parseInt(e.target.value) || 1 })} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Tiradas por evento</label>
            <input type="number" min={1} max={10} value={config.tiradas_por_evento || 1} onChange={e => setConfig({ ...config, tiradas_por_evento: parseInt(e.target.value) || 1 })} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Tokens del premio</label>
            <input type="number" min={1} value={config.tokens_premio} onChange={e => setConfig({ ...config, tokens_premio: parseInt(e.target.value) || 1 })} className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Jugadas actuales: <span className="font-bold text-gray-700">{config.jugadas_actuales}</span> / {config.jugadas_para_ganar}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p className="font-medium text-gray-700">Videos NO ganadores</p>
          <p className="text-xs text-gray-400">Se muestran en random cuando el usuario no gana</p>
          <input ref={inputNoGanadorRef} type="file" accept="video/mp4" className="hidden" onChange={e => subirVideo(e, 'no_ganador')} />
          <button onClick={() => inputNoGanadorRef.current?.click()} disabled={subiendo === 'no_ganador'} className="bg-gray-700 text-white text-sm px-4 py-2 rounded-xl font-medium disabled:opacity-50">
            {subiendo === 'no_ganador' ? 'Subiendo...' : '+ Subir video no ganador'}
          </button>
          {(config.videos_no_ganador || []).map((url: string, i: number) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600">Video {i + 1}</p>
              <button onClick={() => eliminarVideo('no_ganador', i)} className="text-red-400 text-xs font-medium">Eliminar</button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p className="font-medium text-gray-700">Videos GANADORES</p>
          <p className="text-xs text-gray-400">Se muestran cuando el usuario gana, sin repetir</p>
          <input ref={inputGanadorRef} type="file" accept="video/mp4" className="hidden" onChange={e => subirVideo(e, 'ganador')} />
          <button onClick={() => inputGanadorRef.current?.click()} disabled={subiendo === 'ganador'} className="bg-green-700 text-white text-sm px-4 py-2 rounded-xl font-medium disabled:opacity-50">
            {subiendo === 'ganador' ? 'Subiendo...' : '+ Subir video ganador'}
          </button>
          {(config.videos_ganador || []).map((url: string, i: number) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-600">Video ganador {i + 1}</p>
              <button onClick={() => eliminarVideo('ganador', i)} className="text-red-400 text-xs font-medium">Eliminar</button>
            </div>
          ))}
        </div>

        <Button onClick={handleGuardar} disabled={guardando || !!subiendo} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl">
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </main>
  )
}