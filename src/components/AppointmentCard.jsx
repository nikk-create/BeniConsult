import { useNavigate } from 'react-router-dom'
import { MessageCircle, Video, FileText } from 'lucide-react'

const STATUS = {
  en_attente: { label:'En attente', cls:'bg-secondary/20 text-secondary-dark' },
  confirmé:   { label:'Confirmé',   cls:'bg-primary/15 text-primary' },
  terminé:    { label:'Terminé',    cls:'bg-gray-100 text-gray-500' },
  annulé:     { label:'Annulé',     cls:'bg-accent/15 text-accent' },
}

export default function AppointmentCard({ appt, isDoctor = false }) {
  const navigate = useNavigate()
  const status = STATUS[appt.status] || STATUS.en_attente
  const name = isDoctor ? appt.patient_name : appt.doctor_name

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-heading font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{isDoctor ? appt.patient_email : appt.doctor_specialty}</p>
        </div>
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span>📅 {appt.date}</span>
        <span>🕐 {appt.time}</span>
        <span>💰 {(appt.tarif_fcfa||0).toLocaleString('fr-FR')} F</span>
      </div>

      {(appt.status === 'confirmé') && (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/chat/${appt.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </button>
          <button onClick={() => navigate(`/video/${appt.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary/15 text-secondary-dark text-xs font-medium hover:bg-secondary/25 transition-colors">
            <Video className="w-3.5 h-3.5" /> Vidéo
          </button>
          {appt.prescription_id && (
            <button onClick={() => navigate(`/ordonnance/${appt.prescription_id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-border transition-colors">
              <FileText className="w-3.5 h-3.5" /> Ordonnance
            </button>
          )}
        </div>
      )}
    </div>
  )
}
