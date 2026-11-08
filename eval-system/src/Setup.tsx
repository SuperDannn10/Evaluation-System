import type { AppData } from './types'
import { seed, uid } from './store'

interface Props {
  data: AppData
  onChange: (d: AppData) => void
}

export default function Setup({ data, onChange }: Props) {
  const { criteria, subjects } = data
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)

  const patchCriterion = (id: string, patch: Partial<AppData['criteria'][number]>) =>
    onChange({ ...data, criteria: criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  const patchSubject = (id: string, patch: Partial<AppData['subjects'][number]>) =>
    onChange({ ...data, subjects: subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)) })

  return (
    <div>
      <section className="panel">
        <div className="bar">
          <h2>Criteria</h2>
          <p className={totalWeight === 100 ? 'ok' : 'muted'}>Total weight: {totalWeight}% {totalWeight !== 100 && '(scores are normalized, but 100% is easier to read)'}</p>
        </div>
        {criteria.map((c) => (
          <div key={c.id} className="row edit">
            <input aria-label="Criterion name" value={c.name} onChange={(e) => patchCriterion(c.id, { name: e.target.value })} />
            <input aria-label="Description" value={c.description} onChange={(e) => patchCriterion(c.id, { description: e.target.value })} />
            <input aria-label="Weight" type="number" min={0} max={100} value={c.weight} onChange={(e) => patchCriterion(c.id, { weight: Number(e.target.value) })} />
            <button className="danger" onClick={() => onChange({ ...data, criteria: criteria.filter((x) => x.id !== c.id) })}>Remove</button>
          </div>
        ))}
        <button onClick={() => onChange({ ...data, criteria: [...criteria, { id: uid(), name: 'New criterion', description: '', weight: 10 }] })}>
          Add criterion
        </button>
      </section>

      <section className="panel">
        <h2>People</h2>
        {subjects.map((s) => (
          <div key={s.id} className="row edit">
            <input aria-label="Name" value={s.name} onChange={(e) => patchSubject(s.id, { name: e.target.value })} />
            <input aria-label="Group" value={s.group} onChange={(e) => patchSubject(s.id, { group: e.target.value })} />
            <button className="danger" onClick={() => onChange({ ...data, subjects: subjects.filter((x) => x.id !== s.id), evaluations: data.evaluations.filter((e) => e.subjectId !== s.id) })}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={() => onChange({ ...data, subjects: [...subjects, { id: uid(), name: 'New person', group: '' }] })}>
          Add person
        </button>
      </section>

      <button className="danger" onClick={() => window.confirm('Delete all data and restore the sample setup?') && onChange(seed)}>
        Reset all data
      </button>
    </div>
  )
}
