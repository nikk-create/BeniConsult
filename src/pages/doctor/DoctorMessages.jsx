import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Video, FolderHeart, FileText } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function DoctorMessages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('appointments').select('*')
      .eq('doctor_id', user.id).eq('status', 'confirmé')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAppts(data || []); setLoading(false) })
  }, [user.id])

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Consultations actives</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-card rounded-2xl border animate-pulse" />)}
        </div>
      ) : appts.length === 0 ? (
        <div className="bg-card rounded-2xl border p-8 text-center text-sm text-muted-foreground">
          Aucune consultation active.
        </div>
      ) : appts.map(a => (
        <div key={a.id} className="bg-card rounded-2xl border border-border p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-heading font-semibold text-sm">{a.patient_name}</p>
              <p className="text-xs text-muted-foreground">{a.date} · {a.time}</p>
            </div>
            <span className="text-xs text-primary font-medium">
              {(a.tarif_fcfa || 0).toLocaleString('fr-FR')} F
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/chat/${a.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> Chat
            </button>
            <button onClick={() => navigate(`/video/${a.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary/15 text-secondary-dark text-xs font-medium hover:bg-secondary/25 transition-colors">
              <Video className="w-3.5 h-3.5" /> Vidéo
            </button>
            <button onClick={() => navigate(`/medecin/dossier/${a.patient_id}`)}
              className="w-10 flex items-center justify-center py-2 rounded-xl bg-muted text-muted-foreground hover:bg-border transition-colors">
              <FolderHeart className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(`/medecin/ordonnance/${a.id}`)}
              className="w-10 flex items-center justify-center py-2 rounded-xl bg-muted text-muted-foreground hover:bg-border transition-colors">
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
