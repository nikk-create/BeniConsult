import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Stethoscope, Shield, Clock, MessageCircle, Video,
  Star, ChevronRight, Phone, Mail, MapPin,
  CheckCircle, Users, Award, Zap, Baby, Heart,
  Brain, Eye, Smile, Activity, Syringe, Microscope
} from 'lucide-react'

function Logo({ size = 48 }) {
  return (
    <img
      src="/logo.png"
      alt="BéniConsult"
      style={{ width: size, height: size }}
      className="object-contain"
    />
  )
}

const FEATURES = [
  { Icon: Zap,         title: 'Consultation instantanée', desc: 'Médecin disponible en moins de 2 minutes, 7j/7 et 24h/24.' },
  { Icon: Shield,      title: '100% confidentiel',        desc: 'Vos données médicales sont chiffrées et protégées.' },
  { Icon: Video,       title: 'Chat & Vidéo',             desc: 'Consultez par chat ou appel vidéo selon votre préférence.' },
  { Icon: MessageCircle, title: 'Ordonnance digitale',    desc: 'Recevez votre ordonnance en PDF directement après la consultation.' },
]

const SPECIALTIES = [
  { Icon: Stethoscope, label: 'Médecine générale',  color: 'text-primary',      bg: 'bg-primary/8' },
  { Icon: Baby,        label: 'Pédiatrie',           color: 'text-blue-500',     bg: 'bg-blue-50' },
  { Icon: Heart,       label: 'Gynécologie',         color: 'text-pink-500',     bg: 'bg-pink-50' },
  { Icon: Activity,    label: 'Cardiologie',         color: 'text-accent',       bg: 'bg-accent/8' },
  { Icon: Microscope,  label: 'Dermatologie',        color: 'text-purple-500',   bg: 'bg-purple-50' },
  { Icon: Brain,       label: 'Neurologie',          color: 'text-indigo-500',   bg: 'bg-indigo-50' },
  { Icon: Eye,         label: 'Ophtalmologie',       color: 'text-teal-500',     bg: 'bg-teal-50' },
  { Icon: Smile,       label: 'Dentisterie',         color: 'text-secondary-dark', bg: 'bg-secondary/15' },
]

const STEPS = [
  { n: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 2 minutes avec votre email.' },
  { n: '02', title: 'Choisissez un médecin', desc: 'Parcourez les profils et choisissez selon votre besoin.' },
  { n: '03', title: 'Consultez', desc: 'Par chat ou vidéo, depuis votre smartphone.' },
  { n: '04', title: 'Recevez votre ordonnance', desc: 'Téléchargez le PDF et achetez vos médicaments.' },
]

const STATS = [
  { value: '8+',    label: 'Médecins certifiés' },
  { value: '4.8',   label: 'Note moyenne' },
  { value: '1 500', label: 'FCFA / consultation' },
  { value: '24h',   label: 'Disponibilité' },
]

const TESTIMONIALS = [
  { name: 'Koffi A.', city: 'Cotonou', text: 'J\'ai pu consulter un médecin à 22h un dimanche. Service incroyable !', stars: 5 },
  { name: 'Fatou B.', city: 'Parakou', text: 'Mon enfant avait de la fièvre, le pédiatre a été disponible en 5 min.', stars: 5 },
  { name: 'Serge M.', city: 'Porto-Novo', text: 'Très pratique pour un suivi de tension artérielle à distance.', stars: 4 },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-white font-body overflow-x-hidden">

      {/* ── NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-heading font-bold text-lg text-gray-900">Beni<span className="text-primary">consult</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#fonctionnalites" className="hover:text-primary transition-colors">Fonctionnalités</a>
          <a href="#comment" className="hover:text-primary transition-colors">Comment ça marche</a>
          <a href="#avis" className="hover:text-primary transition-colors">Avis</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/connexion')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-primary border border-primary hover:bg-primary/5 transition-colors">
            Connexion
          </button>
          <button onClick={() => navigate('/connexion')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors hidden md:block">
            S'inscrire
          </button>
        </div>
      </nav>

      {/* ── HERO */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white overflow-hidden">
        {/* Déco drapeau */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <div className="h-1/2 bg-secondary" />
          <div className="h-1/2 bg-accent" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="flex justify-center mb-6">
            <Logo size={80} />
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="font-heading font-bold text-3xl md:text-5xl leading-tight mb-4">
            La santé à portée de main<br />
            <span className="text-secondary">au Bénin 🇧🇯</span>
          </motion.h1>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="text-base md:text-lg opacity-90 mb-8 max-w-xl mx-auto leading-relaxed">
            Consultez des médecins béninois certifiés depuis votre smartphone,
            à toute heure, où que vous soyez  par chat ou vidéo.
          </motion.p>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/connexion')}
              className="flex items-center justify-center gap-2 bg-white text-primary font-heading font-bold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-lg text-sm">
              Consulter maintenant <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/connexion')}
              className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-heading font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/25 transition-colors text-sm">
              <Stethoscope className="w-4 h-4" /> Je suis médecin
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 max-w-2xl mx-auto">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 + i*0.07 }}
                className="bg-white/15 rounded-2xl p-3 text-center">
                <p className="font-heading font-bold text-xl md:text-2xl text-secondary">{s.value}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vague */}
        <div className="relative h-12 md:h-16">
          <svg viewBox="0 0 1440 60" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,60 1440,20 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">Pourquoi BéniConsult ?</h2>
          <p className="text-sm text-gray-500">Une plateforme conçue pour les réalités béninoises</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
              className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SPÉCIALITÉS */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Nos spécialités</h2>
          <p className="text-sm text-gray-500 mb-8">Des experts dans toutes les disciplines médicales</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {SPECIALTIES.map(({ Icon, label, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity:0, y:12 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE */}
      <section id="comment" className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">Comment ça marche ?</h2>
          <p className="text-sm text-gray-500">En 4 étapes simples, depuis votre téléphone</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEPS.map((step, i) => (
            <motion.div key={step.n} initial={{ opacity:0, x: i%2===0?-20:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
              className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="font-heading font-bold text-2xl text-primary/20 shrink-0 w-10">{step.n}</div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PAIEMENT */}
      <section className="py-12 px-4 bg-gradient-to-r from-secondary/10 to-secondary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">Paiement mobile money</h2>
          <p className="text-sm text-gray-500 mb-6">Payez facilement avec vos solutions préférées</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { label:'MTN MoMo', color:'bg-yellow-400', text:'text-yellow-900' },
              { label:'Moov Money', color:'bg-primary', text:'text-white' },
              { label:'Carte bancaire', color:'bg-blue-600', text:'text-white' },
            ].map(m => (
              <div key={m.label} className={`${m.color} ${m.text} px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm`}>
                {m.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">À partir de 1 500 FCFA · Paiement 100% sécurisé</p>
        </div>
      </section>

      {/* ── AVIS */}
      <section id="avis" className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">Ce que disent nos patients</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-secondary text-secondary" />)}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
              <div>
                <p className="text-xs font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.city}, Bénin</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA MÉDECIN */}
      <section className="py-12 px-4 bg-primary text-white">
        <div className="max-w-2xl mx-auto text-center">
          <Stethoscope className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="font-heading font-bold text-2xl mb-3">Vous êtes médecin ?</h2>
          <p className="text-sm opacity-85 mb-6 leading-relaxed">
            Rejoignez BéniConsult et consultez vos patients à distance.
            Gérez votre agenda, recevez des paiements et émettez des ordonnances digitales.
          </p>
          <button onClick={() => navigate('/connexion')}
            className="bg-secondary text-secondary-dark font-heading font-bold px-6 py-3 rounded-xl hover:bg-secondary/80 transition-colors text-sm">
            Rejoindre en tant que médecin →
          </button>
        </div>
      </section>

      {/* ── CONTACT */}
      <section id="contact" className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Contactez-nous</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { Icon:Phone, label:'Téléphone', value:'+229 97 00 00 00' },
            { Icon:Mail,  label:'Email',     value:'support@beniconsult.bj' },
            { Icon:MapPin,label:'Adresse',   value:'Cotonou, Bénin 🇧🇯' },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER */}
      <footer className="bg-gray-900 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo size={32} />
                <span className="font-heading font-bold text-lg">Beni<span className="text-secondary">consult</span></span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Plateforme de téléconsultation médicale dédiée au Bénin.
                Santé accessible, partout, tout le temps.
              </p>
            </div>

            {/* Liens */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-semibold text-gray-300 mb-3">Plateforme</p>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/connexion')} className="hover:text-white transition-colors">Se connecter</button></li>
                  <li><button onClick={() => navigate('/connexion')} className="hover:text-white transition-colors">S'inscrire</button></li>
                  <li><button onClick={() => navigate('/connexion')} className="hover:text-white transition-colors">Espace médecin</button></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-300 mb-3">Légal</p>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/cgu')} className="hover:text-white transition-colors">CGU</button></li>
                  <li><button onClick={() => navigate('/confidentialite')} className="hover:text-white transition-colors">Confidentialité</button></li>
                  <li><a href="mailto:support@beniconsult.bj" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Drapeau + copyright */}
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-4 w-6 rounded overflow-hidden">
                <div className="w-1/3 bg-primary" />
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 bg-secondary" />
                  <div className="flex-1 bg-accent" />
                </div>
              </div>
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} BéniConsult · Cotonou, Bénin</p>
            </div>
            <p className="text-xs text-gray-500">Fait par InnovaTech pour le système de santé béninois</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
