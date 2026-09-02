# Hotel Evaluation — DS/ER & BRB Decision Support System

A web-based Decision Support System for evaluating and ranking hotels around
**Rangamati Sadar, Rangamati Hill District, Bangladesh**, using **Evidential
Reasoning (ER)**, a **Belief Rule Base (BRB)**, and a combined **ER → BRB**
pipeline.

## Features

- **ER (Evidential Reasoning)** — Dempster–Shafer aggregation of multi-criteria
  belief distributions.
- **BRB (Belief Rule Base)** — fuzzy belief-distribution matching degrees,
  activation weights, and ER-based consequent aggregation.
- **Combined (ER → BRB)** — sub-criteria are aggregated within each group by ER,
  then the group beliefs are synthesised into a final score using either ER
  (across groups) or a BRB. Per-group ER results and the final method are
  reported separately.
- **Multi-Hotel Ranking** — compare real hotels around Rangamati Sadar
  (seeded and fully editable) and rank them by final utility.
- **Sensitivity Analysis** — systematic weight sweep and Monte Carlo simulation.
- **Survey Data** — embedded belief-degree survey data.

## Tech Stack

- Backend: Python, Flask, NumPy
- Frontend: HTML, CSS, JavaScript, Chart.js, jsPDF

## Running the app

```bat
start.bat
```

or manually:

```bat
pip install -r backend\requirements.txt
python backend\app.py
```

Then open http://127.0.0.1:5000

## Project structure

```
backend/
  app.py
  data/          (embedded survey + Rangamati hotel seed data)
  engines/       (ER, BRB, Combined, Ranking, Sensitivity)
  routes/        (Flask API blueprints)
frontend/
  index.html
  pages/         (HTML page fragments)
  js/
    api.js, app.js
    pages/       (per-page logic)
    utils/       (charts, export)
  css/style.css
```

## Notes

- Belief degree rows must sum to ≤ 1.0; the remainder is treated as ignorance.
- Group weights must sum to 1.0 and sub-criteria weights within a group should
  sum to 1.0 (the UI validates this with clear messages).
- The ranking page ships with real, editable hotel seeds for Rangamati Sadar;
  use "Add Hotel" / "Edit Beliefs" for your own data.
