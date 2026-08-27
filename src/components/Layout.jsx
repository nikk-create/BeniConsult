import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Users, CalendarDays, MessageCircle, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import NotificationBell from './NotificationBell'
import RDVNotification from './RDVNotification'
import LangSwitcher from './LangSwitcher'

const NAV_KEYS = ['home', 'doctors', 'appointments', 'chat', 'profile']
const NAV_ICONS = [Home, Users, CalendarDays, MessageCircle, UserCircle]
const NAV_PATHS = ['/accueil', '/medecins', '/rendez-vous', '/messages', '/profil']

export default function Layout() {
  const { user } = useAuth()
  const { t } = useLang()
  const location = useLocation()

  const NAV = NAV_KEYS.map((key, i) => ({
    to: NAV_PATHS[i],
    Icon: NAV_ICONS[i],
    label: t(key),
  }))

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="BéniConsult" className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-base text-gray-900">
            Beni<span className="text-primary">consult</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <NotificationBell userId={user?.id} />
        </div>
      </header>

      <RDVNotification />

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV.map(({ to, Icon, label }) => {
            const active = location.pathname === to
            return (
              <NavLink key={to} to={to}
                onClick={() => { if (active) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative">
                {active && (
                  <motion.div layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/8 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${active ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-medium relative z-10 transition-colors ${active ? 'text-primary' : 'text-gray-400'}`}>
                  {label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
