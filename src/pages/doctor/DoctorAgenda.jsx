import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function DoctorAgenda() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)
  const [appts, setAppts] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    supabase.from('appointments').select('*').eq('doctor_id', user.id).neq('status', 'annulé')
      .then(({ data }) => setAppts(data || []))
  }, [user.id])

  const getWeekDays = () => {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay() + 1 + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return {
        iso: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        num: d.getDate(),
      }
    })
  }

  const days = getWeekDays()
  const dayAppts = appts.filter(a => a.date === selectedDate).sort((a, b) => a.time?.localeCompare(b.time))

  const STATUS_COLOR = {
    confirmé:   'border-l-primary bg-primary/5',
    en_attente: 'border-l-secondary bg-secondary/5',
    terminé:    'border-l-gray-300 bg-muted',
  }

  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="font-heading font-bold text-2xl mb-4">Agenda</h1>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-medium text-gray-700">
          {days[0].num} — {days[6].num} {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
        </p>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jours */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {days.map(d => {
          const count = appts.filter(a => a.date === d.iso).length
          const active = d.iso === selectedDate
          return (
            <button key={d.iso} onClick={() => setSelectedDate(d.iso)}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl transition-all min-w-[44px]
                ${active ? 'bg-primary text-white' : 'bg-card border border-border text-gray-600'}`}>
              <span className="text-[10px] font-medium">{d.day}</span>
              <span className="font-heading font-bold text-base leading-tight">{d.num}</span>
              {count > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${active ? 'bg-white' : 'bg-primary'}`} />
              )}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {dayAppts.length} consultation{dayAppts.length > 1 ? 's' : ''} ce jour
      </p>

      {dayAppts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
          Pas de consultation ce jour.
        </div>
      ) : (
        <div className="space-y-2.5">
          {dayAppts.map(a => (
            <div key={a.id} className={`bg-card rounded-2xl border-l-4 border border-border p-4 ${STATUS_COLOR[a.status] || STATUS_COLOR.en_attente}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-heading font-semibold text-sm">{a.patient_name}</p>
                <span className="text-xs font-semibold text-primary">{a.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {(a.tarif_fcfa || 0).toLocaleString('fr-FR')} FCFA · {a.status}
              </p>
              {a.status === 'confirmé' && (
                <button onClick={() => navigate(`/chat/${a.id}`)}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <MessageCircle className="w-3.5 h-3.5" /> Ouvrir le chat
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
