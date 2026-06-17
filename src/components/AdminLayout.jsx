import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Stethoscope, CalendarDays, Users, CreditCard, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV = [
  { to: '/admin/dashboard',   Icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/medecins',    Icon: Stethoscope,     label: 'Médecins'        },
  { to: '/admin/rendez-vous', Icon: CalendarDays,    label: 'Consultations'   },
  { to: '/admin/patients',    Icon: Users,           label: 'Patients'        },
  { to: '/admin/paiements',   Icon: CreditCard,      label: 'Paiements'       },
]

export default function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { await signOut(); navigate('/connexion') }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-border shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-5 rounded overflow-hidden">
              <div className="w-1/3 bg-primary" />
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-secondary" />
                <div className="flex-1 bg-accent" />
              </div>
            </div>
            <span className="font-heading font-bold text-base">BéniConsult</span>
          </div>
          <span className="text-xs text-accent font-medium mt-1 block">Administration</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${isActive ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:bg-muted'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-accent/5 hover:text-accent transition-all">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center justify-between">
          <span className="font-heading font-bold text-base">Admin BéniConsult</span>
          <button onClick={handleLogout} className="text-gray-500">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          <Outlet />
        </main>

        {/* Nav mobile bas */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-safe">
          <div className="flex items-center justify-around h-14">
            {NAV.map(({ to, Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1 ${isActive ? 'text-accent' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
