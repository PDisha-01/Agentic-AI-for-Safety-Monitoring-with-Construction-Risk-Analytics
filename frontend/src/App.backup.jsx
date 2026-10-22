
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
  const [siteImage, setSiteImage] = useState(null)
  const [hazardSeverity, setHazardSeverity] = useState('4')
  const [likelihood, setLikelihood] = useState('3')
  const [workerExposure, setWorkerExposure] = useState('4')
  const [safetyCompliance, setSafetyCompliance] = useState('2')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function handleAnalyzeImage(event) {
    event.preventDefault()
    setAnalysisError('')
    setAnalysisResult(null)

    if (!siteImage) {
      setAnalysisError('Please choose a site image first.')
      return
    }

    const formData = new FormData()
    formData.append('file', siteImage)
    formData.append('hazard_severity', hazardSeverity)
    formData.append('likelihood', likelihood)
    formData.append('worker_exposure', workerExposure)
    formData.append('safety_compliance', safetyCompliance)

    setIsAnalyzing(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Image analysis failed. Please try again.')
      }
      setAnalysisResult(data)
    } catch (error) {
      setAnalysisError(
        error.message === 'Failed to fetch'
          ? 'Could not connect to FastAPI. Make sure the backend is running at http://127.0.0.1:8000.'
          : error.message || 'Something went wrong during analysis.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

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

          <section className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Live backend feature</p>
              <h3 className="mt-2 text-xl font-bold">Construction Site Image Analysis</h3>
              <p className="mt-1 text-sm text-slate-400">Upload an image to run object detection and calculate a risk score using the connected FastAPI service.</p>
            </div>

            <form onSubmit={handleAnalyzeImage} className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                  Site image (JPEG, PNG, or WebP)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={(event) => {
                      setSiteImage(event.target.files?.[0] || null)
                      setAnalysisResult(null)
                      setAnalysisError('')
                    }}
                    className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-400/15 file:px-3 file:py-2 file:font-semibold file:text-emerald-300"
                  />
                </label>
                {siteImage && <p className="text-xs text-slate-400">Selected: {siteImage.name} ({Math.max(1, Math.round(siteImage.size / 1024))} KB)</p>}
                <p className="text-xs leading-5 text-amber-300">Risk inputs are supplied by the user; this model does not infer construction hazards or PPE compliance from the image.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: 'Hazard severity (1–5)', value: hazardSeverity, setter: setHazardSeverity },
                  { label: 'Likelihood (1–5)', value: likelihood, setter: setLikelihood },
                  { label: 'Worker exposure (1–5)', value: workerExposure, setter: setWorkerExposure },
                  { label: 'Safety compliance (1–5)', value: safetyCompliance, setter: setSafetyCompliance },
                ].map(({ label, value, setter }) => (
                  <label key={label} className="text-sm text-slate-300">
                    {label}
                    <select
                      value={value}
                      onChange={(event) => setter(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400"
                    >
                      {[1, 2, 3, 4, 5].map((number) => <option key={number} value={number}>{number}</option>)}
                    </select>
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="mt-1 rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {isAnalyzing ? 'Analyzing image…' : 'Analyze Site Image'}
                </button>
              </div>
            </form>

            {analysisError && (
              <div role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                {analysisError}
              </div>
            )}

            {analysisResult && (
              <div className="mt-6 space-y-5 border-t border-slate-800 pt-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Objects detected</p>
                    <p className="mt-2 text-3xl font-bold">{analysisResult.object_count}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Risk score</p>
                    <p className="mt-2 text-3xl font-bold">{analysisResult.risk_assessment.risk_score}<span className="text-base text-slate-500">/100</span></p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Risk level</p>
                    <p className={`mt-2 text-2xl font-bold ${analysisResult.risk_assessment.risk_level === 'Critical' ? 'text-rose-300' : analysisResult.risk_assessment.risk_level === 'High' ? 'text-orange-300' : analysisResult.risk_assessment.risk_level === 'Medium' ? 'text-amber-300' : 'text-emerald-300'}`}>{analysisResult.risk_assessment.risk_level}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 p-4">
                  <h4 className="font-semibold">Risk recommendation</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{analysisResult.risk_assessment.recommendation}</p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="font-semibold">Detected objects</h4>
                    <span className="text-xs text-slate-500">General-purpose YOLO model</span>
                  </div>
                  {analysisResult.detected_objects.length === 0 ? (
                    <p className="rounded-xl bg-slate-950 p-4 text-sm text-slate-400">No objects were detected with the current model confidence threshold.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full min-w-[500px] text-left text-sm">
                        <thead className="bg-slate-800/60 text-xs uppercase text-slate-400">
                          <tr><th className="px-4 py-3">Object</th><th className="px-4 py-3">Confidence</th><th className="px-4 py-3">Bounding box (x1, y1, x2, y2)</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {analysisResult.detected_objects.map((object, index) => (
                            <tr key={`${object.label}-${index}`}>
                              <td className="px-4 py-3 font-medium text-slate-200">{object.label}</td>
                              <td className="px-4 py-3 text-emerald-300">{(object.confidence * 100).toFixed(1)}%</td>
                              <td className="px-4 py-3 text-slate-400">{object.bbox.map((coordinate) => coordinate.toFixed(1)).join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <p className="text-xs leading-5 text-slate-500">Prototype note: the score is calculated from the four inputs above, not automatically inferred from detected objects. Validate all findings before any real-world safety decision.</p>
              </div>
            )}
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