import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

const METHODS = [
  { key:'mtn',  label:'MTN MoMo Bénin', desc:'Solde disponible', color:'border-secondary bg-secondary/5', active:'border-secondary bg-secondary/10', dot:'bg-yellow-400', prefix:'+229 96' },
  { key:'moov', label:'Moov Money',      desc:'Paiement instantané', color:'border-border bg-muted', active:'border-primary bg-primary/5', dot:'bg-primary', prefix:'+229 97' },
  { key:'carte',label:'Carte bancaire',  desc:'Visa / Mastercard', color:'border-border bg-muted', active:'border-blue-400 bg-blue-50', dot:'bg-blue-500', prefix:'4242' },
]

export default function Payment() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const appointmentId = params.get('appointment')
  const isInstant = params.get('instant') === '1'

  const [appt, setAppt] = useState(null)
  const [method, setMethod] = useState('mtn')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState('form') // form | processing | success

  useEffect(() => {
    if (appointmentId) {
      supabase.from('appointments').select('*').eq('id', appointmentId).single()
        .then(({ data }) => setAppt(data))
    }
  }, [appointmentId])

  const handlePay = async () => {
    if (!phone.trim()) return
    setStep('processing')

    // Simulation paiement mobile money (2s)
    await new Promise(r => setTimeout(r, 2200))

    const { error } = await supabase.from('payments').insert({
      appointment_id: appointmentId,
      patient_id: user.id,
      doctor_id: appt?.doctor_id,
      amount_fcfa: appt?.tarif_fcfa || 0,
      method,
      phone_number: phone,
      status: 'succès',
      reference: `BNC-${Date.now()}`,
    })

    if (!error) {
      // Met à jour le statut du RDV
      await supabase.from('appointments').update({ status: isInstant ? 'confirmé' : 'confirmé' }).eq('id', appointmentId)

      // Notification médecin
      await supabase.from('notifications').insert({
        user_id: appt?.doctor_id,
        type: 'paiement',
        message: `Paiement reçu de ${profile?.full_name} — ${(appt?.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA`,
      })
    }

    setStep('success')
  }

  if (step === 'processing') return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6">
      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
        <h2 className="font-heading font-bold text-xl mb-2">Traitement en cours...</h2>
        <p className="text-sm text-muted-foreground">Veuillez confirmer sur votre téléphone {method === 'mtn' ? 'MTN' : 'Moov'}</p>
      </motion.div>
    </div>
  )

  if (step === 'success') return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background px-6">
      <motion.div initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ type:'spring', bounce:0.4 }} className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-heading font-bold text-2xl mb-2">Paiement réussi !</h2>
        <p className="text-sm text-muted-foreground mb-1">{(appt?.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA débités</p>
        <p className="text-sm text-muted-foreground mb-8">Votre consultation avec {appt?.doctor_name} est confirmée.</p>

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          {isInstant && (
            <button onClick={() => navigate(`/chat/${appointmentId}`)}
              className="w-full bg-primary text-white py-3 rounded-xl font-heading font-semibold text-sm hover:bg-primary-dark transition-colors">
              Commencer la consultation →
            </button>
          )}
          <button onClick={() => navigate('/rendez-vous')}
            className="w-full bg-muted text-gray-700 py-3 rounded-xl font-heading font-semibold text-sm hover:bg-border transition-colors">
            Mes rendez-vous
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-background">
      {/* Header rouge */}
      <div className="bg-accent text-white px-4 pt-4 pb-8">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-5">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm opacity-85 mb-1">Montant à régler</p>
        <p className="font-heading font-bold text-4xl">{(appt?.tarif_fcfa||0).toLocaleString('fr-FR')}</p>
        <p className="text-base opacity-90 mt-1">FCFA</p>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Récap */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          className="bg-card rounded-2xl border border-accent/20 p-4 shadow-sm">
          <p className="font-heading font-semibold text-sm mb-3">Récapitulatif</p>
          {[
            ['Médecin', appt?.doctor_name || '—'],
            ['Spécialité', appt?.doctor_specialty || '—'],
            ['Date', appt?.date || '—'],
            ['Heure', appt?.time || '—'],
          ].map(([l,v]) => (
            <div key={l} className="flex justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-xs text-muted-foreground">{l}</span>
              <span className="text-xs font-medium">{v}</span>
            </div>
          ))}
        </motion.div>

        {/* Méthodes */}
        <div>
          <p className="font-heading font-semibold text-sm mb-3">Payer via</p>
          <div className="space-y-2.5">
            {METHODS.map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left
                  ${method===m.key ? m.active : m.color}`}>
                <div className={`w-3 h-3 rounded-full ${m.dot} shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                  ${method===m.key ? 'border-primary' : 'border-gray-300'}`}>
                  {method===m.key && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Numéro */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1.5">
            {method === 'carte' ? 'Numéro de carte' : `Numéro ${method==='mtn'?'MTN':'Moov'}`}
          </p>
          <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-3 py-3 bg-muted border-r border-border text-xs font-medium text-gray-600 shrink-0">
              {METHODS.find(m2=>m2.key===method)?.prefix}
            </div>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={method==='carte'?'xxxx xxxx xxxx xxxx':'xx xx xx xx'}
              className="flex-1 px-3 py-3 text-sm outline-none" />
          </div>
        </div>

        {/* Bouton payer */}
        <button onClick={handlePay} disabled={!phone.trim()}
          className="w-full bg-accent text-white py-4 rounded-2xl font-heading font-bold text-base disabled:opacity-50 hover:bg-accent-dark transition-colors shadow-sm">
          Payer {(appt?.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA
        </button>

        <p className="text-[10px] text-muted-foreground text-center">
          🔒 Paiement sécurisé · BéniConsult · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
