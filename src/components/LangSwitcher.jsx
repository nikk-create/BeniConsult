import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { Globe } from 'lucide-react'

const LANG_LABELS = {
  fr:     { label: 'Français', flag: '🇫🇷' },
  fon:    { label: 'Fon',      flag: '🇧🇯' },
  yoruba: { label: 'Yorùbá',   flag: '🇧🇯' },
}

export default function LangSwitcher({ className = '' }) {
  const { lang, changeLang, langs } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted hover:bg-border transition-colors text-xs font-medium text-gray-600"
      >
        <Globe className="w-3.5 h-3.5" />
        {LANG_LABELS[lang]?.flag} {LANG_LABELS[lang]?.label}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-9 z-50 bg-white rounded-xl border border-border shadow-lg overflow-hidden min-w-[130px]"
            >
              {langs.map(l => (
                <button
                  key={l}
                  onClick={() => { changeLang(l); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors
                    ${lang === l ? 'bg-primary/8 text-primary font-semibold' : 'hover:bg-muted text-gray-700'}`}
                >
                  <span>{LANG_LABELS[l]?.flag}</span>
                  <span>{LANG_LABELS[l]?.label}</span>
                  {lang === l && <span className="ml-auto text-primary">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
