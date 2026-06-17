import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Payments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payments').select('*').eq('patient_id', user.id)
      .order('created_at', { ascending:false })
      .then(({ data }) => { setPayments(data||[]); setLoading(false) })
  }, [user.id])

  const icons = {
    succès: <CheckCircle className="w-4 h-4 text-primary" />,
    echec:  <XCircle className="w-4 h-4 text-accent" />,
    en_attente: <Clock className="w-4 h-4 text-secondary-dark" />,
  }

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Paiements</h1>
      {loading
        ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-card rounded-2xl border animate-pulse" />)}</div>
        : payments.length === 0
        ? <div className="bg-card rounded-2xl border p-8 text-center text-sm text-muted-foreground">Aucun paiement.</div>
        : (<div className="space-y-2.5">
            {payments.map(p => (
              <div key={p.id} className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  {icons[p.status]||icons.en_attente}
                </div>
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
           </div>)
      }
    </div>
  )
}
