import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Save } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function DossierMedical() {
  const { user } = useAuth()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    blood_type: '',
    allergies: [],
    chronic_conditions: [],
    treatments: [],
    surgeries: [],
    family_history: '',
  })
  const [newAllergy, setNewAllergy] = useState('')
  const [newCondition, setNewCondition] = useState('')
  const [newTreatment, setNewTreatment] = useState('')
  const [newSurgery, setNewSurgery] = useState('')

  useEffect(() => {
    supabase.from('medical_records').select('*').eq('patient_id', user.id).single()
      .then(({ data }) => {
        if (data) { setRecord(data); setForm({ blood_type: data.blood_type||'', allergies: data.allergies||[], chronic_conditions: data.chronic_conditions||[], treatments: data.treatments||[], surgeries: data.surgeries||[], family_history: data.family_history||'' }) }
        setLoading(false)
      })
  }, [user.id])

  const addItem = (field, value, setter) => {
    if (!value.trim()) return
    setForm(f => ({ ...f, [field]: [...f[field], value.trim()] }))
    setter('')
  }
  const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_,i)=>i!==idx) }))

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, patient_id: user.id, updated_at: new Date().toISOString() }
    if (record) {
      await supabase.from('medical_records').update(payload).eq('id', record.id)
    } else {
      const { data } = await supabase.from('medical_records').insert(payload).select().single()
      setRecord(data)
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const Section = ({ title, children }) => (
    <div className="bg-card rounded-2xl border border-border p-4 mb-4">
      <h3 className="font-heading font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  )

  const TagList = ({ items, field }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
          {item}
          <button onClick={() => removeItem(field, i)} className="ml-0.5 text-primary/60 hover:text-primary">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  )

  const AddRow = ({ placeholder, value, onChange, onAdd }) => (
    <div className="flex gap-2 mt-2">
      <input value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key==='Enter' && onAdd()}
        placeholder={placeholder}
        className="flex-1 bg-muted border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
      <button onClick={onAdd} className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
        <Plus className="w-4 h-4 text-white" />
      </button>
    </div>
  )

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>

  return (
    <div className="px-4 pt-5 pb-6">
      <h1 className="font-heading font-bold text-2xl mb-1">Dossier médical</h1>
      <p className="text-xs text-muted-foreground mb-5">Accessible uniquement à vous et vos médecins.</p>

      {/* Groupe sanguin */}
      <Section title="🩸 Groupe sanguin">
        <div className="flex flex-wrap gap-2">
          {BLOOD_TYPES.map(bt => (
            <button key={bt} onClick={() => setForm(f=>({...f,blood_type:bt}))}
              className={`w-12 h-10 rounded-xl border text-sm font-semibold transition-all
                ${form.blood_type===bt ? 'bg-accent border-accent text-white' : 'bg-muted border-transparent text-gray-600 hover:border-border'}`}>
              {bt}
            </button>
          ))}
        </div>
      </Section>

      {/* Allergies */}
      <Section title="⚠️ Allergies">
        <TagList items={form.allergies} field="allergies" />
        <AddRow placeholder="Ex: Pénicilline, arachides..." value={newAllergy} onChange={setNewAllergy} onAdd={() => addItem('allergies', newAllergy, setNewAllergy)} />
      </Section>

      {/* Maladies chroniques */}
      <Section title="🏥 Antécédents chroniques">
        <TagList items={form.chronic_conditions} field="chronic_conditions" />
        <AddRow placeholder="Ex: Diabète, hypertension..." value={newCondition} onChange={setNewCondition} onAdd={() => addItem('chronic_conditions', newCondition, setNewCondition)} />
      </Section>

      {/* Traitements */}
      <Section title="💊 Traitements en cours">
        <TagList items={form.treatments} field="treatments" />
        <AddRow placeholder="Ex: Metformine 500mg..." value={newTreatment} onChange={setNewTreatment} onAdd={() => addItem('treatments', newTreatment, setNewTreatment)} />
      </Section>

      {/* Chirurgies */}
      <Section title="🔪 Chirurgies / Hospitalisations">
        <TagList items={form.surgeries} field="surgeries" />
        <AddRow placeholder="Ex: Appendicite 2020..." value={newSurgery} onChange={setNewSurgery} onAdd={() => addItem('surgeries', newSurgery, setNewSurgery)} />
      </Section>

      {/* Antécédents familiaux */}
      <Section title="👨‍👩‍👧 Antécédents familiaux">
        <textarea value={form.family_history} onChange={e => setForm(f=>({...f,family_history:e.target.value}))}
          rows={3} placeholder="Ex: Père diabétique, mère hypertendue..."
          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:bg-white border border-transparent focus:border-primary transition-all" />
      </Section>

      {/* Bouton sauvegarder */}
      <motion.button onClick={handleSave} disabled={saving}
        className={`w-full py-3.5 rounded-2xl font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all
          ${saved ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-primary text-white hover:bg-primary-dark'}`}>
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
         : saved ? '✅ Dossier sauvegardé !'
         : <><Save className="w-4 h-4" /> Sauvegarder le dossier</>}
      </motion.button>
    </div>
  )
}
