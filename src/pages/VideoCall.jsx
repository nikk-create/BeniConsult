import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Camera, CameraOff, ChevronLeft } from 'lucide-react'

export default function VideoCall() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [joined, setJoined] = useState(false)
  const roomName = `beniconsult-${appointmentId}`

  if (!joined) return (
    <div className="min-h-dvh bg-gray-900 flex flex-col items-center justify-center px-6 text-white">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-6 text-4xl">📹</div>
      <h1 className="font-heading font-bold text-xl mb-1">Consultation vidéo</h1>
      <p className="text-sm text-gray-400 mb-8 text-center">Vérifiez vos paramètres avant de rejoindre</p>
      <div className="flex gap-5 mb-10">
        <button onClick={() => setMicOn(m=>!m)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${micOn?'bg-gray-700':'bg-accent'}`}>
          {micOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
        </button>
        <button onClick={() => setCamOn(c=>!c)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${camOn?'bg-gray-700':'bg-accent'}`}>
          {camOn ? <Camera className="w-7 h-7" /> : <CameraOff className="w-7 h-7" />}
        </button>
      </div>
      <button onClick={() => setJoined(true)}
        className="w-full max-w-xs bg-primary text-white py-3.5 rounded-xl font-heading font-semibold hover:bg-primary-dark transition-colors">
        Rejoindre la consultation
      </button>
    </div>
  )

  return (
    <div className="h-dvh">
      <iframe
        src={`https://meet.jit.si/${roomName}#userInfo.displayName="BéniConsult"&config.startWithAudioMuted=${!micOn}&config.startWithVideoMuted=${!camOn}&interfaceConfig.SHOW_JITSI_WATERMARK=false`}
        allow="camera; microphone; fullscreen; display-capture"
        className="w-full h-full border-0"
        title="Consultation vidéo BéniConsult"
      />
    </div>
  )
}
