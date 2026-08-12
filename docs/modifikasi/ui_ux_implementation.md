# Mangrove-Eye UI/UX Implementation Guide

## 1. Objective

Transform the current Mangrove-Eye UI into the approved dashboard design direction while preserving existing business logic, data contracts, backend behavior, permissions, routes, and supported functionality.

The approved reference image defines the **target visual language and layout composition**.
The repository defines the **source of truth** for functionality, data, business rules, permissions, routes, and backend behavior.

When the reference image and the repository appear to conflict:
- **do not invent functionality**
- **do not fabricate data**
- **do not modify backend unnecessarily**
- adapt the visual design around what actually exists

---

## 2. Non-Negotiable Rules

1. **Do NOT rewrite backend unnecessarily.**
2. **Do NOT change the database schema unless explicitly required and separately approved.**
3. **Do NOT remove existing functionality.**
4. **Do NOT invent new product features.**
5. **Do NOT fabricate data.**
6. **Preserve permission logic.**
7. **Preserve the validation workflow.**
8. **Preserve map functionality.**
9. **Prefer reusable components.**
10. **Avoid duplicated styles.**
11. **Do not hardcode fake KPI values.**
12. **The screenshot is the visual reference; the repository remains the source of truth.**
13. **Do not replace Leaflet unless absolutely necessary — current map functionality should be preserved.**
14. **Do not merge all UI into a single giant Dashboard component.**

---

## 3. Current Architecture

### 3.1 Technology
- **Backend**: Laravel 13
- **Frontend rendering**: Inertia + React
- **Styling**: Tailwind + custom CSS variables / classes already present in repo
- **Map**: Leaflet / React Leaflet
- **Permissions**: backend permission-based logic / guarded API access
- **Reports**: server-generated report flow already exists

### 3.2 Relevant frontend files (based on current repo understanding)
- `resources/js/Pages/Dashboard.jsx` — current internal dashboard page
- `resources/js/Components/WebGIS/WebGISMap.jsx` — current map implementation
- `resources/js/Components/WebGIS/HotspotPopup.jsx` — hotspot popup UI
- `resources/js/Components/WebGIS/PublicHotspotMap.jsx` — public map variant
- `resources/js/Layouts/AuthenticatedLayout.jsx` — authenticated shell
- `resources/css/app.css` — global design layer / custom variables
- `resources/js/app.jsx` — app bootstrap
- `tailwind.config.js` — theme / token extension if used

### 3.3 Relevant backend / domain files
- `app/Http/Controllers/Api/V1/DashboardController.php`
- `app/Http/Controllers/Api/V1/HotspotController.php`
- `app/Services/FieldValidationService.php`
- `app/Services/ReportService.php`
- `app/Models/Hotspot.php`
- `app/Models/AnalysisRun.php`
- `app/Models/FieldValidation.php`
- `app/Models/ValidationPhoto.php`
- `routes/api.php`

### 3.4 Current data / functionality available for redesign
**Existing functionality:**
- analysis run selection
- AOI display
- hotspot polygons
- hotspot centroids
- hotspot selection
- hotspot priority
- hotspot area
- detected / change-related information
- validation status
- validation history
- observed condition
- confidence (field validation context)
- coordinates depending permission
- geolocation
- photo evidence
- field validation
- hotspot report
- analysis-run report
- filters
- loading/error/empty states

---

## 4. Target Architecture

The current dashboard should be decomposed into clearer visual and component boundaries. Exact component names may differ, but the target structure should resemble:

```text
DashboardPage
├── DashboardShell / AuthenticatedLayout
├── DashboardHeader
│   ├── PageTitle
│   ├── AnalysisRunSelector
│   ├── AnalysisRunReportAction
│   └── UserMenu
├── SummaryMetrics
│   ├── HotspotsMetric
│   ├── TotalAreaMetric
│   ├── HighPriorityMetric
│   └── ValidatedMetric
├── MainWorkspace
│   ├── MapWorkspace
│   │   ├── MangroveMap
│   │   ├── MapLayerControls
│   │   └── MapLegend
│   └── HotspotSidebar
│       ├── HotspotReviewList
│       └── SelectedHotspotPanel
├── DashboardFilters
└── AnalyticsSection
    ├── PriorityDistributionChart
    ├── ValidationStatusChart
    └── ChangeAreaByPriorityChart
```

### Key architectural goals
- Reduce the current monolithic behavior of `Dashboard.jsx`.
- Extract reusable presentational components.
- Keep map logic isolated.
- Keep data derivation memoized and close to relevant sections.
- Keep business logic and permission logic unchanged.

---

## 5. Design-to-Repository Mapping

| Design Element | Exists in Repo? | Current Implementation | Target Implementation | Backend Change Needed? |
|---|---|---|---|---|
| Dashboard page | Yes | Existing dashboard page | Restyled / restructured | No |
| Analysis Run selector | Yes | Existing control / context | Restyled compact header control | No |
| Analysis Run report action | Yes | Existing report functionality | Header action button | No |
| Page title + AOI/location subtitle | Yes | Existing dashboard context can support | Clear contextual header | No |
| KPI summary cards | Yes / Derived | Current counts partly exist | Compact summary metric row | No |
| Hotspots detected metric | Yes | Existing summary/derived count | New KPI component | No |
| Total change area metric | Yes / Derived | Existing `area_ha` totals | New KPI component | No |
| High priority metric | Yes / Derived | Existing hotspot priority data | New KPI component | No |
| Validated hotspots metric | Yes / Derived | Existing validation-related count | New KPI component | No |
| Map workspace | Yes | Existing Leaflet map | Re-composed larger hero map | No |
| AOI boundary layer | Yes | Existing map support | Restyled layer control | No |
| Hotspot polygon layer | Yes | Existing map support | Restyled layer control | No |
| Hotspot centroid layer | Yes | Existing map support | Restyled layer control | No |
| Selected hotspot highlight | Yes | Existing selected state | Stronger visual selected state | No |
| Map legend | Yes / UI enhancement | Implicit via current colors / controls | Explicit compact legend | No |
| Hotspot review list | Yes / Derived | Current list functionality exists in dashboard | Cleaner panel/list UI | No |
| Selected hotspot detail panel | Yes | Existing detail section in dashboard | Redesigned contextual panel | No |
| Overview subsection | Yes | Existing detail fields | Reorganized detail block | No |
| Change evidence subsection | Yes | Existing indices / deltas | Reorganized detail block | No |
| Observation subsection | Yes | Existing observed condition / confidence | Reorganized detail block | No |
| Location subsection | Yes | Existing coordinates with permission logic | Reorganized detail block | No |
| Latest validation subsection | Yes | Existing validation history / latest validation | Reorganized detail block | No |
| Evidence photos subsection | Yes | Existing evidence photo functionality | Reorganized detail block | No |
| Validate hotspot action | Yes | Existing functionality | Restyled primary action | No |
| Use current location action | Yes | Existing geolocation action | Restyled secondary action | No |
| Add photo evidence action | Yes | Existing functionality | Restyled secondary action | No |
| Generate hotspot report action | Yes | Existing functionality | Restyled secondary action | No |
| Filters row | Yes | Existing filters | Restyled unified filter section | No |
| Priority filter | Yes | Existing | Restyled | No |
| Validation status filter | Yes | Existing | Restyled | No |
| Date range filter | Yes | Existing | Restyled | No |
| Area min/max filter | Yes | Existing | Restyled | No |
| Clear filters action | Yes | Existing | Restyled | No |
| Hotspots by Priority chart | Derived from existing data | Not necessarily existing as final chart | Add new chart | No |
| Validation Status Distribution chart | Derived from existing data | Not necessarily existing as final chart | Add new chart | No |
| Change Area by Priority chart | Derived from existing data | Not necessarily existing as final chart | Add new chart | No |
| Dedicated “Restoration” domain | No | Not in current repo | DO NOT IMPLEMENT | N/A |
| Active alert system / notifications | No | Not in current repo | DO NOT IMPLEMENT | N/A |
| Mangrove density layer | No confirmed operational support | Not safe to assume | DO NOT IMPLEMENT | N/A |
| Water bodies layer | No confirmed operational support | Not safe to assume | DO NOT IMPLEMENT | N/A |
| Real-time alert feed | No | Not in current repo | DO NOT IMPLEMENT | N/A |
| Fabricated trend chart | No guaranteed data contract | Not safe to assume | DO NOT IMPLEMENT unless separately validated | N/A |

---

## 6. Existing Functionality vs UI Transformation vs New Functionality

### 6.1 Existing Functionality
These must remain functional and accurate:
- analysis run selection
- AOI context
- hotspot rendering
- hotspot selection
- hotspot filtering
- hotspot priority
- validation status
- date filtering
- area filtering
- hotspot details
- indices and delta values
- observed condition
- confidence (current supported field context)
- precise coordinates based on permission
- geolocation
- photo evidence
- validation history
- report generation
- role / permission behavior
- loading / error / empty states

### 6.2 UI/UX Transformation
These are design improvements around existing functionality:
- sidebar structure and visual style
- page composition
- KPI presentation
- map prominence
- hotspot review list styling
- selected hotspot panel organization
- filter composition
- analytics section styling
- badge system
- button hierarchy
- spacing, typography, and visual hierarchy

### 6.3 New Functionality
Must **not** be introduced silently.
If not supported in current repo, do not implement as part of this redesign:
- restoration metrics
- environmental sensors
- fake alerts
- unsupported map layers
- unsupported time-series analytics
- unsupported AI triage UI if not present in current repo main

---

## 7. Implementation Phases

### Phase 0 — Preparation
- Inspect current dashboard and related components.
- Identify state ownership in `Dashboard.jsx`.
- Identify which current sections can be extracted.
- Identify derived metrics that already exist or can be memoized.
- Confirm styling strategy currently used in repo.

### Phase 1 — Design Foundation
- Define / normalize tokens in existing styling architecture.
- Add or refine color variables.
- Define typography scale.
- Define spacing scale.
- Normalize radius, border, and button styles.

### Phase 2 — Shell / Layout
- Redesign authenticated shell.
- Introduce or restyle left navigation rail.
- Redesign dashboard header and top context.
- Preserve existing auth / user menu behavior.

### Phase 3 — Dashboard Hierarchy
- Build compact context row.
- Rebuild summary metrics as compact KPI row.
- Ensure top section remains compact and clean.

### Phase 4 — Map Workspace
- Recompose map as the hero workspace.
- Keep current Leaflet implementation.
- Move layer toggles and legend into a clean overlay.
- Ensure selected hotspot visual state is obvious.

### Phase 5 — Hotspot Experience
- Redesign hotspot review panel.
- Redesign selected hotspot detail panel.
- Group details into Overview / Change Evidence / Observation / Location / Latest Validation / Evidence / Actions.
- Preserve data and behavior.

### Phase 6 — Analytics
- Implement only charts supported by current data.
- Prefer lightweight charting or existing project-friendly approach.
- Ensure empty state and loading state support.

### Phase 7 — States
- Refine loading states.
- Refine empty states.
- Refine error states.
- Preserve permission-denied states and action gating.

### Phase 8 — Responsive
- Implement desktop and laptop first.
- Then tablet adaptation.
- Then mobile fallback with map still prominent.

### Phase 9 — Accessibility & Polish
- Review focus states.
- Review semantic labels.
- Review button accessibility.
- Review contrast.
- Review hover/selected distinction.

---

## 8. Existing Functionality That MUST REMAIN

Use this as a preservation checklist:
- [ ] Analysis Run selection works.
- [ ] AOI renders correctly.
- [ ] Hotspot polygons render correctly.
- [ ] Hotspot centroids render correctly.
- [ ] Selected hotspot still syncs between list and map.
- [ ] Priority data remains accurate.
- [ ] Validation status remains accurate.
- [ ] Date filtering still works.
- [ ] Area filtering still works.
- [ ] Priority filtering still works.
- [ ] Validation status filtering still works.
- [ ] Hotspot detail values remain accurate.
- [ ] MVI / CMRI / NDVI / NDWI values still appear where relevant.
- [ ] Observed condition remains accurate.
- [ ] Confidence remains accurate according to current repo data contract.
- [ ] Coordinates still respect permission logic.
- [ ] Geolocation action still works.
- [ ] Photo evidence workflow still works.
- [ ] Validation history still works.
- [ ] Analysis Run report generation still works.
- [ ] Hotspot report generation still works.
- [ ] Loading state still works.
- [ ] Empty state still works.
- [ ] Error state still works.

---

## 9. UX Behavior Specification

### 9.1 User opens dashboard
1. User lands on dashboard.
2. User sees page context: dashboard title, AOI/location, current analysis run, report action.
3. User sees compact summary metrics.
4. User sees the map as the main workspace.
5. User sees the hotspot review list and can immediately choose an item needing attention.
6. If a hotspot is selected, contextual details appear in the detail panel.
7. If permission allows, user can validate, capture location, add evidence, or generate report.
8. If the user wants more interpretation, they scroll down to analytics.

### 9.2 Interaction goals
- The first viewport should answer **what area / run is being viewed** and **where the hotspots are**.
- The dashboard should not frontload all deep metadata at once.
- Additional information should be revealed as users investigate.

---

## 10. Hotspot Interaction Specification

### Default
- No hotspot selected.
- Map shows all visible hotspots.
- Right panel shows review list and empty selected state or placeholder.

### Hover
- Optional hover highlight on list rows and map features.
- Hover must not be the only access path; click is primary.

### Selected
- Clicking hotspot polygon, centroid, or list row selects the hotspot.
- Selected hotspot becomes visually emphasized on the map.
- Selected row receives clear state.
- Detail panel updates with selected hotspot information.

### Detail opened
- Selected hotspot panel reveals grouped details.
- Keep one primary CTA.

### Validation state
- Validation badges and latest validation block must reflect current data.

### Permission denied / unavailable
- Hide or disable actions the user cannot perform.
- Respect current permission logic; do not expose actions visually if they should not be available.

### Loading
- Show skeletons or loading states without collapsing layout aggressively.

### Error
- Show clear error messaging if detail, report, or action requests fail.

---

## 11. Filter UX

### Available filters
- Priority
- Validation status
- Detected date range
- Area min / max
- Clear filters

### Behavior
- Default state: all active / unfiltered.
- Active state: clear visual indication that a filter is set.
- Combining filters should narrow both map and list.
- Clear filters should restore defaults.
- If no result remains, show empty state rather than blank unexplained UI.

### Important rule
Do not change filtering logic unless there is a current bug. The redesign is primarily visual and structural.

---

## 12. Map UX

### Principles
- The map is the primary workspace.
- Avoid covering the map with excessive floating UI.
- Keep controls compact and consistent.

### Required behavior
- AOI boundary remains visible.
- Hotspot polygons and/or centroids remain visible according to toggles.
- Selected hotspot is clearly highlighted.
- Zoom/pan controls remain functional.
- Clicking a hotspot updates selection state.
- List and map remain synchronized.

### Map overlay behavior
- Layer toggle overlay should be compact.
- Legend should be small and integrated.
- No unsupported layers should be shown.

---

## 13. Charts / Diagrams

Implement only if the data can be derived from existing repo data.

### 13.1 Hotspots by Priority
- **Source:** count hotspots grouped by priority
- **Transformation:** `groupBy(priority).count()`
- **Fallback:** empty state if no hotspots

### 13.2 Validation Status Distribution
- **Source:** count hotspots grouped by validation status
- **Transformation:** `groupBy(validation_status).count()`
- **Fallback:** empty state if no hotspots

### 13.3 Change Area by Priority
- **Source:** sum hotspot `area_ha` grouped by priority
- **Transformation:** `groupBy(priority).sum(area_ha)`
- **Fallback:** empty state if no hotspots

### Rule
If a chart needs backend data that current dashboard does not receive, derive it from existing loaded hotspot data if reasonable. If not possible or too costly without changing core contracts, do not implement until separately approved.

---

## 14. Component Reusability

Copilot should:
- reuse existing components where sensible
- extract repeated patterns
- avoid one-off duplicated markup
- keep component boundaries clear
- separate data logic from presentation where practical
- avoid creating a new giant `Dashboard.jsx`

Suggested reusable UI patterns:
- metric tile
- panel header
- status badge
- priority badge
- action button group
- field/value row
- chart panel
- empty state block

---

## 15. Styling Strategy

Use the existing styling stack.

### Recommended approach
- Use Tailwind utilities and/or existing CSS variable approach already present in repo.
- Introduce missing design tokens through existing global stylesheet or Tailwind extension.
- Avoid adding a new styling framework.
- Keep semantic tokens centralized.
- Ensure reusable class patterns or component abstractions are created for repeated UI elements.

### Do not
- scatter arbitrary inline styles everywhere
- add random hard-coded colors
- create visually inconsistent one-off controls

---

## 16. Responsive Implementation

### Desktop
- Sidebar expanded
- KPI row in one line
- Main workspace split: map left, detail right
- Analytics in row(s)

### Laptop
- Same structure, slightly tighter spacing
- Ensure filters wrap gracefully

### Tablet
- Sidebar collapses
- KPI cards wrap
- Map remains first
- Hotspot panel moves below or becomes collapsible
- Analytics stack vertically

### Mobile
- Drawer navigation
- Header stacks vertically
- KPI stack or scroll horizontally
- Map stays above fold if possible
- Review list and selected detail move below map
- Filters become multi-row or sheet-style

### Critical requirement
No horizontal overflow. Map remains usable at all sizes.

---

## 17. Accessibility Implementation

Copilot must ensure:
- semantic HTML structure
- visible keyboard focus
- accessible labels for inputs and icon buttons
- aria labels where needed
- contrast compliance for text and badges
- sufficient touch targets
- clear selected state beyond color alone
- list-based fallback navigation for map-heavy interactions

---

## 18. Performance

Because the dashboard includes map and data, implementation should:
- avoid unnecessary re-renders
- memoize derived metric/chart data where appropriate
- avoid expensive recalculations on every render
- preserve map performance
- avoid reinitializing the map unnecessarily
- keep DOM reasonably lean
- only optimize where needed, not prematurely

---

## 19. Visual QA

After implementation, compare the result to the approved reference image.

### Visual QA checklist
- layout hierarchy matches
- spacing feels consistent and clean
- map is dominant
- KPI row is compact
- right-side hotspot review/detail area is balanced
- charts are lower-priority and below the main workspace
- typography hierarchy is correct
- colors are consistent with design tokens
- active / selected states are clear
- no component overlaps or collisions exist

Visual QA should ask not only **“does it work?”** but also **“does it match the approved design language and behavior model?”**

---

## 20. Functional QA

After redesign, verify:
- filters still work
- map still works
- hotspot selection still works
- validation still works
- geolocation still works
- photo evidence still works
- reports still work
- permission logic still works
- loading / error / empty states still work

---

## 21. Regression Prevention

Before changing a component:
1. Understand current behavior.
2. Identify state dependencies.
3. Preserve data contracts.
4. Preserve props and events.
5. Preserve permission checks.
6. Preserve backend integration.
7. Do not delete existing working flows unless intentionally replaced with equivalent or improved behavior.

---

## 22. Forbidden Implementation Patterns

Copilot must NOT:
- fabricate backend data
- hardcode fake KPIs
- invent new API endpoints without real need
- modify database only for cosmetic UI reasons
- remove existing features
- break validation workflow
- replace Leaflet unnecessarily
- introduce unnecessary dependencies
- duplicate components excessively
- leave logic trapped in an overgrown monolithic dashboard file
- use arbitrary colors outside the design system
- use arbitrary inconsistent spacing
- ignore responsive behavior

---

## 23. Acceptance Criteria

### Visual
- Dashboard matches the approved reference composition at high fidelity.
- Major elements have clear hierarchy.
- Map remains the primary workspace.
- No overlapping components exist.
- Spacing is consistent.
- Typography matches the design system.
- Colors follow semantic tokens.
- Component states are visually coherent.

### Functional
- Existing functionality remains operational.
- Filters work.
- Map works.
- Hotspot selection works.
- Validation works.
- Geolocation works.
- Evidence photo actions work.
- Report generation works.
- Permission logic works.

### Responsive
- No horizontal overflow.
- No clipped critical content.
- Map remains usable.
- Filters remain accessible.
- Panels stack or collapse logically.

### Accessibility
- Keyboard navigable.
- Focus visible.
- Labels present.
- Adequate contrast.
- Semantic controls retained.

---

## 24. Implementation Checklist

```text
[ ] Design tokens implemented
[ ] Typography implemented
[ ] Global layout implemented
[ ] Navigation redesigned
[ ] Dashboard header redesigned
[ ] Analysis Run context redesigned
[ ] KPI section redesigned
[ ] Map workspace redesigned
[ ] Map controls restyled
[ ] Hotspot list redesigned
[ ] Hotspot selected state redesigned
[ ] Detail panel redesigned
[ ] Supported charts implemented
[ ] Filters redesigned
[ ] Loading states redesigned
[ ] Empty states redesigned
[ ] Error states redesigned
[ ] Permission states preserved
[ ] Responsive layout implemented
[ ] Accessibility reviewed
[ ] Functional regression checked
[ ] Visual QA performed
```

---

## 25. Most Important Instruction to Copilot

> The reference image defines the **TARGET VISUAL LANGUAGE** and UI composition.
>
> The existing repository defines the **SOURCE OF TRUTH** for functionality, data, business rules, permissions, routes, and backend behavior.
>
> When the reference image and repository appear to conflict, **DO NOT invent functionality** to satisfy the image.
>
> Preserve the repository’s functionality and adapt the visual design around what actually exists.

---

## 26. Browser Verification / Open Questions

The following items may require browser verification during implementation:
- exact responsive behavior of the current Dashboard page
- actual available viewport space around the map on laptop screens
- behavior of Leaflet controls under the new layout
- exact interaction between selected hotspot and detail panel transitions
- whether current evidence photo previews need a modal/lightbox pattern
- whether some navigation items should remain sidebar entries or become section-level tabs because dedicated pages may not exist yet
- whether current report actions should stay in header and detail panel simultaneously or one should be prioritized

These are **implementation decisions**, not backend feature additions.

