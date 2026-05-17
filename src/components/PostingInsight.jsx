import React from 'react'

const FULL_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toET(utcHour) {
  return ((utcHour - 5) + 24) % 24
}

function formatHour(h) {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

function getInsight(hourData, dayData) {
  const withET = hourData.map(h => ({ ...h, etHour: toET(h.hour) }))
  const sortedHours = [...withET].sort((a, b) => b.count - a.count)
  const topHours = sortedHours.slice(0, 5).filter(h => h.count > 0).map(h => h.etHour).sort((a, b) => a - b)

  const sortedDays = [...dayData].sort((a, b) => b.count - a.count)
  const topDays = sortedDays.slice(0, 3).filter(d => d.count > 0)
  const worstDay = sortedDays[sortedDays.length - 1]

  let dayRange = ''
  if (topDays.length >= 2) {
    const indices = topDays.map(d => d.day).sort((a, b) => a - b)
    const contiguous = indices.every((d, i) => i === 0 || d === indices[i - 1] + 1)
    dayRange = contiguous
      ? `${FULL_DAY[indices[0]]}–${FULL_DAY[indices[indices.length - 1]]}`
      : topDays.map(d => FULL_DAY[d.day]).join(', ')
  } else if (topDays.length === 1) {
    dayRange = FULL_DAY[topDays[0].day]
  }

  const timeWindow = topHours.length > 0
    ? `${formatHour(topHours[0])}–${formatHour(Math.min(topHours[topHours.length - 1] + 2, 23))} ET`
    : null

  const parts = []
  if (dayRange && timeWindow) parts.push(`Best window: ${dayRange}, ${timeWindow}.`)
  else if (dayRange) parts.push(`Best days: ${dayRange}.`)
  else if (timeWindow) parts.push(`Best time: ${timeWindow}.`)
  else parts.push('Not enough data to determine best posting time.')

  if (worstDay && sortedDays[0].count > 0 && worstDay.count < sortedDays[0].count * 0.5) {
    parts.push(` Avoid ${FULL_DAY[worstDay.day]}s — lowest engagement in this sample.`)
  }

  return { recommendation: parts.join(''), topDays }
}

export default function PostingInsight({ hourData, dayData }) {
  const { recommendation, topDays } = getInsight(hourData, dayData)
  const maxDay = Math.max(...dayData.map(d => d.count), 1)

  return (
    <div style={{ animation: 'fadeUp 0.4s ease 0.25s both' }}>
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>📅</span>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: '#166534',
          lineHeight: 1.6,
        }}>{recommendation}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dayData.map(d => (
          <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              width: 28,
              textAlign: 'right',
            }}>{d.name}</span>
            <div style={{
              flex: 1,
              height: 8,
              background: 'var(--surface-2)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(d.count / maxDay) * 100}%`,
                background: topDays.some(t => t.day === d.day)
                  ? 'var(--accent)'
                  : 'rgba(244,63,94,0.3)',
                borderRadius: 4,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              width: 24,
              textAlign: 'right',
            }}>{d.count}</span>
          </div>
        ))}
      </div>

      <p style={{
        marginTop: 12,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>UTC timestamps converted to ET · based on fetched comments only</p>
    </div>
  )
}
