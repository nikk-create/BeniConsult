import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Circle } from 'lucide-react'
import { supabase } from '@/api/supabase'
import DoctorCard from '@/components/DoctorCard'

const SPECIALTIES = ['Toutes','Médecine générale','Pédiatrie','Gynécologie','Cardiologie','Dermatologie','Ophtalmologie','Dentisterie','Neurologie','Psychiatrie','Orthopédie']
const CITIES = ['Toutes','Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Natitingou','Ouidah','Abomey']
const SORT_OPTIONS = [
  { key: 'online',  label: 'En ligne d\'abord' },
  { key: 'rating',  label: 'Mieux notés' },
  { key: 'price_asc', label: 'Prix croissant' },
  { key: 'price_desc', label: 'Prix décroissant' },
]

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [specialty, setSpecialty] = useState('Toutes')
  const [city, setCity] = useState('Toutes')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [sortBy, setSortBy] = useState('online')

  useEffect(() => {
    supabase.from('profiles').select('*')
      .eq('role', 'doctor')
      .eq('doctor_status', 'approuvé')
      .then(({ data }) => {
        setDoctors(data || [])
        setLoading(false)
      })

    // Realtime — met à jour le statut en ligne des médecins
    const channel = supabase
      .channel('doctors_online')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.doctor',
      }, (payload) => {
        setDoctors(prev =>
          prev.map(d => d.id === payload.new.id ? { ...d, ...payload.new } : d)
        )
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    let result = [...doctors]

    // Filtres
    if (search) result = result.filter(d =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase()))
    if (specialty !== 'Toutes') result = result.filter(d => d.specialty === specialty)
    if (city !== 'Toutes') result = result.filter(d => d.city === city)
    if (onlineOnly) result = result.filter(d => d.is_online)

    // Tri
    result.sort((a, b) => {
      if (sortBy === 'online') {
        if (a.is_online && !b.is_online) return -1
        if (!a.is_online && b.is_online) return 1
        return (b.rating || 0) - (a.rating || 0)
      }
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'price_asc') return (a.tarif_fcfa || 0) - (b.tarif_fcfa || 0)
      if (sortBy === 'price_desc') return (b.tarif_fcfa || 0) - (a.tarif_fcfa || 0)
      return 0
    })

    setFiltered(result)
  }, [search, specialty, city, onlineOnly, sortBy, doctors])

  const onlineCount = doctors.filter(d => d.is_online).length
  const hasFilters = specialty !== 'Toutes' || city !== 'Toutes' || onlineOnly

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading font-bold text-2xl">Médecins</h1>
        {onlineCount > 0 && (
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">{onlineCount} en ligne</span>
          </div>
        )}
      </div>

      {/* Barre recherche */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, spécialité, hôpital..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(s => !s)}
          className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors relative
            ${showFilters || hasFilters ? 'bg-primary border-primary text-white' : 'bg-card border-border text-gray-600'}`}>
          <SlidersHorizontal className="w-4 h-4" />
          {hasFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-white" />}
        </button>
      </div>

      {/* Filtre rapide — En ligne */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button onClick={() => setOnlineOnly(o => !o)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
            ${onlineOnly ? 'bg-green-600 border-green-600 text-white' : 'bg-card border-border text-gray-600'}`}>
          <Circle className={`w-2 h-2 ${onlineOnly ? 'fill-white text-white' : 'fill-green-500 text-green-500'}`} />
          Disponible maintenant
        </button>
        {SORT_OPTIONS.map(opt => (
          <button key={opt.key} onClick={() => setSortBy(opt.key)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
              ${sortBy === opt.key ? 'bg-primary border-primary text-white' : 'bg-card border-border text-gray-600'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filtres avancés */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Spécialité</p>
                <div className="flex gap-2 flex-wrap">
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => setSpecialty(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                        ${specialty === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
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
                        ${city === c ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {hasFilters && (
                <button onClick={() => { setSpecialty('Toutes'); setCity('Toutes'); setOnlineOnly(false) }}
                  className="flex items-center gap-1 text-xs text-accent font-medium">
                  <X className="w-3 h-3" /> Réinitialiser les filtres
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} médecin{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        {onlineOnly && <span className="text-green-600 font-medium"> · en ligne</span>}
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-medium text-gray-700">Aucun résultat</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            {onlineOnly ? 'Aucun médecin disponible en ce moment.' : 'Essayez d\'autres critères.'}
          </p>
          {onlineOnly && (
            <button onClick={() => setOnlineOnly(false)}
              className="text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
              Voir tous les médecins
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {filtered.map((doc, i) => (
            <DoctorCard key={doc.id} doctor={doc} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
