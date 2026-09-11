import test from 'node:test'
import assert from 'node:assert/strict'
import { calculate, initialProject, components } from '../src/data.js'

test('hourly building and zone totals reconcile to every component', () => {
  const result = calculate(initialProject)
  assert.equal(result.hours.length, 24)
  for (const hour of result.hours) {
    const componentsTotal = components.reduce((sum, [key]) => sum + hour[key], 0)
    assert(Math.abs(hour.total - componentsTotal) < 1e-9)
    assert(Math.abs(hour.total - result.zones.reduce((sum, zone) => sum + zone.hours[hour.hour].total, 0)) < 1e-9)
    assert(hour.total >= 0)
  }
  assert.equal(result.peak.total, Math.max(...result.hours.map(h => h.total)))
  assert(result.nonCoincident >= result.peak.total - 1e-9)
  assert.equal(result.design, result.peak.total * 1.1)
})
test('adjustments affect design result and leave component loads unchanged', () => {
  const adjusted = calculate({ ...initialProject, safety: 20, diversity: 80 })
  const base = calculate(initialProject)
  assert.deepEqual(adjusted.hours, base.hours)
  assert.equal(adjusted.design, base.peak.total * 1.2 * 0.8)
})
test('a project without zones produces finite zero loads', () => {
  const result = calculate({ ...initialProject, zones: [] })
  assert.equal(result.design, 0)
  assert.equal(result.nonCoincident, 0)
  assert(result.hours.every(hour => hour.total === 0))
})
test('an isolated occupant load follows the stated schedule and heat-gain split', () => {
  const zone = Object.fromEntries(Object.entries(initialProject.zones[0]).map(([key, value]) => [key, typeof value === 'number' ? 0 : value]))
  zone.people = 1
  const result = calculate({ ...initialProject, zones: [zone], safety: 0, diversity: 100 })
  assert.equal(result.hours[10].people, 0.075)
  assert.equal(result.hours[10].latent, 0.055)
  assert.equal(result.hours[7].people, 0.075 * 0.25)
  assert.equal(result.hours[0].total, 0)
  assert.equal(result.design, 0.13)
})
