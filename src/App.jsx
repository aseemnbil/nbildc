import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Printer, Building2,
  User, MapPin, Phone, Hash, ChevronDown, ChevronUp,
  FileText, CheckCircle2, AlertCircle, Sun, Moon
} from 'lucide-react'

// ─── helpers ──────────────────────────────────────────────────────────────────
const today = new Date()
const fmtDate = (d) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const initialRow = () => ({ id: Date.now(), description: '', quantity: '', value: '', remarks: '' })
const NBIL_ADDRESS = 'No.22, 16th Cross, 5th Phase, J.P.Nagar, Bengaluru – 560078'
const NBIL_GSTIN   = '29AAFCN2192L1Z0'

// ─── NBIL Logo SVG ────────────────────────────────────────────────────────────
function NBILLogo({ dark = false }) {
  // Recreates the hexagon-cluster icon + "nbil" wordmark
  return (
    <svg viewBox="0 0 220 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-auto">
      {/* ── Icon: three interlocked hex-like shapes ── */}
      {/* Blue top hex */}
      <path d="M28 6 L38 11.5 L38 22.5 L28 28 L18 22.5 L18 11.5 Z" fill="#3B4FC8"/>
      {/* Yellow left hex */}
      <path d="M16 24 L26 29.5 L26 40.5 L16 46 L6  40.5 L6  29.5 Z" fill="#F5A623"/>
      {/* Pink/magenta bottom-right hex */}
      <path d="M40 24 L50 29.5 L50 40.5 L40 46 L30 40.5 L30 29.5 Z" fill="#C8186A"/>
      {/* Center connector dot */}
      <circle cx="28" cy="28" r="5" fill="#3B4FC8" opacity="0.85"/>

      {/* ── Wordmark: "nbil" ── */}
      <text
        x="62" y="42"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.5"
        fill={dark ? '#FFFFFF' : '#111827'}
      >nbil</text>
    </svg>
  )
}

// ─── theme-aware primitives ───────────────────────────────────────────────────
function Label({ children, required, dark }) {
  return (
    <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider
      ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
      {children}{required && <span className="text-blue-500 ml-0.5">*</span>}
    </label>
  )
}

function Input({ dark, className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg px-3 py-2 text-sm transition-colors
        focus:outline-none focus:ring-1
        ${dark
          ? 'bg-slate-800/60 border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/30'
          : 'bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
        } ${className}`}
      {...props}
    />
  )
}

function SectionCard({ title, icon: Icon, children, defaultOpen = true, dark }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden border transition-colors
        ${dark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors
          ${dark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} className="text-blue-500" />
          <span className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{title}</span>
        </div>
        {open
          ? <ChevronUp size={14} className={dark ? 'text-slate-500' : 'text-slate-400'} />
          : <ChevronDown size={14} className={dark ? 'text-slate-500' : 'text-slate-400'} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PartyFields({ prefix, data, onChange, dark }) {
  const fields = [
    { key: 'name',    label: 'Name',       icon: User,      placeholder: 'Full name' },
    { key: 'company', label: 'Company',    icon: Building2, placeholder: 'Company / Firm name' },
    { key: 'address', label: 'Address',    icon: MapPin,    placeholder: 'Street address', multiline: true },
    { key: 'pincode', label: 'Pincode',    icon: Hash,      placeholder: '560001' },
    { key: 'mobile',  label: 'Mobile No.', icon: Phone,     placeholder: '+91 98765 43210' },
    { key: 'gst',     label: 'GST No.',    icon: FileText,  placeholder: '29XXXXX0000X1ZX' },
  ]
  const taClass = dark
    ? 'w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none'
    : 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors resize-none shadow-sm'

  return (
    <div className="grid grid-cols-1 gap-3">
      {fields.map(f => (
        <div key={f.key}>
          <Label dark={dark}>{f.label}</Label>
          {f.multiline
            ? <textarea rows={2} value={data[f.key] || ''} onChange={e => onChange(prefix, f.key, e.target.value)} placeholder={f.placeholder} className={taClass} />
            : <Input dark={dark} value={data[f.key] || ''} onChange={e => onChange(prefix, f.key, e.target.value)} placeholder={f.placeholder} />
          }
        </div>
      ))}
    </div>
  )
}

// ─── Live Challan Preview ─────────────────────────────────────────────────────
function ChallanPreview({ form }) {
  const { dcNumber, date, from, to, items, notes } = form
  const fieldLabel = (field) => ({
    gst: 'GST No', mobile: 'Mobile No', address: 'Address',
    pincode: 'Pincode', company: 'Company Name', name: 'Name'
  }[field])

  return (
    <div className="print-area bg-white text-black font-sans text-sm leading-snug select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
        {/* Logo image top-left */}
        <img
          src="/nbillogotrans.png"
          alt="NBIL Logo"
          className="h-12 w-auto object-contain"
        />
        <div className="text-right">
          <div className="text-base font-bold tracking-wide uppercase">Next Big Innovation Labs</div>
          <div className="text-xs text-gray-600 mt-0.5">{NBIL_ADDRESS}</div>
          <div className="text-xs text-gray-500 mt-0.5">GSTIN: {NBIL_GSTIN}</div>
        </div>
      </div>

      <div className="text-center text-sm font-bold uppercase tracking-widest mb-4 text-gray-700">
        Delivery Challan
      </div>

      {/* DC / Date */}
      <div className="flex justify-between items-center mb-4 text-xs">
        <div><span className="font-semibold">DC Number: </span><span className="font-mono font-bold">{dcNumber || 'NBIL/2026/____'}</span></div>
        <div><span className="font-semibold">Date: </span><span>{date || fmtDate(today)}</span></div>
      </div>

      {/* From / To */}
      <table className="w-full border border-black mb-4 text-xs" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="border border-black px-3 py-1.5 text-left w-1/2 bg-gray-100 font-bold">FROM</th>
            <th className="border border-black px-3 py-1.5 text-left w-1/2 bg-gray-100 font-bold">TO</th>
          </tr>
        </thead>
        <tbody>
          {['name','company','address','pincode','mobile','gst'].map(field => (
            <tr key={field}>
              <td className="border border-black px-3 py-1.5 align-top">
                <span className="font-semibold">{fieldLabel(field)}:</span>{' '}
                <span className={from[field] ? '' : 'text-gray-400'}>{from[field] || '—'}</span>
              </td>
              <td className="border border-black px-3 py-1.5 align-top">
                <span className="font-semibold">{fieldLabel(field)}:</span>{' '}
                <span className={to[field] ? '' : 'text-gray-400'}>{to[field] || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Items */}
      <table className="w-full border border-black mb-4 text-xs" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="bg-gray-100">
            {['S.No','Description','Quantity','Approximate Value','Remarks'].map(h => (
              <th key={h} className="border border-black px-2 py-1.5 text-left font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0
            ? <tr><td colSpan={5} className="border border-black px-3 py-4 text-center text-gray-400 italic">No items added</td></tr>
            : items.map((row, i) => (
              <tr key={row.id}>
                <td className="border border-black px-2 py-2">{i + 1}.</td>
                <td className="border border-black px-2 py-2">{row.description}</td>
                <td className="border border-black px-2 py-2">{row.quantity}</td>
                <td className="border border-black px-2 py-2">{row.value}</td>
                <td className="border border-black px-2 py-2">{row.remarks}</td>
              </tr>
            ))
          }
          {items.length < 3 && Array.from({ length: 3 - items.length }).map((_, i) => (
            <tr key={`blank-${i}`}>{[...Array(5)].map((__, j) => <td key={j} className="border border-black px-2 py-5"></td>)}</tr>
          ))}
        </tbody>
      </table>

      {notes && (
        <div className="mb-4 text-xs border border-gray-300 rounded px-3 py-2 bg-gray-50">
          <span className="font-semibold">Notes: </span>{notes}
        </div>
      )}

      <div className="flex justify-between items-end mt-10 text-xs">
        <div>
          <div className="font-bold">Next Big Innovation Labs Pvt. Ltd.</div>
          <div className="mt-8 border-t border-black pt-1 w-44 text-center">Authorized Signature</div>
        </div>
        <div className="text-right">
          <div className="mt-8 border-t border-black pt-1 w-44 text-center">Signature of the Receiver</div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-300 text-xs text-gray-500 text-center">
        Registered Address – {NBIL_ADDRESS}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true)
  const [form, setForm] = useState({
    dcNumber: `NBIL/2026/${String(Math.floor(Math.random() * 9000) + 1000).padStart(4,'0')}`,
    date: fmtDate(today),
    from: {}, to: {},
    items: [initialRow()],
    notes: '',
  })
  const [saved, setSaved] = useState(false)

  // Apply dark class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const setField    = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])
  const setParty    = useCallback((party, field, val) => setForm(f => ({ ...f, [party]: { ...f[party], [field]: val } })), [])
  const addRow      = () => setForm(f => ({ ...f, items: [...f.items, initialRow()] }))
  const removeRow   = (id) => setForm(f => ({ ...f, items: f.items.filter(r => r.id !== id) }))
  const updateRow   = (id, field, val) => setForm(f => ({ ...f, items: f.items.map(r => r.id === id ? { ...r, [field]: val } : r) }))
  const handlePrint = () => window.print()
  const handleSave  = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  // Theme tokens
  const t = {
    bg:         dark ? '#0F172A' : '#F1F5F9',
    sidebar:    dark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200',
    previewBg:  dark ? 'bg-slate-900' : 'bg-slate-100',
    header:     dark ? 'bg-slate-950/90 border-slate-800' : 'bg-white border-slate-200',
    btnSecondary: dark
      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300',
    text:       dark ? 'text-white' : 'text-slate-900',
    subtext:    dark ? 'text-slate-500' : 'text-slate-500',
    addRowBtn:  dark
      ? 'border-slate-600 hover:border-blue-500/60 hover:bg-blue-600/5 text-slate-500 hover:text-blue-400'
      : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-400 hover:text-blue-500',
    itemCard:   dark
      ? 'bg-slate-800/40 border-slate-700/60'
      : 'bg-slate-50 border-slate-200',
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: t.bg }}>

      {/* ── Top Bar ── */}
      <header className={`no-print flex items-center justify-between px-6 py-3 border-b ${t.header} sticky top-0 z-50 backdrop-blur transition-colors duration-300`}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <NBILLogo dark={dark} />
          <div className={`h-6 w-px mx-1 ${dark ? 'bg-slate-700' : 'bg-slate-300'}`} />
          <div>
            <div className={`text-xs font-semibold ${t.text}`}>Challan Builder</div>
            <div className={`text-xs ${t.subtext}`}>Delivery Challan Generator</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            onClick={() => setDark(d => !d)}
            whileTap={{ scale: 0.92 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${t.btnSecondary}`}
            title="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {dark
                ? <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun size={14} /></motion.span>
                : <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={14} /></motion.span>
              }
            </AnimatePresence>
            {dark ? 'Light' : 'Dark'}
          </motion.button>

          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${t.btnSecondary}`}
          >
            <AnimatePresence mode="wait">
              {saved
                ? <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-green-500"><CheckCircle2 size={13} /> Saved</motion.span>
                : <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Save Draft</motion.span>
              }
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={handlePrint}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
          >
            <Printer size={13} /> Print / Export
          </motion.button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Form */}
        <aside className={`no-print w-full max-w-md flex-shrink-0 overflow-y-auto border-r ${t.sidebar} p-5 space-y-4 transition-colors duration-300`}>

          <SectionCard title="Challan Details" icon={Hash} dark={dark}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label dark={dark} required>DC Number</Label>
                <Input dark={dark} className="font-mono" value={form.dcNumber} onChange={e => setField('dcNumber', e.target.value)} placeholder="NBIL/2026/0001" />
              </div>
              <div>
                <Label dark={dark} required>Date</Label>
                <Input dark={dark} value={form.date} onChange={e => setField('date', e.target.value)} placeholder="DD/MM/YYYY" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="From (Sender)" icon={Building2} dark={dark}>
            <PartyFields prefix="from" data={form.from} onChange={setParty} dark={dark} />
          </SectionCard>

          <SectionCard title="To (Receiver)" icon={User} dark={dark}>
            <PartyFields prefix="to" data={form.to} onChange={setParty} dark={dark} />
          </SectionCard>

          <SectionCard title="Items" icon={FileText} dark={dark}>
            <div className="space-y-3">
              {form.items.map((row, i) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`border rounded-lg p-3 space-y-2 ${t.itemCard}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-blue-500 font-mono">Item {i + 1}</span>
                    {form.items.length > 1 && (
                      <button onClick={() => removeRow(row.id)} className={`transition-colors ${dark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div>
                    <Label dark={dark}>Description</Label>
                    <Input dark={dark} value={row.description} onChange={e => updateRow(row.id, 'description', e.target.value)} placeholder="Item description" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label dark={dark}>Quantity</Label>
                      <Input dark={dark} value={row.quantity} onChange={e => updateRow(row.id, 'quantity', e.target.value)} placeholder="e.g. 5 pcs" />
                    </div>
                    <div>
                      <Label dark={dark}>Approx. Value</Label>
                      <Input dark={dark} value={row.value} onChange={e => updateRow(row.id, 'value', e.target.value)} placeholder="₹ 0.00" />
                    </div>
                  </div>
                  <div>
                    <Label dark={dark}>Remarks</Label>
                    <Input dark={dark} value={row.remarks} onChange={e => updateRow(row.id, 'remarks', e.target.value)} placeholder="Optional" />
                  </div>
                </motion.div>
              ))}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addRow}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed text-xs transition-colors ${t.addRowBtn}`}
              >
                <Plus size={13} /> Add Row
              </motion.button>
            </div>
          </SectionCard>

          <SectionCard title="Notes" icon={AlertCircle} defaultOpen={false} dark={dark}>
            <Label dark={dark}>Additional Notes</Label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Any special instructions, terms, etc."
              className={`w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 resize-none
                ${dark
                  ? 'bg-slate-800/60 border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/30'
                  : 'bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
                }`}
            />
          </SectionCard>
        </aside>

        {/* Right: Preview */}
        <main className={`flex-1 overflow-y-auto p-8 flex flex-col items-center transition-colors duration-300 ${t.previewBg}`}>
          <div className="no-print w-full max-w-2xl mb-4 flex items-center justify-between">
            <span className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>Live Preview</span>
            <span className={`text-xs font-mono ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{form.dcNumber}</span>
          </div>

          <motion.div
            layout
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl shadow-black/30 overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-8 py-8">
              <ChallanPreview form={form} />
            </div>
          </motion.div>

          <p className={`no-print mt-5 text-xs text-center ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
            Use <span className="font-mono">Print / Export</span> → Save as PDF for a clean A4 document
          </p>
        </main>
      </div>
    </div>
  )
}
