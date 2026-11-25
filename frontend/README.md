# ResumeAugment AI — Frontend Web Studio

A polished, developer-grade single-page web application for **ResumeAugment AI**, an advanced data-preparation platform for training robust resume-parsing models. Built for machine learning engineers and HR-tech platform teams.

---

## Tech Stack & Architecture

- **React 18 / 19** with functional components, hooks, and context providers
- **Vite** for fast HMR development and optimized production bundling
- **Tailwind CSS v3/v4** with custom theme tokens and design system utilities
- **Framer Motion** for micro-interactions, modal transitions, and smooth toast animations
- **Recharts** for entity frequency bar charts, operation distributions, and token length histograms
- **lucide-react** for clean, modern iconography
- **FastAPI / Mock Hybrid Layer**: Fully wired to the Python FastAPI backend with an automatic offline mock fallback

---

## Design System & Theme Tokens

### Color Palette
- **Headings & Navigation:** Deep Navy (`#0B1F3A`)
- **Primary Actions & Accents:** Teal (`#0FA3A3`), Hover (`#0D8B8B`), Subtle (`#E6F6F6`)
- **Background:** Warm Off-White (`#F7F8FA`) in light mode, Deep Navy Slate (`#070D1B` / `#0B132B`) in dark mode
- **Warnings & Highlights:** Amber (`#F5A524`)
- **Typography:**
  - `Inter` for crisp SaaS interface typography
  - `JetBrains Mono` for markup tokens, IOB labels, and schema tags

### Entity Label Color Chips
Consistent semantic chips across the editor, previewer, gallery, and charts:
- `NAME`: Indigo (`#6366F1`)
- `EMAIL`: Sky (`#0EA5E9`)
- `PHONE`: Emerald (`#10B981`)
- `LOCATION`: Rose (`#F43F5E`)
- `DESIGNATION`: Violet (`#8B5CF6`)
- `COMPANY`: Orange (`#F97316`)
- `COLLEGE`: Cyan (`#06B6D4`)
- `DEGREE`: Fuchsia (`#D946EF`)
- `SKILL`: Lime (`#84CC16`)
- `DATE`: Amber (`#F5A524`)

---

## Key Modules & Workflows

1. **Dashboard & KPIs:**
   - Real-time animated count-up numbers for Base Resumes, Augmented Examples, and Average Variants per Resume.
2. **Resume Annotator & Schema Linter (Split-View):**
   - Left pane: Raw markup editor with instant tag-insertion toolbar and syntax cheat-sheet.
   - Right pane: Live rendered resume preview with color-coded entity highlights and an active schema linter flagging unclosed tags, unknown labels, or malformed sections.
3. **Augmentation Studio & Probability Sliders:**
   - Granular probability tuning across 9 transformation axes (verb swap, synonym replacement, OCR typos, phone/date normalization, section reordering, header style).
   - Instant variant generation with animated progress tracking.
4. **Variant Gallery & Side-by-Side Comparison Modal:**
   - Card grid with operation chips, token counts, and entity statistics.
   - Click-to-inspect modal comparing original vs. augmented resume side-by-side.
   - Visual token-by-token word diff viewer highlighting added, deleted, and unchanged text.
5. **Analytics & Token Distributions:**
   - Entity frequency distribution bar chart (colored by entity label).
   - Augmentation operations frequency chart.
   - Token length histogram.
   - Searchable, sortable dataset table with one-click export for JSONL, CSV, and spaCy DocBin.
6. **Held-Out Generalization Benchmark:**
   - Direct precision, recall, and F1 comparison showing **+84.2% relative F1 gain (+34.0 F1)** on unseen layouts.
   - Per-entity robustness breakdown table.
7. **Settings & Preferences:**
   - Dark/Light mode toggle persisted in `localStorage`.
   - Default variants per resume, random seed configuration, and live backend connection tester.

---

## Quickstart & Installation

### 1. Install Dependencies
```bash
# Using npm:
npm install

# Or using pnpm:
pnpm install
```

### 2. Run the Development Server
```bash
# Using npm:
npm run dev

# Or using pnpm:
pnpm dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`, served directly by the unified FastAPI server at **[http://localhost:8000](http://localhost:8000)**.
