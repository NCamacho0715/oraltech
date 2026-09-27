# Optimización de rendimiento UI: registro de decisión

Priorización aplicada (impacto en fps / costo-riesgo):

## P0 — Composición GPU (máximo impacto, riesgo mínimo)
- `index.css`: fuera `backdrop-filter: blur(10px)` de `.auth-card` (fondo
  opaco: visual idéntico, sin recomposición por frame). Fuera también en los
  modales de `Appointments.jsx` y `Odontogram.jsx` (fondos opacos).
- `transition: all …` → propiedades específicas (`background/border/color,
  transform, box-shadow, opacity`) en `index.css` y 7 archivos (script
  reproducible, sin cambios visuales: `all` con esos tiempos equivale a `ease`
  por defecto donde no se declaraba).
- Fuentes: `@import` en CSS → `<link>` con `preconnect` en `index.html`
  (no bloquea el primer pintado).

## P1 — Renders (alto impacto, riesgo medio)
- `Odontogram.jsx`: `Tooth` fuera del componente + `memo`; `CONVENTIONS` y
  mapas dentales a nivel módulo; `faceMap` con `useMemo` (O(n) una vez en vez
  de ~160 `find` + ~160 `conventions.find` por render); `onSelectFace`
  estable con `useCallback`. De paso se eliminó un bug real: `.reverse()`
  sobre el arreglo compartido del módulo (ahora copia antes de invertir).
- `SignatureCanvas.jsx`: `isDrawing` pasa de `useState` (usado como ref por
  accidente vía `.current`) a `useRef`; `setIsEmpty` solo al terminar el
  trazo en vez de en cada `mousemove` (de ~100 renders/seg a 1 por firma).

## P2 — Diferido (no tocado)
- Calendario semanal (`Appointments.jsx`, 1100+ líneas): re-renderiza 84
  celdas + bloques ante cualquier estado; memoizarlo exige extraer
  componentes con props estables. Riesgo alto para esta pasada; siguiente
  paso recomendado.
- `fadeIn` con `translateY` por sección: barato ya sin blur detrás; se conserva.

## Verificación
- Lint 71 → 68 problemas (se eliminan 3 `static-components` del odontograma;
  cero `no-unused-vars`; resto preexistente), `npm run build` verde.
- Medición de fps: manual en `vite preview` (build prod) con DevTools →
  Performance, antes/después; en `dev` parte del jank es StrictMode+HMR.
