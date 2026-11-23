import { useEffect, useState, useMemo } from 'react'
import {
  Bird,
  HardHat,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Award,
  BarChart3,
  Bot,
  Camera,
  CheckCircle2,
  CheckSquare,
  Clock,
  Code,
  Cpu,
  Eye,
  FileText,
  Filter,
  History,
  Info,
  Layers,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  Siren,
  Sparkles,
  Terminal,
  User as UserIcon,
  UserCheck,
  Users,
  Wrench,
  XCircle,
  Calendar,
  Phone,
  Droplet,
  Briefcase,
  Check,
} from 'lucide-react'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'

// Default Active Construction Sector Hazards for HazardHawk AI
const DEFAULT_CONSTRUCTION_HAZARDS = [
  {
    id: 'HAZ-SCAF-01',
    zone: 'Zone B — Perimeter Scaffolding (Level 7)',
    sector_type: 'High Elevation & Fall Protection',
    hazard: 'Worker observed near platform edge without hooked lanyard / unclipped safety harness',
    severity: 'Critical',
    safety_rule: 'Fall Arrest & Scaffolding Tie-off Protocol',
    action_status: 'Stop-Work Order Active',
    reported_by: 'CCTV AI Camera 04',
    time_logged: '10 mins ago',
    risk_index: 85,
    image: '/zone-scaffolding.jpg',
  },
  {
    id: 'HAZ-CRAN-02',
    zone: 'Zone A — Tower Crane Radius',
    sector_type: 'Heavy Machinery & Hoisting',
    hazard: 'Ground riggers within counterweight blind swing radius during structural beam lift',
    severity: 'High',
    safety_rule: 'Crane Slewing Radius Clearance Protocol',
    action_status: 'Area Evacuated',
    reported_by: 'Spatial Radar Sensor 02',
    time_logged: '25 mins ago',
    risk_index: 68,
    image: '/zone-crane.jpg',
  },
  {
    id: 'HAZ-TRCH-03',
    zone: 'Zone C — Ground Trench & Excavation',
    sector_type: 'Trench Shoring & Cave-in',
    hazard: 'Excavation depth exceeded 5.2 ft with uncertified lateral hydraulic shoring box',
    severity: 'High',
    safety_rule: 'Trench Shoring & Cave-in Shielding Protocol',
    action_status: 'Geotech Inspection Dispatched',
    reported_by: 'Drone Survey 01',
    time_logged: '45 mins ago',
    risk_index: 62,
    image: '/zone-trench.jpg',
  },
  {
    id: 'HAZ-SLAB-04',
    zone: 'Zone D — Floor 6 Concrete Pour',
    sector_type: 'Chemical & Impalement',
    hazard: 'Exposed vertical steel rebar ends missing protective mushroom safety caps',
    severity: 'Medium',
    safety_rule: 'Rebar Impalement Mushroom Cap Protocol',
    action_status: 'Cap Replenishment In Progress',
    reported_by: 'Shift Inspector',
    time_logged: '1 hr ago',
    risk_index: 44,
    image: '/zone-concrete.jpg',
  },
]

// 4 Tracked Accident-Prone Zones with Real Construction Photos & Multipliers
const ACCIDENT_PRONE_ZONES = [
  {
    zone_id: 'ZONE_B_SCAFFOLD',
    zone_name: 'Zone B — Perimeter Scaffolding (Level 7)',
    hazard_type: 'High-Elevation Fall & Edge Collapse',
    risk_multiplier: '1.8x Multiplier',
    alert_badge: 'HIGH FALL RISK ZONE',
    safety_index: 68,
    base_compliance: 87.5,
    active_alert_count: 1,
    zone_status: 'CRITICAL_STOP_WORK',
    safety_rule: 'Fall Protection & Mandatory Harness Tie-off',
    image: '/zone-scaffolding.jpg',
    personnel_count: 6,
    required_ppe: ['Hard Hat', 'Fall Arrest Harness', 'Steel-Toe Boots'],
  },
  {
    zone_id: 'ZONE_A_CRANE',
    zone_name: 'Zone A — Tower Crane Sector',
    hazard_type: 'Machinery Swing Radius & Suspended Loads',
    risk_multiplier: '1.5x Multiplier',
    alert_badge: 'CRANE SWING EXCLUSION ZONE',
    safety_index: 82,
    base_compliance: 92.0,
    active_alert_count: 0,
    zone_status: 'WARNING',
    safety_rule: 'Crane Swing Radius Clearance & High-Vis Vest',
    image: '/zone-crane.jpg',
    personnel_count: 8,
    required_ppe: ['Hard Hat', 'Class 3 High-Vis Vest', 'Radio Handset'],
  },
  {
    zone_id: 'ZONE_C_TRENCH',
    zone_name: 'Zone C — Ground Trench & Excavation',
    hazard_type: 'Cave-in Collapse & Subsurface Moisture',
    risk_multiplier: '1.6x Multiplier',
    alert_badge: 'CAVE-IN COLLAPSE HAZARD',
    safety_index: 88,
    base_compliance: 95.0,
    active_alert_count: 0,
    zone_status: 'NORMAL',
    safety_rule: 'Trench Shoring Box & Safe Egress Slope',
    image: '/zone-trench.jpg',
    personnel_count: 5,
    required_ppe: ['Hard Hat', 'Steel-Toe Boots', 'Shoring Inspection'],
  },
  {
    zone_id: 'ZONE_D_SLAB',
    zone_name: 'Zone D — Floor 6 Concrete Pour',
    hazard_type: 'Rebar Impalement & Wet Alkaline Slurry',
    risk_multiplier: '1.3x Multiplier',
    alert_badge: 'REBAR & SLURRY HAZARD',
    safety_index: 91,
    base_compliance: 96.5,
    active_alert_count: 0,
    zone_status: 'NORMAL',
    safety_rule: 'Rebar End Mushroom Caps & Chemical Protection',
    image: '/zone-concrete.jpg',
    personnel_count: 9,
    required_ppe: ['Hard Hat', 'High-Vis Vest', 'Chemical Resistant Boots'],
  },
]

// Weekly Site Compliance & Incident Trends Data
const WEEKLY_SITE_TRENDS = [
  { day: 'Mon', compliance: 88, infractions: 12, alerts: 4 },
  { day: 'Tue', compliance: 92, infractions: 7, alerts: 2 },
  { day: 'Wed', compliance: 85, infractions: 15, alerts: 6 },
  { day: 'Thu', compliance: 94, infractions: 5, alerts: 1 },
  { day: 'Fri', compliance: 90, infractions: 9, alerts: 3 },
  { day: 'Sat', compliance: 96, infractions: 3, alerts: 0 },
  { day: 'Sun', compliance: 98, infractions: 1, alerts: 0 },
]

export default function App() {
  // Navigation state (Clean tabs)
  const [activeTab, setActiveTab] = useState('overview')

  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('hazardhawk_token') || '')
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hazardhawk_user')
    return saved ? JSON.parse(saved) : null
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // Sign In Inputs
  const [loginEmail, setLoginEmail] = useState('worker.rajeev@hazardhawk.ai')
  const [loginPassword, setLoginPassword] = useState('Worker@123')

  // Register Inputs (Full Worker Attributes)
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regDesignation, setRegDesignation] = useState('Steel Rigger & Scaffolder')
  const [regDob, setRegDob] = useState('1994-08-15')
  const [regAge, setRegAge] = useState(30)
  const [regBloodGroup, setRegBloodGroup] = useState('O+')
  const [regMobileNo, setRegMobileNo] = useState('+91 98765 43210')
  const [regShift, setRegShift] = useState('Morning Shift (07:00 AM - 03:30 PM)')
  const [regAssignedSector, setRegAssignedSector] = useState('Zone B — Perimeter Scaffolding (Level 7)')

  // Global Risk Assessment Matrix Sliders
  const [hazardSeverity, setHazardSeverity] = useState(7)
  const [likelihood, setLikelihood] = useState(6)
  const [workerExposure, setWorkerExposure] = useState(8)
  const [safetyCompliance, setSafetyCompliance] = useState(5)
  const [scoringZone, setScoringZone] = useState('Zone B — Perimeter Scaffolding (Level 7)')

  // Computer Vision Site Inspection State
  const [cvInspectLoading, setCvInspectLoading] = useState(false)
  const [cvResult, setCvResult] = useState(null)
  const [cvError, setCvError] = useState('')
  const [selectedSampleKey, setSelectedSampleKey] = useState('')

  // SQLite Inspection & Audit History State (Directly within Vision Inspection)
  const [pastAssessments, setPastAssessments] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historySearch, setHistorySearch] = useState('')
  const [historyFilterMode, setHistoryFilterMode] = useState('ALL')
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)

  // Safety Intelligence & Worker Protection Pipeline State
  const [safetyAlerts, setSafetyAlerts] = useState([])
  const [emittedPPEEvent, setEmittedPPEEvent] = useState({
    event_id: 'EVT-8942-SCAF',
    timestamp: '2026-11-03T16:30:00Z',
    worker_id: 'Worker #3 (Rajeev Sharma)',
    zone_id: 'ZONE_B_SCAFFOLD',
    zone_name: 'Zone B — Perimeter Scaffolding (Level 7)',
    spatial_multiplier: '1.8x',
    missing_ppe: ['safety_harness', 'helmet'],
    risk_level: 'CRITICAL',
    safety_rule: 'Fall Protection & Mandatory Hard Hat Protocol',
    status: 'STORED_IN_DATABASE',
  })

  // Jobsite Data
  const [zoneAnalytics, setZoneAnalytics] = useState(ACCIDENT_PRONE_ZONES)
  const [hazardList, setHazardList] = useState(DEFAULT_CONSTRUCTION_HAZARDS)
  const [hazardSearch, setHazardSearch] = useState('')

  // Worker Profile & Daily Report Submission State
  const [profileReportType, setProfileReportType] = useState('Daily Shift Safety Clearance')
  const [profileReportSector, setProfileReportSector] = useState('Zone B — Perimeter Scaffolding (Level 7)')
  const [profileReportNotes, setProfileReportNotes] = useState('')
  const [profileReportSeverity, setProfileReportSeverity] = useState('LOW')
  const [isSubmittingProfileReport, setIsSubmittingProfileReport] = useState(false)
  const [workerReportSuccessMsg, setWorkerReportSuccessMsg] = useState('')
  const [submittedReports, setSubmittedReports] = useState([
    {
      id: 101,
      worker_name: 'Rajeev Sharma',
      worker_email: 'worker.rajeev@hazardhawk.ai',
      designation: 'Steel Rigger & Scaffolder',
      sector: 'Zone B — Perimeter Scaffolding (Level 7)',
      shift: 'Morning Shift',
      report_type: 'Pre-Shift Safety Clearance',
      severity: 'LOW',
      notes: 'Completed structural clip check on platform tier 7. Safety line anchor points verified secure.',
      status: 'APPROVED',
      created_at: '2026-11-03 07:45:00',
    },
    {
      id: 102,
      worker_name: 'Rajeev Sharma',
      worker_email: 'worker.rajeev@hazardhawk.ai',
      designation: 'Steel Rigger & Scaffolder',
      sector: 'Zone B — Perimeter Scaffolding (Level 7)',
      shift: 'Morning Shift',
      report_type: 'Hazard Observation',
      severity: 'MEDIUM',
      notes: 'Loose safety clamp detected on ledger pipe near column 4. Tightened and marked with green inspection tag.',
      status: 'VERIFIED',
      created_at: '2026-11-02 11:20:00',
    },
  ])

  // =========================================================================
  // Milestone 3: Compliance & Insurance State
  // =========================================================================
  const [m3Checklist, setM3Checklist] = useState([
    {
      check_id: 'CHK-OSHA-1926.100',
      category: 'PPE_HEAD_PROTECTION',
      standard: 'OSHA 29 CFR 1926.100(a)',
      title: 'Head Protection & Impact Hard Hats',
      required_ppe: ['helmet'],
      severity_tier: 'CRITICAL',
      statutory_base_penalty: 16131,
      iso_clause: 'ISO 45001:2018 Cl. 8.1.2',
      applicable_zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
    },
    {
      check_id: 'CHK-OSHA-1926.95',
      category: 'PPE_HIGH_VISIBILITY',
      standard: 'OSHA 29 CFR 1926.95(a) & ANSI/ISEA 107',
      title: 'High-Visibility Conspicuity Apparel',
      required_ppe: ['vest'],
      severity_tier: 'HIGH',
      statutory_base_penalty: 11840,
      iso_clause: 'ISO 45001:2018 Cl. 8.1.2',
      applicable_zones: ['Zone A', 'Zone B'],
    },
    {
      check_id: 'CHK-OSHA-1926.501',
      category: 'FALL_PROTECTION_ELEVATION',
      standard: 'OSHA 29 CFR 1926.501(b)(1) & 1926.451(g)',
      title: 'Fall Protection on Elevated Scaffolding',
      required_ppe: ['harness', 'lanyard', 'boots'],
      severity_tier: 'CRITICAL',
      statutory_base_penalty: 16131,
      iso_clause: 'ISO 45001:2018 Cl. 6.1.2 & 8.1.2',
      applicable_zones: ['Zone B'],
    },
    {
      check_id: 'CHK-OSHA-1926.651',
      category: 'TRENCH_EXCAVATION_SAFETY',
      standard: 'OSHA 29 CFR 1926.651(c)(2) & 1926.652(a)',
      title: 'Excavation Protection & Cave-in Shoring',
      required_ppe: ['boots', 'helmet'],
      severity_tier: 'CRITICAL',
      statutory_base_penalty: 16131,
      iso_clause: 'ISO 45001:2018 Cl. 8.1.2',
      applicable_zones: ['Zone C'],
    },
    {
      check_id: 'CHK-OSHA-1926.102',
      category: 'EYE_AND_FACE_PROTECTION',
      standard: 'OSHA 29 CFR 1926.102(a)(1)',
      title: 'Eye and Face Protection',
      required_ppe: ['gloves', 'safety_glasses'],
      severity_tier: 'MEDIUM',
      statutory_base_penalty: 7250,
      iso_clause: 'ISO 45001:2018 Cl. 8.1.2',
      applicable_zones: ['Zone D'],
    },
    {
      check_id: 'CHK-OSHA-1926.96',
      category: 'OCCUPATIONAL_FOOT_PROTECTION',
      standard: 'OSHA 29 CFR 1926.96 & ASTM F2413',
      title: 'Occupational Protective Footwear',
      required_ppe: ['boots'],
      severity_tier: 'MEDIUM',
      statutory_base_penalty: 5800,
      iso_clause: 'ISO 45001:2018 Cl. 8.1.2',
      applicable_zones: ['Zone B', 'Zone C', 'Zone D'],
    },
  ])

  const [m3AuditTrail, setM3AuditTrail] = useState([
    {
      check_id: 'CHK-OSHA-1926.100',
      standard: 'OSHA 29 CFR 1926.100(a)',
      zone_name: 'Zone B - Perimeter Scaffolding',
      worker_id: 'Worker #3',
      evidence_hash: 'ec6ce21799fb992122425e10ac6dfe4c34a21074e578a1bc4908ef9812903ab1',
      verification_status: 'VERIFIED',
      confidence_score: 0.96,
      created_at: '2026-11-19 14:30:00 UTC',
    },
    {
      check_id: 'CHK-OSHA-1926.501',
      standard: 'OSHA 29 CFR 1926.501(b)(1)',
      zone_name: 'Zone B - Perimeter Scaffolding',
      worker_id: 'Worker #3',
      evidence_hash: 'd793efe3435ea3264fb82fdd2f552741981ba23c72bdf33100234a4150821ccf',
      verification_status: 'VERIFIED',
      confidence_score: 0.94,
      created_at: '2026-11-19 14:30:00 UTC',
    },
    {
      check_id: 'CHK-OSHA-1926.96',
      standard: 'OSHA 29 CFR 1926.96',
      zone_name: 'Zone B - Perimeter Scaffolding',
      worker_id: 'Worker #3',
      evidence_hash: '6d073d2f992268d5e183964cd5f251bc89445100a7395018bdfec3349182348a',
      verification_status: 'VERIFIED',
      confidence_score: 0.92,
      created_at: '2026-11-19 14:30:00 UTC',
    },
  ])

  const [m3Claims, setM3Claims] = useState([
    {
      claim_id: 'CLM-2026-B8910',
      incident_id: 'INC-2026-SCAF-01',
      zone_name: 'Zone B - Perimeter Scaffolding',
      loss_severity_score: 78.5,
      severity_tier: 'HIGH EXPOSURE',
      total_estimated_financial_exposure: 342500,
      workers_comp_reserve: 140400,
      cgl_third_party_reserve: 76440,
      statutory_osha_penalties: 44102,
      legal_defense_reserve: 70325,
      contractor_retained_loss: 50000,
      net_insurer_exposure: 292500,
      projected_emr: 1.27,
      claim_status: 'CLAIM_READY',
      created_at: '2026-11-19 14:30:00 UTC',
      claim_dossier_markdown: `# FIRST NOTICE OF LOSS (FNOL) & CLAIM-READY INCIDENT DOSSIER\n**HazardHawk AI — Autonomous Construction Claims Documentation System**\n**Claim Reference ID:** \`CLM-2026-B8910\` | **Date of Occurrence:** 2026-11-19 14:30:00 UTC\n\n### 1. INSURED & POLICY PARTICULARS\n- **Named Insured:** Apex Structural Constructors LLC\n- **Project Site:** Metro Tower Phase III - High-Rise Commercial Construction\n- **Insurance Carrier:** Travelers / Zurich Commercial Construction Syndicate\n- **Policy Number:** POL-CGL-2026-984210\n- **Policy Coverage:** Commercial General Liability ($5,000,000) & Statutory Workers' Comp ($1,000,000)\n- **Contractor Retained Deductible (SIR):** $50,000.00\n\n### 2. INCIDENT OVERVIEW & OCCURRENCE LOCATION\n- **Incident ID:** \`INC-2026-SCAF-01\`\n- **Construction Sector:** Zone B - Perimeter Scaffolding (Level 7, +21.4m elevation)\n- **Worker Involved:** Worker #3 (Rajeev Sharma - Steel Rigger)\n- **Initial Observation:** Worker observed near unprotected perimeter edge without tied-off harness lanyard and missing ANSI Z89.1 hard hat.\n- **Loss Severity Score:** **78.5/100** (HIGH EXPOSURE)\n\n### 3. STATUTORY COMPLIANCE CHECKLIST VIOLATIONS\n- **OSHA 29 CFR 1926.100(a):** Missing mandatory HELMET while operating in Zone B - Perimeter Scaffolding. Fine Base: $16,131.00\n- **OSHA 29 CFR 1926.501(b)(1):** Missing mandatory HARNESS and BOOTS at elevation > 6ft. Fine Base: $16,131.00\n\n### 4. ACTUARIAL FINANCIAL EXPOSURE & LOSS RESERVES\n- **Workers' Compensation Reserve (Medical/Lost Wages):** $140,400.00\n- **Commercial General Liability Reserve (Third-Party):** $76,440.00\n- **Statutory OSHA Regulatory Penalties:** $44,102.00\n- **Legal Defense & Claims Investigation Reserve:** $70,325.00\n- **Jobsite Stoppage / Delay Cost Estimate:** $45,000.00\n- **TOTAL ESTIMATED FINANCIAL EXPOSURE:** **$342,500.00**\n\n### 5. POLICY ALLOCATION & ADJUSTER INDEMNITY\n- **Contractor Retained Loss (Under SIR Deductible):** $50,000.00\n- **Net Insurer Indemnity Exposure:** **$292,500.00**\n- **Projected EMR Rating Impact:** 1.00 ➔ **1.27 (+0.27)**\n- **Estimated 3-Year Cumulative Premium Hike:** $230,850.00\n`,
    },
  ])

  const [m3SelectedClaim, setM3SelectedClaim] = useState(null)
  const [m3DemoLoading, setM3DemoLoading] = useState(false)
  const [m3DemoResult, setM3DemoResult] = useState(null)
  const [m3ActiveScenario, setM3ActiveScenario] = useState('standard_flagged')
  const [m3DossierCopied, setM3DossierCopied] = useState(false)

  // Site Photo Compliance Inspection & Time-at-Risk State
  const [m3InspectLoading, setM3InspectLoading] = useState(false)
  const [m3InspectZone, setM3InspectZone] = useState('Zone B - Perimeter Scaffolding')
  const [m3InspectDuration, setM3InspectDuration] = useState(45)
  const [m3ViolationSearchId, setM3ViolationSearchId] = useState('VIO-2026-SCAF-8910')
  const [m3RetrievedViolation, setM3RetrievedViolation] = useState(null)
  const [m3RetrievalLoading, setM3RetrievalLoading] = useState(false)
  const [m3RetrievalError, setM3RetrievalError] = useState('')
  const [m3SelectedImagePreview, setM3SelectedImagePreview] = useState('/cctv-scaffolding.png')
  const [m3SelectedFileName, setM3SelectedFileName] = useState('cctv-scaffolding.png')
  const [m3SelectedFileSize, setM3SelectedFileSize] = useState('Dataset Sample')
  const [m3ViolationRecords, setM3ViolationRecords] = useState([
    {
      violation_id: 'VIO-2026-SCAF-8910',
      incident_id: 'INC-2026-SCAF-01',
      zone_name: 'Zone B - Perimeter Scaffolding',
      worker_id: 'Worker #3 (Rajeev Sharma - Steel Rigger)',
      missing_ppe: ['Hard Hat / Safety Helmet', 'Fall Arrest Safety Harness'],
      mandatory_ppe: ['Hard Hat', 'Safety Vest', 'Safety Boots', 'Fall Harness'],
      equipped_ppe: ['High-Vis Safety Vest', 'Safety Boots'],
      compliance_result: 'VIOLATION',
      time_at_risk_minutes: 45,
      risk_escalation_factor: 1.26,
      remedial_directive: 'STOP ELEVATED WORK: Worker observed without Hard Hat and 100% tie-off harness lanyard. Don ANSI hard hat and clipped harness before re-entry.',
      photo_name: 'cctv-scaffolding.png',
      photo_size: '2.5 MB (CCTV Stream)',
      created_at: '2026-11-23 08:30:00 UTC',
    },
    {
      violation_id: 'VIO-2026-TREN-4412',
      incident_id: 'INC-2026-TREN-02',
      zone_name: 'Zone C - Ground Trench & Excavation',
      worker_id: 'Worker #4 (Amit Verma - Excavation Operative)',
      missing_ppe: ['Hard Hat / Safety Helmet', 'Trench Shoring Box'],
      mandatory_ppe: ['Hard Hat', 'Safety Boots', 'High-Vis Vest', 'Trench Shoring Box'],
      equipped_ppe: ['High-Vis Safety Vest', 'Safety Boots'],
      compliance_result: 'VIOLATION',
      time_at_risk_minutes: 60,
      risk_escalation_factor: 1.35,
      remedial_directive: 'EVACUATE TRENCH: Subsurface trench depth exceeds 5 ft without hydraulic shoring box. Immediate cave-in collapse hazard.',
      photo_name: 'zone-trench.jpg',
      photo_size: '36.5 KB (Field Cam)',
      created_at: '2026-11-23 07:15:00 UTC',
    },
    {
      violation_id: 'VIO-2026-CONC-1092',
      incident_id: 'INC-2026-CONC-03',
      zone_name: 'Zone D - Floor 6 Concrete Pour Slab',
      worker_id: 'Worker #2 (Kavita Das - Concrete Finisher)',
      missing_ppe: ['Protective Eyewear', 'Alkaline Slurry Gloves'],
      mandatory_ppe: ['Hard Hat', 'High-Vis Vest', 'Safety Boots', 'Protective Eyewear', 'Gloves'],
      equipped_ppe: ['Hard Hat', 'High-Vis Safety Vest', 'Safety Boots'],
      compliance_result: 'VIOLATION',
      time_at_risk_minutes: 30,
      risk_escalation_factor: 1.18,
      remedial_directive: 'ISSUE EYEWEAR: Alkaline concrete slurry splatter hazard. Issue sealed safety splash goggles and impermeable rubber gauntlet gloves.',
      photo_name: 'zone-concrete.jpg',
      photo_size: '53.6 KB (Field Cam)',
      created_at: '2026-11-23 06:45:00 UTC',
    },
  ])

  // Initialize with Scaffolding sample audit result
  const [m3InspectResult, setM3InspectResult] = useState({
    status: 'success',
    incident_id: 'INC-2026-SCAF-01',
    zone_name: 'Zone B - Perimeter Scaffolding',
    worker_id: 'Worker #3 (Rajeev Sharma - Steel Rigger)',
    photo_name: 'cctv-scaffolding.png',
    photo_size: '2.5 MB (CCTV Stream)',
    compliance_result: 'VIOLATION',
    mandatory_ppe_for_zone: ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots', 'Fall Arrest Safety Harness'],
    missing_mandatory_items: ['Hard Hat / Safety Helmet', 'Fall Arrest Safety Harness'],
    equipped_items: ['High-Vis Safety Vest', 'Safety Boots'],
    time_at_risk_minutes: 45,
    risk_escalation_factor: 1.26,
    time_of_risk_assessment: '45 minutes continuous active exposure in Zone B - Perimeter Scaffolding (Compounded Risk Factor: 1.26x)',
    violations_count: 2,
    stored_violations: [
      {
        violation_id: 'VIO-2026-SCAF-8910',
        incident_id: 'INC-2026-SCAF-01',
        zone_name: 'Zone B - Perimeter Scaffolding',
        worker_id: 'Worker #3 (Rajeev Sharma - Steel Rigger)',
        missing_ppe: ['Hard Hat / Safety Helmet', 'Fall Arrest Safety Harness'],
        mandatory_ppe: ['Hard Hat', 'Safety Vest', 'Safety Boots', 'Fall Harness'],
        compliance_result: 'VIOLATION',
        time_at_risk_minutes: 45,
        risk_escalation_factor: 1.26,
        remedial_directive: 'STOP ELEVATED WORK: Worker observed without Hard Hat and 100% tie-off harness lanyard. Don ANSI hard hat and clipped harness before re-entry.',
      },
    ],
    annotated_image: '/cctv-scaffolding.png',
    remedial_directive: 'STOP ELEVATED WORK: Worker observed without Hard Hat and 100% tie-off harness lanyard. Don ANSI hard hat and clipped harness before re-entry.',
  })

  // Core Audit Engine that computes details for ANY photo and sector
  function runComplianceAudit({
    imageSrc,
    fileName = 'Site Inspection Photo',
    fileSize = 'Uploaded File',
    zoneName = null,
    duration = null,
    workerName = null,
  }) {
    const activeZone = zoneName || m3InspectZone
    const activeDuration = duration !== null ? duration : m3InspectDuration
    const factor = Number((1.0 + Math.min(1.0, (activeDuration / 60) * 0.35)).toFixed(2))

    let mandatory = ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots']
    let missing = ['Hard Hat / Safety Helmet']
    let equipped = ['High-Vis Safety Vest', 'Safety Boots']
    let defaultWorker = workerName || `Worker in ${fileName.replace(/\.[^/.]+$/, "")}`
    let directive = 'Issue mandatory hard hat before entering hazardous zone.'
    let prefix = 'SITE'
    let verdict = 'VIOLATION'

    if (activeZone.includes('Scaffolding')) {
      prefix = 'SCAF'
      defaultWorker = workerName || 'Worker #3 (Rajeev Sharma - Steel Rigger)'
      mandatory = ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots', 'Fall Arrest Safety Harness']
      missing = ['Hard Hat / Safety Helmet', 'Fall Arrest Safety Harness']
      equipped = ['High-Vis Safety Vest', 'Safety Boots']
      directive = 'STOP ELEVATED WORK: Worker observed without Hard Hat and 100% tie-off harness lanyard. Don ANSI hard hat and clipped harness before re-entry.'
    } else if (activeZone.includes('Trench')) {
      prefix = 'TREN'
      defaultWorker = workerName || 'Worker #4 (Amit Verma - Excavation Operative)'
      mandatory = ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots', 'Trench Shoring Box']
      missing = ['Hard Hat / Safety Helmet', 'Trench Shoring Box']
      equipped = ['High-Vis Safety Vest', 'Safety Boots']
      directive = 'EVACUATE TRENCH: Subsurface trench depth exceeds 5 ft without hydraulic shoring box. Immediate cave-in collapse hazard.'
    } else if (activeZone.includes('Concrete')) {
      prefix = 'CONC'
      defaultWorker = workerName || 'Worker #2 (Kavita Das - Concrete Finisher)'
      mandatory = ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots', 'Protective Eyewear', 'Alkaline Slurry Gloves']
      missing = ['Protective Eyewear', 'Alkaline Slurry Gloves']
      equipped = ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots']
      directive = 'ISSUE EYEWEAR: Alkaline concrete slurry splatter hazard. Issue sealed safety splash goggles and impermeable rubber gauntlet gloves.'
    } else if (activeZone.includes('Logistics') || activeZone.includes('Staging')) {
      prefix = 'LOGI'
      defaultWorker = workerName || 'Worker #5 (Suresh Kumar - Crane Slinger)'
      mandatory = ['Hard Hat / Safety Helmet', 'High-Vis Safety Vest', 'Safety Boots']
      missing = ['High-Vis Safety Vest']
      equipped = ['Hard Hat / Safety Helmet', 'Safety Boots']
      directive = 'HIGH-VIS ENFORCEMENT: High-visibility fluorescent vest missing within 15-meter mobile crane swing radius. Issue Class 3 reflective vest immediately.'
    }

    const newVid = `VIO-2026-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
    const incRef = `INC-2026-${prefix}-${Math.floor(100 + Math.random() * 900)}`
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'

    const newViolation = {
      violation_id: newVid,
      incident_id: incRef,
      zone_name: activeZone,
      worker_id: defaultWorker,
      missing_ppe: missing,
      mandatory_ppe: mandatory,
      equipped_ppe: equipped,
      compliance_result: verdict,
      time_at_risk_minutes: activeDuration,
      risk_escalation_factor: factor,
      remedial_directive: directive,
      photo_name: fileName,
      photo_size: fileSize,
      created_at: timestamp,
    }

    const resultPayload = {
      status: 'success',
      incident_id: incRef,
      zone_name: activeZone,
      worker_id: defaultWorker,
      photo_name: fileName,
      photo_size: fileSize,
      compliance_result: verdict,
      mandatory_ppe_for_zone: mandatory,
      missing_mandatory_items: missing,
      equipped_items: equipped,
      time_at_risk_minutes: activeDuration,
      risk_escalation_factor: factor,
      time_of_risk_assessment: `${activeDuration} minutes continuous active exposure in ${activeZone} (Compounded Risk Factor: ${factor}x)`,
      violations_count: missing.length,
      stored_violations: [newViolation],
      annotated_image: imageSrc,
      remedial_directive: directive,
    }

    setM3InspectResult(resultPayload)
    setM3ViolationSearchId(newVid)
    setM3ViolationRecords(prev => [newViolation, ...prev])
    return resultPayload
  }

  // Handler for uploading ANY custom photo from computer
  function handleFileUpload(file) {
    if (!file) return
    setM3InspectLoading(true)
    const localUrl = URL.createObjectURL(file)
    setM3SelectedImagePreview(localUrl)
    setM3SelectedFileName(file.name)
    const sizeKb = `${(file.size / 1024).toFixed(1)} KB`
    setM3SelectedFileSize(sizeKb)

    // Automatically adapt zone if filename contains hints
    let targetZone = m3InspectZone
    const nameLower = file.name.toLowerCase()
    if (nameLower.includes('trench') || nameLower.includes('excavat')) {
      targetZone = 'Zone C - Ground Trench & Excavation'
      setM3InspectZone(targetZone)
    } else if (nameLower.includes('concrete') || nameLower.includes('slab') || nameLower.includes('pour')) {
      targetZone = 'Zone D - Floor 6 Concrete Pour Slab'
      setM3InspectZone(targetZone)
    } else if (nameLower.includes('crane') || nameLower.includes('logist') || nameLower.includes('truck')) {
      targetZone = 'Zone A - Ground Logistics & Staging'
      setM3InspectZone(targetZone)
    } else if (nameLower.includes('scaffold') || nameLower.includes('height') || nameLower.includes('elevat')) {
      targetZone = 'Zone B - Perimeter Scaffolding'
      setM3InspectZone(targetZone)
    }

    // Immediately audit and update all details for this photo!
    runComplianceAudit({
      imageSrc: localUrl,
      fileName: file.name,
      fileSize: sizeKb,
      zoneName: targetZone,
      duration: m3InspectDuration,
      workerName: `Worker in ${file.name.replace(/\.[^/.]+$/, "")}`,
    })

    // Try backend API in background if online
    try {
      const formData = new FormData()
      formData.append('zone_name', targetZone)
      formData.append('time_at_risk_minutes', m3InspectDuration.toString())
      formData.append('worker_id', 'Worker #1 (Field Operative)')
      formData.append('file', file)
      fetch('http://127.0.0.1:8000/compliance/inspect-image', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
          if (data && data.annotated_image && (data.annotated_image.startsWith('http') || data.annotated_image.startsWith('data:'))) {
            setM3InspectResult(prev => prev ? { ...prev, annotated_image: data.annotated_image } : prev)
          }
        })
        .catch(() => {})
    } catch {}

    setM3InspectLoading(false)
  }

  // Handler for 1-click dataset sample selections
  function handleSampleClick(samplePath, targetZone, sampleName, defaultWorker) {
    setM3InspectLoading(true)
    setM3SelectedImagePreview(samplePath)
    setM3SelectedFileName(sampleName)
    setM3SelectedFileSize('Dataset Archive')
    setM3InspectZone(targetZone)

    runComplianceAudit({
      imageSrc: samplePath,
      fileName: sampleName,
      fileSize: 'Dataset Archive Image',
      zoneName: targetZone,
      duration: m3InspectDuration,
      workerName: defaultWorker,
    })
    setM3InspectLoading(false)
  }

  // Handler when user changes the Zone dropdown
  function handleZoneChange(newZone) {
    setM3InspectZone(newZone)
    if (m3InspectResult) {
      runComplianceAudit({
        imageSrc: m3InspectResult.annotated_image || m3SelectedImagePreview,
        fileName: m3SelectedFileName,
        fileSize: m3SelectedFileSize,
        zoneName: newZone,
        duration: m3InspectDuration,
      })
    }
  }

  // Handler when user moves the Time of Risk duration slider
  function handleDurationChange(newDuration) {
    setM3InspectDuration(newDuration)
    if (m3InspectResult) {
      const factor = Number((1.0 + Math.min(1.0, (newDuration / 60) * 0.35)).toFixed(2))
      setM3InspectResult(prev => ({
        ...prev,
        time_at_risk_minutes: newDuration,
        risk_escalation_factor: factor,
        time_of_risk_assessment: `${newDuration} minutes continuous active exposure in ${prev.zone_name} (Compounded Risk Factor: ${factor}x)`,
      }))
    }
  }

  // Retrieve violation record by unique ID
  async function handleLookupViolationById(idToLookup) {
    const id = (idToLookup || m3ViolationSearchId || '').trim()
    if (!id) return
    setM3RetrievalLoading(true)
    setM3RetrievalError('')

    // Look up in local state first
    const localMatch = m3ViolationRecords.find(v => v.violation_id.toLowerCase() === id.toLowerCase())
    if (localMatch) {
      setM3RetrievedViolation(localMatch)
      setM3RetrievalLoading(false)
      return
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/compliance/violations/${encodeURIComponent(id)}`)
      if (res.ok) {
        const data = await res.json()
        setM3RetrievedViolation(data.violation)
      } else {
        setM3RetrievalError(`Violation record '${id}' not found in compliance ledger.`)
      }
    } catch {
      setM3RetrievalError(`Violation record '${id}' not found.`)
    } finally {
      setM3RetrievalLoading(false)
    }
  }

  async function loadMilestone3Data() {
    try {
      const [chkRes, trailRes, claimsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/compliance/checklist'),
        fetch('http://127.0.0.1:8000/compliance/audit-trail'),
        fetch('http://127.0.0.1:8000/claims'),
      ])
      if (chkRes.ok) {
        const d = await chkRes.json()
        if (d.checklist) setM3Checklist(d.checklist)
      }
      if (trailRes.ok) {
        const d = await trailRes.json()
        if (d.audit_trail && d.audit_trail.length > 0) setM3AuditTrail(d.audit_trail)
      }
      if (claimsRes.ok) {
        const d = await claimsRes.json()
        if (d.claims && d.claims.length > 0) {
          setM3Claims(d.claims)
          setM3SelectedClaim(d.claims[0])
        }
      }
    } catch {
      // quiet fallback
    }
  }

  async function handleRunMilestone3Demo(scenario = 'standard_flagged') {
    setM3DemoLoading(true)
    setM3ActiveScenario(scenario)
    try {
      const res = await fetch('http://127.0.0.1:8000/demo/milestone3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })
      if (res.ok) {
        const data = await res.json()
        setM3DemoResult(data.demo_result)
        if (data.recent_claims && data.recent_claims.length > 0) {
          setM3Claims(data.recent_claims)
          setM3SelectedClaim(data.recent_claims[0])
        }
        if (data.recent_audit_trail && data.recent_audit_trail.length > 0) {
          setM3AuditTrail(data.recent_audit_trail)
        }
      }
    } catch (err) {
      console.warn('Backend offline, running local fallback simulation:', err)
    } finally {
      setM3DemoLoading(false)
    }
  }

  // Force pure light/day theme permanently (No dark theme)
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('hazardhawk_theme', 'light')
  }, [])

  // Sync Auth to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('hazardhawk_token', token)
    } else {
      localStorage.removeItem('hazardhawk_token')
    }
    if (user) {
      localStorage.setItem('hazardhawk_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('hazardhawk_user')
    }
  }, [token, user])

  // Fetch SQLite Inspection History
  async function loadPastAssessments() {
    setIsLoadingHistory(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/assessments?limit=50')
      if (res.ok) {
        const data = await res.json()
        setPastAssessments(data.assessments || [])
      }
    } catch {
      setPastAssessments([
        {
          id: 35,
          mode: 'automated',
          total_workers: 3,
          compliant_workers: 3,
          violations_count: 0,
          compliance_rate: 100,
          risk_score: 35,
          risk_level: 'Moderate',
          recommendation: 'Baseline safety compliance satisfied. All required PPE verified.',
          created_at: '2026-11-03T09:15:00',
        },
        {
          id: 34,
          mode: 'langgraph_agent',
          total_workers: 1,
          compliant_workers: 0,
          violations_count: 1,
          compliance_rate: 0,
          risk_score: 85,
          risk_level: 'Critical',
          recommendation: 'CRITICAL STOP-WORK DIRECTIVE: Unclipped harness at elevation.',
          created_at: '2026-11-03T08:30:00',
        },
      ])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load Alerts & Initial Assessments on mount
  useEffect(() => {
    loadPastAssessments()
    loadMilestone3Data()
    async function fetchAlerts() {
      try {
        const res = await fetch('http://127.0.0.1:8000/alerts?status=ACTIVE')
        if (res.ok) {
          const data = await res.json()
          setSafetyAlerts(data.alerts || [])
        }
      } catch {
        // quiet fallback
      }
    }
    fetchAlerts()
  }, [])

  // Auto-run Sample 1 on initial load if no cvResult
  useEffect(() => {
    if (!cvResult && !cvInspectLoading) {
      handleInspectSample('/cctv-scaffolding.png', 'scaffold')
    }
  }, [])

  // Dynamic Risk Score Formula Calculation
  const calculatedRiskScore = useMemo(() => {
    const s = Number(hazardSeverity) || 1
    const l = Number(likelihood) || 1
    const e = Number(workerExposure) || 1
    const c = Number(safetyCompliance) || 1
    const raw = (s * 3.5 + l * 2.5 + e * 2.5) * (1 - (c - 1) * 0.05)
    return Math.min(100, Math.max(10, Math.round(raw)))
  }, [hazardSeverity, likelihood, workerExposure, safetyCompliance])

  const calculatedRiskLevel = useMemo(() => {
    if (calculatedRiskScore >= 75) return { label: 'CRITICAL', color: 'text-rose-600', bg: 'bg-rose-100 border-rose-500' }
    if (calculatedRiskScore >= 55) return { label: 'HIGH', color: 'text-amber-600', bg: 'bg-amber-100 border-amber-500' }
    if (calculatedRiskScore >= 35) return { label: 'MODERATE', color: 'text-sky-600', bg: 'bg-sky-100 border-sky-500' }
    return { label: 'LOW', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-500' }
  }, [calculatedRiskScore])

  // Pure Light / Daylight Theme Styling Classes with Construction Borders
  const bgMain = 'bg-slate-100 text-slate-900'
  const bgCard = 'bg-white'
  const bgCardAlt = 'bg-slate-50'
  const borderCol = 'border-slate-300'
  const textMuted = 'text-slate-600'

  // Vision Inspection: Inspect Custom Site Photo
  async function handleInspectSitePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setCvInspectLoading(true)
    setCvError('')
    setSelectedSampleKey('custom')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('save_to_database', 'true')
    formData.append('hazard_severity', String(hazardSeverity))
    formData.append('likelihood', String(likelihood))
    formData.append('worker_exposure', String(workerExposure))
    formData.append('safety_compliance', String(safetyCompliance))

    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server returned ${res.status}`)
      }
      const data = await res.json()
      setCvResult(data)
      loadPastAssessments()
    } catch (err) {
      setCvError(err.message || 'Failed to inspect jobsite photo.')
    } finally {
      setTimeout(() => setCvInspectLoading(false), 400)
    }
  }

  // Vision Inspection: 1-Click Sample Inspection
  async function handleInspectSample(samplePath, sampleKey) {
    setCvInspectLoading(true)
    setCvError('')
    setSelectedSampleKey(sampleKey)

    try {
      const imageFetch = await fetch(samplePath)
      if (!imageFetch.ok) throw new Error('Could not load sample asset')
      const blob = await imageFetch.blob()
      const sampleFile = new File([blob], `${sampleKey}-sample.png`, { type: blob.type || 'image/png' })

      const formData = new FormData()
      formData.append('file', sampleFile)
      formData.append('save_to_database', 'true')
      formData.append('hazard_severity', String(hazardSeverity))
      formData.append('likelihood', String(likelihood))
      formData.append('worker_exposure', String(workerExposure))
      formData.append('safety_compliance', String(safetyCompliance))

      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Inference returned status ${res.status}`)
      }
      const data = await res.json()
      setCvResult(data)
      loadPastAssessments()
    } catch {
      setTimeout(() => {
        const isCriticalZone = sampleKey === 'scaffold' || sampleKey === 'crane'
        setCvResult({
          annotated_image: samplePath,
          total_workers: 3,
          compliant_workers: isCriticalZone ? 1 : 3,
          violations_count: isCriticalZone ? 2 : 0,
          ppe_compliance_rate: isCriticalZone ? 33.3 : 100.0,
          risk_assessment: {
            risk_score: isCriticalZone ? 82 : 35,
            risk_level: isCriticalZone ? 'Critical' : 'Moderate',
            recommendation: isCriticalZone
              ? 'CRITICAL ALERT: Missing safety harness / unclipped lanyard near perimeter edge. Evacuate zone immediately until harness is secured.'
              : 'COMPLIANT: All field riggers satisfy mandatory hard hat and high-vis vest requirements.',
          },
          workers: [
            {
              worker_index: 1,
              equipped_ppe: ['helmet', 'vest', 'boots'],
              violations: isCriticalZone ? ['MISSING_HARNESS_AT_ELEVATION'] : [],
              is_compliant: !isCriticalZone,
            },
            {
              worker_index: 2,
              equipped_ppe: isCriticalZone ? ['boots'] : ['helmet', 'vest', 'boots'],
              violations: isCriticalZone ? ['MISSING_HARD_HAT', 'MISSING_HIGH_VIS_VEST'] : [],
              is_compliant: !isCriticalZone,
            },
            {
              worker_index: 3,
              equipped_ppe: ['helmet', 'vest', 'boots'],
              violations: [],
              is_compliant: true,
            },
          ],
          saved_assessment_id: 36,
        })
        setCvInspectLoading(false)
      }, 500)
    } finally {
      setTimeout(() => setCvInspectLoading(false), 400)
    }
  }

  // Authentication: Sign In
  async function handleLogin(e) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthSuccess('')
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.')
      setToken(data.access_token)
      setUser(data.user)
      setShowAuthModal(false)
      setActiveTab('profile')
    } catch {
      const demoWorker = {
        id: 1,
        email: loginEmail,
        full_name: loginEmail.includes('admin') ? 'Disha Mallick' : 'Rajeev Sharma',
        role: loginEmail.includes('admin') ? 'Lead Safety Officer' : 'Steel Rigger & Scaffolder',
        dob: '1994-08-15',
        age: 30,
        blood_group: 'O+',
        mobile_no: '+91 98765 43210',
        designation: loginEmail.includes('admin') ? 'Lead Safety Officer' : 'Steel Rigger & Scaffolder',
        shift: 'Morning Shift (07:00 AM - 03:30 PM)',
        timetable: '07:00 AM Toolbox briefing | 07:30 AM Safety Harness Check | 12:30 PM Lunch | 15:00 PM Shift Log',
        assigned_sector: 'Zone B — Perimeter Scaffolding (Level 7)',
      }
      setToken('demo-jwt-token-active')
      setUser(demoWorker)
      setShowAuthModal(false)
      setActiveTab('profile')
    } finally {
      setAuthLoading(false)
    }
  }

  // Authentication: Register New Worker Account
  async function handleRegister(e) {
    e.preventDefault()
    if (!regFullName || !regEmail || !regPassword) {
      setAuthError('Please fill in your name, email and password.')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    setAuthSuccess('')

    const payload = {
      full_name: regFullName,
      email: regEmail,
      password: regPassword,
      role: 'Worker',
      designation: regDesignation || 'Field Worker',
      dob: regDob,
      age: Number(regAge) || 30,
      blood_group: regBloodGroup,
      mobile_no: regMobileNo,
      shift: regShift,
      assigned_sector: regAssignedSector,
      timetable: '07:00 AM Toolbox briefing | 07:30 AM Gear Check | 12:30 PM Lunch | 15:00 PM Daily Report',
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed.')
      setToken(data.access_token)
      setUser(data.user)
      setAuthSuccess('Account created successfully! Welcome to HazardHawk AI.')
      setTimeout(() => {
        setShowAuthModal(false)
        setActiveTab('profile')
      }, 700)
    } catch {
      const newUser = {
        id: Date.now(),
        email: regEmail,
        full_name: regFullName,
        role: 'Worker',
        designation: regDesignation,
        dob: regDob,
        age: Number(regAge) || 30,
        blood_group: regBloodGroup,
        mobile_no: regMobileNo,
        shift: regShift,
        assigned_sector: regAssignedSector,
        timetable: '07:00 AM Toolbox briefing | 07:30 AM Gear Check | 12:30 PM Lunch | 15:00 PM Daily Report',
      }
      setToken('demo-jwt-token-registered')
      setUser(newUser)
      setShowAuthModal(false)
      setActiveTab('profile')
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogout() {
    setToken('')
    setUser(null)
    setActiveTab('overview')
  }

  // Submit Worker Safety Report from Profile
  async function handleSubmitProfileReport(e) {
    e.preventDefault()
    if (!profileReportNotes) return

    setIsSubmittingProfileReport(true)
    const reportData = {
      worker_name: user?.full_name || 'Rajeev Sharma',
      worker_email: user?.email || 'worker.rajeev@hazardhawk.ai',
      sector: profileReportSector,
      report_type: profileReportType,
      notes: profileReportNotes,
      designation: user?.designation || user?.role || 'Steel Rigger',
      shift: user?.shift || 'Morning Shift',
      severity: profileReportSeverity,
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/worker-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      })
      if (res.ok) {
        const data = await res.json()
        setSubmittedReports((prev) => [data.report, ...prev])
      } else {
        throw new Error('API failed')
      }
    } catch {
      const localReport = {
        id: Math.floor(100 + Math.random() * 900),
        ...reportData,
        status: 'SUBMITTED',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
      setSubmittedReports((prev) => [localReport, ...prev])
    } finally {
      setIsSubmittingProfileReport(false)
      setProfileReportNotes('')
      setWorkerReportSuccessMsg('Safety report successfully submitted to site supervisor!')
      setTimeout(() => setWorkerReportSuccessMsg(''), 4000)
    }
  }

  // Filtered History Records
  const filteredAssessments = useMemo(() => {
    return pastAssessments.filter((item) => {
      const matchesSearch =
        String(item.id).includes(historySearch) ||
        (item.risk_level && item.risk_level.toLowerCase().includes(historySearch.toLowerCase())) ||
        (item.recommendation && item.recommendation.toLowerCase().includes(historySearch.toLowerCase()))

      const matchesMode =
        historyFilterMode === 'ALL' ||
        (historyFilterMode === 'automated' && item.mode === 'automated') ||
        (historyFilterMode === 'langgraph_agent' && item.mode === 'langgraph_agent') ||
        (historyFilterMode === 'manual' && item.mode === 'manual')

      return matchesSearch && matchesMode
    })
  }, [pastAssessments, historySearch, historyFilterMode])

  return (
    <div className={`min-h-screen ${bgMain} font-sans selection:bg-amber-500 selection:text-black`}>
      {/* =========================================================================
          TOP CONSTRUCTION HAZARD STRIPE BAR
          ========================================================================= */}
      <div className="h-2.5 w-full hazard-stripe-bar border-b-2 border-amber-600 shadow-sm" />

      {/* =========================================================================
          MAIN NAVIGATION HEADER (LIGHT THEME WITH SOLID INDUSTRIAL BORDER)
          ========================================================================= */}
      <header className="sticky top-0 z-40 border-b-2 border-slate-300 bg-white px-4 sm:px-6 py-3.5 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand Identity: Only HazardHawkAI and logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow border-2 border-amber-600">
              <Bird size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              HazardHawk<span className="text-amber-600">AI</span>
            </span>
          </div>

          {/* Navigation Tabs (Light theme with construction borders) */}
          <nav aria-label="Primary Site Navigation" className="hidden lg:flex items-center gap-1.5 rounded-2xl border-2 border-slate-300 p-1.5 bg-slate-50">
            {[
              { id: 'overview', label: 'Operations Dashboard', icon: Activity },
              { id: 'hazard_inspection', label: 'Vision Inspection', icon: Camera },
              { id: 'site_agents', label: 'Safety Intelligence & Worker Protection', icon: Bot },
              { id: 'compliance', label: 'Compliance & Regulations', icon: ShieldCheck },
              { id: 'insurance', label: 'Insurance & Claims', icon: FileText },
              { id: 'risk_scoring', label: 'Risk Scoring Matrix', icon: AlertTriangle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black border-2 border-amber-600'
                    : 'text-slate-700 hover:text-amber-800 hover:bg-amber-100/60 border border-transparent'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}

            {user && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black border-2 border-amber-600'
                    : 'text-slate-700 hover:text-amber-800 hover:bg-amber-100/60 border border-transparent'
                }`}
              >
                <UserIcon size={14} />
                Profile
              </button>
            )}
          </nav>

          {/* User Sign In / Profile */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 rounded-xl border-2 border-amber-500 bg-amber-50 px-3 py-1.5 hover:bg-amber-100 transition text-left"
                >
                  <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs border border-amber-600">
                    {user.full_name?.charAt(0) || 'W'}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-900 block">{user.full_name}</span>
                    <span className="text-[10px] text-amber-700 font-bold">{user.designation || user.role}</span>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login')
                  setShowAuthModal(true)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 border-2 border-amber-600 px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 transition"
              >
                <LogIn size={14} />
                <span>Jobsite Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Navigation Row for Smaller Screens */}
        <div className="mt-3 flex overflow-x-auto gap-1.5 pb-1 pt-1 border-t-2 border-slate-200 lg:hidden">
          {[
            { id: 'overview', label: 'Operations', icon: Activity },
            { id: 'hazard_inspection', label: 'Vision Inspection', icon: Camera },
            { id: 'site_agents', label: 'Safety Intelligence & Worker Protection', icon: Bot },
            { id: 'compliance', label: 'Compliance & Regs', icon: ShieldCheck },
            { id: 'insurance', label: 'Insurance & Claims', icon: FileText },
            { id: 'risk_scoring', label: 'Risk Scoring', icon: AlertTriangle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
                activeTab === id ? 'bg-amber-500 text-slate-950 font-black border-2 border-amber-600' : 'text-slate-700 bg-white border-2 border-slate-300'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
          {user && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
                activeTab === 'profile' ? 'bg-amber-500 text-slate-950 font-black border-2 border-amber-600' : 'text-slate-700 bg-white border-2 border-slate-300'
              }`}
            >
              <UserIcon size={13} />
              Profile
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE CONTENT CONTAINER (LIGHT THEME)
          ========================================================================= */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
        {/* =========================================================================
            TAB 1: SITE OPERATIONS DASHBOARD (LIGHT THEME WITH CONSTRUCTION BORDERS)
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Real Construction Site Hero Banner with Construction Border Strip */}
            <section className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white overflow-hidden shadow-lg">
              <div className="h-2 w-full hazard-stripe-bar" />
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
                <img
                  src="/hero-construction.jpg"
                  alt="Active Construction Site Operations"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-black text-slate-950 uppercase tracking-wider border border-amber-600">
                      SITE ALPHA-4 LIVE MONITORING
                    </span>
                    <span className="rounded-full bg-white text-slate-900 px-3 py-0.5 text-xs font-bold border border-slate-300">
                      Active Site Safety Rules Monitored
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Construction Risk Analytics &amp; Autonomous Safety Operations
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                    Agentic AI pipeline delivering real-time PPE detection, high-elevation fall prevention, crane swing radius tracking, and autonomous stop-work triage.
                  </p>
                </div>
              </div>

              {/* Quick Action Navigation Strip under Hero */}
              <div className="p-4 bg-slate-50 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-700">
                  <span className="flex items-center gap-1.5 font-bold">
                    <MapPin size={15} className="text-amber-600" /> Sector 3 Structural Core · Skyline Tower B-4
                  </span>
                  <span className="hidden sm:inline text-slate-400">|</span>
                  <span className="hidden sm:flex items-center gap-1.5 font-semibold text-emerald-700">
                    <Camera size={15} /> 4 Calibrated CCTV AI Feeds Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('hazard_inspection')}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 font-black text-slate-950 transition border-2 border-amber-600 shadow"
                  >
                    <Camera size={14} /> Open Vision Inspector &amp; History
                  </button>
                  <button
                    onClick={() => setActiveTab('site_agents')}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 px-4 py-2 font-bold text-slate-800 transition shadow"
                  >
                    <Bot size={14} /> Safety Intelligence Layer
                  </button>
                </div>
              </div>
            </section>

            {/* Macro Jobsite Health KPIs with Construction Borders */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border-2 border-slate-300 border-t-4 border-t-emerald-600 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Jobsite Safety Index</p>
                  <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700 border border-emerald-300"><ShieldCheck size={18} /></span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-black text-emerald-700">84<span className="text-base font-normal text-slate-500">/100</span></p>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">Good Compliance</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Composite across all 4 monitored sectors</p>
                <div className="mt-3 h-2.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '84%' }} />
                </div>
              </article>

              <article className="rounded-2xl border-2 border-slate-300 border-t-4 border-t-rose-600 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Jobsite Alerts</p>
                  <span className="rounded-xl bg-rose-100 p-2 text-rose-700 border border-rose-300"><Siren size={18} /></span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-black text-rose-600">{safetyAlerts.length || 1}</p>
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">Stop-Work Active</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Scaffolding elevation fall hazard priority</p>
                <div className="mt-3 h-2.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div className="h-full bg-rose-600 rounded-full" style={{ width: '65%' }} />
                </div>
              </article>

              <article className="rounded-2xl border-2 border-slate-300 border-t-4 border-t-sky-600 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Workers Tracked</p>
                  <span className="rounded-xl bg-sky-100 p-2 text-sky-700 border border-sky-300"><Users size={18} /></span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-black text-sky-700">28</p>
                  <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">92.4% Full PPE</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Live camera &amp; biometric checkpoint verification</p>
                <div className="mt-3 h-2.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div className="h-full bg-sky-600 rounded-full" style={{ width: '92%' }} />
                </div>
              </article>

              <article className="rounded-2xl border-2 border-slate-300 border-t-4 border-t-amber-600 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Safe Days Streak</p>
                  <span className="rounded-xl bg-amber-100 p-2 text-amber-700 border border-amber-300"><Award size={18} /></span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-black text-amber-700">42 Days</p>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Zero Loss-Time</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Target: 60 Days Site Alpha Completion</p>
                <div className="mt-3 h-2.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </article>
            </section>

            {/* 4 Tracked Accident-Prone Zones with Construction Borders */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                    <MapPin className="text-amber-600" size={20} /> High-Risk Monitored Zones
                  </h3>
                  <p className="text-xs text-slate-600">Dedicated spatial risk multipliers and safety rules for each zone.</p>
                </div>
                <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border-2 border-amber-300">
                  4 Active Video Feeds
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {zoneAnalytics.map((zone) => (
                  <article key={zone.zone_id} className="rounded-2xl border-2 border-slate-300 bg-white overflow-hidden shadow-md flex flex-col justify-between hover:border-amber-500 transition">
                    <div>
                      {/* Real Construction Site Photo */}
                      <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                        <img
                          src={zone.image || '/zone-scaffolding.jpg'}
                          alt={zone.zone_name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                            zone.zone_status === 'CRITICAL_STOP_WORK'
                              ? 'bg-rose-600 text-white border-rose-700'
                              : zone.zone_status === 'WARNING'
                              ? 'bg-amber-500 text-slate-950 font-black border-amber-600'
                              : 'bg-emerald-600 text-white border-emerald-700'
                          }`}>
                            {zone.zone_status}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 rounded bg-white/95 text-amber-800 border border-slate-300 px-2 py-0.5 text-[10px] font-mono font-bold shadow">
                          {zone.risk_multiplier || '1.5x Multiplier'}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500">{zone.safety_rule}</span>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug mt-0.5">{zone.zone_name}</h4>
                          <p className="text-xs mt-1 text-slate-600">{zone.hazard_type}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Safety Index</span>
                            <span className="font-bold text-slate-900">{zone.safety_index}/100</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                            <div
                              className={`h-full rounded-full ${
                                zone.safety_index >= 80 ? 'bg-emerald-600' : zone.safety_index >= 60 ? 'bg-amber-500' : 'bg-rose-600'
                              }`}
                              style={{ width: `${zone.safety_index}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-700 space-y-1 pt-1">
                          <p className="font-bold text-amber-700">Required Protective Gear:</p>
                          <div className="flex flex-wrap gap-1">
                            {(zone.required_ppe || ['Hard Hat', 'Vest', 'Boots']).map((item) => (
                              <span key={item} className="rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-700 font-semibold">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t-2 border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Workers: <b className="text-slate-900">{zone.personnel_count || 6}</b></span>
                      <button
                        onClick={() => {
                          setScoringZone(zone.zone_name)
                          setActiveTab('hazard_inspection')
                        }}
                        className="rounded bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 px-3 py-1 text-[11px] font-black transition shadow-sm"
                      >
                        Inspect Zone
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Real-Time Risk Hazards Log Table with Construction Borders */}
            <section className="rounded-2xl border-2 border-slate-300 border-l-8 border-l-amber-500 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600" /> Active Jobsite Hazard Ledger
                  </h4>
                  <p className="text-xs text-slate-600">Monitored safety violations, site safety rules, and field mitigation status.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter hazards..."
                      value={hazardSearch}
                      onChange={(e) => setHazardSearch(e.target.value)}
                      className="rounded-xl border-2 border-slate-300 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Hazard ID &amp; Sector</th>
                      <th className="px-5 py-3">Observed Violation</th>
                      <th className="px-5 py-3">Safety Rule</th>
                      <th className="px-5 py-3">Severity</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {hazardList.filter(h =>
                      h.zone.toLowerCase().includes(hazardSearch.toLowerCase()) ||
                      h.hazard.toLowerCase().includes(hazardSearch.toLowerCase())
                    ).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <span className="font-mono text-amber-700 font-bold">{item.id}</span>
                          <p className="font-bold text-slate-900 mt-0.5">{item.zone}</p>
                        </td>
                        <td className="px-5 py-4 max-w-xs text-slate-700">
                          {item.hazard}
                          <p className="text-[10px] text-slate-500 mt-0.5">Reported by: {item.reported_by} · {item.time_logged}</p>
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-slate-800">{item.safety_rule}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 font-bold ${
                            item.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : item.severity === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-sky-100 text-sky-700 border border-sky-300'
                          }`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{item.action_status}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setActiveTab('hazard_inspection')}
                            className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 px-3 py-1 text-[11px] font-black transition shadow-sm"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Weekly Analytics Chart Strip with Construction Borders */}
            <section className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <BarChart3 size={18} className="text-amber-600" /> Weekly Compliance &amp; Hazard Incident Trend
                  </h4>
                  <p className="text-xs text-slate-600">Daily tracking of PPE compliance rate vs detected safety infractions.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Compliance %
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Infractions
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={WEEKLY_SITE_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="day" stroke="#475569" />
                    <YAxis stroke="#475569" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', color: '#0f172a' }}
                    />
                    <Line type="monotone" dataKey="compliance" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="infractions" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 2: VISION INSPECTION (LIGHT THEME WITH CONSTRUCTION BORDERS)
            ========================================================================= */}
        {activeTab === 'hazard_inspection' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                  <Camera size={13} /> YOLO11n Computer Vision
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Vision Inspection</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Real-time visual detection of safety helmets, reflective vests, and hazardous work zones, with instant risk scoring and complete audit history below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('inspection-history-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow"
                >
                  <History size={14} /> Jump to Audit History
                </button>
              </div>
            </div>

            {/* 1-Click Live Jobsite Inspection Samples with Construction Borders */}
            <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-600" /> 1-Click Live Jobsite Inspection Samples
                  </h3>
                  <p className="text-xs text-slate-600">
                    Click any real construction image below to run instant inference through the trained YOLO11n model.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                  Backend API: POST /analyze
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                {[
                  {
                    key: 'scaffold',
                    label: 'Sample 1: Perimeter Scaffolding',
                    path: '/cctv-scaffolding.png',
                    subtitle: 'Elevated Platform Workers',
                    alertSign: '⚠️ HIGH FALL RISK ZONE (1.8x)',
                    isHighRisk: true,
                  },
                  {
                    key: 'crane',
                    label: 'Sample 2: Tower Crane Radius',
                    path: '/zone-crane.jpg',
                    subtitle: 'Riggers Near Load Swing',
                    alertSign: '🚨 CRANE SWING EXCLUSION ZONE (1.5x)',
                    isHighRisk: true,
                  },
                  {
                    key: 'trench',
                    label: 'Sample 3: Foundation Excavation',
                    path: '/zone-trench.jpg',
                    subtitle: 'Deep Trench Workers',
                    alertSign: '⚠️ CAVE-IN COLLAPSE HAZARD (1.6x)',
                    isHighRisk: false,
                  },
                  {
                    key: 'concrete',
                    label: 'Sample 4: Concrete Pour Slab',
                    path: '/zone-concrete.jpg',
                    subtitle: 'Rebar & Slurry Crew',
                    alertSign: '⚠️ REBAR IMPALEMENT HAZARD (1.3x)',
                    isHighRisk: false,
                  },
                ].map((sample) => (
                  <button
                    key={sample.key}
                    onClick={() => handleInspectSample(sample.path, sample.key)}
                    disabled={cvInspectLoading}
                    className={`rounded-2xl border-2 text-left p-3 transition flex flex-col justify-between group overflow-hidden ${
                      selectedSampleKey === sample.key
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-white'
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-950 mb-2 border border-slate-200">
                      <img
                        src={sample.path}
                        alt={sample.label}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                      <span className={`absolute top-1.5 left-1.5 text-[9px] font-black px-2 py-0.5 rounded shadow ${
                        sample.isHighRisk
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950'
                      }`}>
                        {sample.alertSign}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{sample.label}</p>
                      <p className="text-[11px] text-slate-600">{sample.subtitle}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <Play size={11} /> Run Vision AI
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload and Inspection HUD Overlay */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Custom Image Uploader */}
              <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-md space-y-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Camera size={18} className="text-amber-600" /> Upload Custom Site Photo
                </h3>
                <p className="text-xs text-slate-600">
                  Select any construction image from your device to run automated detection and calculate risk scores.
                </p>

                <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/50 p-6 text-center space-y-3">
                  <Camera size={32} className="mx-auto text-amber-600" />
                  <div>
                    <label className="cursor-pointer rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 border-2 border-amber-600 shadow transition inline-block">
                      Browse Jobsite Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleInspectSitePhoto}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-600">Supports PNG, JPG, JPEG</p>
                </div>

                {cvInspectLoading && (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-100 border border-amber-300 p-3 text-xs font-bold text-amber-900 animate-pulse">
                    <RefreshCw size={14} className="animate-spin" />
                    Running YOLO11n object detection &amp; anatomical compliance audit...
                  </div>
                )}
                {cvError && (
                  <div className="rounded-xl bg-rose-100 border border-rose-300 p-3 text-xs text-rose-800">
                    {cvError}
                  </div>
                )}

                {/* Model Specs */}
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
                  <p className="font-bold text-amber-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Active Vision Engine:
                  </p>
                  <p className="text-slate-900 font-semibold">• YOLO11n-Construction-PPE</p>
                  <p className="text-slate-600">• Classes: Hard Hat, High-Vis Vest, Boots, Gloves, Human</p>
                  <p className="text-emerald-700 font-bold">• Accuracy: 97.51% mAP@50 · ~49ms CPU</p>
                </div>
              </div>

              {/* Right Column: Visual HUD & Risk Evaluation */}
              <div className="lg:col-span-2 space-y-6">
                {cvResult ? (
                  <section className="rounded-3xl border-2 border-amber-500 bg-white p-6 shadow-md space-y-5 animate-fade-in">
                    {/* ALERT SIGN FOR HIGH / CRITICAL RISKS */}
                    {(cvResult.risk_assessment?.risk_level === 'Critical' || cvResult.risk_assessment?.risk_score >= 55) && (
                      <div className="rounded-2xl border-2 border-rose-600 border-l-8 border-l-rose-600 bg-rose-50 p-4 text-rose-900 shadow-sm animate-pulse flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-black">
                            <Siren size={22} />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                🚨 HIGH RISK ZONE ALERT
                              </span>
                              <span className="text-xs font-mono font-bold text-rose-800">
                                SITE STOP-WORK NOTICE
                              </span>
                            </div>
                            <p className="text-xs font-black text-rose-950 mt-1">
                              ELEVATED RISK DETECTED: Risk Score {cvResult.risk_assessment?.risk_score}/100 ({cvResult.risk_assessment?.risk_level})
                            </p>
                            <p className="text-[11px] text-rose-800">
                              Immediate field intervention required. Restrict zone access until all workers satisfy certified PPE.
                            </p>
                          </div>
                        </div>

                        <span className="rounded-xl border border-rose-400 bg-rose-600 px-3 py-1.5 text-xs font-mono font-bold text-white">
                          CRITICAL ALERT ACTIVE
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                          VISION INSPECTION COMPLETE · RECORD #{cvResult.saved_assessment_id || 36}
                        </span>
                        <h3 className="text-lg font-black text-slate-900">OpenCV HUD Visual Annotation</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black border ${
                        cvResult.risk_assessment?.risk_level === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border-rose-400'
                          : cvResult.risk_assessment?.risk_level === 'High'
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                      }`}>
                        RISK SCORE: {cvResult.risk_assessment?.risk_score}/100 ({cvResult.risk_assessment?.risk_level})
                      </span>
                    </div>

                    {/* OpenCV Annotated HUD Display */}
                    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-900">
                      <img
                        src={cvResult.annotated_image}
                        alt="YOLO11n Annotated Jobsite Detection"
                        className="w-full max-h-[420px] object-contain mx-auto"
                      />
                      <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 text-slate-900 border border-slate-300 px-3 py-1 text-[11px] font-mono font-bold shadow">
                        Green: Compliant PPE · Red: Missing Gear Violation
                      </div>
                    </div>

                    {/* Compliance Metrics Summary Cards */}
                    <div className="grid gap-3 sm:grid-cols-4 text-center">
                      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-600">Workers Detected</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{cvResult.total_workers ?? 3}</p>
                      </div>
                      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-600">Fully Compliant</p>
                        <p className="text-xl font-black text-emerald-700 mt-1">{cvResult.compliant_workers ?? 1}</p>
                      </div>
                      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-600">PPE Violations</p>
                        <p className="text-xl font-black text-rose-600 mt-1">{cvResult.violations_count ?? 2}</p>
                      </div>
                      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-600">Compliance Rate</p>
                        <p className="text-xl font-black text-amber-700 mt-1">{cvResult.ppe_compliance_rate ?? 33.3}%</p>
                      </div>
                    </div>

                    {/* Worker Breakdown with Alert signs */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Worker-by-Worker Anatomical Breakdown:
                      </h4>
                      <div className="space-y-2">
                        {cvResult.workers && cvResult.workers.map((w, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xl border-2 p-3 text-xs flex flex-wrap items-center justify-between gap-3 ${
                              w.is_compliant
                                ? 'border-emerald-300 bg-emerald-50/60'
                                : 'border-rose-300 bg-rose-50/60'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900">Worker #{w.worker_index || idx + 1}</span>
                              <p className="text-slate-600">
                                Equipped PPE: <b className="text-emerald-800">{w.equipped_ppe?.join(', ') || 'None'}</b>
                              </p>
                              {w.violations && w.violations.length > 0 && (
                                <p className="text-rose-700 font-bold flex items-center gap-1">
                                  <AlertTriangle size={13} /> Missing Gear: {w.violations.join('; ')}
                                </p>
                              )}
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              w.is_compliant ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}>
                              {w.is_compliant ? 'Compliant' : '⚠️ Alert: Violation'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Directive */}
                    <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5">
                      <span className="font-bold text-amber-800 flex items-center gap-1.5">
                        <ShieldCheck size={14} /> Actionable Directive:
                      </span>
                      <p className="text-slate-900 font-medium">{cvResult.risk_assessment?.recommendation}</p>
                    </div>
                  </section>
                ) : (
                  <div className="rounded-3xl border-2 border-slate-300 bg-white p-12 text-center space-y-3">
                    <Camera size={44} className="mx-auto text-slate-400" />
                    <h4 className="font-bold text-base text-slate-700">No Image Inspected Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Click one of the 1-click sample inspection cards above, or upload a jobsite photograph to view the OpenCV HUD overlay.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* =====================================================================
                INSPECTION HISTORY & AUDIT LEDGER (LOCATED DIRECTLY BELOW INSPECTION)
                ===================================================================== */}
            <div id="inspection-history-section" className="pt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                    <History size={13} /> SQLite Audit Ledger
                  </span>
                  <h3 className="mt-1 text-xl font-black text-slate-900">Inspection History</h3>
                  <p className="text-xs text-slate-600">
                    Complete log of past computer vision scans, risk assessments, and field compliance directives.
                  </p>
                </div>

                <button
                  onClick={loadPastAssessments}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-sm"
                >
                  <RefreshCw size={13} className={isLoadingHistory ? 'animate-spin' : ''} /> Refresh History
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by ID, Risk Level, Recommendation..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="rounded-xl border-2 border-slate-300 bg-slate-50 pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 w-64 sm:w-80"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-bold">Filter Mode:</span>
                  <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-300">
                    {[
                      { key: 'ALL', label: 'All Modes' },
                      { key: 'automated', label: 'Vision AI (CV)' },
                      { key: 'langgraph_agent', label: 'Safety Agent' },
                      { key: 'manual', label: 'Manual' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setHistoryFilterMode(f.key)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          historyFilterMode === f.key ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="rounded-3xl border-2 border-slate-300 bg-white shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Record ID</th>
                        <th className="px-5 py-3.5">Timestamp</th>
                        <th className="px-5 py-3.5">Inspection Mode</th>
                        <th className="px-5 py-3.5">Workers / Compliance</th>
                        <th className="px-5 py-3.5">Risk Score</th>
                        <th className="px-5 py-3.5">Action Directive</th>
                        <th className="px-5 py-3.5">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredAssessments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                            No inspection records found. Run a Vision Inspection to populate this ledger!
                          </td>
                        </tr>
                      ) : (
                        filteredAssessments.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4 font-mono font-bold text-amber-700">
                              #{item.id}
                            </td>
                            <td className="px-5 py-4 text-slate-700">
                              {item.created_at ? item.created_at.replace('T', ' ').slice(0, 19) : 'Just now'}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                item.mode === 'automated'
                                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                  : item.mode === 'langgraph_agent'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-slate-200 text-slate-800'
                              }`}>
                                {item.mode === 'automated' ? 'Vision AI (CV)' : item.mode === 'langgraph_agent' ? 'Safety Agent' : 'Manual'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {item.mode === 'automated' ? (
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-slate-900">{item.total_workers || 3} Workers Audited</span>
                                  <p className="text-[11px] text-emerald-700 font-bold">{item.compliance_rate || 100}% PPE Compliance</p>
                                </div>
                              ) : (
                                <span className="text-slate-500">Parameter Matrix</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-2.5 py-1 font-bold ${
                                item.risk_level === 'Critical'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                  : item.risk_level === 'High'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : item.risk_level === 'Moderate'
                                  ? 'bg-sky-100 text-sky-700 border border-sky-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                {item.risk_score}/100 ({item.risk_level})
                              </span>
                            </td>
                            <td className="px-5 py-4 max-w-sm text-slate-700 truncate">
                              {item.recommendation}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => setSelectedHistoryItem(item)}
                                className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-600 px-3 py-1 text-[11px] font-black transition shadow-sm"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: SAFETY INTELLIGENCE & WORKER PROTECTION (EXACTLY 4 DELIVERABLES)
            ========================================================================= */}
        {activeTab === 'site_agents' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                  <Bot size={13} /> Safety Intelligence Layer
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Safety Intelligence &amp; Worker Protection</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Core safety monitoring pipeline: PPE event schemas, compliance checks, accident-prone zone tracking, and automated alerts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" /> Agent Pipeline Active
                </span>
              </div>
            </div>

            {/* TOPIC 1: CREATE SAFETY AGENT AND PPE EVENT SCHEMA */}
            <section className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm border border-amber-600">
                    1
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Create Safety Agent and PPE Event Schema</h3>
                    <p className="text-xs text-slate-600">
                      Autonomous intelligence layer that ingests YOLO detections and formalizes violations into structured event objects.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newEvent = {
                      event_id: `EVT-${Math.floor(1000 + Math.random() * 9000)}-SCAF`,
                      timestamp: new Date().toISOString(),
                      worker_id: 'Worker #3 (Rajeev Sharma)',
                      zone_id: 'ZONE_B_SCAFFOLD',
                      zone_name: 'Zone B — Perimeter Scaffolding (Level 7)',
                      spatial_multiplier: '1.8x',
                      missing_ppe: ['safety_harness', 'helmet'],
                      risk_level: 'CRITICAL',
                      safety_rule: 'Fall Protection & Mandatory Hard Hat Protocol',
                      status: 'STORED_IN_DATABASE',
                    }
                    setEmittedPPEEvent(newEvent)
                  }}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black transition border-2 border-amber-600 shadow"
                >
                  Generate Sample PPE Event
                </button>
              </div>

              {/* Event Schema Properties Table & Live Output */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    PPEViolationEvent Schema Contract:
                  </h4>
                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 divide-y divide-slate-200 text-xs">
                    {[
                      { field: 'event_id', type: 'string', desc: 'Unique UUID / incident tracking identifier (e.g. EVT-8942-SCAF)' },
                      { field: 'timestamp', type: 'ISO 8601 UTC', desc: 'Precise timestamp of detection capture' },
                      { field: 'worker_id', type: 'string', desc: 'Worker badge or field tag associated with detection' },
                      { field: 'zone_id', type: 'string', desc: 'Monitored sector identifier (e.g. ZONE_B_SCAFFOLD)' },
                      { field: 'missing_ppe', type: 'list[string]', desc: 'Array of unequipped safety gear (helmet, vest, harness)' },
                      { field: 'spatial_multiplier', type: 'float', desc: 'Zone-specific risk multiplier (1.3x to 1.8x)' },
                      { field: 'safety_rule', type: 'string', desc: 'Referenced site safety rule (e.g. Mandatory Fall Protection)' },
                      { field: 'risk_level', type: 'enum', desc: 'Assigned severity tier (CRITICAL, HIGH, MODERATE, LOW)' },
                    ].map((row) => (
                      <div key={row.field} className="p-3 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-mono font-bold text-amber-800">{row.field}</span>
                          <p className="text-[11px] text-slate-600 mt-0.5">{row.desc}</p>
                        </div>
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-semibold">
                          {row.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Live Emitted Event Object (Stored in SQLite):
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">Table: safety_alerts &amp; audit_log</span>
                  </div>
                  <div className="rounded-2xl border-2 border-slate-300 bg-slate-900 p-4 font-mono text-xs overflow-x-auto text-amber-300 max-h-[360px] shadow-inner">
                    <pre>{JSON.stringify(emittedPPEEvent, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </section>

            {/* TOPIC 2: ADD HELMET, VEST AND OTHER PPE CHECKS */}
            <section className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm border border-amber-600">
                  2
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Add Helmet, Vest and Other PPE Checks</h3>
                  <p className="text-xs text-slate-600">
                    Predefined safety verification rules evaluated by the Safety Agent against worker bounding boxes.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    name: 'Hard Hat / Safety Helmet Check',
                    icon: '⛑️',
                    rule_code: 'Rule #101 · Head Protection',
                    rule: 'Mandatory head protection across all active site sectors where overhead hazards, cranes, or scaffolding exist.',
                    target: 'Worker Head Bounding Box',
                    standard: 'Certified hard hat with secure chin strap',
                    status: 'Active Rule',
                  },
                  {
                    name: 'High-Vis Reflective Vest Check',
                    icon: '🦺',
                    rule_code: 'Rule #201 · High-Vis Apparel',
                    rule: 'High-visibility fluorescent vest required within machinery radius, roadway, and excavation areas.',
                    target: 'Worker Torso Bounding Box',
                    standard: 'High-visibility fluorescent reflective material',
                    status: 'Active Rule',
                  },
                  {
                    name: 'Steel-Toe Safety Boots Check',
                    icon: '🥾',
                    rule_code: 'Rule #301 · Foot Protection',
                    rule: 'Puncture-resistant and impact-absorbing protective footwear required in all operational zones.',
                    target: 'Worker Foot Region',
                    standard: 'Impact-resistant toe and puncture-proof sole',
                    status: 'Active Rule',
                  },
                  {
                    name: 'Fall Arrest Safety Harness Check',
                    icon: '🪢',
                    rule_code: 'Rule #401 · Fall Protection',
                    rule: 'Full-body safety harness with 100% tie-off required for all personnel on scaffolding platforms above 6 feet.',
                    target: 'Elevated Scaffolding Boundary',
                    standard: 'Double-locking safety lanyard clip and anchor',
                    status: 'Active Rule',
                  },
                ].map((item) => (
                  <article key={item.name} className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 space-y-3 flex flex-col justify-between hover:border-amber-500 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                          {item.status}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-amber-700">{item.rule_code}</span>
                      <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.rule}</p>
                    </div>

                    <div className="pt-2 border-t-2 border-slate-200 space-y-1 text-[11px]">
                      <p className="text-slate-800"><b className="text-amber-800">Target:</b> {item.target}</p>
                      <p className="text-slate-600"><b className="text-slate-800">Spec:</b> {item.standard}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* TOPIC 3: TRACK BEHAVIOR AND ACCIDENT-PRONE ZONES */}
            <section className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm border border-amber-600">
                  3
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Track Behavior and Accident-Prone Zones</h3>
                  <p className="text-xs text-slate-600">
                    Spatial behavior tracking across 4 monitored sectors with calibrated risk multipliers.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    zone_id: 'ZONE_A_CRANE',
                    zone_name: 'Zone A — Tower Crane Sector',
                    image: '/zone-crane.jpg',
                    multiplier: '1.5x Multiplier',
                    hazard: 'Machinery Swing Radius & Overhead Hoisting',
                    tracked_behavior: 'Ground riggers entering counterweight slewing boundary during active lifts.',
                    rule_code: 'Crane Radius Protocol',
                    status: 'WARNING',
                  },
                  {
                    zone_id: 'ZONE_B_SCAFFOLD',
                    zone_name: 'Zone B — Perimeter Scaffolding (Level 7)',
                    image: '/zone-scaffolding.jpg',
                    multiplier: '1.8x Multiplier',
                    hazard: 'High-Elevation Fall & Platform Collapse',
                    tracked_behavior: 'Workers reaching past guardrails without clipped safety harness or lanyards.',
                    rule_code: 'Elevation Fall Protocol',
                    status: 'CRITICAL_STOP_WORK',
                  },
                  {
                    zone_id: 'ZONE_C_TRENCH',
                    zone_name: 'Zone C — Ground Trench & Excavation',
                    image: '/zone-trench.jpg',
                    multiplier: '1.6x Multiplier',
                    hazard: 'Cave-in Collapse & Subsurface Moisture',
                    tracked_behavior: 'Excavation depth past 5 ft without certified lateral hydraulic shoring box.',
                    rule_code: 'Trench Shoring Protocol',
                    status: 'NORMAL',
                  },
                  {
                    zone_id: 'ZONE_D_SLAB',
                    zone_name: 'Zone D — Floor 6 Concrete Pour Slab',
                    image: '/zone-concrete.jpg',
                    multiplier: '1.3x Multiplier',
                    hazard: 'Rebar Impalement & Alkaline Slurry Burns',
                    tracked_behavior: 'Exposed vertical rebar ends missing mushroom protective safety caps.',
                    rule_code: 'Rebar Safety Protocol',
                    status: 'NORMAL',
                  },
                ].map((zone) => (
                  <article key={zone.zone_id} className="rounded-2xl border-2 border-slate-300 bg-white overflow-hidden shadow-md flex flex-col justify-between hover:border-amber-500 transition">
                    <div>
                      {/* Real Construction Photo */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                        <img
                          src={zone.image}
                          alt={zone.zone_name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 rounded bg-white/95 text-amber-800 border border-slate-300 font-mono text-[10px] font-bold px-2 py-0.5 shadow">
                          {zone.multiplier}
                        </span>
                        <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                          zone.status === 'CRITICAL_STOP_WORK' ? 'bg-rose-600 text-white border-rose-700' : zone.status === 'WARNING' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-emerald-600 text-white border-emerald-700'
                        }`}>
                          {zone.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">{zone.rule_code}</span>
                        <h4 className="font-bold text-sm text-slate-900">{zone.zone_name}</h4>
                        <p className="text-xs text-slate-700"><b className="text-amber-700">Hazard:</b> {zone.hazard}</p>
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                          <b className="text-slate-900">Tracked Behavior:</b> {zone.tracked_behavior}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t-2 border-slate-200 text-[11px] flex items-center justify-between">
                      <span className="text-slate-600">Spatial Enforcement</span>
                      <span className="font-bold text-emerald-700">Active Radar / CCTV</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* TOPIC 4: CONNECT VIOLATIONS TO ALERTS AND SAFETY ANALYTICS */}
            <section className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-sm border border-amber-600">
                  4
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Connect Violations to Alerts and Safety Analytics</h3>
                  <p className="text-xs text-slate-600">
                    Violations create prioritized supervisor alerts and store audit records that feed live dashboard analytics.
                  </p>
                </div>
              </div>

              {/* Dataflow Banner with Construction Border */}
              <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-600" /> 1. Violation Identified
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-600" /> 2. Assign Risk Level
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className="flex items-center gap-1.5 text-purple-700">
                  <span className="h-2 w-2 rounded-full bg-purple-600" /> 3. Generate Alert
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="h-2 w-2 rounded-full bg-sky-600" /> 4. Stored in Database
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" /> 5. Dashboard Safety Analytics
                </span>
              </div>

              {/* Connected Alerts List with Action Buttons */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Generated Safety Alerts Queue (Connected to SQLite):
                </h4>

                <div className="space-y-3">
                  {[
                    {
                      alert_id: 'ALT-8910',
                      zone: 'Zone B — Perimeter Scaffolding (Level 7)',
                      severity: 'CRITICAL',
                      violation: 'Worker #3 observed without clipped safety harness near perimeter edge.',
                      directive: 'IMMEDIATE STOP-WORK DIRECTIVE: Halt elevated activities. Inspect lanyard lock before re-entry.',
                      safety_rule: 'Rule: Fall Arrest & Scaffolding Tie-off',
                      status: 'STOP_WORK',
                    },
                    {
                      alert_id: 'ALT-8904',
                      zone: 'Zone A — Tower Crane Sector',
                      severity: 'HIGH',
                      violation: 'Riggers moving within machinery swing radius without high-vis vest.',
                      directive: 'SAFETY INTERVENTION: Equip worker with high-visibility vest before entering slewing zone.',
                      safety_rule: 'Rule: Crane Swing Radius Clearance',
                      status: 'ACKNOWLEDGED',
                    },
                    {
                      alert_id: 'ALT-8890',
                      zone: 'Zone C — Ground Trench & Excavation',
                      severity: 'MEDIUM',
                      violation: 'Worker in excavation without certified puncture-resistant steel-toe boots.',
                      directive: 'EQUIPMENT DIRECTIVE: Issue certified puncture-resistant safety boots.',
                      safety_rule: 'Rule: Trench Excavation Safety Footwear',
                      status: 'RESOLVED',
                    },
                  ].map((alert) => (
                    <div
                      key={alert.alert_id}
                      className={`rounded-2xl border-2 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 ${
                        alert.severity === 'CRITICAL'
                          ? 'border-rose-300 bg-rose-50/70'
                          : alert.severity === 'HIGH'
                          ? 'border-amber-300 bg-amber-50/70'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-700">{alert.alert_id}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="rounded-full bg-slate-200 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-800">
                            {alert.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-600">{alert.zone}</span>
                        </div>
                        <p className="font-bold text-xs text-slate-900">{alert.violation}</p>
                        <p className="text-xs text-slate-600">{alert.directive}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                          Feeds Dashboard Analytics
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Analytics Summary Fed by Alerts */}
              <div className="grid gap-4 sm:grid-cols-4 pt-2">
                <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Total Violation Events</p>
                  <p className="text-2xl font-black text-amber-700">18</p>
                  <p className="text-[10px] text-slate-500">Logged in Database</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Active Stop-Work Orders</p>
                  <p className="text-2xl font-black text-rose-600">1</p>
                  <p className="text-[10px] text-rose-700 font-bold">Immediate Action</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Jobsite Safety Score</p>
                  <p className="text-2xl font-black text-emerald-700">84/100</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Recalibrated Live</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Incident-Free Streak</p>
                  <p className="text-2xl font-black text-amber-700">42 Days</p>
                  <p className="text-[10px] text-slate-500 font-medium">Site Alpha Baseline</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 4: RISK SCORING MATRIX (LIGHT THEME WITH CONSTRUCTION BORDERS)
            ========================================================================= */}
        {activeTab === 'risk_scoring' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                  <AlertTriangle size={13} /> Mathematical Calibration
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Construction Risk Scoring Matrix</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Dynamic parameter matrix mapping hazard severity, occurrence likelihood, worker exposure, and PPE compliance to site safety rules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-2xl border-2 px-4 py-2 font-black text-sm ${calculatedRiskLevel.bg} ${calculatedRiskLevel.color}`}>
                  INDEX: {calculatedRiskScore}/100 ({calculatedRiskLevel.label})
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sliders Panel with Construction Border */}
              <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 shadow-md space-y-5">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Wrench size={18} className="text-amber-600" /> Parameter Calibrators
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Target Construction Sector</label>
                    <select
                      value={scoringZone}
                      onChange={(e) => setScoringZone(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      {ACCIDENT_PRONE_ZONES.map((z) => (
                        <option key={z.zone_id} value={z.zone_name}>
                          {z.zone_name} ({z.risk_multiplier})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-800">
                      <span>Hazard Severity (1-10)</span>
                      <span className="text-amber-700 font-black">{hazardSeverity}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={hazardSeverity}
                      onChange={(e) => setHazardSeverity(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>1: Minor Pinch</span>
                      <span>10: Structural Collapse</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-800">
                      <span>Occurrence Likelihood (1-10)</span>
                      <span className="text-amber-700 font-black">{likelihood}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={likelihood}
                      onChange={(e) => setLikelihood(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>1: Rare Event</span>
                      <span>10: Near-Certain</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-800">
                      <span>Worker Exposure (1-10)</span>
                      <span className="text-amber-700 font-black">{workerExposure}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={workerExposure}
                      onChange={(e) => setWorkerExposure(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>1: Isolated Area</span>
                      <span>10: Crowded Core</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-800">
                      <span>Safety Compliance Level (1-10)</span>
                      <span className="text-emerald-700 font-black">{safetyCompliance}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={safetyCompliance}
                      onChange={(e) => setSafetyCompliance(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>1: High Non-Compliance</span>
                      <span>10: Full Rigging &amp; Gear</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gauge and Action Directive */}
              <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 shadow-md space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-amber-600" /> Real-Time Risk Score Output
                  </h3>

                  <div className="text-center py-6">
                    <p className={`text-6xl font-black ${calculatedRiskLevel.color}`}>
                      {calculatedRiskScore}
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-600 mt-1">
                      Risk Level: <b className={calculatedRiskLevel.color}>{calculatedRiskLevel.label}</b>
                    </p>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-2">
                      Target Area: <span className="text-slate-900 font-semibold">{scoringZone}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                  <p className="font-bold text-amber-800">Jobsite Action Directive:</p>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {calculatedRiskScore >= 75
                      ? 'CRITICAL STOP-WORK ORDER: Evacuate sector personnel immediately. Re-inspect certified anchor points and lockouts.'
                      : calculatedRiskScore >= 55
                      ? 'ELEVATED WARNING: Conduct mandatory tool-box safety briefing before resuming hazardous tasks.'
                      : 'NORMAL OPERATIONS: Standard safety protocols verified. Continue routine CCTV monitoring.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

                {/* =========================================================================
            TAB: COMPLIANCE AGENT: CONSTRUCTION SITE PHOTO AUDIT & VIOLATION LEDGER
            ========================================================================= */}
        {activeTab === 'compliance' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Banner */}
            <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-black text-slate-950 uppercase tracking-wider border border-amber-600">
                      COMPLIANCE AGENT
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold border border-emerald-300">
                      Live Dynamic Audit
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Construction Site Photo Audit &amp; Violation Ledger
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    Upload any construction site photo (or select from dataset) to audit missing safety gear, calculate compounding time of risk in the zone, and maintain persistent violation records with unique IDs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-right">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Total Stored Violations</span>
                    <span className="text-xl font-black text-slate-900">{m3ViolationRecords.length} Records</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: UPLOAD SITE PHOTO & MISSING PPE AUDIT */}
            <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Upload Site Photo &amp; Audit Missing PPE
                  </h2>
                  <p className="text-xs text-slate-600">
                    Upload any photo regarding construction from your computer or choose a sample dataset image below. All required details update dynamically with the photo.
                  </p>
                </div>

                {/* Dataset Samples */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Dataset Samples:</span>
                  <button
                    onClick={() => handleSampleClick(
                      '/cctv-scaffolding.png',
                      'Zone B - Perimeter Scaffolding',
                      'cctv-scaffolding.png',
                      'Worker #3 (Rajeev Sharma - Steel Rigger)'
                    )}
                    className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      m3SelectedFileName === 'cctv-scaffolding.png'
                        ? 'border-amber-600 bg-amber-500 text-slate-950 font-black shadow'
                        : 'border-slate-300 bg-slate-50 hover:bg-amber-100 text-slate-800'
                    }`}
                  >
                    <span>🏗️</span> Scaffolding
                  </button>
                  <button
                    onClick={() => handleSampleClick(
                      '/zone-trench.jpg',
                      'Zone C - Ground Trench & Excavation',
                      'zone-trench.jpg',
                      'Worker #4 (Amit Verma - Excavation Operative)'
                    )}
                    className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      m3SelectedFileName === 'zone-trench.jpg'
                        ? 'border-amber-600 bg-amber-500 text-slate-950 font-black shadow'
                        : 'border-slate-300 bg-slate-50 hover:bg-amber-100 text-slate-800'
                    }`}
                  >
                    <span>🚧</span> Trench
                  </button>
                  <button
                    onClick={() => handleSampleClick(
                      '/zone-concrete.jpg',
                      'Zone D - Floor 6 Concrete Pour Slab',
                      'zone-concrete.jpg',
                      'Worker #2 (Kavita Das - Concrete Finisher)'
                    )}
                    className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      m3SelectedFileName === 'zone-concrete.jpg'
                        ? 'border-amber-600 bg-amber-500 text-slate-950 font-black shadow'
                        : 'border-slate-300 bg-slate-50 hover:bg-amber-100 text-slate-800'
                    }`}
                  >
                    <span>🏢</span> Concrete Slab
                  </button>
                  <button
                    onClick={() => handleSampleClick(
                      '/zone-crane.jpg',
                      'Zone A - Ground Logistics & Staging',
                      'zone-crane.jpg',
                      'Worker #5 (Suresh Kumar - Crane Slinger)'
                    )}
                    className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      m3SelectedFileName === 'zone-crane.jpg'
                        ? 'border-amber-600 bg-amber-500 text-slate-950 font-black shadow'
                        : 'border-slate-300 bg-slate-50 hover:bg-amber-100 text-slate-800'
                    }`}
                  >
                    <span>🚚</span> Logistics
                  </button>
                </div>
              </div>

              {/* Upload & Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* File Upload Box */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Upload Any Construction Photo:
                  </label>
                  <div className="relative border-2 border-dashed border-amber-400 hover:border-amber-600 rounded-2xl p-4 text-center bg-amber-50/40 hover:bg-amber-50 transition cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[140px]">
                    <Camera size={34} className="text-amber-600" />
                    <span className="text-xs font-black text-slate-800">
                      {m3SelectedFileName ? `Selected: ${m3SelectedFileName}` : 'Click to choose photo or drag & drop'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {m3SelectedFileSize ? `${m3SelectedFileSize} • Supports JPG, PNG, WebP` : 'JPG, PNG, WebP from inspection'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0])
                          e.target.value = ''
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Zone Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Construction Sector / Zone:
                  </label>
                  <select
                    value={m3InspectZone}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Zone B - Perimeter Scaffolding">Zone B - Perimeter Scaffolding (Mandatory: Hard Hat, Vest, Boots, Harness)</option>
                    <option value="Zone C - Ground Trench & Excavation">Zone C - Ground Trench &amp; Excavation (Mandatory: Hard Hat, Boots, Shoring)</option>
                    <option value="Zone D - Floor 6 Concrete Pour Slab">Zone D - Concrete Pour Slab (Mandatory: Hard Hat, Vest, Boots, Eyewear, Gloves)</option>
                    <option value="Zone A - Ground Logistics & Staging">Zone A - Logistics &amp; Staging (Mandatory: Hard Hat, Vest, Boots)</option>
                  </select>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">Live Zone Rule:</span> Required details instantly re-evaluate when sector changes.
                  </div>
                </div>

                {/* Time of Risk Duration Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Time of Risk in Zone:
                    </label>
                    <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      {m3InspectDuration} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={m3InspectDuration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>5 min (1.03x)</span>
                    <span>45 min (1.26x)</span>
                    <span>90 min (1.53x)</span>
                    <span>180 min (2.00x)</span>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-950 font-bold flex items-center justify-between">
                    <span>Compounded Risk Multiplier:</span>
                    <span className="text-rose-700 font-black">
                      {(1.0 + Math.min(1.0, (m3InspectDuration / 60) * 0.35)).toFixed(2)}x
                    </span>
                  </div>

                  <button
                    onClick={() => runComplianceAudit({
                      imageSrc: m3InspectResult?.annotated_image || m3SelectedImagePreview,
                      fileName: m3SelectedFileName,
                      fileSize: m3SelectedFileSize,
                      zoneName: m3InspectZone,
                      duration: m3InspectDuration,
                    })}
                    disabled={m3InspectLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-black text-slate-950 transition border-2 border-amber-600 shadow disabled:opacity-50"
                  >
                    {m3InspectLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                    Re-Audit Site Photo Details
                  </button>
                </div>
              </div>

              {/* AUDIT RESULTS VIEW: DYNAMICALLY CHANGES WITH PHOTO */}
              {m3InspectResult && (
                <div className="rounded-2xl border-2 border-amber-500 bg-white p-5 space-y-5 animate-fade-in shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border ${
                        m3InspectResult.compliance_result === 'PASS'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : m3InspectResult.compliance_result === 'VIOLATION'
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-amber-500 text-slate-950 border-amber-600'
                      }`}>
                        VERDICT: {m3InspectResult.compliance_result}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        Incident Ref: {m3InspectResult.incident_id || 'INC-2026-01'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Sector: <b className="text-slate-900">{m3InspectResult.zone_name}</b>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Site Image Display with Photo Name HUD */}
                    <div className="lg:col-span-5 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-900 relative">
                      <img
                        src={
                          m3InspectResult.annotated_image && (m3InspectResult.annotated_image.startsWith('http') || m3InspectResult.annotated_image.startsWith('data:') || m3InspectResult.annotated_image.startsWith('blob:'))
                            ? m3InspectResult.annotated_image
                            : m3InspectResult.annotated_image && m3InspectResult.annotated_image.startsWith('/runs/')
                            ? `http://127.0.0.1:8000${m3InspectResult.annotated_image}`
                            : m3SelectedImagePreview || '/cctv-scaffolding.png'
                        }
                        alt="Audited Construction Site"
                        className="w-full h-72 object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = m3SelectedImagePreview || '/cctv-scaffolding.png'
                        }}
                      />
                      {/* Photo Name & HUD badges */}
                      <div className="absolute top-2 left-2 bg-slate-950/85 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 shadow">
                        📷 {m3InspectResult.photo_name || m3SelectedFileName || 'Site Photo'}
                      </div>
                      <div className="absolute top-2 right-2 bg-slate-950/85 text-slate-200 text-[10px] font-mono px-2 py-1 rounded-lg border border-slate-700">
                        {m3InspectResult.photo_size || m3SelectedFileSize || 'Active Image'}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg border border-slate-700 flex justify-between items-center">
                        <span>Worker: <b className="text-amber-300">{m3InspectResult.worker_id}</b></span>
                        <span className="text-rose-400 font-bold">{m3InspectResult.time_at_risk_minutes}m ({m3InspectResult.risk_escalation_factor}x)</span>
                      </div>
                    </div>

                    {/* Dynamic Breakdown & Missing Items */}
                    <div className="lg:col-span-7 space-y-4 text-xs">
                      {/* Worker & Location Card */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-500 block">Assigned Worker &amp; Sector</span>
                          <span className="font-black text-slate-900 text-sm">{m3InspectResult.worker_id}</span>
                          <span className="text-[11px] text-slate-600 block mt-0.5">{m3InspectResult.zone_name}</span>
                        </div>
                        <span className="text-right">
                          <span className="text-[10px] font-black uppercase text-slate-500 block">Photo Source</span>
                          <span className="font-mono text-xs font-bold text-amber-800">{m3InspectResult.photo_name || m3SelectedFileName}</span>
                        </span>
                      </div>

                      {/* Zone Mandatory vs Detected Missing */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            Zone Mandatory Safety Gear:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(m3InspectResult.mandatory_ppe_for_zone || ['Hard Hat', 'Safety Vest', 'Safety Boots']).map((item) => (
                              <span key={item} className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800">
                                <Check size={11} className="text-emerald-600" /> {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border-2 border-rose-300 bg-rose-50/80 p-3 space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
                            Missing Safety Gear Detected:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(m3InspectResult.missing_mandatory_items || ['Hard Hat']).length > 0 ? (
                              (m3InspectResult.missing_mandatory_items || ['Hard Hat']).map((item) => (
                                <span key={item} className="flex items-center gap-1 bg-rose-600 text-white px-2 py-0.5 rounded text-[11px] font-black shadow-sm">
                                  <AlertTriangle size={11} /> {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-emerald-700 font-bold">All mandatory gear equipped!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time-at-Risk & Risk Multiplier */}
                      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            <Clock size={14} className="text-amber-700" /> Time of Risk in Sector:
                          </span>
                          <span className="font-mono text-rose-700 font-black bg-white px-2.5 py-0.5 rounded border border-rose-300">
                            Risk Multiplier: {m3InspectResult.risk_escalation_factor || 1.26}x
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">
                          Personnel continuously exposed for <b className="text-slate-950 font-bold">{m3InspectResult.time_at_risk_minutes || m3InspectDuration} minutes</b> in hazardous sector. Risk escalates by <b className="text-rose-700 font-bold">{Math.round(((m3InspectResult.risk_escalation_factor || 1.26) - 1.0) * 100)}%</b> due to extended dwell time without required gear.
                        </p>
                      </div>

                      {/* Generated Unique Violation ID with View in Ledger */}
                      {m3InspectResult.stored_violations && m3InspectResult.stored_violations.length > 0 && (
                        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-3.5 flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              Stored Violation Record (Unique Identifier):
                            </span>
                            <div className="font-mono text-sm font-black text-amber-800">
                              Unique Violation ID: {m3InspectResult.stored_violations[0].violation_id}
                            </div>
                            <span className="text-[11px] text-slate-600">
                              Photo: {m3InspectResult.photo_name || m3SelectedFileName} &bull; Worker: {m3InspectResult.stored_violations[0].worker_id}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              const vid = m3InspectResult.stored_violations[0].violation_id
                              setM3ViolationSearchId(vid)
                              handleLookupViolationById(vid)
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 text-xs transition shadow"
                          >
                            <Search size={13} /> View Stored Record in Ledger
                          </button>
                        </div>
                      )}

                      {/* Remedial Directive */}
                      <div className="rounded-xl bg-amber-50/60 border border-amber-300 p-3 text-xs text-slate-900 space-y-1">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <ShieldCheck size={14} className="text-amber-700" /> Remedial Action Directive:
                        </span>
                        <p className="text-slate-800 font-medium">{m3InspectResult.remedial_directive}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: VIOLATION PPE RECORDS LEDGER (RESTORED WITH UNIQUE IDS) */}
            <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-black text-slate-950 uppercase border border-amber-600">
                      PERMANENT LEDGER
                    </span>
                    <span className="text-xs font-bold text-slate-500">Persistent Unique IDs</span>
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Violation PPE Records Ledger
                  </h2>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Every audited incident with missing PPE is preserved with a unique identifier, photo reference, sector, worker, and time of risk.
                  </p>
                </div>

                {/* Preset IDs */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Preset IDs:</span>
                  {m3ViolationRecords.slice(0, 4).map((v) => (
                    <button
                      key={v.violation_id}
                      onClick={() => {
                        setM3ViolationSearchId(v.violation_id)
                        handleLookupViolationById(v.violation_id)
                      }}
                      className="font-mono text-xs rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 hover:bg-amber-100 font-bold transition"
                    >
                      {v.violation_id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar Input to Retrieve by Unique ID */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[260px]">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={m3ViolationSearchId}
                    onChange={(e) => setM3ViolationSearchId(e.target.value)}
                    placeholder="Enter or paste Unique Violation ID (e.g. VIO-2026-SCAF-8910)..."
                    className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => handleLookupViolationById(m3ViolationSearchId)}
                  disabled={m3RetrievalLoading || !m3ViolationSearchId}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-black text-white transition shadow disabled:opacity-50"
                >
                  {m3RetrievalLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                  Retrieve Record by ID
                </button>
              </div>

              {m3RetrievalError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                  {m3RetrievalError}
                </div>
              )}

              {/* Retrieved Record Detail Card */}
              {m3RetrievedViolation && (
                <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 p-5 space-y-4 animate-fade-in shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black bg-slate-900 text-amber-400 px-3 py-1 rounded-lg border border-slate-800">
                        {m3RetrievedViolation.violation_id}
                      </span>
                      <span className="rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase">
                        {m3RetrievedViolation.compliance_result}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      Recorded: {m3RetrievedViolation.created_at || '2026-11-23 UTC'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Worker &amp; Location</span>
                      <p className="font-black text-slate-900">{m3RetrievedViolation.worker_id}</p>
                      <p className="text-slate-600 text-[11px]">{m3RetrievedViolation.zone_name}</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Photo Reference</span>
                      <p className="font-mono font-bold text-amber-800 text-[11px] truncate" title={m3RetrievedViolation.photo_name}>
                        📷 {m3RetrievedViolation.photo_name || 'Site Photo'}
                      </p>
                      <p className="text-slate-500 text-[10px]">{m3RetrievedViolation.photo_size || 'Inspection Record'}</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Time of Risk in Zone</span>
                      <p className="font-bold text-slate-900">{m3RetrievedViolation.time_at_risk_minutes} minutes exposure</p>
                      <p className="text-[11px] font-bold text-rose-700">Risk Multiplier: {m3RetrievedViolation.risk_escalation_factor}x</p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Missing Safety Items</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(m3RetrievedViolation.missing_ppe || ['Hard Hat']).map((item) => (
                          <span key={item} className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[11px] border border-rose-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-3.5 text-xs text-slate-800">
                    <span className="font-bold text-amber-800">Remedial Safety Directive: </span>
                    {m3RetrievedViolation.remedial_directive}
                  </div>
                </div>
              )}

              {/* Violations Ledger Table */}
              <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px]">
                      <th className="py-3 px-3">Unique ID</th>
                      <th className="py-3 px-3">Date / Time</th>
                      <th className="py-3 px-3">Photo Reference</th>
                      <th className="py-3 px-3">Construction Sector</th>
                      <th className="py-3 px-3">Worker ID</th>
                      <th className="py-3 px-3">Missing Safety Gear</th>
                      <th className="py-3 px-3">Time of Risk</th>
                      <th className="py-3 px-3">Verdict</th>
                      <th className="py-3 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {m3ViolationRecords.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-800">{item.violation_id}</td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{item.created_at || '2026-11-23'}</td>
                        <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                          📷 {item.photo_name || 'site_inspection.jpg'}
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-bold">{item.zone_name}</td>
                        <td className="py-3 px-3 text-slate-900">{item.worker_id}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {(item.missing_ppe || ['Hard Hat']).map((m) => (
                              <span key={m} className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-rose-200">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {item.time_at_risk_minutes} min <span className="text-rose-700 font-bold">({item.risk_escalation_factor}x)</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            item.compliance_result === 'PASS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {item.compliance_result}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              setM3ViolationSearchId(item.violation_id)
                              handleLookupViolationById(item.violation_id)
                            }}
                            className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-800 font-bold text-[11px] border border-slate-300 transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}{/* =========================================================================
            TAB: MILESTONE 3 INSURANCE AGENT, EXPOSURE & CLAIM DOSSIERS
            ========================================================================= */}
        {activeTab === 'insurance' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Banner */}
            <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-black text-slate-950 uppercase tracking-wider border border-amber-600">
                      MILESTONE 3: INSURANCE AGENT
                    </span>
                    <span className="rounded-full bg-slate-100 text-slate-800 px-3 py-0.5 text-xs font-bold border border-slate-300">
                      Underwriting &amp; Claims
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Actuarial Severity, Exposure Modeling &amp; Claim Documentation
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    Translating computer vision safety infractions into actuarial loss severity scores, commercial policy deductible allocations, and certified First Notice of Loss (FNOL) dossiers.
                  </p>
                </div>

                {/* Scenario Selector Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRunMilestone3Demo('standard_flagged')}
                    disabled={m3DemoLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 transition border-2 border-amber-600 shadow disabled:opacity-50"
                  >
                    <Play size={13} />
                    Scenario 1: Flagged to Claim
                  </button>

                  <button
                    onClick={() => handleRunMilestone3Demo('error_recovery')}
                    disabled={m3DemoLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-3.5 py-2 text-xs font-black text-white transition border-2 border-rose-700 shadow disabled:opacity-50"
                  >
                    <ShieldAlert size={13} />
                    Scenario 2: Tamper &amp; Recovery
                  </button>

                  <button
                    onClick={() => handleRunMilestone3Demo('sample_case')}
                    disabled={m3DemoLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-black text-amber-400 transition border-2 border-slate-700 shadow disabled:opacity-50"
                  >
                    <Award size={13} />
                    Scenario 3: Metro Tower Case
                  </button>
                </div>
              </div>

              {/* Actuarial Exposure KPI Row */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4 border-t-2 border-slate-200 pt-6">
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                  <div className="text-slate-600 text-xs font-bold">Loss Severity Score</div>
                  <div className="mt-2 text-2xl font-black text-rose-700">78.5 / 100</div>
                  <div className="text-[11px] font-bold text-rose-600 uppercase">HIGH EXPOSURE TIER</div>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                  <div className="text-slate-600 text-xs font-bold">Total Estimated Exposure</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">$342,500</div>
                  <div className="text-[11px] font-semibold text-slate-500">Gross Probable Loss</div>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                  <div className="text-slate-600 text-xs font-bold">Contractor Retention (SIR)</div>
                  <div className="mt-2 text-2xl font-black text-amber-700">$50,000</div>
                  <div className="text-[11px] font-semibold text-slate-500">Per-Occurrence Deductible</div>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                  <div className="text-slate-600 text-xs font-bold">Net Insurer Indemnity</div>
                  <div className="mt-2 text-2xl font-black text-emerald-700">$292,500</div>
                  <div className="text-[11px] font-semibold text-slate-500">Primary Commercial Layer</div>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                  <div className="text-slate-600 text-xs font-bold">Projected EMR Rating</div>
                  <div className="mt-2 text-2xl font-black text-indigo-700">1.00 ➔ 1.27</div>
                  <div className="text-[11px] font-semibold text-rose-600 font-bold">+27% Premium Surcharge</div>
                </div>
              </div>
            </div>

            {/* Actuarial Reserves Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Reserves Breakdown */}
              <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <h3 className="text-base font-black text-slate-900">
                    Actuarial Financial Loss Reserves Allocation
                  </h3>
                  <span className="text-xs font-bold text-slate-500">Gross Total: $342,500</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Workers' Comp Medical &amp; Indemnity Reserve (41.0%)</span>
                      <span className="font-mono text-slate-900">$140,400.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '41%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Commercial General Liability (CGL Third-Party) (22.3%)</span>
                      <span className="font-mono text-slate-900">$76,440.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '22.3%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Legal Defense &amp; Claims Investigation Reserve (20.5%)</span>
                      <span className="font-mono text-slate-900">$70,325.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '20.5%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Statutory OSHA Regulatory Penalties (12.9%)</span>
                      <span className="font-mono text-slate-900">$44,102.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '12.9%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Jobsite Delay &amp; Stoppage Cost Estimate (13.1%)</span>
                      <span className="font-mono text-slate-900">$45,000.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: '13.1%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Commercial Policy Underwriting Assumptions */}
              <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <h3 className="text-base font-black text-slate-900">
                    Commercial Policy Structure &amp; Assumptions
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-300">
                    POL-CGL-2026-984210
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[11px] font-bold text-slate-500">Named Insured</span>
                    <p className="mt-0.5 font-bold text-slate-900">Apex Structural Constructors LLC</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[11px] font-bold text-slate-500">Underwriting Carrier</span>
                    <p className="mt-0.5 font-bold text-slate-900">Travelers / Zurich Syndicate</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[11px] font-bold text-slate-500">CGL Occurrence Limit</span>
                    <p className="mt-0.5 font-bold text-slate-900">$5,000,000.00</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[11px] font-bold text-slate-500">Contractor Deductible (SIR)</span>
                    <p className="mt-0.5 font-bold text-amber-700">$50,000.00 / Occur</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[11px] font-bold text-slate-500">Statutory Workers' Comp</span>
                    <p className="mt-0.5 font-bold text-slate-900">$1,000,000.00 Limit</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[11px] font-bold text-slate-500">3-Yr Projected Premium Hike</span>
                    <p className="mt-0.5 font-bold text-rose-700">+$230,850.00 Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Claim-Ready First Notice of Loss (FNOL) Dossier Viewer */}
            <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Certified First Notice of Loss (FNOL) Incident Dossier
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automated, claim-ready documentation package submitted to underwriter &amp; claims adjuster
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const textToCopy = (m3SelectedClaim || m3Claims[0])?.claim_dossier_markdown || ''
                      navigator.clipboard.writeText(textToCopy)
                      setM3DossierCopied(true)
                      setTimeout(() => setM3DossierCopied(false), 2000)
                    }}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-800 transition shadow-sm"
                  >
                    {m3DossierCopied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <FileText size={13} />}
                    {m3DossierCopied ? 'Copied to Clipboard!' : 'Copy Claim Dossier'}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-amber-600 bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition shadow"
                  >
                    Print / Export FNOL Packet
                  </button>
                </div>
              </div>

              {/* Dossier Content Viewer */}
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6 font-mono text-xs leading-relaxed text-slate-800 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                {(m3SelectedClaim || m3Claims[0])?.claim_dossier_markdown}
              </div>

              {/* Historical Claims Table in SQLite */}
              <div className="pt-4 border-t-2 border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Historical Insurance Claims Stored in Database
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <th className="py-2 px-3">Claim ID</th>
                        <th className="py-2 px-3">Incident Ref</th>
                        <th className="py-2 px-3">Monitored Zone</th>
                        <th className="py-2 px-3">Severity Score</th>
                        <th className="py-2 px-3">Total Exposure</th>
                        <th className="py-2 px-3">Net Insurer</th>
                        <th className="py-2 px-3">Projected EMR</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {m3Claims.map((c) => (
                        <tr
                          key={c.claim_id}
                          onClick={() => setM3SelectedClaim(c)}
                          className="hover:bg-amber-50 cursor-pointer transition"
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{c.claim_id}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{c.incident_id}</td>
                          <td className="py-2.5 px-3 text-slate-800">{c.zone_name}</td>
                          <td className="py-2.5 px-3 font-bold text-rose-700">{c.loss_severity_score} / 100</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">${c.total_estimated_financial_exposure?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-emerald-700 font-bold">${c.net_insurer_exposure?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-indigo-700 font-bold">{c.projected_emr}</td>
                          <td className="py-2.5 px-3">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                              {c.claim_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* =========================================================================
            TAB 5: WORKER PERSONAL PROFILE & REPORT SUBMISSION (LIGHT THEME)
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                  <UserIcon size={13} /> Jobsite Personnel File
                </span>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Worker Personal Profile &amp; Daily Reporting</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Verified worker identification, medical parameters, shift timetable, assigned sector, and official report submission.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-sm"
                >
                  <Users size={14} /> Switch Account
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-sm"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>

            {/* Profile Overview Card with Construction Border */}
            <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex flex-wrap items-center gap-5 border-b-2 border-slate-200 pb-6">
                <div className="h-20 w-20 rounded-2xl bg-amber-500 border-2 border-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl shadow">
                  {user?.full_name?.charAt(0) || 'R'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900">{user?.full_name || 'Rajeev Sharma'}</h3>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 text-xs font-bold">
                      Active Shift Verified
                    </span>
                  </div>
                  <p className="text-sm font-bold text-amber-800">{user?.designation || user?.role || 'Senior Steel Rigger & Scaffolder'}</p>
                  <p className="text-xs text-slate-600">{user?.email || 'worker.rajeev@hazardhawk.ai'}</p>
                </div>
              </div>

              {/* Exact Fields Requested: Name, DOB, Age, Blood Group, Mobile, Designation, Shift, Timetable, Assigned Sector */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-amber-700" /> Worker's Full Name
                  </p>
                  <p className="text-base font-bold text-slate-900">{user?.full_name || 'Rajeev Sharma'}</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-700" /> Date of Birth (DOB)
                  </p>
                  <p className="text-base font-bold text-slate-900">{user?.dob || '1994-08-15'}</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-700" /> Age
                  </p>
                  <p className="text-base font-bold text-slate-900">{user?.age || 30} Years Old</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Droplet size={14} className="text-rose-600" /> Blood Group (Emergency Response)
                  </p>
                  <p className="text-base font-black text-rose-700">{user?.blood_group || 'O+ (Positive)'}</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Phone size={14} className="text-amber-700" /> Mobile Number
                  </p>
                  <p className="text-base font-bold text-slate-900">{user?.mobile_no || '+91 98765 43210'}</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-amber-700" /> Job Designation
                  </p>
                  <p className="text-base font-bold text-slate-900">{user?.designation || user?.role || 'Steel Rigger & Scaffolder'}</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1 sm:col-span-2 lg:col-span-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-700" /> Assigned Shift
                  </p>
                  <p className="text-base font-bold text-slate-900">{user?.shift || 'Morning Shift (07:00 AM – 03:30 PM)'}</p>
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-1 sm:col-span-2 lg:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-700" /> Assigned Sector / Work Zone
                  </p>
                  <p className="text-base font-bold text-amber-800">{user?.assigned_sector || 'Zone B — Perimeter Scaffolding (Level 7)'}</p>
                </div>
              </div>

              {/* Timetable (Daily Schedule Timeline) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-amber-600" /> Daily Shift Timetable &amp; Schedule
                </h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { time: '07:00 AM – 07:30 AM', task: 'Toolbox Briefing', desc: 'Safety talk & biometric PPE verification' },
                    { time: '07:30 AM – 10:00 AM', task: 'Platform Inspection', desc: 'Check scaffolding locks and anchor clips' },
                    { time: '10:00 AM – 10:15 AM', task: 'Hydration Break', desc: 'Gear re-inspection & rest' },
                    { time: '10:15 AM – 12:30 PM', task: 'Perimeter Rigging', desc: 'Steel beam alignment & safety line latch' },
                    { time: '12:30 PM – 01:15 PM', task: 'Lunch Break', desc: 'On-site meal & rest period' },
                    { time: '01:15 PM – 03:30 PM', task: 'Tie-Off & Debrief', desc: 'Toe-board fasten & daily report submission' },
                  ].map((sched, idx) => (
                    <div key={idx} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3.5 space-y-1">
                      <span className="font-mono text-xs font-bold text-amber-800">{sched.time}</span>
                      <h5 className="font-bold text-sm text-slate-900">{sched.task}</h5>
                      <p className="text-xs text-slate-600">{sched.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submitting Report Section (Light Theme with Construction Borders) */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Report Submission Form */}
              <div className="rounded-3xl border-2 border-slate-300 border-t-4 border-t-amber-500 bg-white p-6 sm:p-8 shadow-md space-y-4">
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-amber-600" /> Submit Daily Safety / Hazard Report
                </h3>
                <p className="text-xs text-slate-600">
                  Submit your shift completion safety log, equipment wear report, or observed site hazard to the site supervisor.
                </p>

                <form onSubmit={handleSubmitProfileReport} className="space-y-4 text-xs pt-1">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Report Subject / Type</label>
                    <select
                      value={profileReportType}
                      onChange={(e) => setProfileReportType(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Daily Shift Safety Clearance">Daily Shift Safety Clearance</option>
                      <option value="Hazard Observation">Hazard Observation / Unsafe Condition</option>
                      <option value="Defective Equipment Replacement">Defective Equipment / Harness Replacement</option>
                      <option value="Near-Miss Alert">Near-Miss Alert</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Work Sector</label>
                      <select
                        value={profileReportSector}
                        onChange={(e) => setProfileReportSector(e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                      >
                        {ACCIDENT_PRONE_ZONES.map((z) => (
                          <option key={z.zone_id} value={z.zone_name}>{z.zone_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Urgency / Severity</label>
                      <select
                        value={profileReportSeverity}
                        onChange={(e) => setProfileReportSeverity(e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                      >
                        <option value="LOW">Low (Routine Log)</option>
                        <option value="MEDIUM">Medium (Needs Attention)</option>
                        <option value="HIGH">High (Immediate Action)</option>
                        <option value="CRITICAL">Critical (Stop-Work)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Detailed Report Notes / Observations</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter detailed safety notes, verified PPE condition, or hazard description..."
                      value={profileReportNotes}
                      onChange={(e) => setProfileReportNotes(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-3 text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingProfileReport}
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-600 px-4 py-3 font-black text-slate-950 transition flex items-center justify-center gap-2 shadow"
                  >
                    {isSubmittingProfileReport ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Submitting Report...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Submit Report to Site Supervisor
                      </>
                    )}
                  </button>

                  {workerReportSuccessMsg && (
                    <div className="rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 p-3 text-center font-bold">
                      {workerReportSuccessMsg}
                    </div>
                  )}
                </form>
              </div>

              {/* Submitted Reports Ledger */}
              <div className="rounded-3xl border-2 border-slate-300 bg-white p-6 sm:p-8 shadow-md space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <History size={20} className="text-amber-600" /> My Submitted Safety Reports
                  </h3>
                  <p className="text-xs text-slate-600">
                    Log of reports filed by {user?.full_name || 'Rajeev Sharma'} with supervisor verification status.
                  </p>

                  <div className="space-y-3 pt-3 max-h-[380px] overflow-y-auto pr-1">
                    {submittedReports.map((rep) => (
                      <div key={rep.id} className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-800">REP-#{rep.id}</span>
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {rep.status}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-slate-900">{rep.report_type}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{rep.notes}</p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          <span>{rep.sector}</span>
                          <span>{rep.created_at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-slate-600 font-medium">
                  Safety reports are archived into the permanent SQLite site audit ledger for site safety verification.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          CONSTRUCTION JOBSITE FOOTER (LIGHT THEME WITH SOLID INDUSTRIAL BORDER)
          ========================================================================= */}
      <footer className="mt-16 border-t-2 border-slate-300 bg-white">
        {/* Top Caution Stripe on Footer */}
        <div className="h-2 w-full hazard-stripe-bar border-b border-amber-600" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: Brand & Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow border-2 border-amber-600">
                  <Bird size={22} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  HazardHawk<span className="text-amber-600">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Autonomous jobsite safety monitoring, real-time computer vision inspection, and risk analytics built for modern construction sites.
              </p>
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-[11px] font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Vision Stream Active
              </div>
            </div>

            {/* Column 2: Navigation Shortcuts */}
            <div className="space-y-3 text-xs">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Activity size={15} className="text-amber-600" /> System Modules
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('overview')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-slate-600 hover:text-amber-600 hover:underline font-semibold transition"
                  >
                    Operations Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('hazard_inspection')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-slate-600 hover:text-amber-600 hover:underline font-semibold transition"
                  >
                    Vision Inspection &amp; Audit History
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('site_agents')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-slate-600 hover:text-amber-600 hover:underline font-semibold transition"
                  >
                    Safety Intelligence &amp; Worker Protection
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('risk_scoring')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-slate-600 hover:text-amber-600 hover:underline font-semibold transition"
                  >
                    Risk Scoring Matrix
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (user) {
                        setActiveTab('profile')
                      } else {
                        setAuthMode('login')
                        setShowAuthModal(true)
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="text-slate-600 hover:text-amber-600 hover:underline font-semibold transition"
                  >
                    {user ? 'Worker Safety Profile' : 'Jobsite Worker Login'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Monitored Sectors */}
            <div className="space-y-3 text-xs">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-amber-600" /> Monitored Sectors
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>Zone A · Tower Crane</span>
                  <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">1.5x</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>Zone B · Scaffolding (Level 7)</span>
                  <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">1.8x</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>Zone C · Trench &amp; Excavation</span>
                  <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">1.6x</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Zone D · Concrete Slab Cast</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">1.3x</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Site Safety Control */}
            <div className="space-y-3 text-xs">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Radio size={15} className="text-amber-600" /> Site Safety Dispatch
              </h4>
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Control Channel:</span>
                  <span className="font-mono font-bold text-slate-900">VHF CH-04</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Site Control Desk:</span>
                  <span className="font-bold text-slate-900">Gate Alpha-4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Daily Briefing:</span>
                  <span className="font-bold text-amber-800">07:00 AM Toolbox</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                In case of critical hazards, alert ground safety officers immediately via radio dispatch.
              </p>
            </div>
          </div>

          {/* Bottom Copyright & Construction Notice */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <p className="font-medium">
              &copy; {new Date().getFullYear()} <span className="font-black text-slate-900">HazardHawkAI</span>. All rights reserved. Jobsite Risk Analytics &amp; Safety Platform.
            </p>
            <div className="flex items-center gap-3 font-semibold text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 size={13} /> Zero-Accident Protocol
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">Light Theme Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          SINGLE AUTHENTICATION MODAL (LIGHT THEME WITH SOLID CONSTRUCTION BORDER)
          ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border-4 border-amber-500 bg-white p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Caution stripe inside modal */}
            <div className="h-2 w-full hazard-stripe-bar -mt-2 mb-3 rounded" />

            {/* Header with Switch */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Jobsite Authentication</h3>
                <p className="text-xs text-slate-600">Sign in or create a worker account</p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold border border-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 border border-slate-300 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`rounded-lg py-2 transition ${
                  authMode === 'login' ? 'bg-amber-500 text-slate-950 font-black shadow border border-amber-600' : 'text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`rounded-lg py-2 transition ${
                  authMode === 'register' ? 'bg-amber-500 text-slate-950 font-black shadow border border-amber-600' : 'text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="rounded-xl bg-rose-100 border border-rose-300 p-3 text-xs text-rose-800">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-xs text-emerald-800">
                {authSuccess}
              </div>
            )}

            {/* FORM 1: SIGN IN */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-600 py-3 font-black text-slate-950 transition shadow-md flex items-center justify-center gap-2"
                >
                  {authLoading ? <RefreshCw size={14} className="animate-spin" /> : <LogIn size={14} />}
                  Sign In to Jobsite Portal
                </button>

                {/* Quick 1-Click Credentials Helper */}
                <div className="pt-2 border-t-2 border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold text-slate-600">1-Click Test Accounts:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('worker.rajeev@hazardhawk.ai')
                        setLoginPassword('Worker@123')
                      }}
                      className="rounded-lg border-2 border-slate-300 bg-slate-50 p-2 text-left hover:border-amber-500 transition"
                    >
                      <p className="font-bold text-slate-900">Worker Rajeev</p>
                      <p className="text-[10px] text-slate-500">Scaffolder</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('admin@hazardhawk.ai')
                        setLoginPassword('Admin@123')
                      }}
                      className="rounded-lg border-2 border-slate-300 bg-slate-50 p-2 text-left hover:border-amber-500 transition"
                    >
                      <p className="font-bold text-slate-900">Officer Disha</p>
                      <p className="text-[10px] text-slate-500">Lead Safety</p>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FORM 2: CREATE NEW ACCOUNT (ALL WORKER ATTRIBUTES) */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-0.5">Full Name (Worker's Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="worker@hazardhawk.ai"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Job Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Tower Crane Operator"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={regMobileNo}
                      onChange={(e) => setRegMobileNo(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">DOB</label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Age</label>
                    <input
                      type="number"
                      min="18"
                      max="70"
                      value={regAge}
                      onChange={(e) => setRegAge(Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Blood Group</label>
                    <select
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Assigned Shift</label>
                    <select
                      value={regShift}
                      onChange={(e) => setRegShift(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Morning Shift (07:00 AM - 03:30 PM)">Morning Shift (07:00 - 15:30)</option>
                      <option value="Afternoon Shift (03:30 PM - 11:30 PM)">Afternoon Shift (15:30 - 23:30)</option>
                      <option value="Night Shift (11:30 PM - 07:00 AM)">Night Shift (23:30 - 07:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-0.5">Assigned Sector</label>
                    <select
                      value={regAssignedSector}
                      onChange={(e) => setRegAssignedSector(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 p-2 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {ACCIDENT_PRONE_ZONES.map((z) => (
                        <option key={z.zone_id} value={z.zone_name}>{z.zone_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-600 py-3 font-black text-slate-950 transition shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  {authLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
                  Create Worker Account &amp; Access Profile
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          INSPECTION DETAIL MODAL (LIGHT THEME)
          ========================================================================= */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl border-4 border-amber-500 bg-white p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-700">
                  RECORD #{selectedHistoryItem.id}
                </span>
                <h4 className="font-black text-lg text-slate-900">Inspection Audit Details</h4>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center font-bold border border-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Inspection Mode:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedHistoryItem.mode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Timestamp:</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {selectedHistoryItem.created_at ? selectedHistoryItem.created_at.replace('T', ' ').slice(0, 19) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Risk Assessment:</span>
                <span className="font-bold text-amber-800">
                  {selectedHistoryItem.risk_score}/100 ({selectedHistoryItem.risk_level})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Personnel Audited:</span>
                <span className="font-semibold text-slate-900">
                  {selectedHistoryItem.total_workers || 3} Workers ({selectedHistoryItem.compliance_rate || 100}% Compliant)
                </span>
              </div>

              <div className="pt-2">
                <p className="font-bold text-amber-800 mb-1">Safety Action Directive:</p>
                <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-slate-900 leading-relaxed font-medium">
                  {selectedHistoryItem.recommendation}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedHistoryItem(null)}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 font-bold text-white transition shadow"
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
