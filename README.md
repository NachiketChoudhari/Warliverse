# WARLI — Visual Grammar & Digital Preservation Studio

An Aavishkar competition project for representing documented Warli visual grammar and supporting digital preservation. Phase 1 provides a structured, rule-based grammar model, modular SVG sketches, a shared canvas, and a Grammar Lab. The project currently has no reference dataset, procedural scene generator, or pose estimation.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install

```sh
npm install
```

## Run locally

```sh
npm run dev
```

Vite prints the local URL after starting, usually `http://localhost:5173`.

## Build

```sh
npm run build
npm run preview
```

## Current Architecture

```text
Reference material
      ↓
Structured visual grammar
      ↓
SVG primitives
      ↓
Motifs
      ↓
Future procedural generation
```

The current grammar engine is a rule-based software representation. It is not a trained machine-learning model.

The application keeps reference-derived information, software configuration, and generated artwork as distinct concepts. No reference dataset is included yet. Numerical constraints will only be added after they are supported by the project's reference dataset; unsupported measurements report a `not-configured` state.

The `/generator` page currently uses seeded procedural composition and clearly labeled prototype/demo layouts. `/deconstruct` demonstrates the structured composition → motif/primitive representation → procedural reconstruction flow using that generator output. Neither feature analyzes source artwork or uses source-backed cultural themes. They are rule-based software features, not trained machine-learning models.

## Current routes

- `/` — project landing page
- `/grammar` — Grammar Lab for configured primitives, motif sketches, structure, and rules
- `/references` — source and documentation structure; currently empty
- `/deconstruct` — inspect and reconstruct a labeled procedural demonstration
- `/generator` — seeded procedural compositions from explicit prototype/demo layouts
- `/pose` — placeholder
- `/personalize` — placeholder
- `/archive` — placeholder

## Stack

React, TypeScript, Vite, React Router, Tailwind CSS, SVG, and Vitest. The app is client-side and requires no database or paid API.

## Reference Data Pipeline

```text
Reference Artwork
        ↓
Source Metadata
        ↓
Motif Observation
        ↓
Grammar Observation
        ↓
Structured Rule
        ↓
Procedural System
```

The reference collection currently contains no records. Source-backed rules will be introduced only after reference material has been recorded and reviewed. Numerical observations must link to supporting source material.

## Checks

```sh
npm test
npm run build
npm run lint
```
