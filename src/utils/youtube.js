const BASE = 'https://www.googleapis.com/youtube/v3'

// ── Helpers ──────────────────────────────────────────────

export function parseVideoId(input) {
  input = input.trim()
  // full URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = input.match(p)
    if (m) return m[1]
  }
  // bare ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  return null
}

async function get(endpoint, params, apiKey) {
  const url = new URL(`${BASE}/${endpoint}`)
  url.searchParams.set('key', apiKey)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

// ── Main fetch functions ──────────────────────────────────

export async function fetchVideoStats(videoId, apiKey) {
  const data = await get('videos', {
    id: videoId,
    part: 'statistics,snippet,contentDetails',
  }, apiKey)

  if (!data.items?.length) throw new Error('Video not found.')

  const { statistics: s, snippet: sn } = data.items[0]
  return {
    videoId,
    title:        sn.title,
    channelTitle: sn.channelTitle,
    publishedAt:  sn.publishedAt,
    thumbnail:    sn.thumbnails?.high?.url || sn.thumbnails?.default?.url,
    views:        parseInt(s.viewCount    || '0', 10),
    likes:        parseInt(s.likeCount    || '0', 10),
    comments:     parseInt(s.commentCount || '0', 10),
    engagementRate: (
      ((parseInt(s.likeCount || '0', 10) + parseInt(s.commentCount || '0', 10))
        / Math.max(parseInt(s.viewCount || '1', 10), 1)) * 100
    ).toFixed(2),
  }
}

export async function fetchComments(videoId, apiKey, maxResults = 100) {
  const data = await get('commentThreads', {
    videoId,
    part:       'snippet',
    order:      'relevance',
    maxResults: Math.min(maxResults, 100),
  }, apiKey)

  return (data.items || []).map(item => {
    const c = item.snippet.topLevelComment.snippet
    return {
      id:          item.id,
      text:        c.textDisplay,
      author:      c.authorDisplayName,
      avatar:      c.authorProfileImageUrl,
      likes:       c.likeCount,
      publishedAt: c.publishedAt,
    }
  })
}

export async function fetchRecentVideos(channelId, apiKey, maxResults = 20) {
  // first resolve channel ID from URL or handle
  const data = await get('search', {
    channelId,
    part:       'snippet',
    order:      'date',
    type:       'video',
    maxResults,
  }, apiKey)

  return (data.items || []).map(item => ({
    videoId:     item.id.videoId,
    title:       item.snippet.title,
    publishedAt: item.snippet.publishedAt,
  }))
}
