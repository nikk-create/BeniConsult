import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, MessageCircle, Stethoscope, Shield, Clock, Zap } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import DoctorCard from '@/components/DoctorCard'

export default function Home() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles')
      .select('*').eq('role','doctor').eq('is_online',true)
      .eq('doctor_status','approuvé').limit(3)
      .then(({ data }) => { setDoctors(data || []); setLoading(false) })
  }, [])

  const actions = [
    { label:'Consulter',     Icon:Stethoscope, to:'/medecins',    color:'bg-primary text-white' },
    { label:'Rendez-vous',   Icon:CalendarDays, to:'/rendez-vous', color:'bg-secondary text-secondary-dark' },
    { label:'Messages',      Icon:MessageCircle,to:'/messages',    color:'bg-accent text-white' },
  ]

  const features = [
    { Icon:Zap,    label:'Consultation instantanée', desc:'Médecin disponible en moins de 2 min' },
    { Icon:Shield, label:'Confidentiel',             desc:'Vos données protégées et sécurisées' },
    { Icon:Clock,  label:'7j/7 · 24h/24',           desc:'Accès aux soins à toute heure' },
  ]

  const firstName = profile?.full_name?.split(' ')[0] || 'vous'

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Salutation */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
        <p className="text-sm text-muted-foreground">Bonjour,</p>
        <h1 className="font-heading font-bold text-2xl text-gray-900">{firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Comment pouvons-nous vous aider ?</p>
      </motion.div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {actions.map(({ label, Icon, to, color }, i) => (
          <motion.button key={label}
            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.07 }}
            onClick={() => navigate(to)}
            className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold text-center leading-tight">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Médecins en ligne */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-base">Médecins en ligne</h2>
          <button onClick={() => navigate('/medecins')} className="text-xs text-primary font-medium">Voir tout →</button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucun médecin en ligne pour le moment.</p>
            <button onClick={() => navigate('/medecins')} className="text-xs text-primary font-medium mt-2">
              Voir tous les médecins →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map((doc, i) => <DoctorCard key={doc.id} doctor={doc} index={i} />)}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <h3 className="font-heading font-semibold text-sm mb-4">Pourquoi BéniConsult ?</h3>
        <div className="space-y-3.5">
          {features.map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
