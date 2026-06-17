import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/api/supabase'
import { Eye, EyeOff, Stethoscope, User, ShieldCheck, Upload, ChevronRight } from 'lucide-react'

const TABS = [
  { key: 'patient',  label: 'Patient',        Icon: User,        color: 'text-primary',   bg: 'bg-primary/10' },
  { key: 'doctor',   label: 'Médecin',         Icon: Stethoscope, color: 'text-secondary-dark', bg: 'bg-secondary/20' },
  { key: 'admin',    label: 'Administrateur',  Icon: ShieldCheck,  color: 'text-accent',    bg: 'bg-accent/10' },
]

const SPECIALTIES = ['Médecine générale','Pédiatrie','Gynécologie','Cardiologie','Dermatologie','Ophtalmologie','Dentisterie','Neurologie','Psychiatrie','Orthopédie']
const CITIES = ['Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Natitingou','Lokossa','Ouidah','Abomey','Kandi']

function InputField({ label, type = 'text', value, onChange, placeholder, error, icon: Icon }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="mb-3.5">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm outline-none transition-all
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-accent' : 'border-border focus:border-primary'}
            focus:ring-2 focus:ring-primary/10`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-accent mt-1">{error}</p>}
    </div>
  )
}

// ── Formulaire Patient
function PatientForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setMsg(error.message); setLoading(false); return }
    navigate('/accueil')
  }

  const handleRegister = async () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Nom requis'
    if (!form.email.includes('@')) errs.email = 'Email invalide'
    if (form.password.length < 6) errs.password = 'Min. 6 caractères'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setMsg('')

    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) { setMsg(error.message); setLoading(false); return }

    // Crée le profil patient
    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: 'patient',
    })
    navigate('/accueil')
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['login','register'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
              ${mode===m ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground'}`}>
            {m==='login' ? 'Connexion' : 'Inscription'}
          </button>
        ))}
      </div>

      {mode === 'register' && (
        <InputField label="Nom complet" value={form.full_name} onChange={set('full_name')} placeholder="Koffi Agbossou" error={errors.full_name} icon={User} />
      )}
      <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.bj" error={errors.email} />
      {mode === 'register' && (
        <InputField label="Téléphone (+229)" value={form.phone} onChange={set('phone')} placeholder="97 00 00 00" />
      )}
      <InputField label="Mot de passe" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" error={errors.password} />

      {msg && <p className="text-xs text-accent bg-accent/5 rounded-lg px-3 py-2 mb-3">{msg}</p>}

      <button
        onClick={mode === 'login' ? handleLogin : handleRegister}
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-xl font-heading font-semibold text-sm mt-1 flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-primary-dark transition-colors"
      >
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        {!loading && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ── Formulaire Médecin
function DoctorForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', specialty: '', city: '', hospital: '', tarif: '', bio: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setMsg(error.message); setLoading(false); return }

    // Vérifie que c'est bien un médecin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'doctor') { setMsg("Ce compte n'est pas un compte médecin."); supabase.auth.signOut(); setLoading(false); return }
    navigate('/medecin/dashboard')
  }

  const handleRegister = async () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Nom requis'
    if (!form.email.includes('@')) errs.email = 'Email invalide'
    if (form.password.length < 6) errs.password = 'Min. 6 caractères'
    if (!form.specialty) errs.specialty = 'Spécialité requise'
    if (!form.city) errs.city = 'Ville requise'
    if (!form.hospital.trim()) errs.hospital = 'Hôpital requis'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setMsg('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: 'doctor',
        }
      }
    })
    if (error) { setMsg(error.message); setLoading(false); return }

    // Attend que le trigger de création de user soit pris en compte avant d'upserter le profil
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Force le upsert avec le bon rôle
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: 'doctor',
      doctor_status: 'en_attente',
      specialty: form.specialty,
      city: form.city,
      hospital: form.hospital,
      tarif_fcfa: parseInt(form.tarif) || 2000,
      bio: form.bio,
      is_online: false,
      rating: 0,
      consultations_count: 0,
    }, { onConflict: 'id' })

    if (profileError) {
      console.error('Erreur profil:', profileError)
      setMsg('Erreur création profil. Réessaie.')
      setLoading(false)
      return
    }

    // Notification admin
    await supabase.from('admin_notifications').insert({
      type: 'new_doctor',
      message: `Nouveau médecin en attente : ${form.full_name} (${form.specialty} · ${form.city})`,
      doctor_email: form.email,
    })

    setMsg("✅ Dossier envoyé ! L'équipe BéniConsult vous contactera sous 24-48h.")
    setLoading(false)
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['login','register'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
              ${mode===m ? 'bg-secondary text-secondary-dark shadow-sm' : 'bg-muted text-muted-foreground'}`}>
            {m==='login' ? 'Connexion' : 'Inscription'}
          </button>
        ))}
      </div>

      {mode === 'register' ? (
        <>
          <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-3 py-2.5 mb-4 text-xs text-secondary-dark">
            📋 Votre dossier sera vérifié par notre équipe avant activation (24-48h).
          </div>
          <InputField label="Nom complet (avec titre)" value={form.full_name} onChange={set('full_name')} placeholder="Dr. Adélaïde Hounsou" error={errors.full_name} />
          <InputField label="Email professionnel" type="email" value={form.email} onChange={set('email')} placeholder="medecin@cnhu.bj" error={errors.email} />
          <InputField label="Téléphone" value={form.phone} onChange={set('phone')} placeholder="+229 97 00 00 00" />
          <InputField label="Mot de passe" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" error={errors.password} />

          <div className="mb-3.5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Spécialité</label>
            <select value={form.specialty} onChange={e => set('specialty')(e.target.value)}
              className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${errors.specialty ? 'border-accent' : 'border-border focus:border-secondary'} focus:ring-2 focus:ring-secondary/10`}>
              <option value="">Choisir...</option>
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
            {errors.specialty && <p className="text-xs text-accent mt-1">{errors.specialty}</p>}
          </div>

          <div className="mb-3.5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Ville</label>
            <select value={form.city} onChange={e => set('city')(e.target.value)}
              className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm outline-none ${errors.city ? 'border-accent' : 'border-border focus:border-secondary'}`}>
              <option value="">Choisir...</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <InputField label="Établissement / Hôpital" value={form.hospital} onChange={set('hospital')} placeholder="CNHU-HKM, Clinique Bénin..." error={errors.hospital} />
          <InputField label="Tarif consultation (FCFA)" type="number" value={form.tarif} onChange={set('tarif')} placeholder="2000" />

          <div className="mb-3.5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio courte</label>
            <textarea value={form.bio} onChange={e => set('bio')(e.target.value)} rows={3} placeholder="Présentez-vous brièvement..."
              className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-secondary focus:ring-2 focus:ring-secondary/10" />
          </div>
        </>
      ) : (
        <>
          <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="medecin@exemple.bj" error={errors.email} />
          <InputField label="Mot de passe" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" error={errors.password} />
        </>
      )}

      {msg && (
        <div className={`text-xs rounded-lg px-3 py-2.5 mb-3 ${msg.startsWith('✅') ? 'bg-primary/5 text-primary-dark border border-primary/20' : 'bg-accent/5 text-accent border border-accent/20'}`}>
          {msg}
        </div>
      )}

      <button
        onClick={mode === 'login' ? handleLogin : handleRegister}
        disabled={loading}
        className="w-full bg-secondary text-secondary-dark py-3 rounded-xl font-heading font-semibold text-sm mt-1 flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-secondary/80 transition-colors"
      >
        {loading ? <div className="w-4 h-4 border-2 border-secondary-dark/30 border-t-secondary-dark rounded-full animate-spin" /> : mode === 'login' ? 'Accéder au tableau de bord' : 'Soumettre mon dossier'}
        {!loading && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ── Formulaire Admin
function AdminForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleLogin = async () => {
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setMsg(error.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'admin') { setMsg("Accès réservé aux administrateurs."); supabase.auth.signOut(); setLoading(false); return }
    navigate('/admin/dashboard')
  }

  return (
    <div>
      <div className="bg-accent/5 border border-accent/20 rounded-xl px-3 py-2.5 mb-5 text-xs text-accent">
        🔒 Accès sécurisé — Administrateurs BéniConsult uniquement.
      </div>
      <InputField label="Email administrateur" type="email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} placeholder="admin@beniconsult.bj" />
      <InputField label="Mot de passe" type="password" value={form.password} onChange={v => setForm(f=>({...f,password:v}))} placeholder="••••••••" />
      {msg && <p className="text-xs text-accent bg-accent/5 rounded-lg px-3 py-2 mb-3">{msg}</p>}
      <button onClick={handleLogin} disabled={loading}
        className="w-full bg-accent text-white py-3 rounded-xl font-heading font-semibold text-sm mt-1 flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-accent-dark transition-colors">
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Accéder au panneau admin'}
        {!loading && <ShieldCheck className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ── Page principale Login
export default function Login() {
  const [tab, setTab] = useState('patient')
  const current = TABS.find(t => t.key === tab)

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header drapeau */}
      <div className="flex h-1.5">
        <div className="flex-none w-1/4 bg-primary" />
        <div className="flex-1 bg-secondary" />
        <div className="flex-1 bg-accent" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        {/* Logo */}
        <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-8 w-6 rounded overflow-hidden">
              <div className="w-1/3 bg-primary" />
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-secondary" />
                <div className="flex-1 bg-accent" />
              </div>
            </div>
            <h1 className="font-heading font-bold text-2xl text-gray-900">BéniConsult</h1>
          </div>
          <p className="text-sm text-muted-foreground">Santé · Juridique · Conseils en ligne</p>
        </motion.div>

        {/* Tabs rôles */}
        <div className="w-full max-w-sm mb-5">
          <div className="flex gap-1.5 bg-muted p-1 rounded-2xl">
            {TABS.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-all
                  ${tab===key ? 'bg-white shadow-sm text-gray-900' : 'text-muted-foreground hover:text-gray-700'}`}>
                <Icon className={`w-3.5 h-3.5 ${tab===key ? current.color : ''}`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Card formulaire */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
            transition={{ duration:0.2 }}
            className="w-full max-w-sm bg-card rounded-2xl border border-border p-5 shadow-sm"
          >
            <div className={`flex items-center gap-2 mb-5 pb-4 border-b border-border`}>
              <div className={`w-8 h-8 rounded-xl ${current.bg} flex items-center justify-center`}>
                <current.Icon className={`w-4 h-4 ${current.color}`} />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-sm">{current.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {tab==='patient' ? 'Consultez un expert depuis chez vous' :
                   tab==='doctor'  ? 'Espace professionnel de santé' :
                                     'Gestion de la plateforme'}
                </p>
              </div>
            </div>

            {tab === 'patient' && <PatientForm />}
            {tab === 'doctor'  && <DoctorForm />}
            {tab === 'admin'   && <AdminForm />}
          </motion.div>
        </AnimatePresence>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          BéniConsult · Cotonou, Bénin 🇧🇯<br />
          <span className="text-primary">support@beniconsult.bj</span>
        </p>
      </div>
    </div>
  )
}
