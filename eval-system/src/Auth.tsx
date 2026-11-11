import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, GraduationCap, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { ADMIN_EMAIL, loginAdmin } from './adminAuth'
import type { Admin } from './adminAuth'
import { loginStudent, registerStudentAccount } from './studentAuth'
import type { Student } from './studentAuth'

interface Props {
  onStudentAuthenticated: (student: Student) => void
  onAdminAuthenticated: (admin: Admin) => void
  initialError?: string
}

type Role = 'student' | 'admin'
type StudentAuthMode = 'signin' | 'signup'

export default function Auth({ onStudentAuthenticated, onAdminAuthenticated, initialError }: Props) {
  const [role, setRole] = useState<Role>('student')
  const [studentAuthMode, setStudentAuthMode] = useState<StudentAuthMode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState(initialError ?? '')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (role === 'student') {
        const student = studentAuthMode === 'signup'
          ? await registerStudentAccount(name, email, idNumber, password)
          : await loginStudent(name, email, password)
        onStudentAuthenticated(student)
      } else {
        onAdminAuthenticated(loginAdmin(email, password))
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function changeRole(nextRole: Role) {
    setRole(nextRole)
    setStudentAuthMode('signin')
    setName('')
    setEmail(nextRole === 'admin' ? ADMIN_EMAIL : '')
    setIdNumber('')
    setPassword('')
    setPasswordVisible(false)
    setError('')
  }

  function changeStudentAuthMode(nextMode: StudentAuthMode) {
    setStudentAuthMode(nextMode)
    setPassword('')
    setError('')
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <div className="brand-mark" aria-hidden="true">C</div>
        <p className="eyebrow">CCDI Academic Review</p>
        <h2>Your voice helps teachers grow.</h2>
        <p className="auth-copy">
          Share thoughtful, constructive feedback about your classroom experience. Your ratings help build a better learning environment.
        </p>
        <div className="auth-highlights">
          <div><span className="highlight-icon">01</span><span>Rate teaching across five key areas</span></div>
          <div><span className="highlight-icon">02</span><span>Leave constructive written feedback</span></div>
          <div><span className="highlight-icon">03</span><span>Submit your review in a few minutes</span></div>
        </div>
        <p className="privacy-note">Please keep feedback respectful and focused on learning.</p>
      </section>
      <section className="auth-card">
        <div className="auth-emblem" aria-hidden="true"><KeyRound size={23} /></div>
        <div className="auth-card-heading">
          <h1>WELCOME TO CCDI EVALUATION SYSTEM</h1>
          <p>Faculty Evaluation Portal for Students &amp; Administrators</p>
        </div>

        <div className="auth-role-picker">
          <span className="auth-section-label">Select system role</span>
          <div className="auth-switch" role="tablist" aria-label="Choose account type">
            <button type="button" role="tab" aria-selected={role === 'student'} className={role === 'student' ? 'selected' : ''} onClick={() => changeRole('student')}>
              <GraduationCap size={16} /> Student Portal
            </button>
            <button type="button" role="tab" aria-selected={role === 'admin'} className={role === 'admin' ? 'selected' : ''} onClick={() => changeRole('admin')}>
              <ShieldCheck size={16} /> Administrator
            </button>
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form-heading">
            <span className="auth-section-label">
              {role === 'student'
                ? studentAuthMode === 'signup' ? 'Create student account' : 'Student sign in'
                : 'Administrator sign in'}
            </span>
            {role === 'student' && studentAuthMode === 'signin' && (
              <span className="auth-existing-account">Use your existing account</span>
            )}
          </div>
          {role === 'student' && (
            <label className="auth-labeled-input">
              Student name
              <span className="auth-input-control">
                <UserRound size={16} aria-hidden="true" />
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                />
              </span>
            </label>
          )}
          {role === 'student' && studentAuthMode === 'signup' && (
            <label className="auth-labeled-input">
              Student ID (optional)
              <span className="auth-input-control">
                <GraduationCap size={16} aria-hidden="true" />
                <input
                  type="text"
                  autoComplete="off"
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  placeholder="Enter your student ID"
                />
              </span>
            </label>
          )}
          <label className="auth-labeled-input">
            {role === 'student' ? 'Student email address' : 'Admin email address'}
            <span className="auth-input-control">
              <GraduationCap size={16} aria-hidden="true" />
              <input
                type="email"
                autoComplete="email"
                required
                readOnly={role === 'admin'}
                value={role === 'admin' ? ADMIN_EMAIL : email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@school.edu"
              />
            </span>
          </label>
          <label className="auth-password-field">
            Password
            <span className="auth-password-control">
              <KeyRound className="auth-input-icon" size={16} aria-hidden="true" />
              <input
                type={passwordVisible ? 'text' : 'password'}
                autoComplete={studentAuthMode === 'signup' && role === 'student' ? 'new-password' : 'current-password'}
                minLength={role === 'student' && studentAuthMode === 'signup' ? 8 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={studentAuthMode === 'signup' && role === 'student' ? 'At least 8 characters' : 'Enter your password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={passwordVisible}
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : role === 'student' && studentAuthMode === 'signup' ? 'Create Account' : 'Sign In to Portal'}
          </button>
        </form>

        {role === 'student'
          ? (
            <>
              <p className="auth-account-switch">
                {studentAuthMode === 'signin' ? 'New student?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => changeStudentAuthMode(studentAuthMode === 'signin' ? 'signup' : 'signin')}
                  disabled={busy}
                >
                  {studentAuthMode === 'signin' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
              <p className="auth-footnote">Student accounts are stored only in this browser and are not shared across devices.</p>
            </>
          )
          : <p className="auth-footnote">Demo admin: {ADMIN_EMAIL} / admin12345. This demo login is not secure for real data.</p>}
      </section>
    </main>
  )
}
