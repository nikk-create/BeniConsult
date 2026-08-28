import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, LogOut } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import Avatar from '@/components/Avatar'

const SPECIALTIES = ['Médecine générale','Pédiatrie','Gynécologie','Cardiologie','Dermatologie','Ophtalmologie','Dentisterie','Neurologie','Psychiatrie','Orthopédie']
const CITIES = ['Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Natitingou','Lokossa','Ouidah','Abomey','Kandi']

export default function DoctorProfil() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ hospital: '', tarif_fcfa: '', bio: '', specialty: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    if (profile) {
      setForm({
        hospital: profile.hospital || '',
        tarif_fcfa: profile.tarif_fcfa || '',
        bio: profile.bio || '',
        specialty: profile.specialty || '',
        city: profile.city || '',
      })
      setAvatarUrl(profile.avatar_url || null)
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({
      ...form,
      tarif_fcfa: parseInt(form.tarif_fcfa) || 0,
    }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Avatar + infos */}
      <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl p-5 mb-5 text-center">
        <div className="flex justify-center mb-3">
          <Avatar
            userId={user?.id}
            avatarUrl={avatarUrl}
            name={profile?.full_name}
            size="xl"
            editable={true}
            onUploaded={async (url) => { setAvatarUrl(url); await refreshProfile() }}
          />
        </div>
        <p className="font-heading font-bold text-lg">{profile?.full_name}</p>
        <p className="text-xs text-muted-foreground">{profile?.email}</p>
        <div className="flex justify-center gap-6 mt-3">
          <div className="text-center">
            <p className="font-bold text-base">{profile?.consultations_count || 0}</p>
            <p className="text-xs text-muted-foreground">Consultations</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-base">{(profile?.rating || 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Note / 5</p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {[
        { label: 'Spécialité', key: 'specialty', type: 'select', options: SPECIALTIES },
        { label: 'Ville', key: 'city', type: 'select', options: CITIES },
        { label: 'Établissement / Hôpital', key: 'hospital', placeholder: 'CNHU-HKM...' },
        { label: 'Tarif consultation (FCFA)', key: 'tarif_fcfa', type: 'number', placeholder: '2000' },
      ].map(({ label, key, type, placeholder, options }) => (
        <div key={key} className="mb-3.5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
          {type === 'select' ? (
            <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-secondary">
              <option value="">Choisir...</option>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input type={type || 'text'} value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          )}
        </div>
      ))}

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio</label>
        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
          placeholder="Présentez-vous brièvement..."
          className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-secondary" />
      </div>

      <button onClick={handleSave} disabled={saving}
        className={`w-full py-3 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 mb-3 transition-all
          ${saved ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-secondary-dark hover:bg-secondary/80'}`}>
        {saving
          ? <div className="w-4 h-4 border-2 border-secondary-dark/30 border-t-secondary-dark rounded-full animate-spin" />
          : saved ? '✅ Profil sauvegardé !'
          : <><Save className="w-4 h-4" /> Sauvegarder</>}
      </button>

      <button onClick={() => { signOut(); navigate('/connexion') }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/5 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/10">
        <LogOut className="w-4 h-4" /> Déconnexion
      </button>
    </div>
  )
}
