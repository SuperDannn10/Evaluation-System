import { useState } from 'react'
import Evaluate from './Evaluate'
import Results from './Results'
import Setup from './Setup'
import { useAppData } from './store'

const tabs = ['Evaluate', 'Results', 'Setup'] as const
type Tab = (typeof tabs)[number]

export default function App() {
  const [data, setData] = useAppData()
  const [tab, setTab] = useState<Tab>('Evaluate')

  return (
    <div className="app">
      <header>
        <h1>Evaluation System</h1>
        <nav aria-label="Sections">
          {tabs.map((t) => (
            <button key={t} className={t === tab ? 'tab active' : 'tab'} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === 'Evaluate' && <Evaluate data={data} onChange={setData} />}
        {tab === 'Results' && <Results data={data} onChange={setData} />}
        {tab === 'Setup' && <Setup data={data} onChange={setData} />}
      </main>
    </div>
  )
}
