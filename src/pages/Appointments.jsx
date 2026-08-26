import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import AppointmentCard from '@/components/AppointmentCard'

export default function Appointments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appts, setAppts] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('appointments').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAppts(data || []); setLoading(false) })
  }, [user.id])

  const upcoming = appts.filter(a => ['en_attente','confirmé'].includes(a.status))
  const history  = appts.filter(a => ['terminé','annulé'].includes(a.status))
  const list = tab === 'upcoming' ? upcoming : history

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/accueil')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-heading font-bold text-2xl">Mes consultations</h1>
      </div>

      <div className="flex gap-2 mb-5">
        {[['upcoming','À venir'],['history','Historique']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              ${tab===k ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground'}`}>
            {l} ({k==='upcoming' ? upcoming.length : history.length})
          </button>
        ))}
      </div>

      {loading
        ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-28 bg-card rounded-2xl border animate-pulse" />)}</div>
        : list.length === 0
        ? (<div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-2xl mb-2">{tab==='upcoming' ? '📅' : '📋'}</p>
            <p className="text-sm text-muted-foreground">
              {tab==='upcoming' ? 'Aucune consultation à venir.' : 'Aucun historique.'}
            </p>
          </div>)
        : (<div className="space-y-3">
            {list.map((a,i) => (
              <motion.div key={a.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <AppointmentCard appt={a} />
              </motion.div>
            ))}
          </div>)
      }
    </div>
  )
}
