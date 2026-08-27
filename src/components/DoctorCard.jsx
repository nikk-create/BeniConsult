import { useNavigate } from 'react-router-dom'
import { Star, MapPin, Circle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DoctorCard({ doctor, index = 0 }) {
  const navigate = useNavigate()
  const initials = doctor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => navigate(`/doctor/${doctor.id}`)}
      className="bg-card rounded-2xl border border-border p-4 cursor-pointer active:scale-[0.98] transition-transform hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Avatar — photo ou initiales */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="font-heading font-bold text-sm text-primary">{initials}</span>
            )}
          </div>
          {/* Indicateur en ligne */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white
            ${doctor.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm text-gray-900 truncate">{doctor.full_name}</p>
          <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-secondary fill-secondary" />
              <span className="text-xs font-medium">{(doctor.rating || 0).toFixed(1)}</span>
              {doctor.consultations_count > 0 && (
                <span className="text-[10px] text-muted-foreground ml-0.5">({doctor.consultations_count})</span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{doctor.city}</span>
            </div>
          </div>
        </div>

        {/* Tarif + statut */}
        <div className="text-right shrink-0">
          <p className="font-heading font-bold text-sm text-primary">
            {(doctor.tarif_fcfa || 0).toLocaleString('fr-FR')} F
          </p>
          <div className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
            ${doctor.is_online ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <Circle className={`w-1.5 h-1.5 ${doctor.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
            {doctor.is_online ? 'En ligne' : 'Hors ligne'}
          </div>
        </div>
      </div>

      {/* Hôpital */}
      {doctor.hospital && (
        <p className="text-[10px] text-muted-foreground mt-2 truncate">🏥 {doctor.hospital}</p>
      )}
    </motion.div>
  )
}
