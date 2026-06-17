import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, X, Eye, Circle, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/api/supabase'

const STATUS_TABS = ['Tous', 'En attente', 'Approuvés', 'Rejetés']
const STATUS_MAP = { 'En attente':'en_attente', 'Approuvés':'approuvé', 'Rejetés':'rejeté' }

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [tab, setTab] = useState('En attente')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // pour détail

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role','doctor')
      .order('created_at', { ascending:false })
      .then(({ data }) => { setDoctors(data||[]); setLoading(false) })
  }, [])

  useEffect(() => {
    let result = [...doctors]
    if (tab !== 'Tous') result = result.filter(d => d.doctor_status === STATUS_MAP[tab])
    if (search) result = result.filter(d =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      d.city?.toLowerCase().includes(search.toLowerCase()))
    setFiltered(result)
  }, [doctors, tab, search])

  const updateStatus = async (doctorId, status) => {
    await supabase.from('profiles').update({ doctor_status: status }).eq('id', doctorId)

    // Notif au médecin
    const msg = status === 'approuvé'
      ? '✅ Votre compte BéniConsult a été approuvé ! Vous pouvez maintenant vous connecter.'
      : '❌ Votre demande a été rejetée. Contactez support@beniconsult.bj pour plus d\'informations.'
    await supabase.from('notifications').insert({ user_id: doctorId, type: 'compte', message: msg })

    setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, doctor_status: status } : d))
    setSelected(prev => prev?.id === doctorId ? { ...prev, doctor_status: status } : prev)
  }

  const toggleOnline = async (doctorId, current) => {
    await supabase.from('profiles').update({ is_online: !current }).eq('id', doctorId)
    setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, is_online: !current } : d))
  }

  const counts = {
    'Tous': doctors.length,
    'En attente': doctors.filter(d=>d.doctor_status==='en_attente').length,
    'Approuvés': doctors.filter(d=>d.doctor_status==='approuvé').length,
    'Rejetés': doctors.filter(d=>d.doctor_status==='rejeté').length,
  }

  const statusBadge = {
    en_attente: 'bg-secondary/20 text-secondary-dark',
    approuvé:   'bg-primary/15 text-primary',
    rejeté:     'bg-accent/15 text-accent',
  }

  return (
    <div className="px-4 pt-5 md:px-6">
      <h1 className="font-heading font-bold text-2xl mb-4">Médecins</h1>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Nom, spécialité, ville..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5
              ${tab===t ? 'bg-accent text-white' : 'bg-card border border-border text-muted-foreground'}`}>
            {t}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab===t?'bg-white/20':'bg-muted'}`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-card rounded-2xl border animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
          Aucun médecin trouvé.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <motion.div key={doc.id} layout initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-heading font-bold text-sm text-primary shrink-0">
                  {doc.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-semibold text-sm">{doc.full_name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[doc.doctor_status]||statusBadge.en_attente}`}>
                      {doc.doctor_status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.specialty} · {doc.city}</p>
                  <p className="text-xs text-muted-foreground">{doc.hospital} · {doc.email}</p>
                </div>
                <button onClick={() => setSelected(selected?.id===doc.id ? null : doc)}
                  className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground hover:text-gray-700">
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                {doc.doctor_status === 'en_attente' && (
                  <>
                    <button onClick={() => updateStatus(doc.id, 'approuvé')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approuver
                    </button>
                    <button onClick={() => updateStatus(doc.id, 'rejeté')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent/10 text-accent border border-accent/20 text-xs font-semibold hover:bg-accent/20 transition-colors">
                      <X className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  </>
                )}
                {doc.doctor_status === 'approuvé' && (
                  <>
                    <button onClick={() => toggleOnline(doc.id, doc.is_online)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors
                        ${doc.is_online ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground border border-border'}`}>
                      <Circle className={`w-2 h-2 ${doc.is_online?'fill-green-500 text-green-500':'fill-gray-400 text-gray-400'}`} />
                      {doc.is_online ? 'En ligne' : 'Hors ligne'}
                    </button>
                    <button onClick={() => updateStatus(doc.id, 'rejeté')}
                      className="px-3 py-2 rounded-xl bg-muted text-xs text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors border border-border">
                      Suspendre
                    </button>
                  </>
                )}
                {doc.doctor_status === 'rejeté' && (
                  <button onClick={() => updateStatus(doc.id, 'approuvé')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                    Réactiver le compte
                  </button>
                )}
              </div>

              {/* Détail dépliable */}
              <AnimatePresence>
                {selected?.id === doc.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                    className="overflow-hidden">
                    <div className="border-t border-border mt-3 pt-3 space-y-1.5">
                      {[
                        ['Tarif', `${(doc.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA`],
                        ['Téléphone', doc.phone || '—'],
                        ['Note', `${(doc.rating||0).toFixed(1)} / 5`],
                        ['Consultations', doc.consultations_count || 0],
                      ].map(([l,v]) => (
                        <div key={l} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{l}</span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                      {doc.bio && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border italic">{doc.bio}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
