import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function WritePrescription() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [appt, setAppt] = useState(null)
  const [meds, setMeds] = useState([{ name: '', dosage: '', duration: '', instructions: '' }])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('appointments').select('*').eq('id', appointmentId).single()
      .then(({ data }) => setAppt(data))
  }, [appointmentId])

  const addMed = () => setMeds(m => [...m, { name: '', dosage: '', duration: '', instructions: '' }])
  const removeMed = (i) => setMeds(m => m.filter((_, idx) => idx !== i))
  const updateMed = (i, field, val) => setMeds(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med))

  const handleSave = async () => {
    setSaving(true)
    const { data: presc } = await supabase.from('prescriptions').insert({
      appointment_id: appointmentId,
      doctor_id: user.id,
      doctor_name: profile?.full_name,
      doctor_specialty: profile?.specialty,
      patient_id: appt?.patient_id,
      patient_name: appt?.patient_name,
      medications: meds.filter(m => m.name.trim()),
      notes,
    }).select().single()

    await supabase.from('appointments').update({ status: 'terminé', prescription_id: presc?.id }).eq('id', appointmentId)

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
              <span className="text-xs font-semibold text-muted-foreground">Médicament {i + 1}</span>
              {meds.length > 1 && (
                <button onClick={() => removeMed(i)} className="text-accent">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {[
              ['name', 'Nom du médicament', 'Ex: Paracétamol 500mg'],
              ['dosage', 'Posologie', 'Ex: 1 comprimé 3x/jour'],
              ['duration', 'Durée', 'Ex: 5 jours'],
              ['instructions', 'Instructions (optionnel)', 'Ex: Prendre après repas'],
            ].map(([field, label, placeholder]) => (
              <div key={field} className="mb-2.5">
                <label className="text-[10px] text-muted-foreground mb-1 block">{label}</label>
                <input
                  value={med[field]}
                  onChange={e => updateMed(i, field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-muted border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:border-secondary focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={addMed}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted border border-dashed border-border text-sm text-muted-foreground hover:border-secondary hover:text-secondary-dark transition-colors mb-4">
        <Plus className="w-4 h-4" /> Ajouter un médicament
      </button>

      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes / Diagnostic</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Diagnostic, recommandations, notes cliniques..."
          className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-secondary"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || meds.every(m => !m.name.trim())}
        className="w-full bg-primary text-white py-3.5 rounded-xl font-heading font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
      >
        {saving
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : '📋 Valider et envoyer l\'ordonnance'
        }
      </button>
    </div>
  )
}
