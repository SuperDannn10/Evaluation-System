import { useEffect, useState } from 'react'
import { GraduationCap, LogOut, ShieldCheck } from 'lucide-react'
import { getCurrentAdmin, logoutAdmin } from './adminAuth'
import type { Admin } from './adminAuth'
import AdminPortal from './AdminPortal'
import Auth from './Auth'
import StudentPortal from './StudentPortal'
import { getCurrentStudent, logoutStudent } from './studentAuth'
import type { Student } from './studentAuth'
import { useAppData } from './store'

export default function App() {
  const [data, setData] = useAppData()
  const [student, setStudent] = useState<Student | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    try {
      const currentAdmin = getCurrentAdmin()
      if (currentAdmin) setAdmin(currentAdmin)
      else setStudent(getCurrentStudent())
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to read the saved student session.')
    } finally {
      setAuthReady(true)
    }
  }, [])

  if (!authReady) {
    return <main className="auth-loading" aria-label="Loading student portal">Loading student portal…</main>
  }

  if (!student) {
    if (admin) {
      return <PortalShell admin={admin} onSignOut={async () => { logoutAdmin(); setAdmin(null) }} data={data} onDataChange={setData} />
    }
    return (
      <Auth
        onStudentAuthenticated={(authenticatedStudent) => {
          setStudent(authenticatedStudent)
          setAdmin(null)
        }}
        onAdminAuthenticated={(authenticatedAdmin) => {
          setAdmin(authenticatedAdmin)
          setStudent(null)
        }}
        initialError={authError}
      />
    )
  }

  return (
    <PortalShell
      student={student}
      onSignOut={async () => {
        await logoutStudent()
        setStudent(null)
      }}
      data={data}
      onDataChange={setData}
    />
  )
}

function PortalShell({
  student,
  admin,
  onSignOut,
  data,
  onDataChange,
}: {
  student?: Student
  admin?: Admin
  onSignOut: () => Promise<void>
  data: ReturnType<typeof useAppData>[0]
  onDataChange: ReturnType<typeof useAppData>[1]
}) {
  const currentUser = admin ?? student
  const [signOutError, setSignOutError] = useState('')
  if (!currentUser) return null

  async function signOut() {
    setSignOutError('')
    try {
      await onSignOut()
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to log out. Please try again.')
    }
  }

  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <div className="portal-brand">
          <div className="portal-logo"><GraduationCap size={23} /></div>
          <div>
            <div className="portal-brand-name">CCDI <span>TEACHER EVALUATION</span></div>
            <p>Computer Communication Development Institute</p>
          </div>
        </div>
        <div className="portal-header-actions">
          <div className="portal-user">
            <span className="student-avatar" aria-hidden="true">{admin ? <ShieldCheck size={17} /> : currentUser.name.charAt(0).toUpperCase()}</span>
            <span className="portal-user-details">
              <span className="student-name">{admin ? 'Administrator' : currentUser.name} · {admin ? 'Admin' : 'Student'}</span>
              {student?.idNumber && <small className="student-id-number">Student ID: {student.idNumber}</small>}
            </span>
            <button className="signout-button" onClick={() => void signOut()}><LogOut size={15} /><span>Log out</span></button>
          </div>
        </div>
        {signOutError && <p className="form-error" role="alert">{signOutError}</p>}
      </header>
      <main className="portal-main">
        {admin
          ? <AdminPortal data={data} onChange={onDataChange} />
          : <StudentPortal data={data} onChange={onDataChange} studentName={student?.name ?? ''} />}
      </main>
      <footer className="portal-footer">© {new Date().getFullYear()} Computer Communication Development Institute (CCDI). All rights reserved.</footer>
    </div>
  )
}
