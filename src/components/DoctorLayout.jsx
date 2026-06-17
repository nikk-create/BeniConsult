import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, CalendarDays, MessageCircle, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import NotificationBell from './NotificationBell'

const NAV = [
  { to: '/medecin/dashboard', Icon: LayoutDashboard, label: 'Tableau' },
  { to: '/medecin/agenda',    Icon: CalendarDays,     label: 'Agenda'  },
  { to: '/medecin/messages',  Icon: MessageCircle,    label: 'Messages'},
  { to: '/medecin/profil',    Icon: UserCircle,       label: 'Profil'  },
]

export default function DoctorLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="sticky top-0 z-40 bg-secondary/10 backdrop-blur border-b border-secondary/30 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-4 rounded overflow-hidden">
            <div className="w-1/3 bg-primary" />
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-secondary" />
              <div className="flex-1 bg-accent" />
            </div>
          </div>
          <span className="font-heading font-bold text-base">BéniConsult</span>
          <span className="text-xs bg-secondary/30 text-secondary-dark px-2 py-0.5 rounded-full font-medium">Médecin</span>
        </div>
        <NotificationBell userId={user?.id} />
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV.map(({ to, Icon, label }) => {
            const active = location.pathname === to
            return (
              <NavLink key={to} to={to}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative">
                {active && (
                  <motion.div layoutId="doctor-nav-pill"
                    className="absolute inset-0 bg-secondary/15 rounded-xl"
                    transition={{ type:'spring', bounce:0.2, duration:0.5 }} />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${active ? 'text-secondary-dark' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-medium relative z-10 ${active ? 'text-secondary-dark' : 'text-gray-400'}`}>{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
