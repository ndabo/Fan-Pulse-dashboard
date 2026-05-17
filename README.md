# Fan Pulse — YouTube Engagement Dashboard

Built for Fanfare. Analyses fan activity (engagement, comments, sentiment, activity patterns) for any YouTube video.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Setup

The API key is baked in at build time — no user entry required.

To run locally, create a `.env` file at the project root:

```
VITE_YOUTUBE_API_KEY=your_key_here
```

To deploy on Vercel, add `VITE_YOUTUBE_API_KEY` in **Settings → Environment Variables**.

## What it analyses

| Component | What it shows | API call |
|---|---|---|
| Engagement overview | Views, likes, comments, engagement rate | `videos.list` |
| Fan sentiment | Positive / neutral / negative breakdown | `commentThreads.list` + keyword heuristics |
| Activity by hour | When fans comment most (UTC) | `commentThreads.list` timestamps |
| Top comments | Sorted by likes, filterable by sentiment | `commentThreads.list` |

## API quota

Free tier = 10,000 units/day.
Each analysis costs ~2 units (1 for `videos.list` + 1 for `commentThreads.list`).

## Project structure

```
src/
  utils/
    youtube.js     # All YouTube API fetch helpers
    sentiment.js   # Keyword-based sentiment tagger + heatmap builder
  components/
    EngagementCard.jsx      # Views / likes / engagement rate
    SentimentBreakdown.jsx  # Positive / neutral / negative bars
    ActivityHeatmap.jsx     # Bar chart by hour of day
    TopComments.jsx         # Filterable comment list
  App.jsx          # Main layout + state orchestration
  index.css        # Global design tokens
```

## Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

## v2 ideas (post-assessment)

- Swap keyword sentiment for a real NLP model via a Python FastAPI backend
- Add channel-level analysis (multiple videos)
- Export report as PDF
- Track engagement over time (store snapshots)
