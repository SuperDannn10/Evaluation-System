import type { AppData } from './types'
import TeacherPortrait from './TeacherPortrait'
import { seed, uid, weightedScore } from './store'

interface Props {
  data: AppData
  onChange: (d: AppData) => void
}

export default function Setup({ data, onChange }: Props) {
  const { criteria, subjects } = data
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
  const totalEvaluations = data.evaluations.length
  const avgScore = totalEvaluations
    ? data.evaluations.reduce((sum, e) => sum + weightedScore(e.scores, criteria), 0) / totalEvaluations
    : 0

  const patchCriterion = (id: string, patch: Partial<AppData['criteria'][number]>) =>
    onChange({ ...data, criteria: criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  const patchSubject = (id: string, patch: Partial<AppData['subjects'][number]>) =>
    onChange({ ...data, subjects: subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)) })

  return (
    <div>
      <section className="panel">
        <div className="bar">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h2>Teacher record management</h2>
            <p className="muted">Manage your roster and customize how feedback is scored.</p>
          </div>
          <span className={totalWeight === 100 ? 'status-pill status-good' : 'status-pill'}>Weights: {totalWeight}%</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Teachers</span>
            <strong>{subjects.length}</strong>
          </div>
          <div className="stat-card">
            <span>Feedback</span>
            <strong>{totalEvaluations}</strong>
          </div>
          <div className="stat-card">
            <span>Average score</span>
            <strong>{totalEvaluations ? `${avgScore.toFixed(1)}%` : '—'}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="bar">
          <div>
            <p className="eyebrow">Scoring setup</p>
            <h2>Evaluation criteria</h2>
          </div>
          <p className={totalWeight === 100 ? 'ok' : 'muted'}>{totalWeight !== 100 ? 'Weights are normalized automatically.' : 'Your weights are balanced.'}</p>
        </div>
        {criteria.map((c) => (
          <div key={c.id} className="row edit setup-row">
            <input aria-label="Criterion name" value={c.name} onChange={(e) => patchCriterion(c.id, { name: e.target.value })} />
            <input aria-label="Description" value={c.description} onChange={(e) => patchCriterion(c.id, { description: e.target.value })} />
            <label className="weight-input">Weight
              <input aria-label="Weight" type="number" min={0} max={100} value={c.weight} onChange={(e) => patchCriterion(c.id, { weight: Number(e.target.value) })} />
            </label>
            <button className="danger" onClick={() => onChange({ ...data, criteria: criteria.filter((x) => x.id !== c.id) })}>Remove</button>
          </div>
        ))}
        <div className="setup-actions">
          <button onClick={() => onChange({ ...data, criteria: [...criteria, { id: uid(), name: 'New criterion', description: '', weight: 10 }] })}>
            <span aria-hidden="true">+</span> Add criterion
          </button>
          <span className={totalWeight === 100 ? 'weight-total balanced' : 'weight-total'}>{totalWeight}% <small>of 100%</small></span>
        </div>
        {totalWeight !== 100 && <div className="weight-track"><span style={{ width: `${Math.min(Math.max(totalWeight, 0), 100)}%` }} /></div>}
        {totalWeight !== 100 && (
          <p className="weight-hint">The score is still calculated correctly using normalized weights.</p>
        )}
      </section>

      <section className="panel roster-panel">
        <div className="bar roster-heading">
          <div>
            <p className="eyebrow">Faculty</p>
            <h2>Teacher roster</h2>
          </div>
          <span className="section-count">{subjects.length} teacher{subjects.length === 1 ? '' : 's'}</span>
        </div>
        {subjects.length === 0 && <p className="empty">Your teacher roster is empty. Add a teacher to begin.</p>}
        {subjects.map((s) => (
          <div key={s.id} className="row edit setup-row teacher-setup-row">
            {s.avatar
              ? <img className="teacher-avatar setup-avatar" src={s.avatar} alt="" />
              : <TeacherPortrait className="teacher-avatar setup-avatar" name={s.name} />}
            <input aria-label="Teacher name" value={s.name} onChange={(e) => patchSubject(s.id, { name: e.target.value })} />
            <input aria-label="Department" value={s.group} onChange={(e) => patchSubject(s.id, { group: e.target.value })} />
            <button className="danger" onClick={() => onChange({ ...data, subjects: subjects.filter((x) => x.id !== s.id), evaluations: data.evaluations.filter((e) => e.subjectId !== s.id) })}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={() => onChange({ ...data, subjects: [...subjects, { id: uid(), name: 'New teacher', group: 'Department' }] })}>
          <span aria-hidden="true">+</span> Add teacher
        </button>
      </section>

      <button className="danger" onClick={() => window.confirm('Delete all data and restore the sample setup?') && onChange(seed)}>
        Reset all data
      </button>
    </div>
  )
}
