import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// Layouts
import Layout from '@/components/Layout'
import DoctorLayout from '@/components/DoctorLayout'
import AdminLayout from '@/components/AdminLayout'

// Pages publiques
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import CGU from '@/pages/CGU'
import Confidentialite from '@/pages/Confidentialite'
import NotFound from '@/pages/NotFound'

// Pages patient
import Home from '@/pages/Home'
import Doctors from '@/pages/Doctors'
import DoctorProfile from '@/pages/DoctorProfile'
import Appointments from '@/pages/Appointments'
import Messages from '@/pages/Messages'
import Chat from '@/pages/Chat'
import VideoCall from '@/pages/VideoCall'
import Payment from '@/pages/Payment'
import Payments from '@/pages/Payments'
import Profile from '@/pages/Profile'
import DossierMedical from '@/pages/DossierMedical'
import PrescriptionView from '@/pages/PrescriptionView'

// Pages médecin
import DoctorHome from '@/pages/doctor/DoctorHome'
import DoctorAgenda from '@/pages/doctor/DoctorAgenda'
import DoctorMessages from '@/pages/doctor/DoctorMessages'
import DoctorProfil from '@/pages/doctor/DoctorProfil'
import WritePrescription from '@/pages/doctor/WritePrescription'
import PatientRecord from '@/pages/doctor/PatientRecord'

// Pages admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminDoctors from '@/pages/admin/AdminDoctors'
import AdminAppointments from '@/pages/admin/AdminAppointments'
import AdminPatients from '@/pages/admin/AdminPatients'
import AdminPayments from '@/pages/admin/AdminPayments'

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-body">Chargement...</p>
      </div>
    </div>
  )
}

function RoleRedirect() {
  const { role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!role) return <Navigate to="/connexion" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'doctor') return <Navigate to="/medecin/dashboard" replace />
  return <Navigate to="/accueil" replace />
}

function ProtectedRoute({ children, allowedRoles }) {
  const { role, loading, profile, signOut } = useAuth()
  if (loading) return <Spinner />
  if (!role) return <Navigate to="/connexion" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />

  if (role === 'doctor' && profile?.doctor_status === 'en_attente') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">Compte en attente</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Votre dossier est en cours de vérification par l'équipe BéniConsult.
            Vous recevrez une notification dès validation.
          </p>
          <button
            onClick={() => { signOut(); window.location.href = '/connexion' }}
            className="w-full py-2.5 rounded-xl bg-muted text-sm font-medium text-muted-foreground hover:bg-border transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    )
  }

  if (role === 'doctor' && profile?.doctor_status === 'rejeté') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
        <div className="bg-card rounded-2xl border border-accent/20 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">Compte rejeté</h2>
          <p className="text-sm text-muted-foreground">
            Votre demande n'a pas été approuvée. Contactez support@beniconsult.bj pour plus d'informations.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Landing />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/confidentialite" element={<Confidentialite />} />

        {/* Redirection selon rôle */}
        <Route path="/app" element={<RoleRedirect />} />

        {/* ── PATIENT */}
        <Route element={<ProtectedRoute allowedRoles={['patient']}><Layout /></ProtectedRoute>}>
          <Route path="/accueil" element={<Home />} />
          <Route path="/medecins" element={<Doctors />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/rendez-vous" element={<Appointments />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/paiement" element={<Payment />} />
          <Route path="/paiements" element={<Payments />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/dossier-medical" element={<DossierMedical />} />
        </Route>

        {/* Pages sans layout */}
        <Route path="/chat/:appointmentId" element={<ProtectedRoute allowedRoles={['patient','doctor']}><Chat /></ProtectedRoute>} />
        <Route path="/video/:appointmentId" element={<ProtectedRoute allowedRoles={['patient','doctor']}><VideoCall /></ProtectedRoute>} />
        <Route path="/ordonnance/:prescriptionId" element={<ProtectedRoute allowedRoles={['patient','doctor']}><PrescriptionView /></ProtectedRoute>} />

        {/* ── MÉDECIN */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout /></ProtectedRoute>}>
          <Route path="/medecin/dashboard" element={<DoctorHome />} />
          <Route path="/medecin/agenda" element={<DoctorAgenda />} />
          <Route path="/medecin/messages" element={<DoctorMessages />} />
          <Route path="/medecin/profil" element={<DoctorProfil />} />
        </Route>

        <Route path="/medecin/ordonnance/:appointmentId" element={<ProtectedRoute allowedRoles={['doctor']}><WritePrescription /></ProtectedRoute>} />
        <Route path="/medecin/dossier/:patientId" element={<ProtectedRoute allowedRoles={['doctor']}><PatientRecord /></ProtectedRoute>} />

        {/* ── ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/medecins" element={<AdminDoctors />} />
          <Route path="/admin/rendez-vous" element={<AdminAppointments />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/paiements" element={<AdminPayments />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
