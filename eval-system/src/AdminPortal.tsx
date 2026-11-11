import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  BarChart3,
  BookOpenCheck,
  Eye,
  FileText,
  MessageSquareText,
  Pencil,
  Plus,
  Printer,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  UserPlus,
  X,
} from 'lucide-react'
import Results from './Results'
import Setup from './Setup'
import TeacherPortrait from './TeacherPortrait'
import { listStudentAccounts, removeStudentAccount } from './studentAuth'
import type { Student } from './studentAuth'
import { uid, weightedScore } from './store'
import type { AppData, Subject } from './types'

interface Props {
  data: AppData
  onChange: (data: AppData) => void
}

type AdminTab = 'overview' | 'teachers' | 'students' | 'feedback' | 'setup' | 'reports'

interface TeacherForm {
  name: string
  title: string
  department: string
  email: string
  subjects: string
}

const emptyTeacherForm: TeacherForm = {
  name: '',
  title: '',
  department: '',
  email: '',
  subjects: '',
}

function StudentAccountsPanel() {
  const [accounts, setAccounts] = useState<Student[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      setAccounts(listStudentAccounts())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load student accounts.')
    }
  }, [])

  function deleteStudent(account: Student) {
    if (!window.confirm(`Remove the student account for ${account.name} (${account.email})?`)) return
    try {
      removeStudentAccount(account.email)
      setAccounts(listStudentAccounts())
      setNotice(`Removed the account for ${account.email}.`)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to remove the student account.')
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="portal-overline">Student access</span>
          <h3>Student accounts</h3>
          <p className="admin-subtitle">View and manage student accounts. Students can register from the Student Portal.</p>
        </div>
        <span className="admin-panel-icon"><UserPlus size={20} /></span>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="student-account-notice" role="status">{notice}</p>}
      <div className="student-account-list">
        <h4>Accounts ({accounts.length})</h4>
        {accounts.length ? accounts.map((account) => (
          <article className="student-account-row" key={account.email}>
            <span className="student-avatar" aria-hidden="true">{account.name.trim().charAt(0).toUpperCase() || '?'}</span>
            <div><strong>{account.name}</strong><small>{account.idNumber ? `ID: ${account.idNumber} · ` : ''}{account.email}</small></div>
            <button className="delete-action" onClick={() => deleteStudent(account)} aria-label={`Remove ${account.name}`} title="Remove account"><Trash2 size={16} /></button>
          </article>
        )) : <p className="portal-empty compact">No student accounts have registered yet.</p>}
      </div>
      <p className="student-account-warning">Demo only: accounts are stored in this browser. This does not provide production-grade authentication.</p>
    </section>
  )
}

function teacherScore(evaluations: AppData['evaluations'], criteria: AppData['criteria']): number | null {
  if (!evaluations.length) return null
  return evaluations.reduce((sum, evaluation) => sum + weightedScore(evaluation.scores, criteria), 0) /
    evaluations.length / 20
}

function RatingStars({ value }: { value: number | null }) {
  return (
    <span className="rating-stars" aria-label={value === null ? 'No ratings' : `${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={14} fill={value !== null && value >= star ? 'currentColor' : 'none'} />
      ))}
      <strong>{value === null ? '—' : value.toFixed(1)}</strong>
    </span>
  )
}

function MetricBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="admin-metric">
      <div className="admin-metric-label"><span>{label}</span><strong>{value.toFixed(2)} / {max}</strong></div>
      <div className="admin-metric-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Number(value.toFixed(2))}>
        <span style={{ width: `${Math.min(Math.max(value / max * 100, 0), 100)}%` }} />
      </div>
    </div>
  )
}

export default function AdminPortal({ data, onChange }: Props) {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null)
  const [teacherModalOpen, setTeacherModalOpen] = useState(false)
  const [teacherForm, setTeacherForm] = useState<TeacherForm>(emptyTeacherForm)
  const [reportTeacher, setReportTeacher] = useState<Subject | null>(null)
  const [filterTeacher, setFilterTeacher] = useState('All')
  const [filterRating, setFilterRating] = useState('All')

  const stats = useMemo(() => data.subjects.map((teacher) => {
    const evaluations = data.evaluations.filter((evaluation) => evaluation.subjectId === teacher.id)
    const rating = teacherScore(evaluations, data.criteria)
    const byCriterion = data.criteria.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      average: evaluations.length
        ? evaluations.reduce((sum, evaluation) => sum + (evaluation.scores[criterion.id] ?? 0), 0) / evaluations.length
        : 0,
    }))
    return { teacher, evaluations, rating, byCriterion }
  }), [data.criteria, data.evaluations, data.subjects])

  const overallRating = data.evaluations.length
    ? data.evaluations.reduce((sum, evaluation) => sum + weightedScore(evaluation.scores, data.criteria), 0) /
      data.evaluations.length / 20
    : null
  const topTeacher = [...stats].filter((stat) => stat.rating !== null).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
  const overallCriteria = data.criteria.map((criterion) => {
    const scoreTotal = data.evaluations.reduce((sum, evaluation) => sum + (evaluation.scores[criterion.id] ?? 0), 0)
    return { ...criterion, average: data.evaluations.length ? scoreTotal / data.evaluations.length : 0 }
  })

  const feedback = [...data.evaluations]
    .filter((evaluation) => filterTeacher === 'All' || evaluation.subjectId === filterTeacher)
    .filter((evaluation) => {
      const score = weightedScore(evaluation.scores, data.criteria) / 20
      return filterRating === 'All' ||
        (filterRating === 'high' && score >= 4) ||
        (filterRating === 'medium' && score >= 3 && score < 4) ||
        (filterRating === 'low' && score < 3)
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  function openAddTeacher() {
    setEditingTeacherId(null)
    setTeacherForm(emptyTeacherForm)
    setTeacherModalOpen(true)
  }

  function openEditTeacher(teacher: Subject) {
    setEditingTeacherId(teacher.id)
    setTeacherForm({
      name: teacher.name,
      title: teacher.title ?? '',
      department: teacher.group,
      email: teacher.email ?? '',
      subjects: teacher.subjects?.join(', ') ?? '',
    })
    setTeacherModalOpen(true)
  }

  function saveTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const updated: Subject = {
      id: editingTeacherId ?? uid(),
      name: teacherForm.name.trim(),
      title: teacherForm.title.trim(),
      group: teacherForm.department.trim(),
      email: teacherForm.email.trim(),
      subjects: teacherForm.subjects.split(',').map((subject) => subject.trim()).filter(Boolean),
    }
    onChange({
      ...data,
      subjects: editingTeacherId
        ? data.subjects.map((teacher) => teacher.id === editingTeacherId ? updated : teacher)
        : [...data.subjects, updated],
    })
    setEditingTeacherId(null)
    setTeacherForm(emptyTeacherForm)
    setTeacherModalOpen(false)
  }

  function removeTeacher(teacher: Subject) {
    if (!window.confirm(`Remove ${teacher.name} and all of their evaluations?`)) return
    onChange({
      ...data,
      subjects: data.subjects.filter((entry) => entry.id !== teacher.id),
      evaluations: data.evaluations.filter((evaluation) => evaluation.subjectId !== teacher.id),
    })
  }

  function removeEvaluation(id: string) {
    onChange({ ...data, evaluations: data.evaluations.filter((evaluation) => evaluation.id !== id) })
  }

  const adminTabs: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'teachers', label: 'Faculty directory', icon: Users },
    { id: 'students', label: 'Student accounts', icon: UserPlus },
    { id: 'feedback', label: 'Feedback logs', icon: MessageSquareText },
    { id: 'setup', label: 'Setup', icon: BookOpenCheck },
    { id: 'reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="admin-page">
      <section className="admin-header">
        <div>
          <span className="portal-overline">Administration</span>
          <h2><ShieldCheck size={25} /> Administrative control panel</h2>
          <p>Monitor teaching feedback and manage the faculty evaluation records.</p>
        </div>
        <span className="admin-live"><span className="online-dot" /> Local data</span>
      </section>
      <div className="admin-prototype-note">
        <ShieldCheck size={16} />
        <span>Demo mode: student and admin screens are separated, but browser-stored accounts are not secure authentication.</span>
      </div>
      <nav className="admin-tabs" aria-label="Admin dashboard sections">
        {adminTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={tab === id ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab(id)}>
            <Icon size={16} /><span>{label}</span>
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="admin-content">
          <section className="admin-stat-grid">
            <article className="admin-stat-card"><span className="admin-stat-icon blue"><Users size={20} /></span><div><small>Active faculty</small><strong>{data.subjects.length}</strong></div></article>
            <article className="admin-stat-card"><span className="admin-stat-icon teal"><FileText size={20} /></span><div><small>Evaluations submitted</small><strong>{data.evaluations.length}</strong></div></article>
            <article className="admin-stat-card"><span className="admin-stat-icon gold"><Star size={20} /></span><div><small>Campus average</small><strong>{overallRating === null ? '—' : `${overallRating.toFixed(2)} / 5`}</strong></div></article>
            <article className="admin-stat-card"><span className="admin-stat-icon purple"><BookOpenCheck size={20} /></span><div><small>Top rated teacher</small><strong className="top-teacher-name">{topTeacher?.teacher.name ?? 'No ratings yet'}</strong></div></article>
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="portal-overline">Campus insights</span><h3>Institutional criteria breakdown</h3></div>
              <span className="admin-panel-icon"><BarChart3 size={20} /></span>
            </div>
            <p className="admin-subtitle">Average student rating across all evaluation categories.</p>
            {overallCriteria.length ? (
              <div className="admin-metric-list">
                {overallCriteria.map((criterion) => <MetricBar key={criterion.id} label={criterion.name} value={criterion.average} />)}
              </div>
            ) : <p className="portal-empty compact">Add evaluation criteria in Setup to see category insights.</p>}
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="portal-overline">Faculty overview</span><h3>Teacher performance</h3></div>
              <button className="portal-button portal-button-outline" onClick={() => setTab('teachers')}>View directory <span aria-hidden="true">→</span></button>
            </div>
            {stats.length ? (
              <div className="performance-table">
                {stats.slice().sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1)).map(({ teacher, rating, evaluations }) => (
                  <div className="performance-row" key={teacher.id}>
                    {teacher.avatar
                      ? <img className="teacher-initial" src={teacher.avatar} alt="" />
                      : <TeacherPortrait className="teacher-initial" name={teacher.name} />}
                    <div className="performance-teacher"><strong>{teacher.name}</strong><small>{teacher.group || 'Faculty'}</small></div>
                    <span className="performance-response">{evaluations.length} response{evaluations.length === 1 ? '' : 's'}</span>
                    <RatingStars value={rating} />
                  </div>
                ))}
              </div>
            ) : <p className="portal-empty compact">No faculty records available yet.</p>}
          </section>
        </div>
      )}

      {tab === 'teachers' && (
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><span className="portal-overline">Faculty records</span><h3>Faculty directory</h3><p className="admin-subtitle">Manage instructors, departments, and assigned courses.</p></div>
            <button className="portal-button portal-button-gold" onClick={openAddTeacher}><Plus size={16} /> Add teacher</button>
          </div>
          {stats.length ? (
            <div className="faculty-list">
              {stats.map(({ teacher, rating, evaluations }) => (
                <article className="faculty-record" key={teacher.id}>
                  {teacher.avatar
                    ? <img className="teacher-initial large" src={teacher.avatar} alt="" />
                    : <TeacherPortrait className="teacher-initial large" name={teacher.name} />}
                  <div className="faculty-record-main">
                    <strong>{teacher.name}</strong>
                    <span>{teacher.title || 'Faculty member'} · {teacher.group || 'Department not set'}</span>
                    <small>{teacher.email || 'No email'}{teacher.subjects?.length ? ` · ${teacher.subjects.join(', ')}` : ''}</small>
                  </div>
                  <div className="faculty-record-rating"><small>{evaluations.length} evaluations</small><RatingStars value={rating} /></div>
                  <div className="faculty-record-actions">
                    <button aria-label={`View ${teacher.name} report`} title="View report" onClick={() => setReportTeacher(teacher)}><Eye size={16} /></button>
                    <button aria-label={`Edit ${teacher.name}`} title="Edit teacher" onClick={() => openEditTeacher(teacher)}><Pencil size={16} /></button>
                    <button aria-label={`Delete ${teacher.name}`} title="Delete teacher" className="delete-action" onClick={() => removeTeacher(teacher)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="portal-empty compact">No teachers have been added. Use “Add teacher” to create a faculty record.</p>}
        </section>
      )}

      {tab === 'students' && <StudentAccountsPanel />}

      {tab === 'feedback' && (
        <section className="admin-panel">
          <div className="admin-panel-heading feedback-heading">
            <div><span className="portal-overline">Student voice</span><h3>Feedback logs</h3><p className="admin-subtitle">Review submitted comments and star ratings.</p></div>
            <div className="feedback-filters">
              <label><span>Teacher</span><select value={filterTeacher} onChange={(event) => setFilterTeacher(event.target.value)}><option value="All">All teachers</option>{data.subjects.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>
              <label><span>Rating</span><select value={filterRating} onChange={(event) => setFilterRating(event.target.value)}><option value="All">All ratings</option><option value="high">High (4–5)</option><option value="medium">Medium (3–3.9)</option><option value="low">Low (under 3)</option></select></label>
            </div>
          </div>
          {feedback.length ? (
            <div className="feedback-list">
              {feedback.map((evaluation) => {
                const teacher = data.subjects.find((entry) => entry.id === evaluation.subjectId)
                return (
                  <article className="feedback-record" key={evaluation.id}>
                    <div className="feedback-record-top">
                      <div><span className="feedback-teacher-tag">{teacher?.name ?? 'Removed teacher'}</span>{evaluation.subject && <span className="feedback-course">{evaluation.subject}</span>}</div>
                      <div className="feedback-date-rating"><time dateTime={evaluation.date}>{new Date(evaluation.date).toLocaleDateString()}</time><RatingStars value={weightedScore(evaluation.scores, data.criteria) / 20} /></div>
                    </div>
                    <p className="feedback-quote">{evaluation.comment || 'No written comment provided.'}</p>
                    <div className="feedback-record-bottom">
                      <span>{evaluation.isAnonymous ? 'Anonymous student' : evaluation.evaluator}</span>
                      <button className="text-delete" onClick={() => removeEvaluation(evaluation.id)}>Delete response</button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : <p className="portal-empty compact">No feedback matches these filters.</p>}
        </section>
      )}

      {tab === 'setup' && <Setup data={data} onChange={onChange} />}
      {tab === 'reports' && <Results data={data} onChange={onChange} />}

      {teacherModalOpen && (
        <div className="portal-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) { setEditingTeacherId(null); setTeacherForm(emptyTeacherForm); setTeacherModalOpen(false) }
        }}>
          <section className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-modal-title">
            <button className="portal-modal-close" aria-label="Close dialog" onClick={() => { setEditingTeacherId(null); setTeacherForm(emptyTeacherForm); setTeacherModalOpen(false) }}><X size={19} /></button>
            <span className="portal-overline">Faculty records</span>
            <h3 id="teacher-modal-title">{editingTeacherId ? 'Edit teacher' : 'Add a teacher'}</h3>
            <p className="admin-subtitle">Enter the instructor details below.</p>
            <form className="teacher-modal-form" onSubmit={saveTeacher}>
              <label>Full name<input required value={teacherForm.name} onChange={(event) => setTeacherForm({ ...teacherForm, name: event.target.value })} placeholder="e.g. Prof. Jane Doe" /></label>
              <label>Academic title<input value={teacherForm.title} onChange={(event) => setTeacherForm({ ...teacherForm, title: event.target.value })} placeholder="e.g. Senior Lecturer" /></label>
              <label>Department<input required value={teacherForm.department} onChange={(event) => setTeacherForm({ ...teacherForm, department: event.target.value })} placeholder="Department" /></label>
              <label>Email address<input type="email" value={teacherForm.email} onChange={(event) => setTeacherForm({ ...teacherForm, email: event.target.value })} placeholder="name@ccdi.edu.ph" /></label>
              <label>Assigned subjects <small>Separate subjects with commas</small><input value={teacherForm.subjects} onChange={(event) => setTeacherForm({ ...teacherForm, subjects: event.target.value })} placeholder="Web Development, Databases" /></label>
              <div className="teacher-modal-actions"><button type="button" className="portal-button portal-button-outline" onClick={() => { setEditingTeacherId(null); setTeacherForm(emptyTeacherForm); setTeacherModalOpen(false) }}>Cancel</button><button type="submit" className="portal-button portal-button-gold">Save teacher</button></div>
            </form>
          </section>
        </div>
      )}

      {reportTeacher && (
        <div className="portal-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportTeacher(null) }}>
          <section className="portal-modal report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
            <button className="portal-modal-close" aria-label="Close report" onClick={() => setReportTeacher(null)}><X size={19} /></button>
            <div className="report-print-header">
              <div><span className="portal-overline">CCDI faculty evaluation report</span><h3 id="report-title">{reportTeacher.name}</h3><p>{reportTeacher.title} · {reportTeacher.group}</p></div>
              <button className="portal-button portal-button-outline print-button" onClick={() => window.print()}><Printer size={16} /> Print</button>
            </div>
            {(() => {
              const entry = stats.find((stat) => stat.teacher.id === reportTeacher.id)
              if (!entry) return <p className="portal-empty compact">No report data found.</p>
              return (
                <>
                  <div className="report-stats">
                    <div><span>Average rating</span><strong>{entry.rating === null ? '—' : `${entry.rating.toFixed(2)} / 5`}</strong></div>
                    <div><span>Responses</span><strong>{entry.evaluations.length}</strong></div>
                    <div><span>Performance</span><strong>{entry.rating === null ? 'Awaiting feedback' : entry.rating >= 4.5 ? 'Excellent' : entry.rating >= 4 ? 'Very good' : entry.rating >= 3 ? 'Satisfactory' : 'Needs support'}</strong></div>
                  </div>
                  <h4 className="report-section-heading">Criteria breakdown</h4>
                  <div className="admin-metric-list">{entry.byCriterion.map((criterion) => <MetricBar key={criterion.id} label={criterion.name} value={criterion.average} />)}</div>
                  <h4 className="report-section-heading">Written feedback</h4>
                  <div className="report-comments">
                    {entry.evaluations.filter((evaluation) => evaluation.comment).map((evaluation) => (
                      <article key={evaluation.id}><p>“{evaluation.comment}”</p><small>{evaluation.isAnonymous ? 'Anonymous student' : evaluation.evaluator} · {new Date(evaluation.date).toLocaleDateString()}</small></article>
                    ))}
                    {!entry.evaluations.some((evaluation) => evaluation.comment) && <p className="portal-muted">No written feedback yet.</p>}
                  </div>
                </>
              )
            })()}
          </section>
        </div>
      )}
    </div>
  )
}
