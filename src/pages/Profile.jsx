import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderHeart, CreditCard, LogOut, ChevronRight } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Profile() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [apptCount, setApptCount] = useState(0)
  const [spent, setSpent] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    supabase.from('appointments').select('id', { count:'exact' }).eq('patient_id', user.id).eq('status','terminé')
      .then(({ count }) => setApptCount(count||0))
    supabase.from('payments').select('amount_fcfa').eq('patient_id', user.id).eq('status','succès')
      .then(({ data }) => setSpent((data||[]).reduce((s,p)=>s+(p.amount_fcfa||0),0)))
  }, [user?.id])

  const menu = [
    { label:'Dossier médical', Icon:FolderHeart, to:'/dossier-medical', color:'text-primary' },
    { label:'Historique paiements', Icon:CreditCard, to:'/paiements', color:'text-secondary-dark' },
  ]

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-heading font-bold text-xl">
            {profile?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
          </div>
          <div>
            <p className="font-heading font-bold text-lg">{profile?.full_name||'—'}</p>
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
