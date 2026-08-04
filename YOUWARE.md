# Dashboard PQRSD - Ministerio del Interior

## Descripción del Proyecto
Dashboard interactivo para la gestión y monitoreo de documentos PQRSD (Peticiones, Quejas, Reclamos, Sugerencias, Denuncias) de la Dirección de Asuntos Indígenas, ROM y Minorías del Ministerio del Interior de Colombia.

## Características Implementadas
1. **KPIs en Tiempo Real**: Total de documentos, vencidos, pendientes y promedio de días de procesamiento
2. **Gráficos Comparativos**: Distribución por serie documental, distribución mensual y por rangos de días
3. **Panel de Filtros**: Filtrado por serie, subserie, oficina, rango de días y búsqueda por texto
4. **Alertas Automáticas**: Sistema de monitoreo que genera alertas cuando se detectan condiciones críticas
5. **Resumen Ejecutivo**: Análisis de tendencias y métricas clave para toma de decisiones
6. **Mapa de Calor**: Visualización de densidad de documentos por oficina
7. **Sistema de Exportación**: Exportación a CSV de documentos completos, críticos y vencidos
8. **Análisis de Gestores**: Ranking de gestores por volumen de documentos procesados

## Datos
- Archivo fuente: `7ec7ljcklx.xlsx` (52,355 documentos)
- Datos procesados: `src/data/pqrsd_data.json`

## Tecnologías
- React 18 + TypeScript
- Tailwind CSS 3.4
- Framer Motion (animaciones)
- Lucide React (iconos)
- Vite 7.0 (build tool)

## Estructura
```
src/
├── components/
│   └── Dashboard.tsx    # Componente principal del dashboard
├── data/
│   └── pqrsd_data.json  # Datos procesados del Excel
├── types/
│   └── pqrsd.ts         # Definiciones TypeScript
├── App.tsx              # Entry point
├── main.tsx             # Bootstrap
└── index.css            # Estilos globales
```

## Scripts Disponibles
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

### Code Organization Principles

- Write semantic React components with clear component hierarchy
- Use TypeScript interfaces and types to ensure type safety
- Create modular components with clear separation of concerns
- Prioritize maintainability and readability

## Tech Stack

### Core Framework
- **React**: 18.3.1 - Declarative UI library
- **TypeScript**: 5.8.3 - Type-safe JavaScript superset
- **Vite**: 7.0.0 - Next generation frontend build tool
- **Tailwind CSS**: 3.4.17 - Atomic CSS framework

### Routing and State Management
- **React Router DOM**: 6.30.1 - Client-side routing
- **Zustand**: 4.4.7 - Lightweight state management

### Internationalization Support
- **i18next**: 23.10.1 - Internationalization core library
- **react-i18next**: 14.1.0 - React integration for i18next
- **i18next-browser-languagedetector**: 7.2.0 - Browser language detection

### UI and Styling
- **Lucide React**: Beautiful icon library
- **Headless UI**: 1.7.18 - Unstyled UI components
- **Framer Motion**: 11.0.8 - Powerful animation library
- **GSAP**: 3.13.0 - High-performance professional animation library
- **clsx**: 2.1.0 - Conditional className utility

### 3D Graphics and Physics
- **Three.js**: 0.179.1 - JavaScript 3D graphics library
- **Cannon-es**: Modern TypeScript-enabled 3D physics engine
- **Matter.js**: 0.20.0 - 2D physics engine for web

## Technical Standards

### React Component Development Methodology

- Use functional components and React Hooks
- Implement single responsibility principle for components
- Create reusable and composable component architecture
- Use TypeScript for strict type checking

### Styling and Design System

- Use Tailwind CSS design token system
- Apply mobile-first responsive design approach
- Leverage modern layout techniques (Grid, Flexbox)
- Implement thoughtful animations and transitions through Framer Motion and GSAP
- Create immersive 3D visual experiences with Three.js
- Add realistic physics interactions using Cannon-es and Matter.js

### CSS Import Order Rules

**CRITICAL**: `@import` statements must come BEFORE all other CSS statements to avoid PostCSS warnings.

### State Management Approach

- Use Zustand for global state management
- Prioritize React built-in Hooks for local state
- Implement clear data flow and state update patterns
- Ensure state predictability and debugging capabilities

### Performance Optimization Requirements

- Use React.memo and useMemo for component optimization
- Implement code splitting and lazy loading
- Optimize resource loading and caching strategies
- Ensure all interactions work on both touch and pointer devices

## Development Commands

- **Install dependencies**: `npm install`
- **Build project**: `npm run build`

## ⚠️ CRITICAL: Do NOT Modify index.html Entry Point

**WARNING**: This is a Vite + React project. **NEVER** modify this critical line in `index.html`:

```html
<script type="module" src="/src/main.tsx"></script>
```

**Why**: This is the core entry point. Any modification will cause the app to completely stop working.

**Do instead**: Work in `src/` directory - modify `App.tsx`, add components in `src/components/`, pages in `src/pages/`.

**If accidentally modified**: 
1. Restore: `<script type="module" src="/src/main.tsx"></script>`
2. Rebuild: `npm run build`

## Build and Deployment

The project uses Vite build system:
- **Development server**: `http://127.0.0.1:5173`
- **Build output**: `dist/` directory
- **Supports HMR**: Hot Module Replacement
- **Optimized production build**: Automatic code splitting and optimization

## Configuration Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `yw_manifest.json` - Project manifest file
