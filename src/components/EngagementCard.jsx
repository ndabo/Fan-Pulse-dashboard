import React from 'react'

const fmt = n => n >= 1_000_000
  ? (n / 1_000_000).toFixed(1) + 'M'
  : n >= 1_000 ? (n / 1_000).toFixed(1) + 'K'
  : n.toString()

function StatBox({ label, value, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--accent-dim)' : 'var(--surface-2)',
      border: `1px solid ${accent ? 'rgba(244,63,94,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: accent ? 'var(--accent)' : 'var(--text-secondary)',
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 700,
        color: accent ? 'var(--accent)' : 'var(--text-primary)',
        lineHeight: 1,
      }}>{value}</span>
    </div>
  )
}

export default function EngagementCard({ stats }) {
  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      {/* Video header */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        marginBottom: 24,
        padding: '20px 24px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        {stats.thumbnail && (
          <img
            src={stats.thumbnail}
            alt=""
            style={{
              width: 120,
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: 8,
              flexShrink: 0,
              border: '1px solid var(--border)',
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}>{stats.channelTitle}</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>{stats.title}</h2>
          <p style={{
            marginTop: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            Published {new Date(stats.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
      }}>
        <StatBox label="Views"           value={fmt(stats.views)} />
        <StatBox label="Likes"           value={fmt(stats.likes)} />
        <StatBox label="Comments"        value={fmt(stats.comments)} />
        <StatBox label="Engagement rate" value={`${stats.engagementRate}%`} accent />
      </div>
    </div>
  )
}
