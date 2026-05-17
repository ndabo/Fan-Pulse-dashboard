import React, { useState } from 'react'

const SENTIMENT_COLORS = {
  positive: { bg: 'var(--positive-dim)', text: 'var(--positive)', label: '+ positive' },
  neutral:  { bg: 'var(--neutral-dim)',  text: 'var(--neutral)',  label: '· neutral'  },
  negative: { bg: 'var(--negative-dim)', text: 'var(--negative)', label: '− negative' },
}

function CommentRow({ comment, index }) {
  const s = SENTIMENT_COLORS[comment.sentiment]
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
      animation: `fadeUp 0.3s ease ${index * 0.04}s both`,
    }}>
      {/* avatar */}
      <img
        src={comment.avatar}
        alt={comment.author}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flexShrink: 0,
          border: '1px solid var(--border)',
          objectFit: 'cover',
        }}
        onError={e => { e.target.style.display = 'none' }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--text-primary)',
          }}>{comment.author}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            padding: '2px 7px',
            borderRadius: 4,
            background: s.bg,
            color: s.text,
          }}>{s.label}</span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>👍 {comment.likes}</span>
        </div>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />
      </div>
    </div>
  )
}

export default function TopComments({ comments }) {
  const [filter, setFilter] = useState('all')

  const filters = ['all', 'positive', 'neutral', 'negative']
  const visible = filter === 'all'
    ? comments.slice(0, 15)
    : comments.filter(c => c.sentiment === filter).slice(0, 15)

  return (
    <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map(f => {
          const active = filter === f
          const s = SENTIMENT_COLORS[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: `1px solid ${active ? (s?.text || 'var(--accent)') : 'var(--border)'}`,
                background: active ? (s?.bg || 'var(--accent-dim)') : 'transparent',
                color: active ? (s?.text || 'var(--accent)') : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >{f === 'all' ? 'All comments' : f}</button>
          )
        })}
      </div>

      {/* Comments list */}
      <div>
        {visible.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              No {filter} comments found.
            </p>
          : visible.map((c, i) => <CommentRow key={c.id} comment={c} index={i} />)
        }
      </div>
    </div>
  )
}
