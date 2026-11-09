import { hashPassword } from './password'
import { signInWithGoogleProvider, signOutGoogleProvider } from './googleAuth'

export interface Student {
  name: string
  email: string
  idNumber?: string
}

export interface StudentAccount extends Student {
  passwordHash: string
}

const ACCOUNTS_KEY = 'evaluation-system-students-v1'
const SESSION_KEY = 'evaluation-system-student-session-v1'

function readAccounts(): StudentAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) return []

  const accounts: unknown = JSON.parse(raw)
  if (
    !Array.isArray(accounts) ||
    !accounts.every(
      (account) =>
        account &&
        typeof account.name === 'string' &&
        typeof account.email === 'string' &&
        typeof account.passwordHash === 'string' &&
        (account.idNumber === undefined || typeof account.idNumber === 'string')
    )
  ) {
    throw new Error('Saved student accounts are invalid. Clear this site’s local storage and try again.')
  }
  return accounts as StudentAccount[]
}

function startSession(account: StudentAccount): Student {
  localStorage.removeItem('evaluation-system-admin-session-v2')
  localStorage.setItem(SESSION_KEY, account.email)
  return { name: account.name, email: account.email, idNumber: account.idNumber }
}

export async function createStudentAccount(name: string, email: string, idNumber: string, password: string): Promise<Student> {
  const normalizedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()
  const trimmedIdNumber = idNumber.trim()
  if (!trimmedName || !normalizedEmail || !trimmedIdNumber) throw new Error('Enter the student name, email address, and ID number.')
  if (password.length < 8) throw new Error('Choose a password with at least 8 characters.')

  const accounts = readAccounts()
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists. Please log in instead.')
  }
  if (accounts.some((account) => account.idNumber?.toLowerCase() === trimmedIdNumber.toLowerCase())) {
    throw new Error('A student account with this ID number already exists.')
  }

  const account = { name: trimmedName, email: normalizedEmail, idNumber: trimmedIdNumber, passwordHash: await hashPassword(password) }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  return { name: account.name, email: account.email, idNumber: account.idNumber }
}

export function listStudentAccounts(): Student[] {
  return readAccounts().map(({ name, email, idNumber }) => ({ name, email, idNumber }))
}

export function removeStudentAccount(email: string): void {
  const normalizedEmail = email.trim().toLowerCase()
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(readAccounts().filter((account) => account.email !== normalizedEmail)))
  if (localStorage.getItem(SESSION_KEY) === normalizedEmail) {
    localStorage.removeItem(SESSION_KEY)
  }
}

export async function loginStudent(name: string, email: string, password: string): Promise<Student> {
  const normalizedName = name.trim().replace(/\s+/g, ' ').toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()
  const accounts = readAccounts()
  const account = accounts.find((entry) => entry.email === normalizedEmail)
  const passwordHash = await hashPassword(password)
  if (!account || account.name.trim().replace(/\s+/g, ' ').toLowerCase() !== normalizedName || account.passwordHash !== passwordHash) {
    throw new Error('Name, email, or password is incorrect.')
  }
  return startSession(account)
}

export async function loginStudentWithGoogle(): Promise<Student> {
  const profile = await signInWithGoogleProvider()
  const accounts = readAccounts()
  const existingAccount = accounts.find((account) => account.email === profile.email)
  if (existingAccount) return startSession(existingAccount)

  const account: StudentAccount = { ...profile, passwordHash: '' }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  return startSession(account)
}

export function getCurrentStudent(): Student | null {
  const email = localStorage.getItem(SESSION_KEY)
  if (!email) return null
  const account = readAccounts().find((entry) => entry.email === email)
  if (!account) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return { name: account.name, email: account.email, idNumber: account.idNumber }
}

export async function logoutStudent(): Promise<void> {
  await signOutGoogleProvider()
  localStorage.removeItem(SESSION_KEY)
}
