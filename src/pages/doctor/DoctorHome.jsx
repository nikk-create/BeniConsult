import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, Star, TrendingUp, CalendarDays, CheckCircle, X, MessageCircle, Circle } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function DoctorHome() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, today: 0, revenue: 0, rating: 0 })
  const [pending, setPending] = useState([])
  const [todayAppts, setTodayAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      const [allAppts, payments] = await Promise.all([
        supabase.from('appointments').select('*').eq('doctor_id', user.id),
        supabase.from('payments').select('amount_fcfa').eq('doctor_id', user.id).eq('status','succès'),
      ])
      const appts = allAppts.data || []
      setStats({
        total: appts.filter(a=>a.status==='terminé').length,
        today: appts.filter(a=>a.date===today).length,
        revenue: (payments.data||[]).reduce((s,p)=>s+(p.amount_fcfa||0),0),
        rating: profile?.rating || 0,
      })
      setPending(appts.filter(a=>a.status==='en_attente'))
      setTodayAppts(appts.filter(a=>a.date===today && a.status==='confirmé'))
      setLoading(false)
    }
    load()
  }, [user?.id, profile])

  const toggleOnline = async () => {
    setToggling(true)
    await supabase.from('profiles').update({ is_online: !profile?.is_online }).eq('id', user.id)
    await refreshProfile()
    setToggling(false)
  }

  const acceptAppt = async (apptId, patientId, patientName) => {
    await supabase.from('appointments').update({ status:'confirmé' }).eq('id', apptId)
    await supabase.from('notifications').insert({
      user_id: patientId,
      type: 'rdv',
      message: `${profile?.full_name} a confirmé votre rendez-vous.`,
    })
    setPending(p => p.filter(a=>a.id!==apptId))
  }

  const declineAppt = async (apptId, patientId) => {
    await supabase.from('appointments').update({ status:'annulé' }).eq('id', apptId)
    await supabase.from('notifications').insert({
      user_id: patientId,
      type: 'rdv',
      message: `Votre rendez-vous a été annulé par le médecin.`,
    })
    setPending(p => p.filter(a=>a.id!==apptId))
  }

  const statCards = [
    { Icon:Stethoscope, label:'Consultations', value:stats.total,                   color:'bg-primary/10 text-primary' },
    { Icon:Star,        label:'Note',           value:`${stats.rating.toFixed(1)}/5`, color:'bg-secondary/20 text-secondary-dark' },
    { Icon:TrendingUp,  label:'Revenus FCFA',   value:stats.revenue.toLocaleString('fr-FR'), color:'bg-primary/10 text-primary' },
    { Icon:CalendarDays,label:'Aujourd\'hui',   value:stats.today,                   color:'bg-accent/10 text-accent' },
  ]

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" /></div>

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Greeting + toggle */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour,</p>
          <h1 className="font-heading font-bold text-xl">{profile?.full_name}</h1>
          <p className="text-xs text-muted-foreground">{profile?.specialty} · {profile?.hospital}</p>
        </div>
        <button onClick={toggleOnline} disabled={toggling}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all
            ${profile?.is_online ? 'bg-green-50 border-green-200 text-green-700' : 'bg-muted border-border text-gray-500'}`}>
          <Circle className={`w-2 h-2 ${profile?.is_online ? 'fill-green-500 text-green-500 animate-pulse' : 'fill-gray-400 text-gray-400'}`} />
          {toggling ? '...' : profile?.is_online ? 'En ligne' : 'Hors ligne'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map(({ Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="bg-card rounded-2xl border border-border p-4">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="font-heading font-bold text-xl">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Demandes en attente */}
      {pending.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-base">Demandes en attente</h2>
            <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="space-y-3">
            {pending.map(appt => (
              <div key={appt.id} className="bg-card rounded-2xl border border-secondary/30 p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-heading font-semibold text-sm">{appt.patient_name}</p>
                  <span className="text-[10px] bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full font-medium">
                    {appt.date} · {appt.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{appt.patient_email}</p>
                <div className="flex gap-2">
                  <button onClick={() => acceptAppt(appt.id, appt.patient_id, appt.patient_name)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Accepter
                  </button>
                  <button onClick={() => declineAppt(appt.id, appt.patient_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted border border-border text-xs font-medium text-gray-600 hover:bg-border transition-colors">
                    <X className="w-3.5 h-3.5" /> Décliner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Agenda du jour */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
        <h2 className="font-heading font-semibold text-base mb-3">Agenda d'aujourd'hui</h2>
        {todayAppts.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucun rendez-vous aujourd'hui.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayAppts.sort((a,b)=>a.time?.localeCompare(b.time)).map(appt => (
              <div key={appt.id} className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3">
                <div className="text-xs font-semibold text-primary bg-primary/10 rounded-xl px-2 py-1.5 text-center shrink-0 min-w-[44px]">
                  {appt.time}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{appt.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{appt.tarif_fcfa?.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <button onClick={() => navigate(`/chat/${appt.id}`)}
                  className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
