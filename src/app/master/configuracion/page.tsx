'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function MasterConfiguracion() {
  const [whatsapp, setWhatsapp] = useState('8112345678')
  const [guardado, setGuardado] = useState(false)

  const handleGuardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <main className='min-h-screen bg-gray-50 pb-24'>
      <div className='bg-green-700 px-6 pt-10 pb-6'>
        <h1 className='text-2xl font-bold text-white'>Configuracion</h1>
        <p className='text-green-200 text-sm'>Ajustes generales de BIORED</p>
      </div>
      <div className='px-6 py-6 flex flex-col gap-4'>
        {guardado && <p className='text-green-600 text-sm text-center font-medium bg-green-50 py-3 rounded-xl'>Guardado correctamente</p>}
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <p className='font-medium text-gray-700'>Pantalla de inicio</p>
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-gray-500'>Video de inicio (mp4, max 50mb)</label>
            <div className='border-2 border-dashed border-gray-200 rounded-xl p-6 text-center'>
              <p className='text-3xl mb-2'>🎥</p>
              <p className='text-sm text-gray-400'>Toca para subir video</p>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-gray-500'>Imagen de fondo (jpg/png, max 50mb)</label>
            <div className='border-2 border-dashed border-gray-200 rounded-xl p-6 text-center'>
              <p className='text-3xl mb-2'>🖼️</p>
              <p className='text-sm text-gray-400'>Toca para subir imagen</p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4'>
          <p className='font-medium text-gray-700'>WhatsApp de soporte</p>
          <input type='tel' value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder='Numero de WhatsApp' className='border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500' />
        </div>
        <Button onClick={handleGuardar} className='w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-6 rounded-2xl'>
          Guardar cambios
        </Button>
      </div>
    </main>
  )
}