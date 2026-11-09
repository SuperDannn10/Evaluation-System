import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AppData } from './types'
import { MAX, SCALE, rating, uid, weightedScore } from './store'

interface Props {
  data: AppData
  onChange: (d: AppData) => void
  studentName: string
}

export default function Evaluate({ data, onChange, studentName }: Props) {
  const { criteria, subjects } = data
  const [subjectId, setSubjectId] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(false)

  if (!subjects.length || !criteria.length) {
    return <p className="empty">Add at least one teacher and one evaluation criterion in Setup, then return here.</p>
  }

  const complete = subjectId !== '' && criteria.every((c) => scores[c.id])
  const live = weightedScore(scores, criteria)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!complete) return
    onChange({
      ...data,
      evaluations: [
        ...data.evaluations,
        { id: uid(), subjectId, evaluator: studentName, scores, comment: comment.trim(), date: new Date().toISOString() },
      ],
    })
    setScores({})
    setComment('')
    setSaved(true)
  }

  return (
    <form onSubmit={submit} className="panel form-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">Student feedback</p>
          <h2>Teacher evaluation form</h2>
          <p className="muted">Rate each area based on your classroom experience, then share any written feedback.</p>
        </div>
        <span className="form-count">{criteria.length} areas <span aria-hidden="true">·</span> 5-star scale</span>
      </div>

      <div className="row">
        <label>
          Teacher to evaluate
          <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setSaved(false) }}>
            <option value="">Select a teacher</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.group})</option>
            ))}
          </select>
        </label>
        <div className="signed-in-note">
          <span className="student-avatar small" aria-hidden="true">{studentName.charAt(0).toUpperCase()}</span>
          <span>Submitting as <strong>{studentName}</strong></span>
        </div>
      </div>

      {criteria.map((c) => (
        <fieldset key={c.id}>
          <legend>{c.name} <span className="muted">({c.weight}%)</span></legend>
          <p className="muted">{c.description}</p>
          <div className="scale">
            {SCALE.map((label, i) => (
              <button
                type="button"
                key={label}
                aria-pressed={scores[c.id] === i + 1}
                aria-label={`${i + 1} star${i === 0 ? '' : 's'}: ${label}`}
                className={scores[c.id] === i + 1 ? 'score on' : 'score'}
                onClick={() => { setScores({ ...scores, [c.id]: i + 1 }); setSaved(false) }}
              >
                <span className="star-symbol" aria-hidden="true">★</span>
                <span className="star-label">{label}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <label>
        Written feedback
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share strengths, suggestions, or comments about the teacher's classroom performance."
        />
      </label>

      <div className="footer evaluation-footer">
        <p className="live">
          Current score: <strong>{live.toFixed(1)}%</strong> · {Object.keys(scores).length === 0 ? 'Not scored yet' : rating(live)}
          <span className="muted"> (1–{MAX} star scale)</span>
        </p>
        <button className="primary" disabled={!complete}>Submit feedback</button>
      </div>
      {saved && <p className="ok" role="status">Feedback saved. View the updated results in the Results tab.</p>}
    </form>
  )
}
