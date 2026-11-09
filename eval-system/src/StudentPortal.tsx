import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, BookOpen, CheckCircle2, GraduationCap, LockKeyhole, Search, Send, ShieldCheck, Star, Users } from 'lucide-react'
import type { AppData, Criterion, Subject } from './types'
import TeacherPortrait from './TeacherPortrait'
import { SCALE, uid, weightedScore } from './store'

interface Props {
  data: AppData
  onChange: (data: AppData) => void
  studentName: string
}

function TeacherStars({ value }: { value: number | null }) {
  if (value === null) return <span className="portal-muted">No ratings yet</span>
  return (
    <span className="teacher-stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span aria-hidden="true">★</span> {value.toFixed(1)} <small>/ 5</small>
    </span>
  )
}

function TeacherCard({ teacher, evaluations, criteria, onSelect }: {
  teacher: Subject
  evaluations: AppData['evaluations']
  criteria: Criterion[]
  onSelect: () => void
}) {
  const teacherEvaluations = evaluations.filter((evaluation) => evaluation.subjectId === teacher.id)
  const average = teacherEvaluations.length
    ? teacherEvaluations.reduce((sum, evaluation) => sum + weightedScore(evaluation.scores, criteria), 0) /
      teacherEvaluations.length / 20
    : null
  const rating = average
  const subjects = teacher.subjects?.length ? teacher.subjects : [teacher.group]

  return (
    <article className="portal-teacher-card">
      <div className="portal-teacher-heading">
        {teacher.avatar
          ? <img className="portal-teacher-avatar" src={teacher.avatar} alt="" />
          : <TeacherPortrait className="portal-teacher-avatar" name={teacher.name} />}
        <div className="portal-teacher-name">
          <h3>{teacher.name}</h3>
          <p>{teacher.title || 'Faculty member'}</p>
        </div>
      </div>
      <span className="department-tag">{teacher.group || 'Faculty'}</span>
      <div className="assigned-subjects">
        <p>Assigned subjects</p>
        <div>
          {subjects.map((subject) => <span className="subject-chip" key={subject}>{subject}</span>)}
        </div>
      </div>
      <div className="portal-teacher-footer">
        <div>
          <TeacherStars value={rating} />
          <small>{teacherEvaluations.length} evaluation{teacherEvaluations.length === 1 ? '' : 's'}</small>
        </div>
        <button className="portal-button portal-button-gold" onClick={onSelect}>Evaluate</button>
      </div>
    </article>
  )
}

export default function StudentPortal({ data, onChange, studentName }: Props) {
  const [selectedTeacher, setSelectedTeacher] = useState<Subject | null>(null)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [notice, setNotice] = useState('')

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(data.subjects.map((teacher) => teacher.group).filter(Boolean)))],
    [data.subjects]
  )
  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return data.subjects.filter((teacher) => {
      const matchesSearch = !query ||
        teacher.name.toLowerCase().includes(query) ||
        (teacher.title ?? '').toLowerCase().includes(query) ||
        (teacher.subjects ?? []).some((subject) => subject.toLowerCase().includes(query))
      return matchesSearch && (department === 'All' || teacher.group === department)
    })
  }, [data.subjects, department, search])

  function startEvaluation(teacher: Subject) {
    setSelectedTeacher(teacher)
    setSelectedSubject(teacher.subjects?.[0] ?? '')
    setScores({})
    setComment('')
    setNotice('')
  }

  function submitEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedTeacher || data.criteria.some((criterion) => !scores[criterion.id]) || !comment.trim()) return

    onChange({
      ...data,
      evaluations: [
        {
          id: uid(),
          subjectId: selectedTeacher.id,
          evaluator: anonymous ? 'Anonymous student' : studentName,
          isAnonymous: anonymous,
          subject: selectedSubject,
          scores,
          comment: comment.trim(),
          date: new Date().toISOString(),
        },
        ...data.evaluations,
      ],
    })
    setSelectedTeacher(null)
    setNotice('Your evaluation was submitted. Thank you for helping improve learning at CCDI.')
  }

  const ratingComplete = data.criteria.length > 0 && data.criteria.every((criterion) => scores[criterion.id])
  const liveScore = weightedScore(scores, data.criteria)

  return (
    <div className="portal-page">
      {notice && (
        <div className="portal-toast" role="status">
          <CheckCircle2 size={19} />
          <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button>
        </div>
      )}
      {!selectedTeacher ? (
        <>
          <section className="portal-hero">
            <div className="portal-hero-copy">
              <span className="portal-kicker"><span className="online-dot" /> Faculty evaluation period</span>
              <h2>Empower education<br />through your feedback.</h2>
              <p>Your honest, constructive feedback helps CCDI instructors strengthen the learning experience for everyone.</p>
              <div className="portal-hero-points">
                <span><ShieldCheck size={16} /> Private and respectful</span>
                <span><Star size={16} /> Five teaching criteria</span>
              </div>
            </div>
            <div className="portal-hero-art" aria-hidden="true">
              <div className="hero-art-circle"><GraduationCap size={90} strokeWidth={1.2} /></div>
              <div className="hero-art-badge"><BookOpen size={18} /> Your voice matters</div>
            </div>
          </section>

          <section className="portal-directory">
            <div className="portal-section-heading">
              <div>
                <span className="portal-overline">Student portal</span>
                <h2><Users size={21} /> Choose a teacher</h2>
                <p>Find an instructor and share feedback about your class experience.</p>
              </div>
              <span className="directory-count">{filteredTeachers.length} faculty member{filteredTeachers.length === 1 ? '' : 's'}</span>
            </div>
            <div className="portal-filters">
              <label className="portal-search">
                <Search size={18} aria-hidden="true" />
                <span className="sr-only">Search faculty</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or subject…" />
              </label>
              <label className="portal-department-filter">
                <span>Department</span>
                <select value={department} onChange={(event) => setDepartment(event.target.value)}>
                  {departments.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </label>
            </div>
            {filteredTeachers.length ? (
              <div className="portal-teacher-grid">
                {filteredTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    evaluations={data.evaluations}
                    criteria={data.criteria}
                    onSelect={() => startEvaluation(teacher)}
                  />
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <Search size={24} />
                <strong>No teachers found</strong>
                <span>Try another name, subject, or department.</span>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="evaluation-workspace">
          <button className="portal-back" onClick={() => setSelectedTeacher(null)}><ArrowLeft size={16} /> Back to faculty</button>
          <div className="evaluation-teacher-banner">
            {selectedTeacher.avatar
              ? <img className="portal-teacher-avatar large" src={selectedTeacher.avatar} alt="" />
              : <TeacherPortrait className="portal-teacher-avatar large" name={selectedTeacher.name} />}
            <div className="evaluation-teacher-details">
              <span className="portal-overline">Teacher evaluation</span>
              <h2>{selectedTeacher.name}</h2>
              <p>{selectedTeacher.title || 'Faculty member'} <span>·</span> {selectedTeacher.group}</p>
            </div>
            <div className="evaluation-subject-select">
              <label htmlFor="evaluation-subject">Course</label>
              <select id="evaluation-subject" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
                {(selectedTeacher.subjects?.length ? selectedTeacher.subjects : [selectedTeacher.group || 'General']).map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={submitEvaluation}>
            <div className="evaluation-form-heading">
              <div><span className="portal-overline">Your classroom experience</span><h3>Rate each area</h3></div>
              <span className="form-count">{data.criteria.length} criteria · 5-star scale</span>
            </div>
            <div className="portal-rating-list">
              {data.criteria.map((criterion) => (
                <fieldset className="portal-rating-row" key={criterion.id}>
                  <legend>
                    <strong>{criterion.name}</strong>
                    <span>{criterion.description}</span>
                  </legend>
                  <div className="portal-rating-control" role="group" aria-label={`Rate ${criterion.name}`}>
                    {SCALE.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        aria-label={`${index + 1} star${index === 0 ? '' : 's'}: ${label}`}
                        aria-pressed={scores[criterion.id] === index + 1}
                        className={scores[criterion.id] >= index + 1 ? 'portal-star selected' : 'portal-star'}
                        onClick={() => setScores((current) => ({ ...current, [criterion.id]: index + 1 }))}
                      >
                        <Star size={23} fill="currentColor" />
                      </button>
                    ))}
                    <span className="portal-rating-value">{scores[criterion.id] || '—'}<small>/ 5</small></span>
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="portal-feedback-field">
              <label htmlFor="written-feedback">Written feedback <span>Required</span></label>
              <textarea
                id="written-feedback"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share a constructive comment about the teaching, classroom experience, or an area for improvement…"
                rows={4}
                required
              />
            </div>
            <label className="anonymous-option">
              <span className="anonymous-icon"><LockKeyhole size={18} /></span>
              <span className="anonymous-copy"><strong>Submit anonymously</strong><small>Your name will not appear with this feedback.</small></span>
              <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            </label>
            <div className="evaluation-submit-row">
              <div className="live-score"><span>Overall rating</span><strong>{ratingComplete ? `${liveScore.toFixed(1)}%` : 'Not rated'}</strong></div>
              <button className="portal-button portal-button-gold submit-evaluation" type="submit" disabled={!ratingComplete || !comment.trim()}>
                <Send size={16} /> Submit evaluation
              </button>
            </div>
          </form>
        </section>
      )}
      <p className="portal-privacy-note"><LockKeyhole size={13} /> Your feedback is handled with care and used to improve teaching and learning.</p>
    </div>
  )
}
