import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Video, FolderHeart, FileText, Paperclip, X, Image, File } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/api/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useMessages } from '@/hooks/useMessages'

function formatMessageDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const sameDay = (a, b) => a.toDateString() === b.toDateString()
  if (sameDay(date, now)) return "Aujourd'hui"
  if (sameDay(date, yesterday)) return 'Hier'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function groupMessagesByDay(messages) {
  const groups = []
  let currentDay = null
  messages.forEach(msg => {
    const day = new Date(msg.created_at).toDateString()
    if (day !== currentDay) {
      currentDay = day
      groups.push({ type: 'separator', label: formatMessageDate(msg.created_at), key: day })
    }
    groups.push({ type: 'message', ...msg })
  })
  return groups
}

export default function Chat() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const { messages, loading, sendMessage } = useMessages(appointmentId)
  const [appt, setAppt] = useState(null)
  const [otherProfile, setOtherProfile] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [attachPreview, setAttachPreview] = useState(null)
  const bottomRef = useRef()
  const textareaRef = useRef()
  const fileRef = useRef()

  useEffect(() => {
    supabase.from('appointments').select('*').eq('id', appointmentId).single()
      .then(async ({ data }) => {
        setAppt(data)
        if (data) {
          const otherId = role === 'doctor' ? data.patient_id : data.doctor_id
          const { data: op } = await supabase.from('profiles').select('*').eq('id', otherId).single()
          setOtherProfile(op)
        }
      })
  }, [appointmentId, role])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if ((!text.trim() && !attachPreview) || sending) return
    setSending(true)
    const content = text.trim() || (attachPreview ? `📎 ${attachPreview.name}` : '')
    setText('')
    textareaRef.current?.focus()
    await sendMessage({
      appointmentId,
      senderId: user.id,
      senderRole: role,
      content,
      file_url: attachPreview?.url || null,
      file_type: attachPreview?.type || null,
      file_name: attachPreview?.name || null,
    })
    setAttachPreview(null)
    setSending(false)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Fichier trop grand. Maximum 5MB.'); return }
    setUploading(true)
    const path = `chat/${appointmentId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('chat-files').upload(path, file, { upsert: false })
    if (!error) {
      const { data } = supabase.storage.from('chat-files').getPublicUrl(path)
      setAttachPreview({ url: data.publicUrl, name: file.name, type: file.type, isImage: file.type.startsWith('image/') })
    } else {
      alert('Erreur upload. Réessayez.')
    }
    setUploading(false)
    e.target.value = ''
  }

  const grouped = groupMessagesByDay(messages)
  const otherName = otherProfile?.full_name || appt?.doctor_name || appt?.patient_name
  const otherInitials = otherName?.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <div className="flex flex-col h-dvh bg-background">
      <div className="bg-primary text-white px-4 pt-3 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative">
            {otherProfile?.avatar_url
              ? <img src={otherProfile.avatar_url} alt={otherName} className="w-9 h-9 rounded-xl object-cover" />
              : <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-heading font-bold text-sm">{otherInitials}</div>
            }
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-primary rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-sm truncate">{otherName}</p>
            <p className="text-xs opacity-80">{role === 'doctor' ? appt?.patient_email : appt?.doctor_specialty}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/video/${appointmentId}`)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </button>
            {role === 'doctor' && (
              <>
                <button onClick={() => navigate(`/medecin/dossier/${appt?.patient_id}`)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <FolderHeart className="w-4 h-4" />
                </button>
                <button onClick={() => navigate(`/medecin/ordonnance/${appointmentId}`)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-xs opacity-90">Session active · {(appt?.tarif_fcfa || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <span className="text-xs font-semibold">En cours</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">👋</p>
            <p className="text-sm text-muted-foreground">Commencez la consultation en envoyant un message.</p>
          </div>
        ) : grouped.map((item, i) => {
          if (item.type === 'separator') {
            return (
              <div key={item.key} className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground bg-background px-2 shrink-0">{item.label}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )
          }
          const isMine = item.sender_id === user.id
          return (
            <motion.div key={item.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMine && (
                <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mb-1">
                  {otherInitials}
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                {item.file_url && (
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                    className={`rounded-2xl overflow-hidden border ${isMine ? 'border-primary/30' : 'border-border'}`}>
                    {item.file_type?.startsWith('image/') ? (
                      <img src={item.file_url} alt={item.file_name} className="max-w-[200px] max-h-[200px] object-cover" />
                    ) : (
                      <div className={`flex items-center gap-2 px-3 py-2.5 ${isMine ? 'bg-primary/10' : 'bg-muted'}`}>
                        <File className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">{item.file_name}</span>
                      </div>
                    )}
                  </a>
                )}
                {item.content && !item.content.startsWith('📎') && (
                  <div className={`rounded-2xl px-3.5 py-2.5 ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-border text-gray-800 rounded-bl-sm'}`}>
                    <p className="text-sm leading-relaxed">{item.content}</p>
                  </div>
                )}
                <p className="text-[10px] px-1 text-muted-foreground">{formatTime(item.created_at)}</p>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {messages.length < 2 && role === 'patient' && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-muted-foreground mb-2">Suggestions :</p>
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

      {attachPreview && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
            {attachPreview.isImage ? <Image className="w-4 h-4 text-primary shrink-0" /> : <File className="w-4 h-4 text-primary shrink-0" />}
            <span className="text-xs text-gray-700 flex-1 truncate">{attachPreview.name}</span>
            <button onClick={() => setAttachPreview(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-border px-4 py-3 pb-safe flex items-end gap-3 flex-shrink-0">
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-gray-500 hover:bg-border transition-colors disabled:opacity-40">
          {uploading
            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            : <Paperclip className="w-4 h-4" />}
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
        <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Écrire un message..." rows={1}
          className="flex-1 bg-muted rounded-xl px-3 py-2.5 text-sm outline-none resize-none max-h-32 focus:bg-primary/5 transition-colors" />
        <button onClick={handleSend} disabled={(!text.trim() && !attachPreview) || sending}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary-dark transition-colors">
          {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  )
}