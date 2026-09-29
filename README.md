# WARLI — Visual Grammar & Digital Preservation Studio

An Aavishkar competition project for representing documented Warli visual grammar and supporting digital preservation. The application includes a structured, rule-based grammar model, source-aware reference architecture, procedural SVG composition, deconstruction/reconstruction, a browser-local Pose Mirror, and product-format personalization.

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
Procedural compositions
      ↓
Deconstruction and product-format personalization
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
- `/pose` — browser-local pose landmarks mapped into the configured SVG human figure, with deterministic Demo Mode
- `/personalize` — deterministic product previews and exports using existing procedural demo layouts
- `/archive` — placeholder

## Stack

React, TypeScript, Vite, React Router, Tailwind CSS, SVG, MediaPipe Tasks Vision, browser webcam APIs, and Vitest. The app is client-side and requires no database or paid API.

## Pose Mirror

The Pose Mirror uses the pretrained MediaPipe Pose Landmarker Lite task as a local pose-estimation component. Its model asset is included at `public/models/pose_landmarker_lite.task`; the runtime and WASM assets are bundled from the installed `@mediapipe/tasks-vision` package. The camera stream is passed directly from the browser video element to the local detector. Frames are not uploaded, saved, or sent to an external API.

MediaPipe provides body landmarks. The project's software normalizes those coordinates and maps them to the configured human figure's circle head, triangle body, and line limbs. This mapping is rule-based; it does not train or claim to teach the pose model Warli visual grammar. The camera preview is mirrored for natural interaction, and normalized horizontal coordinates are inverted so the structural figure follows the preview consistently. Camera access generally requires localhost or HTTPS; Demo Mode provides deterministic simulated landmarks through the same mapping path when camera access or hardware is unavailable.

The model asset is distributed from Google's official MediaPipe model storage: [Pose Landmarker Lite task](https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task). MediaPipe's web integration and browser setup are documented in the [official Pose Landmarker Web guide](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js).

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

## Personalization Studio

The Personalization Studio maps four seeded compositions from the existing generator into configured product preview areas. Layouts are procedural demonstrations, not source-backed cultural themes. Product canvas sizes and safe areas are renderer settings, not physical or cultural measurements. The studio validates compositions with the existing grammar validator and exports the selected vector preview and a deterministic, versioned JSON record without timestamps or user/session data.

## Checks

```sh
npm test
npm run build
npm run lint
```
