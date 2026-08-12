# Mangrove-Eye Design System

## 1. Design Philosophy

Mangrove-Eye should feel like a **serious environmental intelligence platform** focused on geospatial investigation, hotspot review, and field validation. It should present complex monitoring data in a way that feels calm, structured, trustworthy, and professional.

### Product character
- **Professional** — built for analysts, validators, NGO users, and stakeholders.
- **Scientific** — data-led, precise, and not visually sensational.
- **Environmental** — grounded in mangrove/ecosystem context without becoming a generic “green website”.
- **Operational** — designed to help users investigate and act, not just view charts.
- **Map-first** — the map is the primary workspace.

### UX philosophy
- **Clarity over density** — not all available data should appear in the first viewport.
- **Progressive disclosure** — dashboard shows summary first; details appear contextually after hotspot selection.
- **Spatial awareness first** — users should understand “where” before “why” and “what next”.
- **Actionable understanding** — the interface should connect hotspot location, hotspot metadata, field validation, evidence, and reporting.
- **Consistency** — identical semantics should always look and behave consistently.

### Mangrove-Eye should feel like
- a focused monitoring workspace
- a premium internal operations tool
- a credible decision-support interface
- a modern but restrained dashboard

### Mangrove-Eye should NOT feel like
- a generic CRUD admin panel
- a crowded analytics wall
- a futuristic sci-fi interface
- a glossy template with excessive decoration
- a dashboard that invents environmental metrics the repository does not support

---

## 2. Visual Principles

### 2.1 Clarity
Use whitespace, structure, and concise labels to reduce cognitive load. Users should quickly identify context, summary, map, and the next action.

### 2.2 Hierarchy
The interface should clearly separate:
1. **Context** — page title, AOI/location, selected analysis run.
2. **Summary** — compact KPI row.
3. **Primary workspace** — map and adjacent hotspot review / selected hotspot panel.
4. **Secondary analytics** — supporting charts below the fold or lower on the page.

### 2.3 Consistency
The same color, spacing, radius, and badge patterns must repeat across KPIs, hotspot status, validation states, and action controls.

### 2.4 Spatial Awareness
The map must remain the hero element. Overlay controls should be lightweight and non-intrusive.

### 2.5 Progressive Disclosure
Deep hotspot metadata such as indices, observation details, coordinates, validation history, and evidence should be displayed only when a hotspot is selected.

### 2.6 Information Density
Use compact summary and side-by-side layout at the top. Reserve larger data breakdowns for lower sections or contextual panels.

### 2.7 Data Readability
Numbers should be easy to scan. Labels should be explicit. Derived charts must remain simple and directly interpretable.

### 2.8 Interaction Clarity
Selected state, active filters, status badges, and actions must be obvious. Users should always understand what item is selected and what action is currently available.

### 2.9 Accessibility
The UI should not rely only on color. Focus states, semantic labels, keyboard navigation, and readable contrast are required.

---

## 3. Layout System

The final approved direction suggests a **left navigation rail + top context + two-dimensional content grid**.

### 3.1 Overall page structure
- **Left sidebar / navigation rail**: persistent vertical navigation.
- **Main content area**: full-height application workspace.
- **Header/context row**: page title, AOI/location context, analysis run selector, report action, user menu.
- **Compact KPI row** below header.
- **Main workspace row**: large map on the left, hotspot review + selected hotspot panel on the right.
- **Filters row** below the main workspace.
- **Analytics row** lower on the page.

### 3.2 Relative measurements
Because exact pixel values cannot be guaranteed from the image alone, implementation should use relative proportions:
- **Sidebar width**: ~220–260 px on desktop.
- **Main content max width**: fluid, full app width inside viewport.
- **Horizontal page padding**: ~24–32 px desktop.
- **Vertical section spacing**: ~16–24 px between stacked sections.
- **Main workspace split**:
  - map area: ~58–66%
  - right column: ~34–42%
- **KPI cards**: 4 compact cards in a single row on desktop.

### 3.3 Grid
Recommended implementation grid:
- 12-column content grid in the main canvas, or equivalent CSS grid.
- Sidebar excluded from content grid.
- Consistent gutters: ~16–24 px.
- The map should span a larger column count than the review/detail column.

### 3.4 Section spacing
- Header → KPI: medium spacing.
- KPI → map workspace: medium spacing.
- Map workspace → filters: medium spacing.
- Filters → analytics: medium spacing.
- Internal panel spacing: small-to-medium spacing.

---

## 4. Dashboard Anatomy

### 4.1 Global Navigation
**Purpose:** persistent navigation to core areas currently supported or visually represented as UI transformations of existing functionality.

**Includes:**
- Brand / logo
- Dashboard
- Profile
- Analysis Runs
- Hotspot List
- Validation
- Reports
- User mini-profile at bottom

**Notes:** In current repository, only Dashboard and Profile are explicit in frontend navigation. The other entries should be treated as **UI enhancement / IA transformation** mapped to existing functionality, not proof of dedicated fully built pages.

### 4.2 Page Context
**Purpose:** establish what workspace the user is viewing.

**Includes:**
- Page title: Dashboard
- AOI/location subtitle: Kwala Serapuh, Langkat
- Analysis Run selector
- Report action
- User account area

### 4.3 Summary Row
**Purpose:** fast interpretation of monitoring state.

**Suggested metrics from existing or directly derived data:**
- Hotspots Detected
- Total Change Area
- High Priority
- Validated Hotspots

### 4.4 Main Geospatial Workspace
**Purpose:** primary operational workspace.

**Layout:**
- large map on left
- review/detail panel on right

**Map content:**
- AOI boundary
- hotspot polygons
- hotspot centroids
- selected hotspot highlight
- compact layer toggles
- zoom controls
- scale line

**Right panel content:**
- hotspot review list (compact)
- selected hotspot details
- hotspot actions

### 4.5 Filters Row
**Purpose:** refine hotspot dataset currently shown.

**Includes:**
- Priority filter
- Validation status filter
- Detected date range
- Area min/max
- Clear filters action

### 4.6 Analytics Section
**Purpose:** support interpretation without competing with the map.

**Allowed charts only if grounded in current repo data:**
- Hotspots by Priority
- Validation Status Distribution
- Change Area by Priority

---

## 5. Color System

Exact HEX values cannot be guaranteed from the image alone. The following values are recommended implementation approximations consistent with the approved visual language.

### 5.1 Brand colors
- **Brand green / primary**: deep mangrove green, approx `#0F4D3C` to `#134B3B`
- **Brand accent green**: muted moss/forest green, approx `#2F6B52`

### 5.2 Background colors
- **App background**: soft off-white / warm neutral, approx `#F7F8F6`
- **Canvas surface**: white, approx `#FFFFFF`
- **Sidebar background**: darker green gradient / layered green surface, approx `#083B2E` to `#0F4D3C`

### 5.3 Surface colors
- **Primary surface**: white
- **Subtle surface**: light neutral tint, approx `#F4F6F4`
- **Muted panel surface**: very light grey-green, approx `#EEF3EE`

### 5.4 Border colors
- **Default border**: soft neutral grey, approx `#E3E8E3`
- **Stronger border**: approx `#D5DDD6`

### 5.5 Text colors
- **Primary text**: very dark neutral, approx `#1D2420`
- **Secondary text**: muted grey-green, approx `#5E6B63`
- **Sidebar text active**: white
- **Sidebar text inactive**: near-white with reduced opacity

### 5.6 Muted colors
- Label / metadata grey: approx `#738178`
- Disabled surface: approx `#F0F2F0`

### 5.7 Semantic colors
#### Priority
- **High priority**: red / coral red, approx `#D94B41`
- **Medium priority**: orange / amber, approx `#E89B2C`
- **Low priority**: yellow / muted gold, approx `#D8C14B`

#### Validation status
- **Validated**: green, approx `#4E9A64`
- **Under Review**: blue, approx `#6EA0D6`
- **Needs Recheck**: amber/yellow, approx `#E7B646`
- **Rejected**: grey-red / muted danger, approx `#C96262`

#### General states
- **Information**: muted blue
- **Warning**: amber
- **Error**: red
- **Success**: green

Use semantic colors sparingly. The dashboard should not become a multicolor surface.

---

## 6. Typography

The image suggests a modern sans-serif interface. Recommended implementation font family:
- **Primary UI font**: Inter
- fallback: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif

### 6.1 Type scale (recommended implementation values)
| Role | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Display / page title | 32 px | 700 | 1.2 | “Dashboard” |
| H1 alt / major section | 24 px | 700 | 1.25 | Major section headers if needed |
| H2 / section title | 18–20 px | 600 | 1.3 | Right panel / analytics section |
| H3 / subheading | 16 px | 600 | 1.35 | Internal grouping labels |
| Body | 14–15 px | 400 | 1.5 | Main text |
| Label | 12–13 px | 500 | 1.4 | Control labels, field labels |
| Caption / metadata | 11–12 px | 400 | 1.4 | Dates, small metadata |
| KPI metric | 32–40 px | 700 | 1.1 | Main metric value |
| KPI unit / sublabel | 13–14 px | 500 | 1.4 | “hotspots”, “ha” |
| Button text | 14 px | 600 | 1.2 | Buttons |

### 6.2 Typography behavior
- Use larger typography only for page title and KPI values.
- Keep list rows compact.
- Metadata should never overpower the map or KPI values.
- Avoid excessive size variation.

---

## 7. Spacing System

Recommended spacing scale:
- `xs` = 4 px
- `sm` = 8 px
- `md` = 12 px
- `lg` = 16 px
- `xl` = 24 px
- `2xl` = 32 px
- `3xl` = 40 px

### Usage
- **Component inner padding**: 12–16 px
- **Card/panel padding**: 16–20 px
- **Section spacing**: 16–24 px
- **Page top/side padding**: 24–32 px
- **List row vertical spacing**: 10–12 px
- **Control group gaps**: 8–12 px

---

## 8. Border & Radius

### Borders
- Default border thickness: 1 px
- Optional strong divider: 1 px with stronger neutral border color

### Radius hierarchy
- **Small radius**: 8 px — badges, inputs, compact controls
- **Medium radius**: 12 px — KPI panels, list panels, detail panels
- **Large radius**: 16 px — major containers, map container, sidebar active item

Do not use oversized rounded shapes everywhere.

---

## 9. Shadows & Elevation

Use shadows lightly.

### Elevation levels
- **None**: default flat surfaces with border
- **Subtle**: soft shadow for elevated cards/panels
- **Floating**: only for overlays like map toggle panel if necessary

Recommended shadow style:
- subtle blur, low opacity, no dramatic depth

The design should feel clean and precise, not “floating glassmorphism”.

---

## 10. Components

### 10.1 Header / Page Context
**Purpose:** orient the user.

**Anatomy:**
- title + subtitle
- analysis run selector
- report action button
- user menu

**States:** default, compact responsive stack.

**Repository mapping:**
- Analysis Run selector: existing functionality
- Report action: existing functionality (analysis-run report)
- User menu: existing layout functionality

### 10.2 Navigation Rail
**Purpose:** global app navigation.

**Style:** dark green vertical panel with active item highlight.

**Responsive:** collapses to icon rail or drawer on smaller widths.

**Repository mapping:**
- Dashboard, Profile exist
- Other entries should be treated as IA/UI transformation mapped to current functionality

### 10.3 KPI Card
**Purpose:** summary metrics.

**Anatomy:** icon, label, large value, optional small unit/subtext.

**States:** default, loading skeleton.

**Repository mapping:** existing or directly derived data.

### 10.4 Map Container
**Purpose:** primary geospatial workspace.

**Anatomy:**
- tile map
- AOI boundary
- hotspot polygons
- hotspot centroids
- selected hotspot visual state
- map controls
- layer toggle overlay
- scale

**Repository mapping:** existing functionality.

### 10.5 Hotspot Review List
**Purpose:** show a small list of hotspots requiring attention.

**Anatomy:** row with hotspot ID, priority badge, status badge, date, area.

**States:** default, hover, selected, empty.

**Repository mapping:** derived from existing hotspot dataset.

### 10.6 Selected Hotspot Panel
**Purpose:** reveal contextual detail only when a hotspot is selected.

**Subsections:**
- Overview
- Change evidence
- Observation
- Location
- Latest validation
- Evidence photos
- Actions

**Repository mapping:** existing functionality.

### 10.7 Filters Row
**Purpose:** refine visible hotspot set.

**Controls:**
- priority select
- validation status select
- date range inputs
- area min/max
- clear filters

**Repository mapping:** existing functionality.

### 10.8 Status Badge
**Purpose:** quick semantic recognition.

**Style:** pill or subtle rounded badge with text.

**States:** high/medium/low priority and validation statuses.

**Repository mapping:** existing functionality.

### 10.9 Action Buttons
**Allowed actions:**
- Validate Hotspot
- Use Current Location
- Add Photo Evidence
- Generate Hotspot Report

**Visual hierarchy:**
- one primary action based on state
- other actions secondary/ghost

**Repository mapping:** existing functionality, permission gated.

### 10.10 Charts
Only include charts supported by existing data or direct derivation.

**Repository mapping:**
- Hotspots by Priority — derived from existing data
- Validation Status Distribution — derived from existing data
- Change Area by Priority — derived from existing data

### 10.11 States
Every component should support:
- default
- hover
- active / selected
- focus-visible
- loading
- empty
- error
- disabled if permission denied or unavailable

---

## 11. Map Design System

### 11.1 Map container
- Large primary canvas
- Rounded corners
- Clear separation from surrounding panels

### 11.2 AOI boundary
- White or very light stroke
- Visible but not dominant
- Dashed or solid depending implementation clarity

### 11.3 Hotspot polygons
- Filled with low-to-medium opacity in priority color
- Distinct stroke to maintain legibility over satellite imagery

### 11.4 Hotspot centroids
- Small circular point markers
- White center or light dot for visibility

### 11.5 Selected hotspot
- Stronger outline / glow / thicker border
- Must be clearly distinguishable from non-selected hotspots

### 11.6 Priority visualization
- High = red
- Medium = orange
- Low = yellow
- Keep saturation controlled so satellite context remains readable

### 11.7 Layer controls
Only include controls aligned with current repo map capability:
- AOI Boundary
- Hotspot Polygons
- Hotspot Centroids
- Selected Highlight

### 11.8 Map interactions
- Click hotspot polygon or centroid → select hotspot
- Selected hotspot updates the detail panel
- Zoom and pan should remain available
- Hover can optionally enhance affordance, but click is primary

### 11.9 Accessibility
- Do not rely solely on color for priority interpretation; pair with legend and detail labels
- Provide list-based fallback navigation to hotspots

---

## 12. Data Visualization

### 12.1 Hotspots by Priority
- **Purpose:** show distribution of hotspot counts by priority
- **Type:** donut chart or ring chart
- **Source:** direct aggregation from hotspot priority
- **Classification:** **DERIVED FROM EXISTING DATA**

### 12.2 Validation Status Distribution
- **Purpose:** show distribution of hotspot validation states
- **Type:** donut chart or ring chart
- **Source:** direct aggregation from validation/hotspot validation status
- **Classification:** **DERIVED FROM EXISTING DATA**

### 12.3 Change Area by Priority
- **Purpose:** show total hotspot area grouped by priority
- **Type:** horizontal bar chart
- **Source:** sum of `area_ha` grouped by priority
- **Classification:** **DERIVED FROM EXISTING DATA**

### Not allowed in current repo-grounded implementation
- restoration progress
- tree planting progress
- real-time alert charts
- sensor metrics
- confidence score distribution if not exposed for dashboard data contract
- unsupported historical trend charts unless valid analysis-run aggregation is explicitly implemented from existing data

---

## 13. Interaction States

### Default
Neutral surface, calm styling, no excessive emphasis.

### Hover
Subtle background tint or border emphasis for list rows and buttons.

### Active / Selected
Clear highlight for active nav item, selected hotspot row, and selected hotspot on the map.

### Focus
Visible keyboard focus ring with accessible contrast.

### Disabled
Reduced contrast while maintaining legibility.

### Loading
Skeleton blocks or spinners consistent with layout.

### Success
Used for completed actions or validated state confirmation.

### Error
Used for load failures, submission errors, or report/upload failures.

### Empty
Show informative empty state messaging without making the page feel broken.

---

## 14. Responsive Design

### Desktop (≥ 1440 px)
- Full sidebar
- KPI in 4 columns
- Large map + right detail column
- Analytics in 2–3 columns

### Laptop (~1280 px)
- Sidebar may stay expanded
- KPI remain compact
- Right column may slightly narrow
- Charts stack more efficiently

### Tablet (~768–1024 px)
- Sidebar collapses to rail or drawer
- KPI may wrap to 2×2
- Map remains first, hotspot panel moves below or into tabs/drawer
- Filters stack into multiple rows

### Mobile (< 768 px)
- Navigation becomes drawer
- Header stacks vertically
- KPI become horizontal cards or stacked tiles
- Map stays near top
- Hotspot review becomes stacked list below map
- Selected hotspot detail becomes accordion/drawer
- Analytics move below with full-width layout

---

## 15. Accessibility

- Ensure text contrast meets WCAG expectations.
- Use semantic HTML for headings, lists, buttons, inputs, and table/list structures.
- Provide visible focus states.
- Ensure every icon button has accessible label text or `aria-label`.
- Use semantic badge labels, not color only.
- Ensure touch targets are at least ~40–44 px.
- Ensure filter controls have explicit labels.
- Keep map interaction supplemented by list interaction for keyboard and screen-reader users.

---

## 16. Do / Don’t

### DO
- Make the map the primary workspace.
- Use compact summary metrics.
- Show hotspot detail contextually after selection.
- Keep supporting analytics below the main workspace.
- Use restrained semantic colors.
- Preserve whitespace and strong alignment.
- Keep labels explicit and calm.

### DON’T
- Put too many charts in the first viewport.
- Add unsupported environmental metrics.
- Add fake real-time alerts.
- Cover the map with oversized overlays.
- Nest cards inside cards excessively.
- Use large decorative gradients or shadows.
- Present every available data field all at once.

---

## 17. Design Tokens

Suggested implementation token table:

| Token | Suggested value / guidance |
|---|---|
| `color.brand.primary` | deep mangrove green (`#0F4D3C` approx) |
| `color.brand.sidebar` | dark green (`#083B2E` approx) |
| `color.background.app` | soft off-white (`#F7F8F6` approx) |
| `color.surface.default` | `#FFFFFF` |
| `color.surface.subtle` | `#F4F6F4` approx |
| `color.border.default` | `#E3E8E3` approx |
| `color.text.primary` | `#1D2420` approx |
| `color.text.secondary` | `#5E6B63` approx |
| `color.priority.high` | `#D94B41` approx |
| `color.priority.medium` | `#E89B2C` approx |
| `color.priority.low` | `#D8C14B` approx |
| `color.status.validated` | `#4E9A64` approx |
| `color.status.underReview` | `#6EA0D6` approx |
| `color.status.needsRecheck` | `#E7B646` approx |
| `color.status.rejected` | `#C96262` approx |
| `font.family.base` | Inter, system-ui, sans-serif |
| `font.size.pageTitle` | 32 px |
| `font.size.sectionTitle` | 18–20 px |
| `font.size.body` | 14–15 px |
| `font.size.caption` | 11–12 px |
| `font.size.metric` | 32–40 px |
| `spacing.xs` | 4 px |
| `spacing.sm` | 8 px |
| `spacing.md` | 12 px |
| `spacing.lg` | 16 px |
| `spacing.xl` | 24 px |
| `spacing.2xl` | 32 px |
| `radius.sm` | 8 px |
| `radius.md` | 12 px |
| `radius.lg` | 16 px |
| `shadow.sm` | subtle low-opacity shadow |
| `shadow.none` | no shadow, border-only |

