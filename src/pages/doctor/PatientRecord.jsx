import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/api/supabase'

export default function PatientRecord() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [patient, setPatient] = useState(null)
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').eq('id', patientId).single(),
      supabase.from('medical_records').select('*').eq('patient_id', patientId).maybeSingle(),
      supabase.from('appointments').select('*').eq('patient_id', patientId)
        .order('date', { ascending: false }).limit(10),
    ]).then(([{ data: p }, { data: r }, { data: a }]) => {
      setPatient(p)
      setRecord(r)
      setAppts(a || [])
      setLoading(false)
    })
  }, [patientId])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  )

  const Badge = ({ label, color = 'bg-primary/10 text-primary' }) => (
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
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="font-heading font-bold text-xl">Dossier patient</h1>
      </div>

      {/* Infos patient */}
      <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl p-4 mb-4">
        <p className="font-heading font-bold text-lg">{patient?.full_name || '—'}</p>
        <p className="text-xs text-muted-foreground">{patient?.email} {patient?.phone ? `· ${patient.phone}` : ''}</p>
        {record?.blood_type && (
          <span className="inline-block mt-2 bg-accent/15 text-accent px-2.5 py-1 rounded-full text-xs font-bold">
            {record.blood_type}
          </span>
        )}
      </div>

      {record ? (
        <>
          {record.allergies?.length > 0 && (
            <Section title="⚠️ Allergies">
              <div className="flex flex-wrap gap-2">
                {record.allergies.map((a, i) => <Badge key={i} label={a} color="bg-accent/10 text-accent" />)}
              </div>
            </Section>
          )}

          {record.chronic_conditions?.length > 0 && (
            <Section title="🏥 Antécédents chroniques">
              <div className="flex flex-wrap gap-2">
                {record.chronic_conditions.map((c, i) => <Badge key={i} label={c} />)}
              </div>
            </Section>
          )}

          {record.treatments?.length > 0 && (
            <Section title="💊 Traitements en cours">
              <div className="flex flex-wrap gap-2">
                {record.treatments.map((t, i) => <Badge key={i} label={t} color="bg-secondary/20 text-secondary-dark" />)}
              </div>
            </Section>
          )}

          {record.surgeries?.length > 0 && (
            <Section title="🔪 Chirurgies / Hospitalisations">
              <div className="flex flex-wrap gap-2">
                {record.surgeries.map((s, i) => <Badge key={i} label={s} color="bg-gray-100 text-gray-600" />)}
              </div>
            </Section>
          )}

          {record.family_history && (
            <Section title="👨‍👩‍👧 Antécédents familiaux">
              <p className="text-sm text-gray-700 leading-relaxed">{record.family_history}</p>
            </Section>
          )}
        </>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6 text-center mb-4">
          <p className="text-sm text-muted-foreground">Aucun dossier médical renseigné par ce patient.</p>
        </div>
      )}

      {/* Historique consultations */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-4">
        <h3 className="font-heading font-semibold text-sm mb-3">📋 Historique des consultations</h3>
        {appts.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune consultation.</p>
        ) : appts.map(a => (
          <div key={a.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <div>
              <p className="text-xs font-medium">{a.date} · {a.time}</p>
              <p className="text-[10px] text-muted-foreground">{a.status}</p>
            </div>
            <span className="text-xs font-semibold text-primary">
              {(a.tarif_fcfa || 0).toLocaleString('fr-FR')} F
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
