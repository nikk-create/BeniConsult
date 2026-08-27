import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderHeart, CreditCard, LogOut, ChevronRight, Edit2, Check, X } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import Avatar from '@/components/Avatar'

export default function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [apptCount, setApptCount] = useState(0)
  const [spent, setSpent] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setAvatarUrl(profile?.avatar_url || null)
    supabase.from('appointments').select('id', { count: 'exact' })
      .eq('patient_id', user.id).eq('status', 'terminé')
      .then(({ count }) => setApptCount(count || 0))
    supabase.from('payments').select('amount_fcfa')
      .eq('patient_id', user.id).eq('status', 'succès')
      .then(({ data }) => setSpent((data || []).reduce((s, p) => s + (p.amount_fcfa || 0), 0)))
  }, [user?.id, profile])

  const displayName = profile?.full_name && !profile.full_name.includes('@')
    ? profile.full_name : 'Définir mon nom'

  const saveName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: newName.trim() }).eq('id', user.id)
    await refreshProfile()
    setSaving(false); setEditingName(false)
  }

  const savePhone = async () => {
    if (!newPhone.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ phone: newPhone.trim() }).eq('id', user.id)
    await refreshProfile()
    setSaving(false); setEditingPhone(false)
  }

  const menu = [
    { label: 'Dossier médical',      Icon: FolderHeart, to: '/dossier-medical', color: 'text-primary' },
    { label: 'Historique paiements', Icon: CreditCard,   to: '/paiements',       color: 'text-secondary-dark' },
  ]

  return (
    <div className="px-4 pt-5 pb-8">
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white mb-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar
            userId={user?.id}
            avatarUrl={avatarUrl}
            name={profile?.full_name}
            size="lg"
            editable={true}
            onUploaded={async (url) => { setAvatarUrl(url); await refreshProfile() }}
          />
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  placeholder="Votre nom complet"
                  className="flex-1 bg-white/20 text-white placeholder-white/60 rounded-lg px-2 py-1 text-sm outline-none border border-white/30 min-w-0" />
                <button onClick={saveName} disabled={saving} className="shrink-0">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4 text-white" />}
                </button>
                <button onClick={() => setEditingName(false)} className="shrink-0"><X className="w-4 h-4 text-white/70" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <p className="font-heading font-bold text-lg truncate">{displayName}</p>
                <button onClick={() => { setNewName(profile?.full_name || ''); setEditingName(true) }}
                  className="shrink-0 w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-sm opacity-80 truncate">{profile?.email}</p>
            {editingPhone ? (
              <div className="flex items-center gap-2 mt-1">
                <input autoFocus value={newPhone} onChange={e => setNewPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && savePhone()}
                  placeholder="+229 97 00 00 00"
                  className="flex-1 bg-white/20 text-white placeholder-white/60 rounded-lg px-2 py-1 text-xs outline-none border border-white/30 min-w-0" />
                <button onClick={savePhone} className="shrink-0"><Check className="w-4 h-4 text-white" /></button>
                <button onClick={() => setEditingPhone(false)} className="shrink-0"><X className="w-4 h-4 text-white/70" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs opacity-70">{profile?.phone || 'Ajouter un téléphone'}</p>
                <button onClick={() => { setNewPhone(profile?.phone || ''); setEditingPhone(true) }}
                  className="shrink-0 w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
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
