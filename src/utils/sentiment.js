const POSITIVE = new Set([
  'love', 'loved', 'amazing', 'incredible', 'awesome', 'great', 'best',
  'perfect', 'fantastic', 'excellent', 'beautiful', 'brilliant', 'outstanding',
  'fire', 'goat', 'legend', 'legendary', 'underrated', 'blessed', 'happy',
  'glad', 'excited', 'thrilled', 'wonderful', 'superb', 'wow', 'insane',
  '🔥', '❤️', '🙌', '💯', '👏', '😍', '🥹', '💪', '🫶', '⭐', '👑',
])

const NEGATIVE = new Set([
  'hate', 'terrible', 'worst', 'awful', 'boring', 'bad', 'disgusting',
  'trash', 'garbage', 'stupid', 'dumb', 'waste', 'overrated', 'disappointed',
  'disappointing', 'poor', 'pathetic', 'horrible', 'annoying', 'cringe',
  'fake', 'dislike', 'unsubscribe', 'clickbait', 'lame', 'mediocre',
  '👎', '🤮', '😡', '🤦', '💀',
])

export function scoreSentiment(text) {
  const lower = text.toLowerCase()
  const tokens = lower.split(/\s+/)
  let pos = 0, neg = 0
  for (const t of tokens) {
    if (POSITIVE.has(t)) pos++
    if (NEGATIVE.has(t)) neg++
  }
  // also check emoji as chars
  for (const emoji of [...POSITIVE]) {
    if (text.includes(emoji)) pos++
  }
  for (const emoji of [...NEGATIVE]) {
    if (text.includes(emoji)) neg++
  }
  if (pos > neg) return 'positive'
  if (neg > pos) return 'negative'
  return 'neutral'
}

export function analyzeComments(comments) {
  const tagged = comments.map(c => ({ ...c, sentiment: scoreSentiment(c.text) }))
  const counts = { positive: 0, neutral: 0, negative: 0 }
  for (const c of tagged) counts[c.sentiment]++
  const total = tagged.length || 1
  return {
    tagged,
    counts,
    percentages: {
      positive: Math.round((counts.positive / total) * 100),
      neutral:  Math.round((counts.neutral  / total) * 100),
      negative: Math.round((counts.negative / total) * 100),
    },
  }
}

export function buildHeatmap(comments) {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour:  i,
    label: i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`,
    count: 0,
  }))
  for (const c of comments) {
    const h = new Date(c.publishedAt).getUTCHours()
    hours[h].count++
  }
  return hours
}

export function buildDayHeatmap(comments) {
  const days = [
    { day: 0, name: 'Sun', count: 0 },
    { day: 1, name: 'Mon', count: 0 },
    { day: 2, name: 'Tue', count: 0 },
    { day: 3, name: 'Wed', count: 0 },
    { day: 4, name: 'Thu', count: 0 },
    { day: 5, name: 'Fri', count: 0 },
    { day: 6, name: 'Sat', count: 0 },
  ]
  for (const c of comments) {
    const d = new Date(c.publishedAt).getUTCDay()
    days[d].count++
  }
  return days
}

// ── Age group inference ───────────────────────────────────

const AGE_KEYWORDS = {
  '13–24': [
    'no cap', 'bussin', 'mid', 'slay', 'vibe', 'drip', 'lit', 'sheesh',
    'ngl', 'era', 'based', 'ate', 'fr fr', 'lowkey', 'hits different',
    'rent free', 'main character', 'understood the assignment', 'giving',
    'nba2k', '2k', 'slept on', 'no shot', 'cooked', 'sus', 'rizz', 'sigma',
    'goated', 'W tbh', 'bro really', 'bruh moment',
  ],
  '25–34': [
    'analytics', 'stat line', 'efficiency', 'trade deadline', 'salary cap',
    'front office', 'coaching staff', 'scheme', 'matchup nightmare', 'role player',
    'advanced stats', 'win share', 'usage rate', 'rebuild', 'tanking',
    'playoff picture', 'second unit', 'rotation', 'three and d',
  ],
  '35–49': [
    'kobe', 'shaq', 'showtime', 'magic johnson', 'kareem', 'back in the day',
    'old school', 'fundamentals', '3peat', 'legacy', 'classic lakers',
    'remember when', 'pat riley', 'phil jackson', 'triangle offense',
    'forum blue and gold', 'chick hearn', 'great western',
  ],
  '50+': [
    'jerry west', 'wilt chamberlain', 'elgin baylor', 'old forum', 'loyal fan',
    'season tickets', 'since the', 'been a fan for decades', 'back when',
    'radio broadcast', 'the showtime lakers', 'hot rod', 'james worthy',
  ],
}

export const targetingTips = {
  '13–24': 'NBA 2K partnerships, TikTok/Reels highlights, sneaker collabs, gaming integrations',
  '25–34': 'Premium merch, fantasy basketball tie-ins, analytics content, streaming bundles',
  '35–49': 'Legacy retrospectives, nostalgia campaigns, premium seating, alumni events',
  '50+':   'Long-form storytelling, loyalty programs, in-arena experiences, radio/TV integrations',
}

export function inferAgeGroup(text) {
  const lower = text.toLowerCase()
  const scores = { '13–24': 0, '25–34': 0, '35–49': 0, '50+': 0 }
  for (const [group, keywords] of Object.entries(AGE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[group]++
    }
  }
  const best = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)
  return best[1] > 0 ? best[0] : null
}

export function analyzeAgeGroups(comments) {
  const counts = { '13–24': 0, '25–34': 0, '35–49': 0, '50+': 0, unknown: 0 }
  for (const c of comments) {
    const g = inferAgeGroup(c.text)
    if (g) counts[g]++
    else counts.unknown++
  }
  const inferred = comments.length - counts.unknown
  const percentages = {}
  for (const g of ['13–24', '25–34', '35–49', '50+']) {
    percentages[g] = inferred > 0 ? Math.round((counts[g] / inferred) * 100) : 0
  }
  return { counts, percentages, inferred, total: comments.length }
}
