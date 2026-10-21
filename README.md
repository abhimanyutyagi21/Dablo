# Dablo — React front end + Express API

React (Vite) front end and a Node/Express API with accounts, tracking-link redirects, YouTube and Twitch connections, RSS imports, and AI summaries.

Requires **Node 20 or newer** (`node -v`). No database install: data lives in a SQLite file.

---

## 1. First-time setup

```bash
npm run setup                          # installs front end + server
cp server/.env.example server/.env     # Windows: copy server\.env.example server\.env
```

Open `server/.env` and set `JWT_SECRET` and `TOKEN_ENCRYPTION_KEY` (two different random strings):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # run twice
```

Start everything:

```bash
npm run dev:all        # web: http://localhost:5173   API: http://localhost:4000
```

Always open **http://localhost:5173** (not 4000). After editing `server/.env`, stop (`Ctrl+C`) and start again.

---

## 2. Check that it works

### A. Automated test (no accounts or keys needed) — 1 minute
```bash
npm test
```
Starts fake Google, Twitch, Anthropic and feed servers and runs the real API against them: 14 checks covering sign-up, tracking redirects, the YouTube/Twitch flows (token refresh, revoked access, no duplicates, tokens encrypted), RSS import, the private-network guard, and AI summaries. Expect `# pass 14` and `# fail 0`.

### B. Manual check without any keys
1. Open http://localhost:5173 → **Get started** → create an account (8+ character password) → finish onboarding.
2. **Content** → add an item. Refresh the page: it is still there (saved in the database).
3. **Tracking links** → add a link to `https://example.com`, leave the slug empty. Click **Copy**, open the link in a private window: you land on example.com with `utm_` parameters. Back in the app (switch tabs), **Tracked clicks** becomes 1.
4. **Platforms & earnings** → **Connections**: YouTube and Twitch show *Setup needed* (expected until you add keys).
5. In *Blog, newsletter & podcast feeds* add `https://feeds.bbci.co.uk/news/rss.xml` as **Blog**. Open **Content**: the items appear with "Synced from RSS feed".
6. Add the feed `http://localhost:4000/api/health` → it is refused with "That address is not allowed" (private-network guard).
7. **Insights** → the *AI summary* panel says summaries are switched off (expected until you add a key).

### C. With real keys (set up in section 3)
- **YouTube:** Platforms → *Connect YouTube* → pick your Google account → allow → you return to the app and your videos appear in **Content** (format "Video" or "Short-form video", real view counts). If the channel is monetised, monthly **estimated** revenue records appear under **Revenue** (source *Platform payout*, attribution *Estimated*). Click *Sync now* again: nothing duplicates.
- **Twitch:** *Connect Twitch* → your videos appear with view counts; the card shows the follower total.
- **AI summary:** Insights → *Generate summary*. Tick *Include content titles* only if you are happy to send titles to Anthropic.
- **Disconnect:** *Disconnect* removes the stored tokens; imported records stay.

---

## 3. Getting the keys (all optional)

Each feature switches on when its keys are in `server/.env`. The redirect URIs below must match **exactly**.

### YouTube (Google Cloud)
1. https://console.cloud.google.com → create a project.
2. **APIs & Services → Library**: enable **YouTube Data API v3** and **YouTube Analytics API**.
3. **OAuth consent screen** (Google Auth Platform): user type *External*, fill in the app name and your email. Add your own Google account under **Test users**. Under data access/scopes add `youtube.readonly`, `yt-analytics.readonly` and `yt-analytics-monetary.readonly`.
4. **Credentials → Create credentials → OAuth client ID → Web application.** Authorized redirect URI:
   `http://localhost:5173/api/integrations/youtube/callback`
5. Put the client ID and secret in `server/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then restart.

Notes: while the app is in *Testing* status Google shows an "unverified app" warning (click Advanced → continue; it is your own app) and expires the login after 7 days: the card then shows *Reconnect needed*. Revenue only exists for channels in the YouTube Partner Program; others import videos only and the card says so.

### Twitch
1. https://dev.twitch.tv/console → **Register Your Application**, OAuth redirect URL `http://localhost:5173/api/integrations/twitch/callback`, category *Website Integration*, client type *Confidential*.
2. Copy the client ID and **New Secret** into `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.

### AI summaries (Anthropic)
1. https://console.anthropic.com → **API keys** → create a key (the account needs a little credit).
2. Put it in `ANTHROPIC_API_KEY`. The default model is `claude-haiku-5-5` (cheap and fast); change it with `ANTHROPIC_MODEL`.

---

## 4. What each feature does

| Feature | How it works |
|---|---|
| **Tracking links** | `/r/:slug` logs the click (bots, prefetch and 30-second repeats ignored) and redirects with UTM parameters. |
| **YouTube** | OAuth with offline access. Imports up to your 200 newest uploads (title, URL, publish date, views, Short vs Video) and 6 months of **estimated** revenue from the Analytics API, in your workspace currency, as one record per month. |
| **Twitch** | Imports videos/VODs with view counts and reads the follower total. Twitch's API has no revenue data. |
| **Feeds (RSS/Atom)** | Blogs, Substack/beehiiv/Ghost/WordPress newsletters and podcasts, no login. Up to 100 items per feed, 10 feeds per account. |
| **Auto-sync** | Every `SYNC_INTERVAL_HOURS` (default 6; `0` turns it off), plus *Sync now* buttons. |
| **AI summary** | The server sends Claude only aggregates (totals, rankings, 30-day trend). Names become "Content #1" unless you tick *Include content titles*. Cached for an hour when nothing changed; 10 per user per hour. |

**Re-sync rules:** imported records are matched by an external ID. A sync overwrites the synced fields (title, views, revenue amount…) and keeps what you added yourself (notes, campaign, product, tags). If you delete an imported record, the next sync recreates it.

**Not included:** Instagram/Facebook (needs Meta app review and a business account), TikTok, X and LinkedIn (restricted or paid API access). Stripe/Razorpay webhooks and per-video revenue are also not built yet.

---

## 5. Project layout

```
src/                         React app (landing/, components/, hooks/, app/)
  app/pages/Connections.jsx  connect/sync/disconnect + feeds panel
  app/pages/AiSummary.jsx    AI summary panel on Insights
server/
  .env.example               all settings, documented
  src/index.js               app setup, security headers, routes
  src/config.js  db.js       settings, SQLite tables
  src/routes/                auth, workspace, redirect, integrations, insights
  src/integrations/          oauth.js (tokens + refresh), youtube.js, twitch.js, rss.js,
                             safeFetch.js (SSRF-safe fetcher), scheduler.js
  src/lib/                   schema.js (validation), crypto.js (AES-256-GCM), summary.js (AI prompt + aggregates)
  test/integration.test.mjs  the 14 automated checks
```

### API additions
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/integrations` | platforms (configured? connected?) and feeds — never tokens |
| GET | `/api/integrations/:provider/connect` | returns the Google/Twitch consent URL (`youtube` or `twitch`) |
| GET | `/api/integrations/:provider/callback` | OAuth return URL (validates `state`) |
| POST | `/api/integrations/:provider/sync` | import now |
| DELETE | `/api/integrations/:provider` | revoke + forget tokens |
| POST / DELETE | `/api/integrations/feeds`, `/feeds/:id` | add / remove a feed (`{url, platform}`) |
| POST | `/api/integrations/feeds/:id/sync` | re-import one feed |
| GET / POST | `/api/insights/summary` | latest summary / generate (`{includeTitles}`) |

## 6. Security notes
- Passwords: bcrypt. Sessions: 7-day httpOnly SameSite=Lax cookie. Every query is scoped to the signed-in user.
- Platform tokens: AES-256-GCM encrypted in the database with `TOKEN_ENCRYPTION_KEY`, never sent to the browser. OAuth uses a one-time `state` tied to the signed-in user (10 minutes).
- Feed URLs typed by users are fetched through a guard that blocks private, loopback and link-local addresses (including via DNS tricks and redirects), caps size and time, and returns generic errors.
- Imported titles are untrusted text: they are shown as text only, and the AI prompt tells the model to treat them as data.
- Keep `server/.env` and `server/data/` out of git (already in `.gitignore`). In production `JWT_SECRET` and `TOKEN_ENCRYPTION_KEY` are required.

## 7. Troubleshooting
| Problem | Fix |
|---|---|
| "Can't reach Dablo" | The API isn't running. `npm run dev:all`, then *Try again*. |
| Connect button disabled / "Setup needed" | Keys missing in `server/.env`, or the server wasn't restarted. |
| Google says `redirect_uri_mismatch` | The redirect URI in Google Cloud must be exactly `http://localhost:5173/api/integrations/youtube/callback`. |
| Google says "access blocked" | Add your account under *Test users* on the consent screen. |
| YouTube card says revenue not available | Channel isn't monetised, or the revenue permission wasn't ticked. Reconnect and tick all boxes. |
| *Reconnect needed* | Normal after 7 days in Google *Testing* mode, or if you revoked access. Click *Reconnect*. |
| AI summary error "key was rejected" | Check `ANTHROPIC_API_KEY` for typos and that the account has credit. |
| `better-sqlite3` fails to install | Use Node 20 or 22 LTS (Windows may need "Desktop development with C++" build tools). |
| Start fresh | Stop the server and delete `server/data`. |

## 8. Deploying
Serve the built front end and API from the **same origin** (nginx/Caddy sending `/api` and `/r` to Node, everything else to `dist/`). Set `PUBLIC_URL` to your real domain, add that domain's callback URLs in Google/Twitch, set `NODE_ENV=production` (`cd server && npm start`) and `TRUST_PROXY=1` behind a proxy. For Google, publishing the app (and Google's verification of the sensitive scopes) removes the 7-day login limit.
