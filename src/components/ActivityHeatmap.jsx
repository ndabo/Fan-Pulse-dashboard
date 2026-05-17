import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-secondary)' }}>{d.label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 500 }}>{d.count} comments</p>
    </div>
  )
}

export default function ActivityHeatmap({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  // peak hours label
  const sorted = [...data].sort((a, b) => b.count - a.count)
  const peaks = sorted.slice(0, 3).filter(d => d.count > 0)

  return (
    <div style={{ animation: 'fadeUp 0.4s ease 0.3s both' }}>

      {peaks.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            alignSelf: 'center',
          }}>Peak hours</span>
          {peaks.map(p => (
            <span key={p.hour} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 4,
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid rgba(244,63,94,0.25)',
            }}>{p.label} · {p.count}</span>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={24}>
            {data.map(entry => {
              const intensity = max > 0 ? entry.count / max : 0
              return (
                <Cell
                  key={entry.hour}
                  fill={
                    intensity > 0.75 ? 'var(--accent)'
                    : intensity > 0.4 ? 'rgba(244,63,94,0.45)'
                    : intensity > 0    ? 'rgba(244,63,94,0.18)'
                    : 'var(--surface-2)'
                  }
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p style={{
        marginTop: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        textAlign: 'center',
        letterSpacing: '0.05em',
      }}>Comment activity by UTC hour of day</p>
    </div>
  )
}
