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

## Current routes

- `/` — project landing page
- `/grammar` — Grammar Lab for configured primitives, motif sketches, structure, and rules
- `/deconstruct` — placeholder
- `/generator` — placeholder
- `/pose` — placeholder
- `/personalize` — placeholder
- `/archive` — placeholder

## Stack

React, TypeScript, Vite, React Router, Tailwind CSS, SVG, and Vitest. The app is client-side and requires no database or paid API.

## Checks

```sh
npm test
npm run build
npm run lint
```
