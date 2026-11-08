import { useState } from 'react'
import type { FormEvent } from 'react'
import type { AppData } from './types'
import { MAX, SCALE, rating, uid, weightedScore } from './store'

interface Props {
  data: AppData
  onChange: (d: AppData) => void
}

export default function Evaluate({ data, onChange }: Props) {
  const { criteria, subjects } = data
  const [subjectId, setSubjectId] = useState('')
  const [evaluator, setEvaluator] = useState('')
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(false)

  if (!subjects.length || !criteria.length) {
    return <p className="empty">Add at least one person and one criterion in Setup, then come back to evaluate.</p>
  }

  const complete = subjectId !== '' && evaluator.trim() !== '' && criteria.every((c) => scores[c.id])
  const live = weightedScore(scores, criteria)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!complete) return
    onChange({
      ...data,
      evaluations: [
        ...data.evaluations,
        { id: uid(), subjectId, evaluator: evaluator.trim(), scores, comment: comment.trim(), date: new Date().toISOString() },
      ],
    })
    setScores({})
    setComment('')
    setSaved(true)
  }

  return (
    <form onSubmit={submit} className="panel">
      <div className="row">
        <label>
          Person being evaluated
          <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setSaved(false) }}>
            <option value="">Select a person</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.group})</option>
            ))}
          </select>
        </label>
        <label>
          Your name
          <input value={evaluator} onChange={(e) => setEvaluator(e.target.value)} placeholder="Evaluator name" />
        </label>
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
                className={scores[c.id] === i + 1 ? 'score on' : 'score'}
                onClick={() => { setScores({ ...scores, [c.id]: i + 1 }); setSaved(false) }}
              >
                <strong>{i + 1}</strong> {label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <label>
        Comments
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Strengths and areas to improve" />
      </label>

      <div className="footer">
        <p className="live">
          Current score: <strong>{live.toFixed(1)}%</strong> · {Object.keys(scores).length === 0 ? 'Not scored yet' : rating(live)}
          <span className="muted"> (scale 1–{MAX})</span>
        </p>
        <button className="primary" disabled={!complete}>Save evaluation</button>
      </div>
      {saved && <p className="ok" role="status">Evaluation saved. See it under Results.</p>}
    </form>
  )
}
