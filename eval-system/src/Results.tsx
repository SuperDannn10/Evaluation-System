import type { AppData } from './types'
import { MAX, rating, weightedScore } from './store'

interface Props {
  data: AppData
  onChange: (d: AppData) => void
}

export default function Results({ data, onChange }: Props) {
  const { criteria, subjects, evaluations } = data

  const rows = subjects
    .map((s) => {
      const evs = evaluations.filter((e) => e.subjectId === s.id)
      const avg = evs.length ? evs.reduce((sum, e) => sum + weightedScore(e.scores, criteria), 0) / evs.length : null
      const byCriterion = criteria.map((c) =>
        evs.length ? evs.reduce((sum, e) => sum + (e.scores[c.id] ?? 0), 0) / evs.length : 0
      )
      return { s, count: evs.length, avg, byCriterion }
    })
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))

  function exportCsv() {
    const head = ['Name', 'Group', 'Evaluations', 'Score (%)', 'Rating', ...criteria.map((c) => `${c.name} (avg of ${MAX})`)]
    const lines = rows.map((r) => [
      r.s.name, r.s.group, r.count,
      r.avg === null ? '' : r.avg.toFixed(1),
      r.avg === null ? '' : rating(r.avg),
      ...r.byCriterion.map((v) => v.toFixed(2)),
    ])
    const csv = [head, ...lines]
      .map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'evaluation-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const log = [...evaluations].sort((a, b) => b.date.localeCompare(a.date))
  const nameOf = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Removed person'
  const evaluatedCount = rows.filter((row) => row.count > 0).length
  const overallAverage = evaluations.length
    ? evaluations.reduce((sum, evaluation) => sum + weightedScore(evaluation.scores, criteria), 0) / evaluations.length
    : null

  return (
    <div className="results-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Insights & reports</p>
          <h2>Evaluation results</h2>
          <p className="muted">A clear overview of student feedback and teacher performance.</p>
        </div>
        <button className="export-button" onClick={exportCsv} disabled={!subjects.length}>Export report <span aria-hidden="true">↓</span></button>
      </section>

      <section className="stats-grid results-stats" aria-label="Evaluation summary">
        <div className="stat-card">
          <span>Total responses</span>
          <strong>{evaluations.length}</strong>
          <small>Submitted evaluations</small>
        </div>
        <div className="stat-card">
          <span>Teachers reviewed</span>
          <strong>{evaluatedCount}<em> / {subjects.length}</em></strong>
          <small>With at least one response</small>
        </div>
        <div className="stat-card">
          <span>Overall average</span>
          <strong>{overallAverage === null ? '—' : `${overallAverage.toFixed(1)}%`}</strong>
          <small>{overallAverage === null ? 'Waiting for first response' : rating(overallAverage)}</small>
        </div>
      </section>

      <section className="ranking-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">By teacher</p>
            <h2>Teacher rankings</h2>
          </div>
          <span className="section-count">{subjects.length} teacher{subjects.length === 1 ? '' : 's'}</span>
        </div>
        {rows.length === 0 && <p className="empty">Add teachers in Setup to see their results here.</p>}
        <div className="ranking-grid">
          {rows.map((r, index) => (
            <section key={r.s.id} className="panel teacher-result">
              <div className="teacher-result-top">
                <span className="rank-badge">#{String(index + 1).padStart(2, '0')}</span>
                <span className="teacher-avatar" aria-hidden="true">{r.s.name.trim().charAt(0).toUpperCase() || '?'}</span>
                <div className="teacher-info">
                  <h3>{r.s.name}</h3>
                  <p className="muted">{r.s.group || 'No department listed'}</p>
                </div>
              </div>
              <div className="teacher-score">
                <div>
                  <span className="score-caption">Average score</span>
                  <p className="big">
                    {r.avg === null ? <span className="muted">No ratings yet</span> : (
                      <><strong>{r.avg.toFixed(1)}%</strong><span className="rating-pill">{rating(r.avg)}</span></>
                    )}
                  </p>
                </div>
                <span className="response-count"><strong>{r.count}</strong> response{r.count === 1 ? '' : 's'}</span>
              </div>
              {r.count > 0 ? (
                <div className="criterion-list">
                  {criteria.map((c, i) => (
                    <div key={c.id} className="meter">
                      <span>{c.name}</span>
                      <div className="track" role="progressbar" aria-label={`${c.name} average`} aria-valuemin={0} aria-valuemax={MAX} aria-valuenow={Number(r.byCriterion[i].toFixed(1))}>
                        <div className="fill" style={{ width: `${(r.byCriterion[i] / MAX) * 100}%` }} />
                      </div>
                      <span className="meter-value">{r.byCriterion[i].toFixed(1)}<small>/{MAX}</small></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-responses">This teacher has not received feedback yet.</p>
              )}
            </section>
          ))}
        </div>
      </section>

      <section className="activity-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest submissions</p>
            <h2>Feedback activity</h2>
          </div>
          <span className="section-count">{log.length} response{log.length === 1 ? '' : 's'}</span>
        </div>
        {log.length === 0 && <p className="empty">No evaluations yet. Submit the first one from the Evaluate tab.</p>}
        <div className="activity-list">
          {log.map((e) => (
            <article key={e.id} className="panel activity-item">
              <span className="activity-avatar" aria-hidden="true">{e.evaluator.trim().charAt(0).toUpperCase() || '?'}</span>
              <div className="activity-content">
                <div className="activity-meta">
                  <div>
                    <strong>{nameOf(e.subjectId)}</strong>
                    <p className="muted">Feedback by {e.evaluator}</p>
                  </div>
                  <div className="activity-score">
                    <strong>{weightedScore(e.scores, criteria).toFixed(1)}%</strong>
                    <time dateTime={e.date}>{new Date(e.date).toLocaleDateString()}</time>
                  </div>
                </div>
                {e.comment ? <p className="activity-comment">{e.comment}</p> : <p className="activity-comment muted">No written comment provided.</p>}
              </div>
              <button
                className="danger delete-button"
                aria-label={`Delete evaluation by ${e.evaluator} for ${nameOf(e.subjectId)}`}
                onClick={() => onChange({ ...data, evaluations: evaluations.filter((x) => x.id !== e.id) })}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
