import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Stethoscope, CalendarDays, CreditCard, TrendingUp, Activity, Circle } from 'lucide-react'
import { supabase } from '@/api/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, revenue: 0 })
  const [onlineDoctors, setOnlineDoctors] = useState([])
  const [recentAppts, setRecentAppts] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [doctors, patients, appointments, payments] = await Promise.all([
        supabase.from('profiles').select('*').eq('role','doctor').eq('doctor_status','approuvé'),
        supabase.from('profiles').select('id', { count:'exact' }).eq('role','patient'),
        supabase.from('appointments').select('*').order('created_at', { ascending:false }).limit(20),
        supabase.from('payments').select('amount_fcfa').eq('status','succès'),
      ])
      const pending = await supabase.from('profiles').select('*').eq('role','doctor').eq('doctor_status','en_attente')

      setStats({
        doctors: doctors.data?.length || 0,
        patients: patients.count || 0,
        appointments: appointments.data?.length || 0,
        revenue: (payments.data||[]).reduce((s,p) => s + (p.amount_fcfa||0), 0),
      })
      setOnlineDoctors((doctors.data||[]).filter(d => d.is_online))
      setRecentAppts((appointments.data||[]).slice(0, 6))
      setPendingDoctors(pending.data||[])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { Icon:Stethoscope, label:'Médecins approuvés', value:stats.doctors,                     color:'bg-primary/10 text-primary',       border:'border-primary/20' },
    { Icon:Users,       label:'Patients',           value:stats.patients,                     color:'bg-secondary/20 text-secondary-dark', border:'border-secondary/30' },
    { Icon:CalendarDays,label:'Consultations',      value:stats.appointments,                 color:'bg-primary/10 text-primary',       border:'border-primary/20' },
    { Icon:TrendingUp,  label:'Revenus FCFA',       value:stats.revenue.toLocaleString('fr-FR'), color:'bg-accent/10 text-accent',      border:'border-accent/20' },
  ]

  const statusBadge = {
    en_attente: 'bg-secondary/20 text-secondary-dark',
    confirmé:   'bg-primary/15 text-primary',
    terminé:    'bg-muted text-muted-foreground',
    annulé:     'bg-accent/15 text-accent',
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-5 md:px-6 md:pt-6">
      <div className="mb-5">
        <h1 className="font-heading font-bold text-2xl">Vue d'ensemble</h1>
        <p className="text-sm text-muted-foreground">Tableau de bord administrateur — BéniConsult</p>
      </div>

      {/* Alerte médecins en attente */}
      {pendingDoctors.length > 0 && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="bg-secondary/10 border border-secondary/40 rounded-2xl p-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-secondary-dark">⏳ {pendingDoctors.length} médecin{pendingDoctors.length>1?'s':''} en attente de validation</p>
            <p className="text-xs text-muted-foreground">Vérifiez les dossiers dans la section Médecins.</p>
          </div>
          <a href="/admin/medecins" className="text-xs text-primary font-semibold bg-white border border-border rounded-lg px-2.5 py-1.5 shrink-0 ml-3">
            Voir →
          </a>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map(({ Icon, label, value, color, border }, idx) => (
          <motion.div key={label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.08 }}
            className={`bg-card rounded-2xl border ${border} p-4`}>
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="font-heading font-bold text-xl">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Médecins en ligne */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} className="mb-6">
        <h2 className="font-heading font-semibold text-base mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Médecins en ligne
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {onlineDoctors.length} actif{onlineDoctors.length > 1 ? 's' : ''}
          </span>
        </h2>
        {onlineDoctors.length === 0 ? (
          <div className="bg-muted/50 rounded-xl p-4 text-center text-xs text-muted-foreground">Aucun médecin en ligne</div>
        ) : (
          <div className="space-y-2">
            {onlineDoctors.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center font-heading font-bold text-xs text-primary">
                  {doc.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{doc.full_name}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialty} · {doc.city}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" /> En ligne
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Consultations récentes */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
        <h2 className="font-heading font-semibold text-base mb-3">Consultations récentes</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Patient</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Médecin</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentAppts.map(a => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium truncate max-w-[80px]">{a.patient_name || '—'}</td>
                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[80px]">{a.doctor_name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{a.date}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge[a.status] || statusBadge.en_attente}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
