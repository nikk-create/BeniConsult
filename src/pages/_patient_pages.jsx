// ═══════════════════════════════════════════
// pages/Appointments.jsx
// ═══════════════════════════════════════════
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import AppointmentCard from '@/components/AppointmentCard'

export function Appointments() {
  const { user } = useAuth()
  const [appts, setAppts] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('appointments').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAppts(data||[]); setLoading(false) })
  }, [user.id])

  const upcoming = appts.filter(a => ['en_attente','confirmé'].includes(a.status))
  const history  = appts.filter(a => ['terminé','annulé'].includes(a.status))
  const list = tab === 'upcoming' ? upcoming : history

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Mes consultations</h1>
      <div className="flex gap-2 mb-5">
        {[['upcoming','À venir'],['history','Historique']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${tab===k ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground'}`}>
            {l} {k==='upcoming'?`(${upcoming.length})`:`(${history.length})`}
          </button>
        ))}
      </div>
      {loading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-28 bg-card rounded-2xl border animate-pulse" />)}</div>
       : list.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-2xl mb-2">{tab==='upcoming'?'📅':'📋'}</p>
          <p className="text-sm text-muted-foreground">{tab==='upcoming'?'Aucune consultation à venir.':'Aucun historique.'}</p>
        </div>
       ) : (
        <div className="space-y-3">
          {list.map((a,i) => <motion.div key={a.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}><AppointmentCard appt={a} /></motion.div>)}
        </div>
       )}
    </div>
  )
}

// ═══════════════════════════════════════════
// pages/Messages.jsx
// ═══════════════════════════════════════════
import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

export function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('appointments').select('*').eq('patient_id', user.id).eq('status','confirmé')
      .order('created_at', { ascending:false })
      .then(({ data }) => { setAppts(data||[]); setLoading(false) })
  }, [user.id])

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Messages</h1>
      {loading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-20 bg-card rounded-2xl border animate-pulse" />)}</div>
       : appts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">Aucune consultation active.</p>
        </div>
       ) : appts.map(a => (
        <button key={a.id} onClick={() => navigate(`/chat/${a.id}`)}
          className="w-full bg-card rounded-2xl border border-border p-4 mb-3 text-left hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-heading font-bold text-sm text-primary">
              {a.doctor_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{a.doctor_name}</p>
              <p className="text-xs text-muted-foreground">{a.doctor_specialty} · {a.date}</p>
            </div>
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
        </button>
       ))}
    </div>
  )
}

// ═══════════════════════════════════════════
// pages/Profile.jsx
// ═══════════════════════════════════════════
import { UserCircle, CreditCard, FolderHeart, LogOut, ChevronRight } from 'lucide-react'

export function Profile() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [apptCount, setApptCount] = useState(0)
  const [spent, setSpent] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    supabase.from('appointments').select('id').eq('patient_id', user.id).eq('status','terminé')
      .then(({ data }) => setApptCount(data?.length||0))
    supabase.from('payments').select('amount_fcfa').eq('patient_id', user.id).eq('status','succès')
      .then(({ data }) => setSpent((data||[]).reduce((s,p)=>s+(p.amount_fcfa||0),0)))
  }, [user.id])

  const menu = [
    { label:'Dossier médical', Icon:FolderHeart, to:'/dossier-medical', color:'text-primary' },
    { label:'Historique paiements', Icon:CreditCard, to:'/paiements', color:'text-secondary-dark' },
  ]

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Carte profil */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-heading font-bold text-xl">
            {profile?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <p className="font-heading font-bold text-lg">{profile?.full_name}</p>
            <p className="text-sm opacity-80">{profile?.email}</p>
            {profile?.phone && <p className="text-xs opacity-70">{profile.phone}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="font-heading font-bold text-xl">{apptCount}</p>
            <p className="text-xs opacity-80">Consultations</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="font-heading font-bold text-base">{spent.toLocaleString('fr-FR')} F</p>
            <p className="text-xs opacity-80">Dépensés</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-card rounded-2xl border border-border divide-y divide-border mb-4">
        {menu.map(({ label, Icon, to, color }) => (
          <button key={to} onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="flex-1 text-sm font-medium text-left">{label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button onClick={() => { signOut(); navigate('/connexion') }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent/5 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/10 transition-colors">
        <LogOut className="w-4 h-4" /> Se déconnecter
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════
// pages/Payments.jsx
// ═══════════════════════════════════════════
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function Payments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payments').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending:false })
      .then(({ data }) => { setPayments(data||[]); setLoading(false) })
  }, [user.id])

  const icons = { succès:<CheckCircle className="w-4 h-4 text-primary" />, echec:<XCircle className="w-4 h-4 text-accent" />, en_attente:<Clock className="w-4 h-4 text-secondary-dark" /> }

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Paiements</h1>
      {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-card rounded-2xl border animate-pulse" />)}</div>
       : payments.length === 0 ? (
        <div className="bg-card rounded-2xl border p-8 text-center text-sm text-muted-foreground">Aucun paiement.</div>
       ) : (
        <div className="space-y-2.5">
          {payments.map(p => (
            <div key={p.id} className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">{icons[p.status]||icons.en_attente}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{(p.amount_fcfa||0).toLocaleString('fr-FR')} FCFA</p>
                <p className="text-xs text-muted-foreground">{p.method?.toUpperCase()} · {new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                ${p.status==='succès'?'bg-primary/10 text-primary':p.status==='echec'?'bg-accent/10 text-accent':'bg-secondary/20 text-secondary-dark'}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
       )}
    </div>
  )
}

// ═══════════════════════════════════════════
// pages/VideoCall.jsx
// ═══════════════════════════════════════════
import { useState } from 'react'
import { Mic, MicOff, Camera, CameraOff } from 'lucide-react'

export function VideoCall() {
  const { appointmentId } = (() => { const { useParams } = require('react-router-dom'); return useParams() })()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [joined, setJoined] = useState(false)
  const roomName = `beniconsult-${appointmentId}`

  if (!joined) return (
    <div className="min-h-dvh bg-gray-900 flex flex-col items-center justify-center px-6 text-white">
      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-6 text-3xl">📹</div>
      <h1 className="font-heading font-bold text-xl mb-2">Consultation vidéo</h1>
      <p className="text-sm text-gray-400 mb-8 text-center">Vérifiez vos paramètres avant de rejoindre</p>
      <div className="flex gap-4 mb-8">
        <button onClick={() => setMicOn(m=>!m)} className={`w-14 h-14 rounded-full flex items-center justify-center ${micOn?'bg-gray-700':'bg-accent'}`}>
          {micOn?<Mic className="w-6 h-6"/>:<MicOff className="w-6 h-6"/>}
        </button>
        <button onClick={() => setCamOn(c=>!c)} className={`w-14 h-14 rounded-full flex items-center justify-center ${camOn?'bg-gray-700':'bg-accent'}`}>
          {camOn?<Camera className="w-6 h-6"/>:<CameraOff className="w-6 h-6"/>}
        </button>
      </div>
      <button onClick={() => setJoined(true)} className="w-full max-w-xs bg-primary text-white py-3.5 rounded-xl font-heading font-semibold text-sm hover:bg-primary-dark transition-colors">
        Rejoindre la consultation
      </button>
    </div>
  )

  return (
    <div className="h-dvh">
      <iframe
        src={`https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent('Patient')}"&config.startWithAudioMuted=${!micOn}&config.startWithVideoMuted=${!camOn}`}
        allow="camera; microphone; fullscreen; display-capture"
        className="w-full h-full border-0"
      />
    </div>
  )
}

export default { Appointments, Messages, Profile, Payments, VideoCall }
