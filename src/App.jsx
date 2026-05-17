import React, { useState, useEffect } from 'react'
import { fetchVideoStats, fetchComments, fetchRecentVideos } from './utils/youtube.js'
import { analyzeComments, buildHeatmap, buildDayHeatmap, analyzeAgeGroups } from './utils/sentiment.js'
import EngagementCard    from './components/EngagementCard.jsx'
import TopComments       from './components/TopComments.jsx'
import SentimentBreakdown from './components/SentimentBreakdown.jsx'
import ActivityHeatmap   from './components/ActivityHeatmap.jsx'
import PostingInsight    from './components/PostingInsight.jsx'
import AgeBreakdown      from './components/AgeBreakdown.jsx'

const API_KEY         = import.meta.env.VITE_YOUTUBE_API_KEY
const LAKERS_CHANNEL  = 'UCEjOSbbaOfgnfRODEEMYlCw'

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
  const [videos,        setVideos]        = useState([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [selectedId,    setSelectedId]    = useState('')
  const [status,        setStatus]        = useState('idle')
  const [error,         setError]         = useState('')
  const [data,          setData]          = useState(null)

  // Load latest Lakers videos on mount
  useEffect(() => {
    fetchRecentVideos(LAKERS_CHANNEL, API_KEY, 20)
      .then(vids => {
        setVideos(vids)
        setVideosLoading(false)
      })
      .catch(() => setVideosLoading(false))
  }, [])

  async function handleAnalyze(videoId) {
    if (!videoId) return
    setError('')
    setStatus('loading')
    setData(null)

    try {
      const [stats, comments] = await Promise.all([
        fetchVideoStats(videoId, API_KEY),
        fetchComments(videoId, API_KEY, 100),
      ])
      const sentiment  = analyzeComments(comments)
      const heatmap    = buildHeatmap(comments)
      const dayHeatmap = buildDayHeatmap(comments)
      const ageGroups  = analyzeAgeGroups(comments)
      const sortedComments = sentiment.tagged.sort((a, b) => b.likes - a.likes)
      setData({ stats, comments: sortedComments, sentiment, heatmap, dayHeatmap, ageGroups })
      setStatus('done')
    } catch (e) {
      setError(e.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  function onSelectVideo(e) {
    const id = e.target.value
    setSelectedId(id)
    handleAnalyze(id)
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Lakers Header ── */}
      <header style={{
        background: 'linear-gradient(135deg, #552583 0%, #3d1a63 100%)',
        padding: '28px 32px 24px',
        borderBottom: '4px solid #FDB927',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 44,
              height: 44,
              background: '#FDB927',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}>🏀</div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 900,
                color: '#FDB927',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 2,
              }}>Los Angeles Lakers</h1>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'rgba(253,185,39,0.6)',
                letterSpacing: '0.1em',
              }}>FAN PULSE · ENGAGEMENT INTELLIGENCE</p>
            </div>
          </div>

          {/* Video picker */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <select
                value={selectedId}
                onChange={onSelectVideo}
                disabled={videosLoading || status === 'loading'}
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(253,185,39,0.4)',
                  borderRadius: 10,
                  color: selectedId ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  cursor: videosLoading ? 'wait' : 'pointer',
                  appearance: 'none',
                  outline: 'none',
                }}
              >
                <option value="" disabled style={{ color: '#333' }}>
                  {videosLoading ? 'Loading latest videos…' : 'Select a video to analyse'}
                </option>
                {videos.map(v => (
                  <option key={v.videoId} value={v.videoId} style={{ color: '#333' }}>
                    {v.title}
                  </option>
                ))}
              </select>
              <span style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#FDB927',
                pointerEvents: 'none',
                fontSize: 12,
              }}>▼</span>
            </div>

            {status === 'loading' && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'rgba(253,185,39,0.7)',
                letterSpacing: '0.06em',
              }}>Analysing…</span>
            )}
          </div>

          {error && (
            <p style={{
              marginTop: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: '#fca5a5',
            }}>{error}</p>
          )}
        </div>
      </header>

      {/* ── Dashboard ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 60px' }}>

        {/* Idle state */}
        {status === 'idle' && !videosLoading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 40, marginBottom: 12 }}>🏀</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.06em' }}>
              Select a video above to see fan activity
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {status === 'loading' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <Skeleton h={180} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Skeleton h={280} /> <Skeleton h={280} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Skeleton h={220} /> <Skeleton h={220} />
            </div>
            <Skeleton h={220} />
          </div>
        )}

        {/* Results */}
        {status === 'done' && data && (
          <div style={{ display: 'grid', gap: 16 }}>

            {/* Row 1: Engagement */}
            <Section title="Engagement overview">
              <EngagementCard stats={data.stats} />
            </Section>

            {/* Row 2: Sentiment + Hour heatmap */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <Section title="Fan sentiment">
                <SentimentBreakdown data={data.sentiment} />
              </Section>
              <Section title="Activity by hour">
                <ActivityHeatmap data={data.heatmap} />
              </Section>
            </div>

            {/* Row 3: Posting insight + Age breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <Section title="Best time to post">
                <PostingInsight hourData={data.heatmap} dayData={data.dayHeatmap} />
              </Section>
              <Section title="Estimated age breakdown">
                <AgeBreakdown data={data.ageGroups} />
              </Section>
            </div>

            {/* Row 4: Top comments */}
            <Section title={`Top comments · ${data.comments.length} fetched`}>
              <TopComments comments={data.comments} />
            </Section>

          </div>
        )}
      </div>
    </div>
  )
}
