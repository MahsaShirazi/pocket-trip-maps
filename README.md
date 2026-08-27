# Pocket Trip Maps

**A little more life, close to home.**

Pocket Trip Maps is a map-first way to discover practical day-trip ideas nearby. The first prototype focuses on Pinawa, Manitoba: select the destination, explore its activities, and quickly understand approximate time, cost status, and what to bring.

## First milestone

- Manitoba-first interactive map
- Pinawa marker with smooth zoom
- Channel tubing, suspension bridge, and beach/swimming activity details
- Basic activity filters
- Responsive desktop and mobile layout
- Structured destination data that can grow without scattering content through UI code

All current prices, access conditions, and official links must be verified before public launch.

## Local development

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Technology

React, TypeScript, Vite, Leaflet, and React Leaflet. The included GitHub Actions workflow builds and deploys the static site to GitHub Pages.
