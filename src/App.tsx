import { useEffect, useState } from 'react'
import { Viewer, type ViewMode } from './components/Viewer'
import {
  team, heroStats, overview, subsystems, software, fabrication, season, resources, glossary, thanks,
} from './content'

const logoUrl = `${import.meta.env.BASE_URL}${team.logo}`
const iconUrl = `${import.meta.env.BASE_URL}${team.icon}`

const sections = [
  { id: 'robot', label: 'Robot' },
  { id: 'overview', label: 'Overview' },
  { id: 'systems', label: 'Systems' },
  { id: 'software', label: 'Software' },
  { id: 'fabrication', label: 'Fabrication' },
  { id: 'season', label: 'Season' },
  { id: 'resources', label: 'Resources' },
]

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])
  return active
}

function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f0a16' : '#f7f5fa')
  }, [dark])
  const toggle = () => {
    const next = !dark
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // Private mode or blocked storage: the choice just isn't remembered.
    }
    setDark(next)
  }
  return { dark, toggle }
}

function Nav({ active, dark, onToggleTheme }: { active: string; dark: boolean; onToggleTheme: () => void }) {
  return (
    <header className="nav">
      <a className="brand" href="#robot" aria-label={`Team ${team.number} home`}>
        <img src={iconUrl} alt="" width={34} height={34} />
        <span>{team.number}</span>
      </a>
      <nav aria-label="Sections">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}>{s.label}</a>
        ))}
      </nav>
      <button
        className="btn ghost theme-toggle"
        onClick={onToggleTheme}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={dark ? 'Light mode' : 'Dark mode'}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {dark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          )}
        </svg>
      </button>
      <button className="btn ghost print-btn" onClick={() => window.print()}>Print</button>
    </header>
  )
}

function Hero() {
  const [selected, setSelected] = useState<string | null>(null)
  const [mode, setMode] = useState<ViewMode>('ghost')
  const [explode, setExplode] = useState(0)
  // Once the visitor touches the model or any control, the idle spin stops for good.
  const [touched, setTouched] = useState(false)
  const touch = () => setTouched(true)
  return (
    <section id="robot" className="hero">
      <div className="hero-copy">
        <img className="hero-logo" src={logoUrl} alt={`${team.name} logo`} />
        <p className="eyebrow">Team {team.number} · {team.name} · {team.location}</p>
        <h1>{team.robotName}</h1>
        <p className="lede">{team.season}. {team.tagline}</p>
        <dl className="stats">
          {heroStats.map((s) => (
            <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
          ))}
        </dl>
        <div className="links">
          {team.links.map((l) => (
            <a key={l.label} className="btn" href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
          ))}
        </div>
      </div>
      <div className="hero-stage">
        <Viewer selected={selected} mode={mode} explode={explode} autoRotate={!touched} onInteract={touch} />
        <div className="controls" role="group" aria-label="Viewer controls">
          <div className="chips">
            <button className={selected === null ? 'chip on' : 'chip'} onClick={() => { setSelected(null); touch() }}>All</button>
            {subsystems.map((s) => (
              <button key={s.id} className={selected === s.id ? 'chip on' : 'chip'} onClick={() => { setSelected(s.id); touch() }}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="row">
            <div className="seg" role="group" aria-label="Other parts">
              <button className={mode === 'ghost' ? 'on' : ''} onClick={() => { setMode('ghost'); touch() }}>Ghost</button>
              <button className={mode === 'isolate' ? 'on' : ''} onClick={() => { setMode('isolate'); touch() }}>Isolate</button>
            </div>
            <label className="slider">
              Explode
              <input type="range" min={0} max={0.6} step={0.01} value={explode} onChange={(e) => { setExplode(Number(e.target.value)); touch() }} />
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

function Overview() {
  return (
    <section id="overview" className="block">
      <h2>{overview.heading}</h2>
      <div className="two">
        <div>{overview.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        <ol className="priorities">
          {overview.priorities.map((p) => (
            <li key={p.title}><strong>{p.title}</strong><span>{p.text}</span></li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Systems() {
  const [openId, setOpenId] = useState(subsystems[0].id)
  return (
    <section id="systems" className="block">
      <h2>Robot systems</h2>
      <div className="tabs" role="tablist">
        {subsystems.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === openId} className={x.id === openId ? 'tab on' : 'tab'} onClick={() => setOpenId(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      {subsystems.map((s) => (
        <article className={s.id === openId ? 'panel' : 'panel off'} key={s.id} hidden={s.id !== openId}>
          <header>
            <h3>{s.name}</h3>
            <p className="muted">{s.tagline}</p>
          </header>
          <p>{s.summary}</p>
          <dl className="specs">
            {s.specs.map((x) => <div key={x.label}><dt>{x.label}</dt><dd>{x.value}</dd></div>)}
          </dl>
          <h4>Options we considered</h4>
          <div className="alts">
            {s.alternatives.map((a) => (
              <div key={a.name} className={a.chosen ? 'alt chosen' : 'alt'}>
                <strong>{a.name}</strong>
                <p><span className="tag pro">Pro</span> {a.pros}</p>
                <p><span className="tag con">Con</span> {a.cons}</p>
              </div>
            ))}
          </div>
          <h4>Iterations</h4>
          <ol className="iters">
            {s.iterations.map((i) => <li key={i.label}><span className="pill">{i.label}</span>{i.note}</li>)}
          </ol>
          <h4>Lessons learned</h4>
          <ul>{s.lessons.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </article>
      ))}
    </section>
  )
}

function Software() {
  return (
    <section id="software" className="block">
      <h2>Software</h2>
      <p>{software.summary}</p>
      <div className="cards">
        {software.pillars.map((p) => (
          <div className="card" key={p.title}><strong>{p.title}</strong><p>{p.text}</p></div>
        ))}
      </div>
    </section>
  )
}

function Fabrication() {
  return (
    <section id="fabrication" className="block">
      <h2>Fabrication</h2>
      <p>{fabrication.summary}</p>
      <ol className="flow">
        {fabrication.workflow.map((w) => <li key={w}>{w}</li>)}
      </ol>
      <div className="cards">
        {fabrication.machines.map((m, i) => (
          <div className="card" key={i}><strong>{m.name}</strong><p>{m.use}</p><p className="muted">{m.note}</p></div>
        ))}
      </div>
      <h3>Machining settings</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Material</th><th>Tool</th><th>Spindle (RPM)</th><th>Feed</th><th>Depth of cut</th></tr></thead>
          <tbody>
            {fabrication.settings.map((r, i) => (
              <tr key={i}><td>{r.material}</td><td>{r.tool}</td><td>{r.rpm}</td><td>{r.feed}</td><td>{r.depth}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Season() {
  return (
    <section id="season" className="block">
      <h2>Season</h2>
      <p>{season.summary}</p>
      <ol className="timeline">
        {season.timeline.map((t) => (
          <li key={t.title}><span className="when">{t.when}</span><strong>{t.title}</strong><p>{t.text}</p></li>
        ))}
      </ol>
      <h3>Events</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Event</th><th>Date</th><th>Result</th><th>Takeaway</th></tr></thead>
          <tbody>
            {season.events.map((e, i) => (
              <tr key={i}><td>{e.name}</td><td>{e.date}</td><td>{e.result}</td><td>{e.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Resources() {
  return (
    <section id="resources" className="block">
      <h2>Resources</h2>
      <div className="cards">
        {resources.map((r) => (
          <a className="card link" key={r.label} href={r.href} target="_blank" rel="noreferrer">
            <strong>{r.label}</strong><span className="muted">{r.note}</span>
          </a>
        ))}
      </div>
      <h3>Glossary</h3>
      <dl className="glossary">
        {glossary.map((g, i) => <div key={i}><dt>{g.term}</dt><dd>{g.def}</dd></div>)}
      </dl>
      <p className="thanks">{thanks}</p>
    </section>
  )
}

export default function App() {
  const active = useScrollSpy(sections.map((s) => s.id))
  const { dark, toggle } = useDarkMode()
  return (
    <>
      <Nav active={active} dark={dark} onToggleTheme={toggle} />
      <main>
        <Hero />
        <Overview />
        <Systems />
        <Software />
        <Fabrication />
        <Season />
        <Resources />
      </main>
      <footer className="footer">Team {team.number} {team.name} · {team.season}</footer>
    </>
  )
}
