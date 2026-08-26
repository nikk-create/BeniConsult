import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function RatingModal({ appointment, onClose, onRated }) {
  const { user, profile } = useAuth()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setSaving(true)

    // 1. Insère la notation
    await supabase.from('ratings').insert({
      appointment_id: appointment.id,
      doctor_id: appointment.doctor_id,
      patient_id: user.id,
      patient_name: profile?.full_name || user.email,
      rating,
      comment: comment.trim(),
    })

    // 2. Recalcule la moyenne du médecin
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('doctor_id', appointment.doctor_id)

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      await supabase.from('profiles').update({
        rating: Math.round(avg * 10) / 10,
        consultations_count: ratings.length,
      }).eq('id', appointment.doctor_id)
    }

    // 3. Marque le RDV comme noté
    await supabase.from('appointments').update({ rated: true }).eq('id', appointment.id)

    // 4. Notifie le médecin
    await supabase.from('notifications').insert({
      user_id: appointment.doctor_id,
      type: 'rdv',
      message: `${profile?.full_name || 'Un patient'} vous a donné ${rating}/5 étoiles.`,
    })

    setSaving(false)
    setDone(true)
    setTimeout(() => { onRated?.(); onClose() }, 1800)
  }

  const labels = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent']

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl"
        >
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-heading font-bold text-lg text-gray-900 mb-1">Merci pour votre avis !</p>
              <p className="text-sm text-muted-foreground">Votre note aide d'autres patients.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-lg">Noter la consultation</h3>
                  <p className="text-xs text-muted-foreground">{appointment.doctor_name}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Étoiles */}
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hover || rating)
                          ? 'fill-secondary text-secondary'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Label */}
              <p className="text-center text-sm font-medium text-gray-600 mb-4 h-5">
                {labels[hover || rating]}
              </p>

              {/* Commentaire */}
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Commentaire optionnel..."
                className="w-full bg-muted border border-transparent rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-primary focus:bg-white transition-all mb-4"
              />

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || saving}
                className="w-full bg-primary text-white py-3 rounded-xl font-heading font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
              >
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : `Envoyer ma note ${rating > 0 ? `(${rating}/5)` : ''}`
                }
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
