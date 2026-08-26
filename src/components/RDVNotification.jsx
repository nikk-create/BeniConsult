import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, X, CalendarDays } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'

export default function RDVNotification() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 6000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  useRealtimeAppointments(user?.id, role, (appt, old) => {
    // Statut changé de en_attente → confirmé
    if (old.status === 'en_attente' && appt.status === 'confirmé') {
      addToast({
        type: 'confirmed',
        title: role === 'patient' ? 'RDV confirmé ! ✅' : 'Demande acceptée',
        message: role === 'patient'
          ? `${appt.doctor_name} a confirmé votre rendez-vous du ${appt.date}.`
          : `RDV avec ${appt.patient_name} confirmé pour le ${appt.date}.`,
        appointmentId: appt.id,
        icon: CheckCircle,
        color: 'border-primary bg-primary/5',
        iconColor: 'text-primary',
      })
    }

    // Statut changé → annulé
    if (old.status !== 'annulé' && appt.status === 'annulé') {
      addToast({
        type: 'cancelled',
        title: 'RDV annulé',
        message: `Le rendez-vous du ${appt.date} a été annulé.`,
        appointmentId: appt.id,
        icon: X,
        color: 'border-accent bg-accent/5',
        iconColor: 'text-accent',
      })
    }

    // Statut changé → terminé (patient peut noter)
    if (old.status === 'confirmé' && appt.status === 'terminé' && role === 'patient') {
      addToast({
        type: 'ended',
        title: 'Consultation terminée',
        message: `N'oubliez pas de noter ${appt.doctor_name} !`,
        appointmentId: appt.id,
        icon: CalendarDays,
        color: 'border-secondary bg-secondary/5',
        iconColor: 'text-secondary-dark',
      })
    }
  })

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-3 left-3 sm:left-auto sm:w-80 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = toast.icon
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className={`bg-white rounded-2xl border-2 ${toast.color} p-4 shadow-lg pointer-events-auto`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl bg-white border border-current/20 flex items-center justify-center shrink-0 ${toast.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm text-gray-900">{toast.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
                  {toast.appointmentId && (
                    <button
                      onClick={() => navigate('/rendez-vous')}
                      className="text-xs text-primary font-medium mt-1.5 hover:underline"
                    >
                      Voir mes rendez-vous →
                    </button>
                  )}
                </div>
                <button onClick={() => removeToast(toast.id)} className="shrink-0 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
