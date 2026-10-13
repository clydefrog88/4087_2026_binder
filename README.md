# Team 4087 Voodoo Voltage Technical Binder

Single-page, static site documenting the robot: 3D CAD viewer, subsystem design process, fabrication, software, and season.

Stack: Bun, Vite, React, TypeScript, three.js (react-three-fiber).

## Run

```
bun install
bun run dev
```

## Edit content

Everything on the page comes from `src/content.ts`. All current text is placeholder.

## Theme and logo

- Colors and fonts: tokens at the top of `src/theme.css` (purple and green sampled from the VoodooScout logo).
- Logos: `public/logo-full.png` (hero) and `public/logo-icon.png` (nav and favicon). Paths are set in `team` in `src/content.ts`.

## Add the robot CAD

1. In Onshape, export the assembly as glTF/GLB.
2. Save it as `public/models/robot.glb`.
3. Name sub-assemblies so they contain the `nodeMatch` words for each subsystem in `src/content.ts` (for example `Intake`, `Shooter`). Isolate, ghost, and explode work from those names.

See `public/models/README.md` for tips. Without a GLB, the viewer shows a placeholder robot.

## Print

The Print button uses the browser print dialog. A print stylesheet makes a light, linear version with every subsystem expanded.

## Deploy to GitHub Pages

1. Create a repo and push to `main`.
2. In the repo go to Settings, Pages, and set Source to GitHub Actions.
3. The workflow in `.github/workflows/deploy.yml` builds and deploys on every push.

## Tuning the 3D viewer

All viewer settings are constants in `src/components/Viewer.tsx`:

- Lighting: `environmentIntensity` in `StudioEnv`, plus the `hemisphereLight` and `directionalLight` intensities in `Viewer`.
- Surface finish: `mat.roughness` and `mat.metalness` in `GlbRobot`.
- Ghost look: `GHOST_OPACITY`. Highlight color: `ACCENT`.
- Flicker between flush parts: `Z_TIERS`, `Z_FACTOR_STEP`, `Z_UNITS_STEP` (depth bias by part size).

For instant feedback, run `bun run dev` on your own machine and edit these values; the page updates on save.
