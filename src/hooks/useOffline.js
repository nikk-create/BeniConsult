import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const goOnline = () => { setOnline(true) }
    const goOffline = () => { setOnline(false); setWasOffline(true) }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return { online, wasOffline }
}
