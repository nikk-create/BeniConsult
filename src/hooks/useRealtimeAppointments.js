import { useEffect, useCallback } from 'react'
import { supabase } from '@/api/supabase'

/**
 * Écoute en temps réel les changements de statut des RDV
 * et déclenche onUpdate quand un RDV change
 */
export function useRealtimeAppointments(userId, role, onUpdate) {
  useEffect(() => {
    if (!userId) return

    const field = role === 'doctor' ? 'doctor_id' : 'patient_id'

    const channel = supabase
      .channel(`appointments:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments',
        filter: `${field}=eq.${userId}`,
      }, (payload) => {
        const appt = payload.new
        const old = payload.old

        // Déclenche le callback avec le changement
        onUpdate?.(appt, old)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId, role])
}
