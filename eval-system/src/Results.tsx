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

  return (
    <div>
      <div className="bar">
        <h2>Ranking</h2>
        <button onClick={exportCsv} disabled={!subjects.length}>Export CSV</button>
      </div>

      {rows.map((r) => (
        <section key={r.s.id} className="panel">
          <div className="bar">
            <div>
              <h3>{r.s.name}</h3>
              <p className="muted">{r.s.group} · {r.count} evaluation{r.count === 1 ? '' : 's'}</p>
            </div>
            <div className="big">
              {r.avg === null ? <span className="muted">No evaluations yet</span> : (
                <><strong>{r.avg.toFixed(1)}%</strong> <span>{rating(r.avg)}</span></>
              )}
            </div>
          </div>
          {r.count > 0 && criteria.map((c, i) => (
            <div key={c.id} className="meter">
              <span>{c.name}</span>
              <div className="track"><div className="fill" style={{ width: `${(r.byCriterion[i] / MAX) * 100}%` }} /></div>
              <span>{r.byCriterion[i].toFixed(1)}</span>
            </div>
          ))}
        </section>
      ))}

      <h2>All evaluations</h2>
      {log.length === 0 && <p className="empty">No evaluations yet. Save one from the Evaluate tab.</p>}
      {log.map((e) => (
        <div key={e.id} className="panel log">
          <div>
            <strong>{nameOf(e.subjectId)}</strong> · {weightedScore(e.scores, criteria).toFixed(1)}%
            <p className="muted">by {e.evaluator} on {new Date(e.date).toLocaleDateString()}</p>
            {e.comment && <p>{e.comment}</p>}
          </div>
          <button className="danger" onClick={() => onChange({ ...data, evaluations: evaluations.filter((x) => x.id !== e.id) })}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
