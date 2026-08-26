import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Video, FileText, Star, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '@/api/supabase'
import RatingModal from './RatingModal'

const STATUS = {
  en_attente: { label: 'En attente',  cls: 'bg-secondary/20 text-secondary-dark' },
  confirmé:   { label: 'Confirmé',    cls: 'bg-primary/15 text-primary' },
  terminé:    { label: 'Terminé',     cls: 'bg-gray-100 text-gray-500' },
  annulé:     { label: 'Annulé',      cls: 'bg-accent/15 text-accent' },
}

export default function AppointmentCard({ appt, isDoctor = false, onRefresh }) {
  const navigate = useNavigate()
  const [paid, setPaid] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const status = STATUS[appt.status] || STATUS.en_attente
  const name = isDoctor ? appt.patient_name : appt.doctor_name

  // Vérifie si le paiement existe pour ce RDV
  useEffect(() => {
    if (appt.status === 'confirmé') {
      supabase.from('payments')
        .select('id')
        .eq('appointment_id', appt.id)
        .eq('status', 'succès')
        .maybeSingle()
        .then(({ data }) => setPaid(!!data))
    }
  }, [appt.id, appt.status])

  const handleChat = async () => {
    if (isDoctor) { navigate(`/chat/${appt.id}`); return }

    // Vérifie le paiement avant d'ouvrir le chat
    setCheckingPayment(true)
    const { data } = await supabase.from('payments')
      .select('id').eq('appointment_id', appt.id).eq('status', 'succès').maybeSingle()
    setCheckingPayment(false)

    if (data) {
      navigate(`/chat/${appt.id}`)
    } else {
      // Redirige vers paiement si pas encore payé
      navigate(`/paiement?appointment=${appt.id}`)
    }
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-heading font-semibold text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">
              {isDoctor ? appt.patient_email : appt.doctor_specialty}
            </p>
          </div>
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span>📅 {appt.date}</span>
          <span>🕐 {appt.time}</span>
          <span>💰 {(appt.tarif_fcfa || 0).toLocaleString('fr-FR')} F</span>
        </div>

        {/* Indicateur paiement */}
        {appt.status === 'confirmé' && !isDoctor && (
          <div className={`flex items-center gap-1.5 text-xs mb-3 px-2.5 py-1.5 rounded-lg w-fit
            ${paid ? 'bg-primary/8 text-primary' : 'bg-accent/8 text-accent'}`}>
            {paid
              ? <><CheckCircle className="w-3 h-3" /> Paiement confirmé</>
              : <><Lock className="w-3 h-3" /> Paiement requis pour le chat</>
            }
          </div>
        )}

        {/* Actions RDV confirmé */}
        {appt.status === 'confirmé' && (
          <div className="flex gap-2">
            <button
              onClick={handleChat}
              disabled={checkingPayment}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {checkingPayment
                ? <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                : <MessageCircle className="w-3.5 h-3.5" />
              }
              {!isDoctor && !paid ? 'Payer & Consulter' : 'Chat'}
            </button>
            <button
              onClick={() => navigate(`/video/${appt.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary/15 text-secondary-dark text-xs font-medium hover:bg-secondary/25 transition-colors"
            >
              <Video className="w-3.5 h-3.5" /> Vidéo
            </button>
            {appt.prescription_id && (
              <button
                onClick={() => navigate(`/ordonnance/${appt.prescription_id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-border transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Ordonnance
              </button>
            )}
          </div>
        )}

        {/* Bouton notation — consultation terminée et pas encore notée */}
        {appt.status === 'terminé' && !isDoctor && !appt.rated && (
          <button
            onClick={() => setShowRating(true)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary-dark text-xs font-semibold hover:bg-secondary/20 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
            Noter cette consultation
          </button>
        )}

        {/* Déjà noté */}
        {appt.status === 'terminé' && !isDoctor && appt.rated && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-secondary text-secondary" />
            Consultation notée — merci !
          </div>
        )}
      </div>

      {/* Modal notation */}
      {showRating && (
        <RatingModal
          appointment={appt}
          onClose={() => setShowRating(false)}
          onRated={onRefresh}
        />
      )}
    </>
  )
}
