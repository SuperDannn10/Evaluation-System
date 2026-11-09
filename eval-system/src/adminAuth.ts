export interface Admin {
  name: string
  email: string
}

export const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'admin12345'
const SESSION_KEY = 'evaluation-system-admin-session-v2'
const STUDENT_SESSION_KEY = 'evaluation-system-student-session-v1'

export function loginAdmin(email: string, password: string): Admin {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error('Email or password is incorrect.')
  }
  localStorage.removeItem(STUDENT_SESSION_KEY)
  localStorage.setItem(SESSION_KEY, ADMIN_EMAIL)
  return { name: 'Administrator', email: ADMIN_EMAIL }
}

export function getCurrentAdmin(): Admin | null {
  if (localStorage.getItem(SESSION_KEY) !== ADMIN_EMAIL) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return { name: 'Administrator', email: ADMIN_EMAIL }
}

export function logoutAdmin(): void {
  localStorage.removeItem(SESSION_KEY)
}
