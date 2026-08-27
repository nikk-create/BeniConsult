import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Stethoscope, Shield, CreditCard, MessageCircle } from 'lucide-react'

const SLIDES = [
  {
    icon: Stethoscope,
    color: 'bg-primary',
    title: 'Consultez un médecin',
    subtitle: 'en quelques minutes',
    desc: 'Accédez à des médecins béninois certifiés depuis votre smartphone, 7j/7 et 24h/24.',
    bg: 'from-primary to-primary-dark',
  },
  {
    icon: MessageCircle,
    color: 'bg-secondary',
    title: 'Chat ou vidéo',
    subtitle: 'à votre choix',
    desc: 'Consultez par chat texte ou appel vidéo selon votre préférence et votre connexion.',
    bg: 'from-secondary-dark to-yellow-600',
  },
  {
    icon: CreditCard,
    color: 'bg-accent',
    title: 'Payez avec',
    subtitle: 'MTN MoMo ou Moov',
    desc: 'Réglez vos consultations facilement avec les solutions mobile money du Bénin.',
    bg: 'from-accent to-red-700',
  },
  {
    icon: Shield,
    color: 'bg-primary',
    title: '100% confidentiel',
    subtitle: 'et sécurisé',
    desc: 'Vos données médicales sont chiffrées et accessibles uniquement par vous et votre médecin.',
    bg: 'from-primary to-primary-dark',
  },
]

export default function Onboarding({ onFinish }) {
  const [current, setCurrent] = useState(0)

  const next = () => {
    if (current < SLIDES.length - 1) setCurrent(c => c + 1)
    else onFinish()
  }

  const skip = () => onFinish()

  const slide = SLIDES[current]
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5 pb-2">
        <img src="/logo.png" alt="BéniConsult" className="w-8 h-8 object-contain" />
        <button onClick={skip} className="text-xs text-muted-foreground font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
          Passer
        </button>
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col items-center justify-center px-6 text-center"
        >
          {/* Illustration */}
          <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slide.bg} flex items-center justify-center mb-8 shadow-lg`}>
            <Icon className="w-14 h-14 text-white" />
          </div>

          <h1 className="font-heading font-bold text-2xl text-gray-900 mb-1">
            {slide.title}
          </h1>
          <p className={`font-heading font-bold text-2xl mb-4 ${current === 0 ? 'text-primary' : current === 1 ? 'text-secondary-dark' : current === 2 ? 'text-accent' : 'text-primary'}`}>
            {slide.subtitle}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {slide.desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Indicateurs + bouton */}
      <div className="px-6 pb-10">
        {/* Points */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300
                ${i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-gray-200'}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full bg-primary text-white py-4 rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm"
        >
          {current === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          <ChevronRight className="w-5 h-5" />
        </button>

        {current === SLIDES.length - 1 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Bénin 🇧🇯 · BéniConsult · Téléconsultation médicale
          </p>
        )}
      </div>
    </div>
  )
}