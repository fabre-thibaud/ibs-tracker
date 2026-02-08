import { getWeekDays, formatWeekRange } from './dates.js'

export function generateWeeklySummary(data, dateKey) {
  const days = getWeekDays(dateKey)
  const weekRange = formatWeekRange(dateKey)

  const allMeals = []
  const allPain = []
  const allBowel = []
  const summaries = []

  for (const day of days) {
    const d = data[day]
    if (!d) continue
    allMeals.push(...d.meals)
    allPain.push(...d.pain)
    allBowel.push(...d.bowel)
    if (d.summary) summaries.push(d.summary)
  }

  // Meals
  const highFatCount = allMeals.filter(m => m.highFat).length

  // Extract food words from items (v2) or content (v1 fallback)
  const foodWords = allMeals
    .flatMap(m => {
      if (m.items && m.items.length > 0) {
        return m.items.map(item => item.name)
      }
      return (m.content || '').split(/[,;]/)
    })
    .filter(Boolean)
    .map(s => s.trim().toLowerCase())
    .filter(w => w.length > 2)

  const wordCounts = {}
  for (const w of foodWords) {
    wordCounts[w] = (wordCounts[w] || 0) + 1
  }
  const commonFoods = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word)

  // Pain
  const avgPain =
    allPain.length > 0
      ? (
          allPain.reduce((s, p) => s + (p.severity || 0), 0) / allPain.length
        ).toFixed(1)
      : 0
  const painLocations = {}
  for (const p of allPain) {
    if (p.location)
      painLocations[p.location] = (painLocations[p.location] || 0) + 1
  }
  const locationStr = Object.entries(painLocations)
    .map(([loc, count]) => `${loc} (${count}x)`)
    .join(', ')

  // Bowel
  const bristolDist = {}
  for (const b of allBowel) {
    if (b.bristolType)
      bristolDist[b.bristolType] = (bristolDist[b.bristolType] || 0) + 1
  }
  const colorNotes = {}
  for (const b of allBowel) {
    if (b.color) colorNotes[b.color] = (colorNotes[b.color] || 0) + 1
  }

  // Daily metrics
  const avgFeeling =
    summaries.length > 0
      ? (
          summaries.reduce((s, d) => s + (d.feeling || 0), 0) / summaries.length
        ).toFixed(1)
      : 'N/A'
  const avgEnergy =
    summaries.length > 0
      ? (
          summaries.reduce((s, d) => s + (d.energy || 0), 0) / summaries.length
        ).toFixed(1)
      : 'N/A'
  const avgSleep =
    summaries.filter(d => d.sleep).length > 0
      ? (
          summaries.reduce((s, d) => s + (d.sleep || 0), 0) /
          summaries.filter(d => d.sleep).length
        ).toFixed(1)
      : 'N/A'

  // Build text
  const lines = []
  lines.push(`WEEK OF ${weekRange}`)
  lines.push('Generated from IBS Tracker App')
  lines.push('')
  lines.push(`MEALS LOGGED: ${allMeals.length}`)
  lines.push(`- High-fat meals: ${highFatCount}`)
  if (commonFoods.length > 0) {
    lines.push(`- Most common foods: ${commonFoods.join(', ')}`)
  }
  lines.push('')
  lines.push(`PAIN EPISODES: ${allPain.length}`)
  if (allPain.length > 0) {
    lines.push(`- Average severity: ${avgPain}/10`)
    if (locationStr) lines.push(`- Locations: ${locationStr}`)
  }
  lines.push('')
  lines.push(`BOWEL MOVEMENTS: ${allBowel.length}`)
  if (Object.keys(bristolDist).length > 0) {
    lines.push('- Bristol Type distribution:')
    for (const [type, count] of Object.entries(bristolDist).sort(
      (a, b) => Number(a[0]) - Number(b[0])
    )) {
      lines.push(`  * Type ${type}: ${count} times`)
    }
  }
  if (Object.keys(colorNotes).length > 0) {
    const colorStr = Object.entries(colorNotes)
      .map(([c, n]) => `${n}x ${c.toLowerCase()}`)
      .join(', ')
    lines.push(`- Color: ${colorStr}`)
  }
  lines.push('')
  lines.push('DAILY METRICS:')
  lines.push(`- Average feeling: ${avgFeeling}/10`)
  lines.push(`- Average energy: ${avgEnergy}/10`)
  lines.push(`- Sleep quality: ${avgSleep}/10`)
  lines.push('')
  lines.push('OBSERVATIONS:')
  lines.push('- (Add your own observations here)')
  lines.push('')

  return lines.join('\n')
}

export function generateCSV(data) {
  const rows = [['Date', 'Type', 'Time', 'Details'].join(',')]

  const dates = Object.keys(data)
    .filter(k => !k.startsWith('_'))
    .sort()
  for (const date of dates) {
    const day = data[date]

    for (const m of day.meals || []) {
      const foodContent =
        m.items && m.items.length > 0
          ? m.items.map(item => item.name).join(', ')
          : m.content || ''

      rows.push(
        [
          date,
          'Meal',
          m.time,
          `"${m.type || ''} - ${foodContent.replace(/"/g, '""')} - ${m.portion || ''} - ${m.highFat ? 'High Fat' : ''}"`,
        ].join(',')
      )
    }

    for (const p of day.pain || []) {
      rows.push(
        [
          date,
          'Pain',
          p.time,
          `"${p.location || ''} - Severity ${p.severity || ''}/10 - ${p.duration || '?'}min - ${p.character || ''}"`,
        ].join(',')
      )
    }

    for (const b of day.bowel || []) {
      rows.push(
        [
          date,
          'Bowel',
          b.time,
          `"Bristol ${b.bristolType || '?'} - ${b.color || ''} - Blood:${b.blood ? 'Y' : 'N'} Mucus:${b.mucus ? 'Y' : 'N'} Urgent:${b.urgency ? 'Y' : 'N'}"`,
        ].join(',')
      )
    }

    if (day.summary) {
      const s = day.summary
      rows.push(
        [
          date,
          'Summary',
          '',
          `"Feeling:${s.feeling || '-'} Energy:${s.energy || '-'} Sleep:${s.sleep || '-'} Stress:${s.stress || '-'} - ${(s.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      )
    }
  }

  return rows.join('\n')
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
