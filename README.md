# Mineral cooling-load workspace

A React interface for HVAC project inputs, zone schedules and inspectable illustrative cooling-load results.

## Run

- `npm install`
- `npm run dev`
- `npm run build` creates the production bundle in `dist`.
- `npm run lint` checks application source.
- `node --test scripts/model.test.mjs` verifies model aggregation and adjustments.
- With the dev server running, `node scripts/verify-ui.mjs` checks all eleven pages at 1440, 1024, 768 and 390 pixels, exercises project interactions, and saves screenshots in `artifacts`. It uses locally installed Google Chrome through Playwright.

## Beginner documentation

The root URL opens an introductory landing page. **Open workspace** enters the current project without changing its data, **Start a new project** opens the existing project-creation dialog, and **Read the user guide** opens the beginner documentation. The snowflake button in the workspace top bar returns home. Workspace pages use `/#workspace/project-overview` (and equivalent page slugs), so reloading or sharing a workspace link preserves the destination. Browser Back returns to the previous screen.

The landing page is maintained in `src/Landing.jsx` and `src/Landing.css`, using the shared theme tokens. Its building section diagram explains heat-gain inputs without presenting invented calculation results. Run `node scripts/verify-landing.mjs` with the dev server running to check responsive layouts, entry points, history, and preservation of project data.

Choose **User guide** at the bottom of the sidebar or use the help button in the top bar. The guide is also directly available at `/#guide-start`; individual contents links can be bookmarked. It explains the first calculation step by step, data preparation, every input group, engineering units, how to read and inspect results, project backups and exports, troubleshooting, and the demonstration model's limits. No prior HVAC or application experience is assumed.

The page is maintained in `src/Guide.jsx`. Run `node scripts/verify-guide.mjs` while the development server is running to verify guide navigation, direct links and all four responsive sizes.

## Design system tokens and components

`src/index.css` is the source of truth for named Tailwind v4 theme tokens. The static theme preserves dynamically selected chart colors in production. It defines the Mineral Green, Graphite and Warm Paper palette, semantic and chart colors, IBM Plex Sans and Mono font families, spacing, control/container/panel radii and two restrained shadows. Google Fonts loads only the requested weights.

`src/components.jsx` contains shared buttons, labeled unit fields, selects, notices, empty states, modal dialogs, the responsive hourly chart and the component breakdown. `src/App.css` implements the application shell, worksheet tables and responsive page layouts. No gradients are used.

Navigation collapses at laptop widths and becomes a keyboard-accessible drawer on tablet and mobile. Native HTML dialogs trap focus and support Escape. Numeric inputs use persistent labels, unit suffixes and validation feedback. Tables scroll within their containers; hourly chart values are available in Table view. Component values appear directly beside the breakdown bars.

## Available workflows

- Edit project details and design conditions.
- Create, edit, duplicate and delete zones using accessible custom dialogs.
- Review envelope, internal-load and outdoor-air schedules.
- Recalculate hourly results after input changes.
- Inspect individual component formulas and zone contributions.
- Export hourly CSV, portable project JSON, or a printable report.
- Import versioned project JSON with validation; invalid imports preserve the current project.
- Save inputs and calculation state locally in the browser.

## Calculation scope

This is an interface implementation with an explicitly labeled illustrative steady-state model, not a validated engineering calculation engine. The model uses 24 hourly steps, fixed occupancy and solar profiles, direct U-values, user-entered humidity-ratio difference and uniform solar exposure. It applies safety and diversity to the coincident building peak. Non-coincident peak is the sum of individual zone peaks. All example results are computed from visible inputs rather than hard-coded statistics.

CLTD/SCL/CLF reference-table import and corrections, thermal storage, orientation, editable schedules, individual construction assemblies, SI/IP conversion and certified equipment sizing are not implemented. The reference page identifies the constants as demonstration assumptions and does not claim a published source. Month and indoor relative humidity are recorded design metadata; the model uses the explicit humidity-ratio difference for moisture loads.

Project data stays in local storage. Fonts are requested from Google Fonts. No accounts, collaboration service or backend is configured.
