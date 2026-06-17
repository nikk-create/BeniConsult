import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/api/supabase'

export function useMessages(appointmentId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appointmentId) return

    // Charge les messages existants
    supabase
      .from('messages')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setMessages(data || []); setLoading(false) })

    // Écoute les nouveaux messages en temps réel (Supabase Realtime)
    const channel = supabase
      .channel(`messages:${appointmentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `appointment_id=eq.${appointmentId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [appointmentId])

  const sendMessage = useCallback(async ({ appointmentId, senderId, senderRole, content }) => {
    const { data, error } = await supabase.from('messages').insert({
      appointment_id: appointmentId,
      sender_id: senderId,
      sender_role: senderRole,
      content,
    }).select().single()
    return { data, error }
  }, [])

  return { messages, loading, sendMessage }
}
