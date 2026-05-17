import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { targetingTips } from '../utils/sentiment.js'

const GROUPS = ['13–24', '25–34', '35–49', '50+']
const COLORS  = ['#f43f5e', '#fb923c', '#facc15', '#a78bfa']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { group, pct } = payload[0].payload
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      maxWidth: 220,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Age {group} · {pct}%</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.5 }}>{targetingTips[group]}</p>
    </div>
  )
}

export default function AgeBreakdown({ data }) {
  const { percentages, inferred, total } = data

  const chartData = GROUPS.map((g, i) => ({
    group: g,
    pct:   percentages[g],
    color: COLORS[i],
  }))

  const dominant = chartData.reduce((a, b) => b.pct > a.pct ? b : a)

  return (
    <div style={{ animation: 'fadeUp 0.4s ease 0.35s both' }}>
      {dominant.pct > 0 && (
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 16,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>Dominant segment</p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 800,
            color: dominant.color,
            marginBottom: 4,
          }}>
            Age {dominant.group}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>
              {dominant.pct}% of scored comments
            </span>
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}>{targetingTips[dominant.group]}</p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="group"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map(d => <Cell key={d.group} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p style={{
        marginTop: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>
        Estimated from comment language — not official YouTube Analytics · {inferred} of {total} comments scored
      </p>
    </div>
  )
}
