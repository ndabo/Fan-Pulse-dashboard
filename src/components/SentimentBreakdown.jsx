import React from 'react'

export default function SentimentBreakdown({ data }) {
  const { counts, percentages } = data
  const total = counts.positive + counts.neutral + counts.negative

  const bars = [
    { key: 'positive', label: 'Positive', color: 'var(--positive)', pct: percentages.positive, count: counts.positive },
    { key: 'neutral',  label: 'Neutral',  color: 'var(--neutral)',  pct: percentages.neutral,  count: counts.neutral  },
    { key: 'negative', label: 'Negative', color: 'var(--negative)', pct: percentages.negative, count: counts.negative },
  ]

  const dominant = bars.reduce((a, b) => b.count > a.count ? b : a)

  return (
    <div style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>

      {/* Summary headline */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 24,
        padding: '16px 20px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 800,
          color: dominant.color,
          lineHeight: 1,
        }}>{dominant.pct}%</span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--text-secondary)',
        }}>
          of comments are <strong style={{ color: dominant.color }}>{dominant.label.toLowerCase()}</strong>
          {' '}— from {total.toLocaleString()} analysed
        </span>
      </div>

      {/* Stacked bar */}
      <div style={{
        display: 'flex',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 20,
        gap: 2,
      }}>
        {bars.map(b => (
          <div
            key={b.key}
            style={{
              width: `${b.pct}%`,
              background: b.color,
              opacity: 0.85,
              transition: 'width 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Individual bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bars.map(b => (
          <div key={b.key}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.06em',
                color: b.color,
              }}>{b.label.toUpperCase()}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}>{b.count} · {b.pct}%</span>
            </div>
            <div style={{
              height: 6,
              background: 'var(--surface-2)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${b.pct}%`,
                background: b.color,
                borderRadius: 3,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
