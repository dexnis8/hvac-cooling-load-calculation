export const initialProject = {
  name: 'Westbridge office', code: 'WB-2026-014', client: 'Westbridge Properties', location: 'Sacramento, California',
  outdoor: 35, indoor: 24, humidity: 50, deltaHumidity: 6, month: 'July', safety: 10, diversity: 100,
  zones: [
    { id: 'z1', name: 'Open office', type: 'Office', floor: 'Level 01', area: 240, height: 3, people: 24, lighting: 9, equipment: 12, airflow: 210, infiltration: 25, wall: 125, roof: 240, glass: 48, uWall: 0.42, uRoof: 0.28, uGlass: 1.8, shgc: 0.35 },
    { id: 'z2', name: 'Meeting rooms', type: 'Meeting', floor: 'Level 01', area: 85, height: 3, people: 28, lighting: 10, equipment: 8, airflow: 185, infiltration: 8, wall: 50, roof: 85, glass: 24, uWall: 0.42, uRoof: 0.28, uGlass: 1.8, shgc: 0.35 },
    { id: 'z3', name: 'Reception & lounge', type: 'Reception', floor: 'Level 01', area: 110, height: 3.6, people: 10, lighting: 8, equipment: 5, airflow: 95, infiltration: 18, wall: 70, roof: 110, glass: 36, uWall: 0.42, uRoof: 0.28, uGlass: 1.8, shgc: 0.35 },
    { id: 'z4', name: 'Private offices', type: 'Office', floor: 'Level 01', area: 120, height: 3, people: 12, lighting: 9, equipment: 12, airflow: 105, infiltration: 12, wall: 85, roof: 120, glass: 28, uWall: 0.42, uRoof: 0.28, uGlass: 1.8, shgc: 0.35 },
    { id: 'z5', name: 'Break room', type: 'Support', floor: 'Level 01', area: 45, height: 3, people: 8, lighting: 8, equipment: 25, airflow: 75, infiltration: 5, wall: 28, roof: 45, glass: 8, uWall: 0.42, uRoof: 0.28, uGlass: 1.8, shgc: 0.35 },
  ],
}
export const components = [['envelope', 'Envelope conduction'], ['solar', 'Solar glass'], ['people', 'People'], ['lighting', 'Lighting'], ['equipment', 'Equipment'], ['ventilation', 'Ventilation'], ['infiltration', 'Infiltration'], ['latent', 'Latent load']]
// International Table Btu; one refrigeration ton equals 12,000 Btu/hr.
export const loadUnits = { kW: 1, Tons: 3412.14163312794 / 12000, 'Btu/hr': 3412.14163312794 }
export function convertResult(result, unit = 'kW') {
  if (!result || unit === 'kW') return result
  const factor = loadUnits[unit]
  const convertHour = hour => ({ ...hour, ...Object.fromEntries([...components.map(([key]) => key), 'total'].map(key => [key, hour[key] * factor])) })
  return {
    ...result,
    design: result.design * factor,
    sensible: result.sensible * factor,
    nonCoincident: result.nonCoincident * factor,
    peak: convertHour(result.peak),
    hours: result.hours.map(convertHour),
    zones: result.zones.map(zone => ({ ...zone, peak: convertHour(zone.peak), hours: zone.hours.map(convertHour) })),
  }
}
// Illustrative steady-state model, not a CLTD/SCL/CLF implementation.
export function calculate(project) {
  const zones = project.zones.map(zone => {
    const hours = Array.from({ length: 24 }, (_, hour) => {
      const occupancy = hour >= 8 && hour < 18 ? 1 : hour === 7 || hour === 18 ? 0.25 : 0
      const sun = Math.max(0, Math.sin((hour - 6) * Math.PI / 14))
      const temperature = project.outdoor - 8 + 8 * Math.cos((hour - 15) * Math.PI / 12)
      const dt = Math.max(0, temperature - project.indoor)
      const loads = {
        envelope: (zone.wall * zone.uWall + zone.roof * zone.uRoof + zone.glass * zone.uGlass) * dt / 1000,
        solar: zone.glass * zone.shgc * 600 * sun / 1000,
        people: zone.people * 75 * occupancy / 1000,
        lighting: zone.area * zone.lighting * occupancy / 1000,
        equipment: zone.area * zone.equipment * (0.15 + 0.85 * occupancy) / 1000,
        ventilation: 1.2 * 1.006 * zone.airflow * dt * occupancy / 1000,
        infiltration: 1.2 * 1.006 * zone.infiltration * dt / 1000,
        latent: (zone.people * 55 * occupancy + 1.2 * 2501 * (zone.airflow * occupancy + zone.infiltration) * project.deltaHumidity / 1000) / 1000,
      }
      return { hour, ...loads, total: Object.values(loads).reduce((a, b) => a + b, 0) }
    })
    return { ...zone, hours, peak: hours.reduce((a, b) => a.total > b.total ? a : b) }
  })
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, ...Object.fromEntries([...components.map(([key]) => key), 'total'].map(key => [key, zones.reduce((sum, z) => sum + z.hours[hour][key], 0)])) }))
  const peak = hours.reduce((a, b) => a.total > b.total ? a : b)
  return { zones, hours, peak, nonCoincident: zones.reduce((sum, z) => sum + z.peak.total, 0), sensible: peak.total - peak.latent, design: peak.total * (1 + project.safety / 100) * project.diversity / 100 }
}
export const number = (value, digits = 2) => Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
export const time = hour => `${String(hour).padStart(2, '0')}:00`
export function download(filename, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
