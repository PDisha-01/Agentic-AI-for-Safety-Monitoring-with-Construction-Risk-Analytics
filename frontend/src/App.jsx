
import { useState } from 'react'
import {
  ShieldCheck,
  LayoutDashboard,
  HardHat,
  AlertTriangle,
  ClipboardCheck,
  Bot,
  Settings,
  Search,
  Bell,
  Activity,
  Users,
  CheckCircle2,
  Menu,
} from 'lucide-react'

const metrics = [
  { label: 'Total Inspections', value: '248', note: '+12% this month', icon: ClipboardCheck },
  { label: 'Active Hazards', value: '18', note: '6 require attention', icon: AlertTriangle },
  { label: 'Safety Compliance', value: '94.2%', note: '+3.1% this month', icon: ShieldCheck },
  { label: 'Workers Monitored', value: '126', note: 'Across active sites', icon: Users },
]

const hazards = [
  { site: 'Building A — Floor 4', hazard: 'Missing safety harness', severity: 'Critical', status: 'Open' },
  { site: 'Tower B — Crane Zone', hazard: 'Restricted area access', severity: 'High', status: 'Investigating' },
  { site: 'Warehouse — East Wing', hazard: 'Protective helmet missing', severity: 'Medium', status: 'In progress' },
  { site: 'Building C — Ground', hazard: 'Obstructed walkway', severity: 'Low', status: 'Resolved' },
]

const weekly = [
  { day: 'Mon', risks: 12, resolved: 8 },
  { day: 'Tue', risks: 18, resolved: 13 },
  { day: 'Wed', risks: 14, resolved: 11 },
  { day: 'Thu', risks: 23, resolved: 17 },
  { day: 'Fri', risks: 16, resolved: 14 },
  { day: 'Sat', risks: 9, resolved: 7 },
  { day: 'Sun', risks: 11, resolved: 9 },
]

export default function App() {
  const [active, setActive] = useState('Overview')
  const [search, setSearch] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  const nav = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Site Monitoring', icon: HardHat },
    { label: 'Risk Analytics', icon: Activity },
    { label: 'Incidents', icon: AlertTriangle },
    { label: 'Compliance', icon: ClipboardCheck },
    { label: 'AI Agents', icon: Bot },
  ]

  const filteredHazards = hazards.filter((item) =>
    `${item.site} ${item.hazard} ${item.severity}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <aside className={`${mobileMenu ? 'block' : 'hidden'} w-full border-b border-slate-800 bg-slate-900 p-5 md:block md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r`}>
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400/15 p-2 text-emerald-400"><ShieldCheck size={27} /></div>
          <div>
            <h1 className="font-bold tracking-tight">HazardHawk AI</h1>
            <p className="text-xs text-slate-400">Safety Intelligence</p>
          </div>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
        <nav className="space-y-1">
          {nav.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => { setActive(label); setMobileMenu(false) }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active === label ? 'bg-emerald-400/10 font-semibold text-emerald-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-300"><Bot size={18} /><span className="text-sm font-semibold">AI Safety Agent</span></div>
          <p className="text-xs leading-5 text-slate-400">Demo mode is active. Risk insights use sample data until the backend is connected.</p>
          <span className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Interface online</span>
        </div>
        <button onClick={() => setActive('Settings')} className="mt-6 flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white"><Settings size={18} /> Settings</button>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-lg p-2 hover:bg-slate-800 md:hidden" aria-label="Toggle menu"><Menu size={20} /></button>
            <div>
              <p className="text-xs text-slate-500">Construction / Safety Platform</p>
              <h2 className="text-xl font-bold">{active}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
              <Search size={16} className="text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hazards..." className="w-32 bg-transparent text-sm outline-none placeholder:text-slate-500 sm:w-44" />
            </label>
            <button className="relative rounded-xl border border-slate-800 bg-slate-900 p-2.5" aria-label="Notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-400" /></button>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-bold text-emerald-300 sm:flex">SA</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-7 p-5 md:p-8">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Monday, October 12, 2026</p>
              <h3 className="mt-1 text-2xl font-bold md:text-3xl">Safety Operations Overview</h3>
              <p className="mt-2 text-sm text-slate-400">Monitor site conditions, identify hazards, and track corrective actions.</p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">● Sample dashboard data</span>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, note, icon: Icon }) => (
              <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{label}</p>
                  <span className="rounded-xl bg-slate-800 p-2 text-emerald-300"><Icon size={19} /></span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
                <p className="mt-2 text-xs text-slate-500">{note}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 xl:col-span-2">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="font-semibold">Weekly Hazard Trends</h3><p className="mt-1 text-xs text-slate-500">Detected hazards versus resolved items</p></div>
                <div className="flex gap-4 text-xs"><span className="text-emerald-300">● Detected</span><span className="text-sky-300">● Resolved</span></div>
              </div>
              <div className="flex h-56 items-end justify-around gap-3 border-b border-slate-800 pb-2">
                {weekly.map((item) => (
                  <div key={item.day} className="flex h-full flex-1 items-end justify-center gap-1">
                    <div title={`${item.risks} detected`} className="w-3 rounded-t-md bg-emerald-400 sm:w-5" style={{ height: `${item.risks / 25 * 100}%` }} />
                    <div title={`${item.resolved} resolved`} className="w-3 rounded-t-md bg-sky-400 sm:w-5" style={{ height: `${item.resolved / 25 * 100}%` }} />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-around text-xs text-slate-500">{weekly.map((item) => <span key={item.day}>{item.day}</span>)}</div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="font-semibold">Safety System Status</h3>
              <p className="mt-1 text-xs text-slate-500">Demo component availability</p>
              <div className="mt-6 space-y-5">
                {[
                  ['Risk Assessment Engine', 'Ready'],
                  ['Site Monitoring UI', 'Ready'],
                  ['AI Agent Workflow', 'Planned'],
                  ['Database Connection', 'Planned'],
                ].map(([name, status]) => (
                  <div key={name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 size={16} className={status === 'Ready' ? 'text-emerald-400' : 'text-slate-600'} />{name}</div>
                    <span className={`text-xs ${status === 'Ready' ? 'text-emerald-300' : 'text-slate-500'}`}>{status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-xl bg-slate-800/70 p-4">
                <p className="text-xs text-slate-400">Project status</p>
                <p className="mt-1 font-semibold">Frontend foundation</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-2/5 rounded-full bg-emerald-400" /></div>
                <p className="mt-2 text-xs text-slate-500">UI prototype — backend integration pending</p>
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
              <div><h3 className="font-semibold">Recent Safety Findings</h3><p className="mt-1 text-xs text-slate-500">Search the sample records using the search box above</p></div>
              <span className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">{filteredHazards.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3 font-medium">Site / Zone</th><th className="px-5 py-3 font-medium">Finding</th><th className="px-5 py-3 font-medium">Severity</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredHazards.map((item) => (
                    <tr key={item.site} className="hover:bg-slate-800/30">
                      <td className="px-5 py-4 font-medium text-slate-200">{item.site}</td>
                      <td className="px-5 py-4 text-slate-400">{item.hazard}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.severity === 'Critical' ? 'bg-rose-400/10 text-rose-300' : item.severity === 'High' ? 'bg-orange-400/10 text-orange-300' : item.severity === 'Medium' ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}>{item.severity}</span></td>
                      <td className="px-5 py-4 text-slate-400">{item.status}</td>
                    </tr>
                  ))}
                  {filteredHazards.length === 0 && <tr><td colSpan="4" className="px-5 py-8 text-center text-slate-500">No matching findings.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500">
            <span>HazardHawk AI · Construction Risk Analytics</span>
            <span className="flex items-center gap-2"><Activity size={14} /> Frontend prototype · Not for live safety decisions</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
