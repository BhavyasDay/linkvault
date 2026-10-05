# LinkVault

> **Save it. LinkVault handles the organizing.**

LinkVault is an early-stage personal web library. Paste a URL and the app fetches basic page metadata, classifies the link, suggests tags, and stores it in a searchable library.

## Included in V1

- Responsive dashboard with sidebar
- All Links / Inbox / Recent / Favorites
- Automatically discovered categories
- URL metadata extraction (server route)
- Automatic category + tag heuristics
- Search across titles, descriptions, notes, tags and domains
- Favorites
- Notes
- Local persistence
- JSON export/import
- No API key required for the current V1

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Important

This V1 stores data in the browser's localStorage. It is intentionally easy to run and test. For a public launch, the next production step is authentication + PostgreSQL/Supabase storage, followed by semantic search and an AI classification/summarization layer.

## Roadmap

- [x] Real Next.js application
- [x] Save URL
- [x] Metadata extraction
- [x] Automatic classification
- [x] Automatic tags
- [x] Search
- [x] Favorites
- [x] Notes
- [x] Import/export
- [ ] User accounts
- [ ] Cloud database
- [ ] Semantic search
- [ ] AI summaries
- [ ] Duplicate detection
- [ ] Chrome extension
- [ ] Public beta / Product Hunt
