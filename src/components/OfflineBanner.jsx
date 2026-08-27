import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOffline'

export default function OfflineBanner() {
  const { online, wasOffline } = useOnlineStatus()
  const [showBack, setShowBack] = useState(false)

  useEffect(() => {
    if (online && wasOffline) {
      setShowBack(true)
      const t = setTimeout(() => setShowBack(false), 3000)
      return () => clearTimeout(t)
    }
  }, [online, wasOffline])

  return (
    <AnimatePresence>
      {(!online || showBack) && (
        <motion.div
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -48 }}
          transition={{ duration: 0.25 }}
          className={`fixed top-0 left-0 right-0 z-[60] px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium
            ${online ? 'bg-primary text-white' : 'bg-gray-900 text-white'}`}
        >
          {online ? (
            <><Wifi className="w-4 h-4" /> Connexion rétablie ✓</>
          ) : (
            <><WifiOff className="w-4 h-4 animate-pulse" /> Pas de connexion — certaines fonctions indisponibles</>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}