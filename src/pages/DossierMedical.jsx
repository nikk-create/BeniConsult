import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Save, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

// Composant input stable — clé fixe pour éviter le re-render qui fait perdre le focus
function TagInput({ label, items, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState('')

  const handleAdd = () => {
    if (!value.trim()) return
    onAdd(value.trim())
    setValue('')
  }

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      {/* Tags existants */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-0.5 text-primary/60 hover:text-primary"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Input + bouton ajouter */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
          placeholder={placeholder}
          className="flex-1 bg-muted border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:border-primary focus:bg-white transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}

export default function DossierMedical() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Champs simples — gérés séparément pour éviter les re-renders globaux
  const [bloodType, setBloodType] = useState('')
  const [familyHistory, setFamilyHistory] = useState('')
  const [allergies, setAllergies] = useState([])
  const [conditions, setConditions] = useState([])
  const [treatments, setTreatments] = useState([])
  const [surgeries, setSurgeries] = useState([])

  useEffect(() => {
    supabase.from('medical_records').select('*').eq('patient_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRecord(data)
          setBloodType(data.blood_type || '')
          setFamilyHistory(data.family_history || '')
          setAllergies(data.allergies || [])
          setConditions(data.chronic_conditions || [])
          setTreatments(data.treatments || [])
          setSurgeries(data.surgeries || [])
        }
        setLoading(false)
      })
  }, [user.id])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      patient_id: user.id,
      blood_type: bloodType,
      family_history: familyHistory,
      allergies,
      chronic_conditions: conditions,
      treatments,
      surgeries,
      updated_at: new Date().toISOString(),
    }

    if (record) {
      await supabase.from('medical_records').update(payload).eq('id', record.id)
    } else {
      const { data } = await supabase.from('medical_records').insert(payload).select().single()
      setRecord(data)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-5 pb-8">
      {/* Header avec retour */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/profil')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-xl">Dossier médical</h1>
          <p className="text-xs text-muted-foreground">Accessible uniquement à vous et vos médecins.</p>
        </div>
      </div>

      {/* Groupe sanguin */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">🩸 Groupe sanguin</h3>
        <div className="flex flex-wrap gap-2">
          {BLOOD_TYPES.map(bt => (
            <button
              key={bt}
              type="button"
              onClick={() => setBloodType(bt)}
              className={`w-12 h-10 rounded-xl border text-sm font-semibold transition-all
                ${bloodType === bt
                  ? 'bg-accent border-accent text-white'
                  : 'bg-muted border-transparent text-gray-600 hover:border-border'}`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <TagInput
          label="⚠️ Allergies"
          items={allergies}
          onAdd={v => setAllergies(prev => [...prev, v])}
          onRemove={i => setAllergies(prev => prev.filter((_,idx) => idx !== i))}
          placeholder="Ex: Pénicilline, arachides..."
        />
      </div>

      {/* Maladies chroniques */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <TagInput
          label="🏥 Antécédents chroniques"
          items={conditions}
          onAdd={v => setConditions(prev => [...prev, v])}
          onRemove={i => setConditions(prev => prev.filter((_,idx) => idx !== i))}
          placeholder="Ex: Diabète, hypertension..."
        />
      </div>

      {/* Traitements */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <TagInput
          label="💊 Traitements en cours"
          items={treatments}
          onAdd={v => setTreatments(prev => [...prev, v])}
          onRemove={i => setTreatments(prev => prev.filter((_,idx) => idx !== i))}
          placeholder="Ex: Metformine 500mg..."
        />
      </div>

      {/* Chirurgies */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <TagInput
          label="🔪 Chirurgies / Hospitalisations"
          items={surgeries}
          onAdd={v => setSurgeries(prev => [...prev, v])}
          onRemove={i => setSurgeries(prev => prev.filter((_,idx) => idx !== i))}
          placeholder="Ex: Appendicite 2020..."
        />
      </div>

      {/* Antécédents familiaux */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          👨‍👩‍👧 Antécédents familiaux
        </label>
        <textarea
          value={familyHistory}
          onChange={e => setFamilyHistory(e.target.value)}
          rows={3}
          placeholder="Ex: Père diabétique, mère hypertendue..."
          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:bg-white border border-transparent focus:border-primary transition-all"
        />
      </div>

      {/* Bouton sauvegarder */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3.5 rounded-2xl font-heading font-semibold text-sm flex items-center justify-center gap-2 transition-all
          ${saved
            ? 'bg-primary/15 text-primary border border-primary/30'
            : 'bg-primary text-white hover:bg-primary-dark'}`}
      >
        {saving
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : saved
          ? '✅ Dossier sauvegardé !'
          : <><Save className="w-4 h-4" /> Sauvegarder le dossier</>
        }
      </motion.button>
    </div>
  )
}
