# Skillora - interactive prototype

Two self-contained, offline front-end prototypes of **Skillora**, a platform where businesses post real challenges and students or employees prove their skills by submitting solutions.

- `skillora-dark/` - starts in the wine and pink dark theme
- `skillora-light/` - starts in the deep teal, mint, navy and blue light theme

Both folders contain the same screens, sample data, interactions and **both themes**. A two-option **Dark / Light** switch in the dashboard top bar lets the user choose either mode instantly and remembers the choice. Only the starting theme differs between the two folders.

## Run it

Open either `index.html` directly in a modern browser. No install, build step, server or internet connection is required.

- Dark start: `skillora-dark/index.html`
- Light start: `skillora-light/index.html`

State is saved in `localStorage`, so refreshes keep your changes. Every page is hash-routed and supports direct links (for example `index.html#/client/settings`). The chosen theme is stored separately under `skillora_theme`.

## See both modes at once

Open `compare.html` in the root folder. It shows the dark and light builds side by side, with a screen picker for the dashboard, challenges, messages, settings, landing page and login. Both panels open directly in the client demo, so the dashboard is visible immediately.

You can also open `skillora-dark/index.html` and `skillora-light/index.html` in two browser windows and place them side by side. Add `?demo=client` or `?demo=student` to sign straight into a demo account.

### Theme controls

- Use the **Dark / Light** control in the dashboard top bar; click either mode to enable it.
- The same control is available under **Settings -> Appearance**.
- The choice persists across refreshes and route changes.
- Force a theme with a query string: `index.html?theme=dark` or `index.html?theme=light`.

## Demo accounts

The sign-in forms are prefilled. Any email containing `@` and a password of at least four characters works.

- **Client** - Nova Tech Solutions
- **Student / Employee** - Ayesha Khan
- **Plan** - starts on Starter (change it in Client -> Settings -> Plan Explorer)

## Suggested demo order

1. **Home** - logo, wordmark, tagline, two sign-in paths.
2. **Student dashboard** - match score, progress chart, recommended challenges, plan card.
3. **Challenges** - search, tabs (All / Active / Evergreen), skill filters.
4. **Challenge detail** - submit a solution; every problem stays open for better ideas.
5. **Client dashboard** - upgrade nudge, latest problems, top solutions, plan card.
6. **Client -> Settings -> Plan Explorer** - compare Starter, Standard and Enterprise; switch plans live; on Enterprise adjust custom AI weights.
7. **Client demo controls** - simulate a new solution (slot frees, challenge becomes evergreen) and simulate a better solution (student notification).
8. **Client -> Post Challenge** - on Enterprise (unlimited active challenges), publish a new problem.
9. **Solutions Inbox** - open a received solution, review AI strengths and gaps, reply, shortlist or mark Best.
10. **Student -> Settings** - add or remove skills (match scores recalculate), activate Premium for unlimited submissions.
11. **Theme choice** - click **Dark** or **Light** in the top bar (or Settings -> Appearance), or open `compare.html` for a side-by-side view.
12. **Reset demo** - Client -> Settings resets all sample data and returns home.

## Plans

| | Starter | Standard | Enterprise |
|---|---|---|---|
| Price | Rs 5,000 / month | Rs 15,000 / month | Rs 20,000 / month |
| Active challenges | 1 | 3 | Unlimited |
| Solutions visible | First 5 per challenge | All | All |
| AI | Basic score | Full strengths and gaps | Full + custom weights |
| Private NDA challenges | - | - | Yes |
| Support | Email, 1-2 days | Priority, same day | Dedicated manager |
| Evergreen challenges | Unlimited | Unlimited | Unlimited |

**Evergreen rule:** a challenge stays Active until its first solution arrives or 30 days pass, then becomes Evergreen and frees its slot. Marking a Best does not close the problem. A better solution even a year later triggers a notification.

## Responsive behaviour

- `> 1100px` - fixed 264px sidebar
- `761-1100px` - icon-only 84px sidebar
- `<= 760px` - hamburger drawer, fixed bottom navigation, single-column layouts, cards instead of tables, full-screen modal sheets
- Tap targets are at least 44px; text contrast targets WCAG AA; `prefers-reduced-motion` is respected.

## Files

```
compare.html        side-by-side dark/light preview

skillora-dark/
  index.html        app shell, starts in dark mode
  theme-dark.css    dark palette and chart/scenery overrides
  theme-light.css   light palette and chart/scenery overrides
  styles.css        layout, components, responsive rules
  app.js            router, pages, theme switch, demo simulations
  data.js           plan config, sample data, localStorage helpers
  assets/           both logo variants and favicon (placeholders)

skillora-light/     same files, starts in light mode
```

To customise the themes, edit `theme-dark.css` and `theme-light.css`; keep the copies in both folders identical. The shared `styles.css`, `app.js` and `data.js` are also identical between folders. The only intentional differences are `data-default-theme` and the initial `theme-color` in each `index.html`.

## Notes

- All companies, people, universities and challenges are fictional.
- The logo files (`assets/logo-dark.png`, `assets/logo-light.png`) and `assets/favicon.ico` are generated placeholders. Replace them with the real brand mark, keeping the same file names.
- Tested at 360, 768, 1366 and 1920px widths with no horizontal scrolling.
- Reset from Client -> Settings, or clear the `skillora_state_v2`, `skillora_session` and `skillora_theme` keys in `localStorage`.
