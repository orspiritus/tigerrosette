# 🐅⚡ TigerRozetka – Improvement & Expansion Proposal (Draft • 09.08.2025)

Structured recommendations to evolve gameplay depth, stability, monetization readiness and technical robustness while preserving current core loop speed and clarity.

---
## 1. Gameplay & Systems

| Priority | Feature | Goal | Outline |
|----------|---------|------|---------|
| High | Stage Banner & Summary | Clear feedback loop | Animated overlay after Stage++ with: Stage #, bonuses, AI drain scaling delta, item rewards, hint for next risk tier. |
| High | Equipment Durability & Repair | Add long‑term resource sink | Each shock decrements durability; 0% disables item stats; shop offers Repair (cost scales with rarity). |
| High | AI Points Curve Balancing | Maintain tension | Non‑linear drain: baseDrain * (1 + fatigue*0.05) and recover reduces if consecutive shocks >1. |
| High | Shock Video Reliability | Feedback clarity | Diagnostics overlay, fallback static frame, preloading & user gesture handshake if autoplay blocked. |
| Medium | Item Rarity Visual FX | Instant recognition | Border glow colors (Common→Epic), subtle pulse for Epic, drop toast includes rarity tag. |
| Medium | Epic Drop Mini-Event | Inject excitement | Short slow‑mo / highlight flash when Epic item appears. |
| Medium | Session Metrics Panel | Player insight | Collapsible panel: avg click interval, shock rate, max streak, stage time. |
| Medium | Risk Preview Dial | Planning tool | Circular gauge fills toward next risk tier with predicted multiplier. |
| Low | Achievement Journal | Retention | Dedicated modal with progress bars and rarity tags. |
| Low | Passive Mods (Future) | Meta depth | Socket simple modifiers (e.g. +5% drain) into equipment at higher levels. |

---
## 2. Economy & Progression

1. Soft Currency (Volts) Uses Expansion:
   - Repairs, Reroll shop stock (future), Cosmetic purchases.
2. Daily Engagement Loop:
   - Daily challenge (e.g. Reach Stage 3 without shock) → bonus XP/Volts.
   - Streak bonus for consecutive daily plays.
3. Progression Pacing Review:
   - Target average session: 3–5 min reaches Stage 2–3, Level 4–5.
   - Introduce XP smoothing to avoid plateaus near level thresholds.
4. Anti‑Snowball Check:
   - Cap protection synergy at 80%, consider diminishing returns above 60%.

---
## 3. UX / UI Enhancements

| Area | Improvement | Rationale |
|------|-------------|-----------|
| HUD | Compact layout mode | More space for outlet on smaller screens. |
| Shop | Sticky equipment summary | Keeps total protection visible when scrolling (mobile). |
| Notifications | Queue w/ priority | Avoid overlap between item drop & stage banner. |
| Accessibility | Colorblind friendly contrast | Replace red/green only cues with shape/icon layering. |
| Feedback | Micro-sound set | Distinct SFX: safe click, risk tier up, shock warning, epic drop. |

---
## 4. Technical Roadmap

### 4.1 Backend & Persistence
- Persist: player level, XP, equipment, durability, last session stats, achievements.
- Prisma schema extensions: EquipmentInstance (id, slot, durability, rarity), PlayerAchievement.
- Migration from SQLite dev to Postgres prod (Neon/Supabase) when scaling.

### 4.2 Real-Time Architecture (Future)
- WebSocket server (NestJS or Fastify+uWebSockets) for true duels.
- State channels: room:score, room:events, matchmaking:lobby.
- Deterministic event model: server authoritative shock windows & AI drain.

### 4.3 Performance & Stability
- Preload critical media (images, shock video) using <link rel="preload">.
- Use requestIdleCallback to prime non-critical animation sprites.
- Introduce simple FPS monitor in dev mode (hidden behind flag).
- Memory audit: release video element after playback to free buffer.

### 4.4 Testing
- Unit: level system, AI drain/recover, protection mitigation.
- Integration: stage progression trigger, item drop probability buckets.
- Visual regression (optional): percy-like snapshots for outlet states.

---
## 5. Analytics & Telemetry (Ethical)
- Events: safe_click, shock, stage_up, item_drop (rarity), equipment_purchase, durability_break.
- Metrics: avg_interval_ms, shock_rate, session_length, retention_d1/d7.
- Privacy: anonymized player ID via Telegram user hash (one-way). Opt-out toggle.

---
## 6. Monetization Preparation (Non-intrusive)
| Phase | Feature | Safeguard |
|-------|---------|----------|
| 1 | Cosmetic outlet skins | Purely visual, no stat changes. |
| 2 | Seasonal Pass | Cosmetic + profile badges only. |
| 3 | Limited boosters (XP +10% 15m) | Soft cap on stacking, no PvP impact. |

No pay-to-win: protection stats strictly gameplay-earned.

---
## 7. Security & Abuse Prevention
- Validate Telegram init data server-side (HMAC check) for auth.
- Rate limit sensitive endpoints (equipment purchase, session submit) via Redis token bucket.
- Server authoritative XP & volt calculation; client sends intents only.
- Replay protection: nonce per action chain.

---
## 8. Shock Video Reliability Task Breakdown
1. Add debug overlay (position: fixed top-left) printing: playing, currentTime, readyState.
2. Preload video via hidden element at app start; clone node on demand.
3. If autoplay fails (catch play() rejection): show Play button overlay that triggers manual start + haptic.
4. Asset fallback strategy: `import` → if error event, swap to `/Media/Pictures/tigrrozetka_a4.png` static flash.
5. Post-play cleanup: remove element, clear global flag.

---
## 9. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Autoplay blocked (policy changes) | Loss of core feedback | Gesture fallback + pre-interaction gating. |
| Protection meta dominance | Reduces risk tension | Diminishing returns + durability decay. |
| Stage pacing too fast | Player overwhelm | Adaptive scaling using recent shock frequency. |
| Network latency (future PvP) | Desync frustration | Server authoritative timeline + client prediction for non-critical visuals. |
| Data loss | Player churn | Periodic autosave + optimistic UI + retry queue. |

---
## 10. KPI Targets (Initial)
- Average Session Length: 3–4 min
- Shock Rate: 12–18% of clicks (healthy tension)
- Retention D1: 30% (target), D7: 10%
- Epic Drop Rate: ~1 per 8–12 minutes active play
- Avg Stage Reached (first 5 sessions): 3.2

---
## 11. Implementation Phasing (Suggested)
| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| 1 | Reliability & Feedback | Shock video fix, Stage Banner, debug overlay, unit tests core systems. |
| 2 | Depth & Economy | Durability, repair costs, rarity visuals, session metrics panel. |
| 3 | Persistence | Backend endpoints, Prisma migration, auth validation. |
| 4 | Real-Time Prep | Architecture spike, WebSocket prototype, matchmaking draft. |
| 5 | Monetization Foundations | Cosmetic skin system baseline, analytics events. |

---
## 12. Quick Wins (Low Effort / High Value)
- Add outline + poster to shock video (visibility).
- Compress large PNG assets (TinyPNG) to reduce load.
- Replace magic numbers in risk logic with named constants.
- Add ESLint rule for exhaustive deps in hooks.
- Introduce simple usePrefersReducedMotion hook for accessibility.

---
## 13. Open Questions
1. Should AI drain scale with current stage or player level more strongly?
2. Do we need a mid-session save for partial equipment durability changes every X actions?
3. Will Stage Banner pause hazard timers or run in parallel?
4. Criteria for Epic rarity assignment—flat % vs weighted by fatigue + stage?
5. Should extreme risk clicks influence future hazard window length adaptively?

---
## 14. Summary
This proposal focuses on making core feedback (shock event) reliable, enriching progression with durability & rarity signaling, and laying groundwork for persistence and real-time multiplayer—while guarding against feature creep via phased sprints and measurable KPIs.

> Next Action Recommended: Implement Shock Video Debug Overlay + Stage Banner (high impact on clarity & retention).
