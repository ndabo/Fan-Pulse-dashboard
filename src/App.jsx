import React, { useState } from 'react'
import { parseVideoId, fetchVideoStats, fetchComments } from './utils/youtube.js'
import { analyzeComments, buildHeatmap } from './utils/sentiment.js'
import EngagementCard    from './components/EngagementCard.jsx'
import TopComments       from './components/TopComments.jsx'
import SentimentBreakdown from './components/SentimentBreakdown.jsx'
import ActivityHeatmap   from './components/ActivityHeatmap.jsx'

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

function Skeleton({ h = 120 }) {
  return <div className="skeleton" style={{ height: h, borderRadius: 12 }} />
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '22px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 16,
      }}>{title}</p>
      {children}
    </div>
  )
}

export default function App() {
  const [input,  setInput]  = useState('')
  const [status, setStatus] = useState('idle')
  const [error,  setError]  = useState('')
  const [data,   setData]   = useState(null)

  async function handleAnalyze() {
    const videoId = parseVideoId(input)
    if (!videoId) return setError('Paste a valid YouTube video URL or 11-character video ID.')
    setError('')
    setStatus('loading')
    setData(null)

    try {
      const [stats, comments] = await Promise.all([
        fetchVideoStats(videoId, API_KEY),
        fetchComments(videoId, API_KEY, 100),
      ])
      const sentiment = analyzeComments(comments)
      const heatmap   = buildHeatmap(comments)
      const sortedComments = sentiment.tagged.sort((a, b) => b.likes - a.likes)
      setData({ stats, comments: sortedComments, sentiment, heatmap })
      setStatus('done')
    } catch (e) {
      setError(e.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 0 var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            flexShrink: 0,
          }}>⚡</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>Fan Pulse</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>by Fanfare</span>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(160deg, #fff 55%, #fff5f6)',
        padding: 'clamp(40px, 8vw, 72px) 32px clamp(36px, 6vw, 60px)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: '#fef2f2',
          border: '1px solid #fecdd3',
          borderRadius: 100,
          padding: '4px 16px',
          marginBottom: 20,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
          }}>FREE TOOL · NO SIGN-UP</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          marginBottom: 16,
        }}>
          Know your fans.<br />
          <span style={{ color: 'var(--accent)' }}>Instantly.</span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--text-secondary)',
          maxWidth: 440,
          margin: '0 auto 32px',
          lineHeight: 1.7,
        }}>
          Paste any YouTube video URL to get sentiment analysis,
          engagement stats, and fan activity — in seconds.
        </p>

        {/* Search bar */}
        <div style={{
          maxWidth: 560,
          margin: '0 auto',
          background: '#fff',
          border: `1.5px solid ${error ? 'var(--negative)' : 'var(--border)'}`,
          borderRadius: 14,
          padding: '8px 8px 8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          transition: 'border-color 0.15s',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>▶️</span>
          <input
            type="text"
            placeholder="youtube.com/watch?v=… or video ID"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'var(--text-primary)',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={status === 'loading'}
            style={{
              padding: '10px 22px',
              background: status === 'loading' ? 'var(--surface-2)' : 'var(--accent)',
              color: status === 'loading' ? 'var(--text-muted)' : '#fff',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {status === 'loading' ? 'Analysing…' : 'Analyse →'}
          </button>
        </div>

        {/* Inline error */}
        {error && (
          <p style={{
            marginTop: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--negative)',
          }}>{error}</p>
        )}

        <p style={{
          marginTop: 14,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>Works with any youtube.com or youtu.be link</p>
      </div>

      {/* ── Dashboard ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 60px' }}>

        {/* Loading skeletons */}
        {status === 'loading' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <Skeleton h={180} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Skeleton h={280} />
              <Skeleton h={280} />
            </div>
            <Skeleton h={220} />
          </div>
        )}

        {/* Results */}
        {status === 'done' && data && (
          <div style={{ display: 'grid', gap: 16 }}>
            <Section title="Engagement overview">
              <EngagementCard stats={data.stats} />
            </Section>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}>
              <Section title="Fan sentiment">
                <SentimentBreakdown data={data.sentiment} />
              </Section>
              <Section title="Activity by hour">
                <ActivityHeatmap data={data.heatmap} />
              </Section>
            </div>
            <Section title={`Top comments · ${data.comments.length} fetched`}>
              <TopComments comments={data.comments} />
            </Section>
          </div>
        )}

      </div>
    </div>
  )
}
