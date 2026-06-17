import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Download, Maximize } from 'lucide-react'
import { supabase } from '@/api/supabase'
import jsPDF from 'jspdf'

export default function PrescriptionView() {
  const { prescriptionId } = useParams()
  const navigate = useNavigate()
  const [presc, setPresc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pharmaMode, setPharmaMode] = useState(false)

  useEffect(() => {
    supabase.from('prescriptions').select('*').eq('id', prescriptionId).single()
      .then(({ data }) => { setPresc(data); setLoading(false) })
  }, [prescriptionId])

  const downloadPDF = () => {
    const doc = new jsPDF({ format: 'a5', orientation: 'portrait' })
    // En-tête couleurs drapeau Bénin
    doc.setFillColor(0, 135, 81)   // vert
    doc.rect(0, 0, 148, 12, 'F')
    doc.setFillColor(252, 209, 22) // jaune
    doc.rect(0, 12, 148, 6, 'F')
    doc.setFillColor(232, 17, 45)  // rouge
    doc.rect(0, 18, 148, 6, 'F')

    doc.setTextColor(255,255,255)
    doc.setFontSize(14)
    doc.setFont('helvetica','bold')
    doc.text('BéniConsult', 10, 9)
    doc.setFontSize(8)
    doc.text('ORDONNANCE MÉDICALE', 100, 9)

    doc.setTextColor(30,30,30)
    doc.setFontSize(10)
    doc.setFont('helvetica','bold')
    doc.text(`Dr. ${presc?.doctor_name || '—'}`, 10, 35)
    doc.setFont('helvetica','normal')
    doc.setFontSize(8)
    doc.text(`Spécialité: ${presc?.doctor_specialty || '—'}`, 10, 41)
    doc.text(`Date: ${new Date(presc?.created_at).toLocaleDateString('fr-FR')}`, 110, 35)

    doc.setDrawColor(200,200,200)
    doc.line(10, 46, 138, 46)

    doc.setFontSize(9)
    doc.setFont('helvetica','bold')
    doc.text(`Patient: ${presc?.patient_name || '—'}`, 10, 54)

    doc.setFont('helvetica','normal')
    doc.setFontSize(8)
    doc.text('Prescription:', 10, 64)

    let y = 72
    ;(presc?.medications || []).forEach((med, i) => {
      doc.setFont('helvetica','bold')
      doc.text(`${i+1}. ${med.name}`, 14, y); y += 6
      doc.setFont('helvetica','normal')
      doc.text(`   Dosage: ${med.dosage} — Durée: ${med.duration}`, 14, y); y += 5
      if (med.instructions) { doc.text(`   Note: ${med.instructions}`, 14, y); y += 5 }
      y += 2
    })

    if (presc?.notes) {
      y += 4
      doc.setFont('helvetica','bold')
      doc.text('Diagnostic / Notes:', 10, y); y += 6
      doc.setFont('helvetica','normal')
      const lines = doc.splitTextToSize(presc.notes, 128)
      doc.text(lines, 10, y)
    }

    doc.setFontSize(7)
    doc.setTextColor(150,150,150)
    doc.text('Document généré par BéniConsult · beniconsult.bj', 74, 200, { align:'center' })

    doc.save(`ordonnance-beniconsult-${prescriptionId}.pdf`)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
  if (!presc) return <div className="p-6 text-center text-sm text-muted-foreground">Ordonnance introuvable.</div>

  if (pharmaMode) return (
    <div className="min-h-dvh bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-xl text-primary">ORDONNANCE</h1>
        <button onClick={() => setPharmaMode(false)} className="text-xs text-muted-foreground">Fermer</button>
      </div>
      <div className="border-b-2 border-primary pb-3 mb-4">
        <p className="font-bold text-lg">{presc.doctor_name}</p>
        <p className="text-sm text-gray-500">{presc.doctor_specialty}</p>
        <p className="text-xs text-gray-400">{new Date(presc.created_at).toLocaleDateString('fr-FR')}</p>
      </div>
      <p className="text-sm font-semibold mb-4">Patient : {presc.patient_name}</p>
      {(presc.medications||[]).map((med,i) => (
        <div key={i} className="mb-4 p-3 border border-border rounded-xl">
          <p className="font-bold text-base">{med.name}</p>
          <p className="text-sm">{med.dosage} — {med.duration}</p>
          {med.instructions && <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>}
        </div>
      ))}
      {presc.notes && <div className="mt-4 p-3 bg-muted rounded-xl"><p className="text-xs text-gray-600">{presc.notes}</p></div>}
    </div>
  )

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="font-heading font-semibold text-base">Ordonnance</h1>
          <div className="flex gap-2">
            <button onClick={() => setPharmaMode(true)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Maximize className="w-4 h-4" />
            </button>
            <button onClick={downloadPDF} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        {/* Infos médecin */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-heading font-bold text-sm">{presc.doctor_name}</p>
              <p className="text-xs text-muted-foreground">{presc.doctor_specialty}</p>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(presc.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="border-t border-border mt-3 pt-3">
            <p className="text-xs text-muted-foreground">Patient</p>
            <p className="text-sm font-semibold">{presc.patient_name}</p>
          </div>
        </div>

        {/* Médicaments */}
        <h3 className="font-heading font-semibold text-sm mb-3">Médicaments prescrits</h3>
        <div className="space-y-3 mb-4">
          {(presc.medications||[]).map((med, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between mb-1">
                <p className="font-heading font-semibold text-sm">{med.name}</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{i+1}</span>
              </div>
              <p className="text-xs text-gray-700">💊 {med.dosage}</p>
              <p className="text-xs text-gray-700">⏱ {med.duration}</p>
              {med.instructions && <p className="text-xs text-muted-foreground mt-1 italic">{med.instructions}</p>}
            </div>
          ))}
        </div>

        {/* Notes */}
        {presc.notes && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4 mb-4">
            <p className="font-heading font-semibold text-xs text-secondary-dark mb-1">Notes du médecin</p>
            <p className="text-sm text-gray-700">{presc.notes}</p>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3">
          <button onClick={() => setPharmaMode(true)}
            className="flex-1 py-3 rounded-xl bg-muted text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 hover:bg-border transition-colors">
            <Maximize className="w-4 h-4" /> Mode pharmacie
          </button>
          <button onClick={downloadPDF}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary-dark transition-colors">
            <Download className="w-4 h-4" /> Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  )
}
