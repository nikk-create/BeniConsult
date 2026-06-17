// ══════════════════════════════
// pages/doctor/DoctorAgenda.jsx
// ══════════════════════════════
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export function DoctorAgenda() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)
  const [appts, setAppts] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    supabase.from('appointments').select('*').eq('doctor_id', user.id).neq('status','annulé')
      .then(({ data }) => setAppts(data||[]))
  }, [user.id])

  const getWeekDays = () => {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay() + 1 + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i)
      return { iso: d.toISOString().split('T')[0], day: d.toLocaleDateString('fr-FR', { weekday:'short' }), num: d.getDate() }
    })
  }

  const days = getWeekDays()
  const dayAppts = appts.filter(a => a.date === selectedDate).sort((a,b)=>a.time?.localeCompare(b.time))

  const STATUS_COLOR = { confirmé:'border-l-primary bg-primary/5', en_attente:'border-l-secondary bg-secondary/5', terminé:'border-l-gray-300 bg-muted' }

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Agenda</h1>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekOffset(w=>w-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-medium text-gray-700">
          {days[0].num} — {days[6].num} {new Date().toLocaleDateString('fr-FR',{month:'long'})}
        </p>
        <button onClick={() => setWeekOffset(w=>w+1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jours */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {days.map(d => {
          const count = appts.filter(a=>a.date===d.iso).length
          const active = d.iso === selectedDate
          return (
            <button key={d.iso} onClick={() => setSelectedDate(d.iso)}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all min-w-[44px]
                ${active ? 'bg-primary text-white' : 'bg-card border border-border text-gray-600'}`}>
              <span className="text-[10px] font-medium">{d.day}</span>
              <span className="font-heading font-bold text-base leading-tight">{d.num}</span>
              {count > 0 && <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${active?'bg-white':'bg-primary'}`} />}
            </button>
          )
        })}
      </div>

      {/* RDV du jour */}
      <p className="text-xs text-muted-foreground mb-3">{dayAppts.length} consultation{dayAppts.length>1?'s':''} ce jour</p>
      {dayAppts.length === 0
        ? <div className="bg-card rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">Pas de consultation ce jour.</div>
        : <div className="space-y-2.5">
            {dayAppts.map(a => (
              <div key={a.id} className={`bg-card rounded-2xl border-l-4 border border-border p-4 ${STATUS_COLOR[a.status]||STATUS_COLOR.en_attente}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-heading font-semibold text-sm">{a.patient_name}</p>
                  <span className="text-xs font-semibold text-primary">{a.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{a.tarif_fcfa?.toLocaleString('fr-FR')} FCFA · {a.status}</p>
                {a.status === 'confirmé' && (
                  <button onClick={() => navigate(`/chat/${a.id}`)}
                    className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <MessageCircle className="w-3.5 h-3.5" /> Ouvrir le chat
                  </button>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  )
}

// ═════════════════════════════════
// pages/doctor/DoctorMessages.jsx
// ═════════════════════════════════
import { FolderHeart, Video, FileText } from 'lucide-react'

export function DoctorMessages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('appointments').select('*').eq('doctor_id', user.id).eq('status','confirmé')
      .order('created_at', { ascending:false })
      .then(({ data }) => { setAppts(data||[]); setLoading(false) })
  }, [user.id])

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Consultations actives</h1>
      {loading
        ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-20 bg-card rounded-2xl border animate-pulse" />)}</div>
        : appts.length === 0
        ? <div className="bg-card rounded-2xl border p-8 text-center text-sm text-muted-foreground">Aucune consultation active.</div>
        : appts.map(a => (
          <div key={a.id} className="bg-card rounded-2xl border border-border p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-heading font-semibold text-sm">{a.patient_name}</p>
                <p className="text-xs text-muted-foreground">{a.date} · {a.time}</p>
              </div>
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
        ))
      }
    </div>
  )
}

// ════════════════════════════════
// pages/doctor/DoctorProfil.jsx
// ════════════════════════════════
import { Save, LogOut } from 'lucide-react'

const SPECIALTIES = ['Médecine générale','Pédiatrie','Gynécologie','Cardiologie','Dermatologie','Ophtalmologie','Dentisterie','Neurologie','Psychiatrie','Orthopédie']
const CITIES = ['Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Natitingou','Lokossa','Ouidah','Abomey','Kandi']

export function DoctorProfil() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ hospital:'', tarif_fcfa:'', bio:'', specialty:'', city:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm({ hospital:profile.hospital||'', tarif_fcfa:profile.tarif_fcfa||'', bio:profile.bio||'', specialty:profile.specialty||'', city:profile.city||'' })
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ ...form, tarif_fcfa:parseInt(form.tarif_fcfa)||0 }).eq('id', user.id)
    await refreshProfile()
    setSaving(false); setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
  }

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Avatar */}
      <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl p-5 mb-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center font-heading font-bold text-2xl text-secondary-dark mx-auto mb-2">
          {profile?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
        <p className="font-heading font-bold text-lg">{profile?.full_name}</p>
        <p className="text-xs text-muted-foreground">{profile?.email}</p>
        <div className="flex justify-center gap-4 mt-3">
          <div className="text-center"><p className="font-bold text-base">{profile?.consultations_count||0}</p><p className="text-xs text-muted-foreground">Consultations</p></div>
          <div className="text-center"><p className="font-bold text-base">{(profile?.rating||0).toFixed(1)}</p><p className="text-xs text-muted-foreground">Note</p></div>
        </div>
      </div>

      {/* Form */}
      {[
        { label:'Spécialité', key:'specialty', type:'select', options:SPECIALTIES },
        { label:'Ville', key:'city', type:'select', options:CITIES },
        { label:'Établissement / Hôpital', key:'hospital', placeholder:'CNHU-HKM...' },
        { label:'Tarif consultation (FCFA)', key:'tarif_fcfa', type:'number', placeholder:'2000' },
      ].map(({ label, key, type, placeholder, options }) => (
        <div key={key} className="mb-3.5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
          {type === 'select'
            ? <select value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-secondary">
                <option value="">Choisir...</option>
                {options.map(o=><option key={o}>{o}</option>)}
              </select>
            : <input type={type||'text'} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                placeholder={placeholder}
                className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          }
        </div>
      ))}

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Bio</label>
        <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={3}
          placeholder="Présentez-vous..." className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-secondary" />
      </div>

      <button onClick={handleSave} disabled={saving}
        className={`w-full py-3 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 mb-3 transition-all
          ${saved?'bg-primary/15 text-primary border border-primary/30':'bg-secondary text-secondary-dark hover:bg-secondary/80'}`}>
        {saving ? <div className="w-4 h-4 border-2 border-secondary-dark/30 border-t-secondary-dark rounded-full animate-spin" />
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

// ═══════════════════════════════════════
// pages/doctor/WritePrescription.jsx
// ═══════════════════════════════════════
import { Plus, Trash2 } from 'lucide-react'

export function WritePrescription() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { appointmentId } = useParams()
  const [appt, setAppt] = useState(null)
  const [meds, setMeds] = useState([{ name:'', dosage:'', duration:'', instructions:'' }])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('appointments').select('*').eq('id', appointmentId).single()
      .then(({ data }) => setAppt(data))
  }, [appointmentId])

  const addMed = () => setMeds(m => [...m, { name:'', dosage:'', duration:'', instructions:'' }])
  const removeMed = (i) => setMeds(m => m.filter((_,idx)=>idx!==i))
  const updateMed = (i, field, val) => setMeds(m => m.map((med,idx)=>idx===i?{...med,[field]:val}:med))

  const handleSave = async () => {
    setSaving(true)
    const { data: presc } = await supabase.from('prescriptions').insert({
      appointment_id: appointmentId,
      doctor_id: user.id,
      doctor_name: profile?.full_name,
      doctor_specialty: profile?.specialty,
      patient_id: appt?.patient_id,
      patient_name: appt?.patient_name,
      medications: meds.filter(m=>m.name.trim()),
      notes,
    }).select().single()

    await supabase.from('appointments').update({ status:'terminé', prescription_id: presc?.id }).eq('id', appointmentId)
    await supabase.from('notifications').insert({
      user_id: appt?.patient_id,
      type: 'ordonnance',
      message: `${profile?.full_name} vous a envoyé une ordonnance.`,
    })
    navigate(-1)
  }

  return (
    <div className="min-h-dvh bg-background px-4 pt-5 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="font-heading font-bold text-xl">Rédiger une ordonnance</h1>
      </div>

      {appt && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 mb-5 text-sm">
          <span className="font-semibold">Patient :</span> {appt.patient_name} · {appt.date}
        </div>
      )}

      <h3 className="font-heading font-semibold text-sm mb-3">Médicaments</h3>
      <div className="space-y-3 mb-4">
        {meds.map((med, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-muted-foreground">Médicament {i+1}</span>
              {meds.length > 1 && (
                <button onClick={() => removeMed(i)} className="text-accent">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {[
              ['name','Nom du médicament','Ex: Paracétamol 500mg'],
              ['dosage','Posologie','Ex: 1 comprimé 3x/jour'],
              ['duration','Durée','Ex: 5 jours'],
              ['instructions','Instructions (optionnel)','Ex: Prendre après repas'],
            ].map(([field,label,placeholder]) => (
              <div key={field} className="mb-2.5">
                <label className="text-[10px] text-muted-foreground mb-1 block">{label}</label>
                <input value={med[field]} onChange={e=>updateMed(i,field,e.target.value)} placeholder={placeholder}
                  className="w-full bg-muted border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:border-secondary focus:bg-white transition-all" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={addMed} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted border border-dashed border-border text-sm text-muted-foreground hover:border-secondary hover:text-secondary-dark transition-colors mb-4">
        <Plus className="w-4 h-4" /> Ajouter un médicament
      </button>

      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes / Diagnostic</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
          placeholder="Diagnostic, recommandations, notes cliniques..."
          className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-secondary" />
      </div>

      <button onClick={handleSave} disabled={saving || meds.every(m=>!m.name.trim())}
        className="w-full bg-primary text-white py-3.5 rounded-xl font-heading font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '📋 Valider et envoyer l\'ordonnance'}
      </button>
    </div>
  )
}

// ══════════════════════════════════
// pages/doctor/PatientRecord.jsx
// ══════════════════════════════════
export function PatientRecord() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [patient, setPatient] = useState(null)
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', patientId).single(),
      supabase.from('medical_records').select('*').eq('patient_id', patientId).single(),
      supabase.from('appointments').select('*').eq('patient_id', patientId).order('date', { ascending:false }).limit(10),
    ]).then(([{ data:p },{ data:r },{ data:a }]) => {
      setPatient(p); setRecord(r); setAppts(a||[])
      setLoading(false)
    })
  }, [patientId])

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" /></div>

  const Badge = ({ label, color='bg-primary/10 text-primary' }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
  )

  const Section = ({ title, children }) => (
    <div className="bg-card rounded-2xl border border-border p-4 mb-4">
      <h3 className="font-heading font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="min-h-dvh bg-background px-4 pt-5 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="font-heading font-bold text-xl">Dossier patient</h1>
      </div>

      {/* Patient info */}
      <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-4 mb-4">
        <p className="font-heading font-bold text-lg">{patient?.full_name}</p>
        <p className="text-xs text-muted-foreground">{patient?.email} · {patient?.phone}</p>
        {record?.blood_type && <span className="inline-block mt-2 bg-accent/15 text-accent px-2.5 py-1 rounded-full text-xs font-bold">{record.blood_type}</span>}
      </div>

      {record ? (
        <>
          {record.allergies?.length > 0 && (
            <Section title="⚠️ Allergies">
              <div className="flex flex-wrap gap-2">{record.allergies.map((a,i)=><Badge key={i} label={a} color="bg-accent/10 text-accent" />)}</div>
            </Section>
          )}
          {record.chronic_conditions?.length > 0 && (
            <Section title="🏥 Antécédents chroniques">
              <div className="flex flex-wrap gap-2">{record.chronic_conditions.map((c,i)=><Badge key={i} label={c} />)}</div>
            </Section>
          )}
          {record.treatments?.length > 0 && (
            <Section title="💊 Traitements en cours">
              <div className="flex flex-wrap gap-2">{record.treatments.map((t,i)=><Badge key={i} label={t} color="bg-secondary/20 text-secondary-dark" />)}</div>
            </Section>
          )}
          {record.family_history && (
            <Section title="👨‍👩‍👧 Antécédents familiaux">
              <p className="text-sm text-gray-700">{record.family_history}</p>
            </Section>
          )}
        </>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6 text-center mb-4">
          <p className="text-sm text-muted-foreground">Aucun dossier médical renseigné par ce patient.</p>
        </div>
      )}

      {/* Historique consultations */}
      <Section title="📋 Historique des consultations">
        {appts.length === 0 ? <p className="text-xs text-muted-foreground">Aucune consultation.</p>
         : appts.map(a => (
          <div key={a.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <div>
              <p className="text-xs font-medium">{a.date} · {a.time}</p>
              <p className="text-[10px] text-muted-foreground">{a.status}</p>
            </div>
            <span className="text-xs font-semibold text-primary">{(a.tarif_fcfa||0).toLocaleString('fr-FR')} F</span>
          </div>
        ))}
      </Section>
    </div>
  )
}

// ══════════════════════════════════
// pages/doctor/DoctorPending.jsx
// ══════════════════════════════════
export function DoctorPending() {
  return <DoctorHome />
}

export default { DoctorAgenda, DoctorMessages, DoctorProfil, WritePrescription, PatientRecord, DoctorPending }
