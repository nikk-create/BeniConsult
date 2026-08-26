import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ChevronLeft } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Payments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payments').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending:false })
      .then(({ data }) => { setPayments(data||[]); setLoading(false) })
  }, [user.id])

  const icons = {
    succès:     <CheckCircle className="w-4 h-4 text-primary" />,
    echec:      <XCircle className="w-4 h-4 text-accent" />,
    en_attente: <Clock className="w-4 h-4 text-secondary-dark" />,
  }

  const total = payments.filter(p => p.status==='succès').reduce((s,p) => s+(p.amount_fcfa||0), 0)

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/profil')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-heading font-bold text-2xl">Paiements</h1>
      </div>

      {/* Total dépensé */}
      {payments.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">Total dépensé</p>
          <p className="font-heading font-bold text-lg text-primary">{total.toLocaleString('fr-FR')} FCFA</p>
        </div>
      )}

      {loading
        ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-card rounded-2xl border animate-pulse" />)}</div>
        : payments.length === 0
        ? <div className="bg-card rounded-2xl border p-8 text-center text-sm text-muted-foreground">Aucun paiement.</div>
        : (<div className="space-y-2.5">
            {payments.map(p => (
              <div key={p.id} className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  {icons[p.status] || icons.en_attente}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{(p.amount_fcfa||0).toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-xs text-muted-foreground">
                    {p.method?.toUpperCase()} · {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0
                  ${p.status==='succès' ? 'bg-primary/10 text-primary'
                  : p.status==='echec' ? 'bg-accent/10 text-accent'
                  : 'bg-secondary/20 text-secondary-dark'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>)
      }
    </div>
  )
}