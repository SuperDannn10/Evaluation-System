import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, GraduationCap, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { ADMIN_EMAIL, loginAdmin } from './adminAuth'
import type { Admin } from './adminAuth'
import { isGoogleSignInConfigured } from './googleAuth'
import { loginStudent, loginStudentWithGoogle } from './studentAuth'
import type { Student } from './studentAuth'

interface Props {
  onStudentAuthenticated: (student: Student) => void
  onAdminAuthenticated: (admin: Admin) => void
  initialError?: string
}

type Role = 'student' | 'admin'

export default function Auth({ onStudentAuthenticated, onAdminAuthenticated, initialError }: Props) {
  const [role, setRole] = useState<Role>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [error, setError] = useState(initialError ?? '')
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (role === 'student') {
        onStudentAuthenticated(await loginStudent(name, email, password))
      } else {
        onAdminAuthenticated(loginAdmin(email, password))
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function continueWithGoogle() {
    setError('')
    setGoogleBusy(true)
    try {
      onStudentAuthenticated(await loginStudentWithGoogle())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in with Google. Please try again.')
    } finally {
      setGoogleBusy(false)
    }
  }

  function changeRole(nextRole: Role) {
    setRole(nextRole)
    setName('')
    setEmail(nextRole === 'admin' ? ADMIN_EMAIL : '')
    setPassword('')
    setPasswordVisible(false)
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
            <span className="auth-section-label">{role === 'student' ? 'Student sign in' : 'Administrator sign in'}</span>
            <span className="auth-existing-account">Use your existing account</span>
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
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
          <button className="primary auth-submit" type="submit" disabled={busy || googleBusy}>
            {busy ? 'Please wait…' : 'Sign In to Portal'}
          </button>
        </form>

        {role === 'student' && (
          <>
            <div className="auth-divider"><span>or</span></div>
            <button
              className="google-signin-button"
              type="button"
              onClick={continueWithGoogle}
              disabled={busy || googleBusy || !isGoogleSignInConfigured}
              title={isGoogleSignInConfigured ? 'Continue with Google' : 'Add Firebase settings to eval-system/.env.local to enable Google sign-in'}
            >
              <svg aria-hidden="true" viewBox="0 0 48 48" width="19" height="19">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 6)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.65 5.94c4.47-4.13 7.13-10.2 7.13-17.59Z" />
                <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 6)" />
                <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.85-5.8l-7.65-5.94c-2.13 1.43-4.85 2.27-8.2 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -6)" />
              </svg>
              {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
            </button>
            {!isGoogleSignInConfigured && (
              <p className="google-signin-hint">Google sign-in is not configured yet. Add your Firebase web settings to <code>eval-system/.env.local</code> and restart the app.</p>
            )}
          </>
        )}

        {role === 'student'
          ? <p className="auth-footnote">Student accounts are provided by your administrator. Demo accounts are stored only in this browser.</p>
          : <p className="auth-footnote">Demo admin: {ADMIN_EMAIL} / admin12345. This demo login is not secure for real data.</p>}
      </section>
    </main>
  )
}
