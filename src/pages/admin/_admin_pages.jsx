// AdminAppointments.jsx
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/api/supabase'

export function AdminAppointments() {
  const [appts, setAppts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [loading, setLoading] = useState(true)

  const STATUS = ['Tous','en_attente','confirmé','terminé','annulé']
  const statusBadge = {
    en_attente:'bg-secondary/20 text-secondary-dark',
    confirmé:'bg-primary/15 text-primary',
    terminé:'bg-muted text-muted-foreground',
    annulé:'bg-accent/15 text-accent',
  }

  useEffect(() => {
    supabase.from('appointments').select('*').order('created_at', { ascending:false })
      .then(({ data }) => { setAppts(data||[]); setFiltered(data||[]); setLoading(false) })
  }, [])

  useEffect(() => {
    let r = [...appts]
    if (statusFilter !== 'Tous') r = r.filter(a => a.status === statusFilter)
    if (search) r = r.filter(a =>
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase()))
    setFiltered(r)
  }, [appts, search, statusFilter])

  return (
    <div className="px-4 pt-5 md:px-6">
      <h1 className="font-heading font-bold text-2xl mb-4">Consultations</h1>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom patient ou médecin..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {STATUS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${statusFilter===s ? 'bg-accent text-white' : 'bg-card border border-border text-muted-foreground'}`}>
            {s}
          </button>
        ))}
      </div>
      {loading ? <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-14 bg-card rounded-xl border animate-pulse" />)}</div>
       : filtered.length === 0 ? <div className="bg-card rounded-2xl border p-8 text-center text-sm text-muted-foreground">Aucune consultation.</div>
       : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {filtered.map((a,i) => (
            <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${i<filtered.length-1?'border-b border-border/50':''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{a.patient_name || '—'} → {a.doctor_name}</p>
                <p className="text-[10px] text-muted-foreground">{a.date} · {a.time} · {(a.tarif_fcfa||0).toLocaleString('fr-FR')} F</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBadge[a.status]||statusBadge.en_attente}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
       )}
    </div>
  )
}

// AdminPatients.jsx
export function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role','patient').order('created_at', { ascending:false })
      .then(({ data }) => { setPatients(data||[]); setLoading(false) })
  }, [])

  const filtered = patients.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="px-4 pt-5 md:px-6">
      <h1 className="font-heading font-bold text-2xl mb-4">Patients ({patients.length})</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom ou email..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent" />
      </div>
      {loading ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-16 bg-card rounded-xl border animate-pulse" />)}</div>
       : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {filtered.map((p,i) => (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i<filtered.length-1?'border-b border-border/50':''}`}>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-heading font-bold text-xs text-primary shrink-0">
                {p.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.email} {p.phone?`· ${p.phone}`:''}</p>
              </div>
              <p className="text-[10px] text-muted-foreground shrink-0">
                {new Date(p.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
       )}
    </div>
  )
}

// AdminPayments.jsx
export function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payments').select('*').order('created_at', { ascending:false })
      .then(({ data }) => { setPayments(data||[]); setLoading(false) })
  }, [])

  const total = payments.filter(p=>p.status==='succès').reduce((s,p)=>s+(p.amount_fcfa||0),0)
  const mtn = payments.filter(p=>p.status==='succès'&&p.method==='mtn').reduce((s,p)=>s+(p.amount_fcfa||0),0)
  const moov = payments.filter(p=>p.status==='succès'&&p.method==='moov').reduce((s,p)=>s+(p.amount_fcfa||0),0)

  const statusBadge = { succès:'bg-primary/10 text-primary', echec:'bg-accent/10 text-accent', en_attente:'bg-secondary/20 text-secondary-dark' }

  return (
    <div className="px-4 pt-5 md:px-6">
      <h1 className="font-heading font-bold text-2xl mb-4">Paiements</h1>
      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[['Total', total, 'border-primary/20'], ['MTN MoMo', mtn, 'border-secondary/30'], ['Moov', moov, 'border-primary/20']].map(([l,v,b]) => (
          <div key={l} className={`bg-card rounded-2xl border ${b} p-3 text-center`}>
            <p className="font-heading font-bold text-base">{v.toLocaleString('fr-FR')}</p>
            <p className="text-[10px] text-muted-foreground">F · {l}</p>
          </div>
        ))}
      </div>
      {loading ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 bg-card rounded-xl border animate-pulse" />)}</div>
       : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {payments.map((p,i) => (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${i<payments.length-1?'border-b border-border/50':''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{(p.amount_fcfa||0).toLocaleString('fr-FR')} FCFA</p>
                <p className="text-[10px] text-muted-foreground">{p.method?.toUpperCase()} · {p.phone_number} · {new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBadge[p.status]||statusBadge.en_attente}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
       )}
    </div>
  )
}
