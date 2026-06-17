import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '@/api/supabase'
import DoctorCard from '@/components/DoctorCard'

const SPECIALTIES = ['Toutes','Médecine générale','Pédiatrie','Gynécologie','Cardiologie','Dermatologie','Ophtalmologie','Dentisterie','Neurologie','Psychiatrie','Orthopédie']
const CITIES = ['Toutes','Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Natitingou','Ouidah','Abomey']

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [specialty, setSpecialty] = useState('Toutes')
  const [city, setCity] = useState('Toutes')
  const [onlineOnly, setOnlineOnly] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role','doctor').eq('doctor_status','approuvé')
      .order('is_online', { ascending:false })
      .then(({ data }) => { setDoctors(data||[]); setFiltered(data||[]); setLoading(false) })
  }, [])

  useEffect(() => {
    let result = [...doctors]
    if (search) result = result.filter(d =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase()))
    if (specialty !== 'Toutes') result = result.filter(d => d.specialty === specialty)
    if (city !== 'Toutes') result = result.filter(d => d.city === city)
    if (onlineOnly) result = result.filter(d => d.is_online)
    setFiltered(result)
  }, [search, specialty, city, onlineOnly, doctors])

  const hasFilters = specialty !== 'Toutes' || city !== 'Toutes' || onlineOnly

  return (
    <div className="px-4 pt-5">
      <h1 className="font-heading font-bold text-2xl mb-4">Médecins</h1>

      {/* Barre recherche */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, spécialité..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
        </div>
        <button onClick={() => setShowFilters(s => !s)}
          className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors relative
            ${showFilters||hasFilters ? 'bg-primary border-primary text-white' : 'bg-card border-border text-gray-600'}`}>
          <SlidersHorizontal className="w-4 h-4" />
          {hasFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />}
        </button>
      </div>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Spécialité</p>
                <div className="flex gap-2 flex-wrap">
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => setSpecialty(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                        ${specialty===s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Ville</p>
                <div className="flex gap-2 flex-wrap">
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setCity(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                        ${city===c ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-600">En ligne uniquement</p>
                <button onClick={() => setOnlineOnly(o => !o)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${onlineOnly ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${onlineOnly ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats */}
      <p className="text-xs text-muted-foreground mb-3">{filtered.length} médecin{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-medium text-gray-700">Aucun résultat</p>
          <p className="text-xs text-muted-foreground mt-1">Essayez d'autres critères</p>
          {hasFilters && (
            <button onClick={() => { setSpecialty('Toutes'); setCity('Toutes'); setOnlineOnly(false) }}
              className="mt-3 text-xs text-primary font-medium flex items-center gap-1 mx-auto">
              <X className="w-3 h-3" /> Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {filtered.map((doc, i) => <DoctorCard key={doc.id} doctor={doc} index={i} />)}
        </div>
      )}
    </div>
  )
}
