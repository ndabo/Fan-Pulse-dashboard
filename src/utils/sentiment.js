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
  // Group comments by hour of day (0–23)
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
