import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, ChevronLeft } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('appointments').select('*')
      .eq('patient_id', user.id).eq('status','confirmé')
      .order('created_at', { ascending:false })
      .then(({ data }) => { setAppts(data||[]); setLoading(false) })
  }, [user.id])

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/accueil')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-heading font-bold text-2xl">Messages</h1>
      </div>

      {loading
        ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-20 bg-card rounded-2xl border animate-pulse" />)}</div>
        : appts.length === 0
        ? (<div className="bg-card rounded-2xl border border-border p-8 text-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">Aucune consultation active.</p>
            <button onClick={() => navigate('/medecins')} className="text-xs text-primary font-medium mt-2 block mx-auto">
              Consulter un médecin →
            </button>
          </div>)
        : appts.map(a => (
          <button key={a.id} onClick={() => navigate(`/chat/${a.id}`)}
            className="w-full bg-card rounded-2xl border border-border p-4 mb-3 text-left hover:border-primary/30 transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center font-heading font-bold text-sm text-primary shrink-0">
                {a.doctor_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{a.doctor_name}</p>
                <p className="text-xs text-muted-foreground">{a.doctor_specialty} · {a.date}</p>
              </div>
              <MessageCircle className="w-4 h-4 text-primary shrink-0" />
            </div>
          </button>
        ))
      }
    </div>
  )
}
