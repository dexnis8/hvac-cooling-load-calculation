import { useId, useRef, useEffect, useState } from 'react'
import { X, ArrowRight, Info, ChevronDown } from 'lucide-react'
import { number, time, components } from './data'

export function Button({ children, variant = 'secondary', icon: Icon, className = '', ...props }) {
  return <button type="button" className={`button ${variant} ${className}`} {...props}>{Icon && <Icon size={17} />}{children}</button>
}
export function Field({ label, unit, hint, value, onChange, type = 'number', min = 0, max, step = 'any', required = true, ...props }) {
  const id = useId()
  const [error, setError] = useState('')
  return <div className="field"><label htmlFor={id}>{label}</label><div className={`input-wrap ${error ? 'invalid' : ''}`}><input id={id} type={type} value={value} min={type === 'number' ? min : undefined} max={max} step={type === 'number' ? step : undefined} required={required} aria-invalid={!!error} aria-describedby={hint || error ? `${id}-help` : undefined} onChange={e => { setError(''); onChange(type === 'number' ? e.target.value === '' ? '' : Number(e.target.value) : e.target.value) }} onBlur={e => setError(e.target.validity.valid ? '' : e.target.validationMessage)} {...props} />{unit && <span className="unit">{unit}</span>}</div>{(error || hint) && <p id={`${id}-help`} className={error ? 'field-error' : 'field-hint'}>{error || hint}</p>}</div>
}
export function Select({ label, value, onChange, options }) {
  const id = useId()
  return <div className="field"><label htmlFor={id}>{label}</label><div className="select-wrap"><select id={id} value={value} onChange={e => onChange(e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></div></div>
}
export function Notice({ children, tone = 'warning', title }) {
  return <div className={`notice ${tone}`}><Info size={17} /><div>{title && <strong>{title} </strong>}{children}</div></div>
}
export function Empty({ icon: Icon = Info, title, children, action, onAction }) {
  return <div className="empty"><Icon size={28} /><h2>{title}</h2><p>{children}</p>{action && <Button variant="primary" icon={ArrowRight} onClick={onAction}>{action}</Button>}</div>
}
export function Modal({ title, children, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = old; previous?.focus() }
  }, [])
  return <dialog ref={ref} className="modal" aria-labelledby="dialog-title" onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose() } }}><div className="modal-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>{children}</dialog>
}
export function LoadChart({ result, month }) {
  const [active, setActive] = useState(null)
  const [view, setView] = useState('Chart')
  const chartRef = useRef(null)
  const [width, setWidth] = useState(660)
  useEffect(() => {
    if (!chartRef.current) return
    const observer = new ResizeObserver(entries => setWidth(Math.max(280, entries[0].contentRect.width)))
    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [view])
  const height = 230, left = 39, top = 15, bottom = 34, right = 19
  const max = Math.max(20, Math.ceil(result.peak.total / 20) * 20)
  const x = h => left + h / 23 * (width - left - right)
  const y = v => height - bottom - v / max * (height - top - bottom)
  const line = key => result.hours.map((h, i) => `${i ? 'L' : 'M'}${x(i)},${y(key === 'sensible' ? h.total - h.latent : h[key])}`).join(' ')
  const selected = result.hours[active ?? result.peak.hour]
  return <section className="panel profile-panel"><div className="panel-heading"><div><h2>Hourly load profile</h2><p>{month} design day · All zones</p></div><div className="segmented" aria-label="Profile display">{['Chart', 'Table'].map(item => <button key={item} aria-pressed={view === item} onClick={() => setView(item)}>{item}</button>)}</div></div>{view === 'Chart' ? <><div className="chart-key"><span><i className="line-key total" />Total</span><span><i className="line-key envelope" />Sensible</span><span><i className="line-key latent dashed" />Latent</span><span className="chart-unit">Load (kW)</span></div><div className="chart" ref={chartRef}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Hourly cooling load. Peak ${number(result.peak.total)} kilowatts at ${time(result.peak.hour)}. Exact values available in Table view.`}>
    {Array.from({ length: 5 }, (_, i) => max * i / 4).map(v => <g key={v}><line x1={left} x2={width - right} y1={y(v)} y2={y(v)} className="grid-line" /><text x={left - 10} y={y(v) + 4} textAnchor="end">{number(v, 0)}</text></g>)}
    {(width < 450 ? [0, 6, 12, 18, 23] : [0, 4, 8, 12, 16, 20, 23]).map(h => <text key={h} x={x(h)} y={height - 10} textAnchor="middle">{time(h)}</text>)}
    <line x1={x(result.peak.hour)} x2={x(result.peak.hour)} y1={top} y2={height - bottom} className="peak-line" />
    <path d={line('total')} className="plot-line total" /><path d={line('sensible')} className="plot-line envelope" /><path d={line('latent')} className="plot-line latent" strokeDasharray="5 5" />
    <circle cx={x(selected.hour)} cy={y(selected.total)} r="4.5" className="peak-dot" />
    {result.hours.map(h => <rect key={h.hour} x={x(h.hour) - 10} y={top} width="20" height={height - top - bottom} fill="transparent" onMouseEnter={() => setActive(h.hour)}><title>{time(h.hour)} · {number(h.total)} kW total</title></rect>)}
  </svg></div><div className="chart-footer"><span><span className="status-dot" />Peak at <b className="mono">{time(result.peak.hour)}</b></span><label className="chart-inspect">Inspect hour <select aria-label="Inspect hourly load" value={active ?? result.peak.hour} onChange={e => setActive(Number(e.target.value))}>{result.hours.map(h => <option key={h.hour} value={h.hour}>{time(h.hour)}</option>)}</select><output className="mono" aria-live="polite">{number(selected.total)} kW</output></label></div></> : <div className="table-scroll chart-table"><table><caption className="sr-only">Exact hourly load values in kilowatts</caption><thead><tr><th>Hour</th><th className="numeric">Sensible (kW)</th><th className="numeric">Latent (kW)</th><th className="numeric">Total (kW)</th></tr></thead><tbody>{result.hours.map(h => <tr key={h.hour}><td className="mono">{time(h.hour)}</td><td className="numeric">{number(h.total - h.latent)}</td><td className="numeric">{number(h.latent)}</td><td className="numeric">{number(h.total)}</td></tr>)}</tbody></table></div>}</section>
}
export function Breakdown({ result }) {
  const sorted = [...components].sort((a, b) => result.peak[b[0]] - result.peak[a[0]])
  return <section className="panel breakdown-panel"><div className="panel-heading"><div><h2>Load breakdown</h2><p>At coincident peak · {time(result.peak.hour)}</p></div><span className="small-unit mono">kW</span></div><table className="breakdown-table"><caption className="sr-only">Load components at coincident peak, kilowatts and percentage</caption><thead className="sr-only"><tr><th>Component</th><th>Load (kW)</th><th>Share</th></tr></thead><tbody>{sorted.map(([key, label]) => <tr key={key}><th scope="row"><div className="bar-label"><i style={{ background: `var(--color-${key})` }} />{label}</div><div className="bar-track"><div style={{ background: `var(--color-${key})`, width: `${result.peak.total ? result.peak[key] / result.peak.total * 100 : 0}%` }} /></div></th><td className="numeric">{number(result.peak[key])}</td><td className="numeric share">{number(result.peak.total ? result.peak[key] / result.peak.total * 100 : 0, 0)}%</td></tr>)}</tbody></table><div className="breakdown-total"><strong>Total unadjusted load</strong><span className="mono">{number(result.peak.total)} <small>kW</small></span></div></section>
}
