import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Drapeau déco */}
      <div className="flex h-1.5 w-32 rounded-full overflow-hidden mb-8">
        <div className="w-1/4 bg-primary" />
        <div className="flex-1 bg-secondary" />
        <div className="flex-1 bg-accent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        {/* Logo */}
        <img src="/logo.png" alt="BéniConsult" className="w-16 h-16 object-contain mx-auto mb-6" />

        {/* 404 stylisé */}
        <div className="relative mb-6">
          <p className="font-heading font-bold text-8xl text-gray-100 select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Search className="w-7 h-7 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="font-heading font-bold text-2xl text-gray-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Retournez à l'accueil pour continuer.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-heading font-semibold text-sm hover:bg-primary-dark transition-colors"
          >
            <Home className="w-4 h-4" /> Retour à l'accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-muted text-gray-600 py-3.5 rounded-xl font-heading font-semibold text-sm hover:bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Page précédente
          </button>
        </div>
      </motion.div>

      <p className="text-xs text-muted-foreground mt-10">
        BéniConsult · Cotonou, Bénin 🇧🇯
      </p>
    </div>
  )
}
