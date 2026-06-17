import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Video, FolderHeart, FileText, Paperclip } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'

export default function Chat() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const { messages, loading, sendMessage } = useMessages(appointmentId)
  const [appt, setAppt] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    supabase.from('appointments').select('*').eq('id', appointmentId).single()
      .then(({ data }) => setAppt(data))
  }, [appointmentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    await sendMessage({ appointmentId, senderId: user.id, senderRole: role, content })
    setSending(false)
  }

  const otherName = role === 'doctor' ? appt?.patient_name : appt?.doctor_name
  const otherInitials = otherName?.split(' ').map(n=>n[0]).join('').slice(0,2)

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-4 pt-3 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-heading font-bold text-sm relative">
            {otherInitials}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-primary rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm truncate">{otherName}</p>
            <p className="text-xs opacity-80">{role==='doctor' ? appt?.patient_email : appt?.doctor_specialty}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/video/${appointmentId}`)}
              className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </button>
            {role === 'doctor' && (
              <>
                <button onClick={() => navigate(`/medecin/dossier/${appt?.patient_id}`)}
                  className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <FolderHeart className="w-4 h-4" />
                </button>
                <button onClick={() => navigate(`/medecin/ordonnance/${appointmentId}`)}
                  className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Timer session */}
        <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-xs opacity-90">Session active · {(appt?.tarif_fcfa||0).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <span className="text-xs font-semibold">En cours</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">👋</p>
            <p className="text-sm text-muted-foreground">Commencez la consultation en envoyant un message.</p>
          </div>
        ) : messages.map((m, i) => {
          const isMine = m.sender_id === user.id
          return (
            <motion.div key={m.id || i}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMine && (
                <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {otherInitials}
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5
                ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-border text-gray-800 rounded-bl-sm'}`}>
                <p className="text-sm leading-relaxed">{m.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions rapides (si peu de messages) */}
      {messages.length < 2 && role === 'patient' && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-muted-foreground mb-2">Réponses rapides :</p>
          <div className="flex gap-2 flex-wrap">
            {["J'ai de la fièvre", "Mon enfant est malade", "J'ai des douleurs", "Besoin d'un certificat"].map(q => (
              <button key={q} onClick={() => setText(q)}
                className="px-3 py-1.5 bg-white border border-border rounded-full text-xs text-gray-700 hover:border-primary/40 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-border px-4 py-3 pb-safe flex items-end gap-3 flex-shrink-0">
        <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-gray-500">
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Écrire un message..." rows={1}
          className="flex-1 bg-muted rounded-xl px-3 py-2.5 text-sm outline-none resize-none max-h-32 focus:bg-primary/5 transition-colors" />
        <button onClick={handleSend} disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary-dark transition-colors">
          {sending
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  )
}
