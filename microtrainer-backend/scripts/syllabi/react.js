/** Auto-generated syllabus spec for React */
module.exports = {
  "technology": "React",
  "idPrefix": "react",
  "domainHint": "React 18+ components, hooks, and modern frontend apps",
  "sections": [
    {
      "id": "01",
      "title": "React Foundations",
      "modules": [
        {
          "title": "React Landscape & Setup",
          "topics": [
            "What React is (library vs framework)",
            "SPA vs MPA",
            "Create React App vs Vite",
            "React DevTools",
            "Career paths: React, Next.js"
          ],
          "project": null
        },
        {
          "title": "JSX & First Components",
          "topics": [
            "JSX syntax rules",
            "Functional components",
            "className and expressions",
            "Fragments",
            "Component file structure"
          ],
          "project": "Render a profile card component"
        },
        {
          "title": "Props & Composition",
          "topics": [
            "Passing props",
            "Props destructuring",
            "children prop",
            "PropTypes or TypeScript intro",
            "Component composition patterns"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "State & Events",
      "modules": [
        {
          "title": "useState Hook",
          "topics": [
            "State in functional components",
            "Updating state correctly",
            "Object/array state immutability",
            "Lifting state up",
            "Controlled inputs"
          ],
          "project": null
        },
        {
          "title": "Events & Forms",
          "topics": [
            "Synthetic events",
            "onClick, onChange handlers",
            "Controlled vs uncontrolled",
            "Form submit handling",
            "Preventing default"
          ],
          "project": null
        },
        {
          "title": "Lists & Keys",
          "topics": [
            "Rendering lists with map",
            "key prop importance",
            "Filtering and sorting UI",
            "Empty states",
            "List performance basics"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Hooks Deep Dive",
      "modules": [
        {
          "title": "useEffect",
          "topics": [
            "Side effects in React",
            "Dependency array rules",
            "Cleanup functions",
            "Fetching data on mount",
            "Common useEffect bugs"
          ],
          "project": null
        },
        {
          "title": "useRef & useMemo",
          "topics": [
            "DOM refs with useRef",
            "Persisting values without re-render",
            "useMemo for expensive calc",
            "useCallback for stable refs",
            "When optimization matters"
          ],
          "project": null
        },
        {
          "title": "Custom Hooks",
          "topics": [
            "Extracting reusable logic",
            "Naming conventions",
            "Sharing stateful logic",
            "Testing custom hooks",
            "Hook composition patterns"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Routing & Data",
      "modules": [
        {
          "title": "React Router",
          "topics": [
            "BrowserRouter setup",
            "Routes, Route, Link",
            "URL parameters",
            "Nested routes",
            "Protected routes pattern"
          ],
          "project": null
        },
        {
          "title": "Data Fetching Patterns",
          "topics": [
            "fetch in useEffect",
            "Loading and error UI",
            "AbortController cleanup",
            "React Query intro",
            "Server state vs client state"
          ],
          "project": null
        },
        {
          "title": "Context API",
          "topics": [
            "createContext and Provider",
            "useContext",
            "When context helps",
            "Context performance pitfalls",
            "vs Redux/Zustand"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Styling React",
      "modules": [
        {
          "title": "CSS Modules",
          "topics": [
            "Scoped class names",
            "Composing styles",
            "Global vs local",
            "Vite CSS modules",
            "BEM alternative"
          ],
          "project": null
        },
        {
          "title": "CSS-in-JS & Tailwind",
          "topics": [
            "Styled-components awareness",
            "Tailwind with React",
            "Conditional classes",
            "Design tokens",
            "Dark mode in React"
          ],
          "project": null
        },
        {
          "title": "UI Libraries",
          "topics": [
            "Material UI / Chakra overview",
            "Component libraries trade-offs",
            "Theming",
            "Accessibility in UI kits",
            "Customizing components"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Advanced React",
      "modules": [
        {
          "title": "Performance",
          "topics": [
            "React.memo",
            "useMemo/useCallback review",
            "Code splitting lazy()",
            "Profiler API intro",
            "Virtual DOM intuition"
          ],
          "project": null
        },
        {
          "title": "Error Boundaries",
          "topics": [
            "componentDidCatch pattern",
            "Error boundary components",
            "Fallback UI",
            "Logging errors",
            "Resilient UIs"
          ],
          "project": null
        },
        {
          "title": "Portals & Refs",
          "topics": [
            "createPortal for modals",
            "forwardRef",
            "Imperative handle intro",
            "Focus trap in modals",
            "Accessibility for overlays"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "State Management",
      "modules": [
        {
          "title": "Redux Toolkit Intro",
          "topics": [
            "Store, slice, reducer",
            "useSelector, useDispatch",
            "Async thunks",
            "DevTools",
            "When Redux is worth it"
          ],
          "project": null
        },
        {
          "title": "Zustand / Jotai Alternatives",
          "topics": [
            "Lightweight stores",
            "Comparing solutions",
            "Local vs global state",
            "Server cache layers",
            "Choosing state tools"
          ],
          "project": null
        },
        {
          "title": "Forms at Scale",
          "topics": [
            "React Hook Form",
            "Validation with zod/yup",
            "Field arrays",
            "Multi-step forms",
            "Submit and error UX"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Testing React",
      "modules": [
        {
          "title": "React Testing Library",
          "topics": [
            "render, screen queries",
            "userEvent interactions",
            "Testing async UI",
            "Mocking modules",
            "Accessibility-first tests"
          ],
          "project": null
        },
        {
          "title": "Vitest & Jest",
          "topics": [
            "Unit vs integration tests",
            "Snapshot testing cautions",
            "MSW for API mocks",
            "CI test runs",
            "Coverage goals"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Next.js & Ecosystem",
      "modules": [
        {
          "title": "Next.js Overview",
          "topics": [
            "File-based routing",
            "SSR vs SSG vs CSR",
            "API routes",
            "Image optimization",
            "When to adopt Next"
          ],
          "project": null
        },
        {
          "title": "Deployment",
          "topics": [
            "Vercel deploy",
            "Environment variables",
            "Build optimization",
            "Analytics",
            "Production checklist"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Capstone & Career",
      "modules": [
        {
          "title": "Project Architecture",
          "topics": [
            "Folder structure",
            "Feature-based modules",
            "API layer separation",
            "Env config",
            "README and demo"
          ],
          "project": null
        },
        {
          "title": "Capstone: Full SPA",
          "topics": [
            "Auth flow UI",
            "Dashboard with routing",
            "Data from API",
            "Responsive design",
            "Tests for critical paths"
          ],
          "project": "Build task manager or e-commerce UI SPA"
        },
        {
          "title": "Interview Prep",
          "topics": [
            "React reconciliation",
            "Hooks rules",
            "State design questions",
            "Performance scenarios",
            "Take-home project tips"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "11",
      "title": "Production React",
      "modules": [
        {
          "title": "State Machines Intro",
          "topics": [
            "useReducer patterns",
            "XState awareness",
            "Complex UI flows",
            "Side effect isolation",
            "Testing state machines"
          ],
          "project": null
        },
        {
          "title": "Accessibility in React",
          "topics": [
            "ARIA in components",
            "Focus management",
            "Live regions",
            "eslint-plugin-jsx-a11y",
            "Screen reader testing"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "Career & Capstone Plus",
      "modules": [
        {
          "title": "Monorepos & Tooling",
          "topics": [
            "Turborepo/nx awareness",
            "Shared packages",
            "Storybook for components",
            "Chromatic visual tests",
            "Release workflow"
          ],
          "project": null
        },
        {
          "title": "Open Source & Interviews",
          "topics": [
            "Reading React source",
            "RFC awareness",
            "Contributing guide",
            "Live coding tips",
            "System design for frontends"
          ],
          "project": null
        }
      ]
    }
  ]
};
