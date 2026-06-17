import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Building, ChevronLeft, Circle, MessageCircle, Video } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

const TIMES = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00']

function getDays() {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1)
    return {
      iso: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' })
    }
  })
}

export default function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile: userProfile } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [booking, setBooking] = useState(false)
  const [msg, setMsg] = useState('')
  const days = getDays()

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', id).single()
      .then(({ data }) => { setDoctor(data); setLoading(false) })
  }, [id])

  const handleBook = async () => {
    if (!selectedDay || !selectedTime) { setMsg('Choisissez une date et un créneau.'); return }
    setBooking(true)
    const { data: appt, error } = await supabase.from('appointments').insert({
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      doctor_specialty: doctor.specialty,
      patient_id: user.id,
      patient_name: userProfile?.full_name,
      patient_email: user.email,
      date: selectedDay,
      time: selectedTime,
      tarif_fcfa: doctor.tarif_fcfa,
      status: 'en_attente',
    }).select().single()

    if (error) { setMsg("Erreur lors de la réservation."); setBooking(false); return }

    // Notification au médecin
    await supabase.from('notifications').insert({
      user_id: doctor.id,
      type: 'rdv',
      message: `Nouvelle demande de ${userProfile?.full_name} pour le ${selectedDay} à ${selectedTime}`,
    })

    navigate(`/paiement?appointment=${appt.id}`)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )
  if (!doctor) return <div className="p-6 text-center text-sm text-muted-foreground">Médecin introuvable.</div>

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark px-4 pt-4 pb-8 text-white relative">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-4">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-heading font-bold text-xl">
            {doctor.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-lg leading-tight">{doctor.full_name}</h1>
            <p className="text-sm opacity-85 mt-0.5">{doctor.specialty}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                <span className="text-sm font-medium">{(doctor.rating||0).toFixed(1)}</span>
                <span className="text-xs opacity-70">({doctor.consultations_count||0} consultations)</span>
              </div>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
              ${doctor.is_online ? 'bg-green-400/20 text-green-200' : 'bg-white/10 text-white/60'}`}>
              <Circle className={`w-2 h-2 ${doctor.is_online ? 'fill-green-400 text-green-400' : ''}`} />
              {doctor.is_online ? 'En ligne' : 'Hors ligne'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Infos card */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          className="bg-card rounded-2xl border border-border p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Établissement</p>
                <p className="text-xs font-medium">{doctor.hospital || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Ville</p>
                <p className="text-xs font-medium">{doctor.city}</p>
              </div>
            </div>
          </div>
          {doctor.bio && <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">{doctor.bio}</p>}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Tarif consultation</span>
            <span className="font-heading font-bold text-lg text-primary">{(doctor.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA</span>
          </div>
        </motion.div>

        {/* Consultation instantanée si dispo */}
        {doctor.is_online && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
            <p className="font-heading font-semibold text-sm text-green-800 mb-1">Disponible maintenant ⚡</p>
            <p className="text-xs text-green-700 mb-3">Ce médecin est en ligne. Commencez une consultation instantanée.</p>
            <div className="flex gap-2">
              <button onClick={() => {
                supabase.from('appointments').insert({
                  doctor_id:doctor.id, doctor_name:doctor.full_name, doctor_specialty:doctor.specialty,
                  patient_id:user.id, patient_name:userProfile?.full_name, patient_email:user.email,
                  date:new Date().toISOString().split('T')[0], time:new Date().toTimeString().slice(0,5),
                  tarif_fcfa:doctor.tarif_fcfa, status:'confirmé', type:'instant',
                }).select().single().then(({ data }) => {
                  if (data) navigate(`/paiement?appointment=${data.id}&instant=1`)
                })
              }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> Chat instantané
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-green-300 text-green-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-green-50 transition-colors">
                <Video className="w-3.5 h-3.5" /> Appel vidéo
              </button>
            </div>
          </motion.div>
        )}

        {/* Prise de RDV */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
          className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Prendre rendez-vous</h3>

          {/* Jours */}
          <p className="text-xs text-muted-foreground mb-2">Choisir une date</p>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
            {days.map(d => (
              <button key={d.iso} onClick={() => setSelectedDay(d.iso)}
                className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-colors
                  ${selectedDay===d.iso ? 'bg-primary border-primary text-white' : 'bg-muted border-transparent text-gray-600 hover:border-border'}`}>
                {d.label}
              </button>
            ))}
          </div>

          {/* Créneaux */}
          {selectedDay && (
            <>
              <p className="text-xs text-muted-foreground mb-2">Choisir un créneau</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-2 rounded-xl border text-xs font-medium transition-colors
                      ${selectedTime===t ? 'bg-primary border-primary text-white' : 'bg-muted border-transparent text-gray-600 hover:border-primary/30'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}

          {msg && <p className="text-xs text-accent mb-3">{msg}</p>}

          <button onClick={handleBook} disabled={booking || !selectedDay || !selectedTime}
            className="w-full bg-primary text-white py-3 rounded-xl font-heading font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
            {booking ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Réserver — ${(doctor.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA`}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
