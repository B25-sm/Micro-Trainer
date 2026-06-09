/** Auto-generated syllabus spec for TypeScript */
module.exports = {
  "technology": "TypeScript",
  "idPrefix": "ts",
  "domainHint": "TypeScript for typed JavaScript applications",
  "sections": [
    {
      "id": "01",
      "title": "TypeScript Foundations",
      "modules": [
        {
          "title": "Why TypeScript",
          "topics": [
            "JS pain points TypeScript solves",
            "Compile vs transpile",
            "tsc and tsconfig.json",
            "IDE benefits",
            "Industry adoption"
          ],
          "project": null
        },
        {
          "title": "Basic Types",
          "topics": [
            "string, number, boolean",
            "arrays and tuples",
            "any, unknown, never",
            "type annotations",
            "type inference"
          ],
          "project": "Type a small utility library"
        },
        {
          "title": "Functions & Objects",
          "topics": [
            "Typed parameters and returns",
            "Optional and default params",
            "Object type aliases",
            "Index signatures",
            "Readonly modifier"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Core Type System",
      "modules": [
        {
          "title": "Unions & Intersections",
          "topics": [
            "Union types |",
            "Intersection types &",
            "Narrowing with typeof",
            "Discriminated unions",
            "Exhaustiveness checking"
          ],
          "project": null
        },
        {
          "title": "Interfaces vs Types",
          "topics": [
            "interface keyword",
            "type aliases",
            "Extending interfaces",
            "Declaration merging",
            "When to use which"
          ],
          "project": null
        },
        {
          "title": "Generics",
          "topics": [
            "Generic functions",
            "Generic interfaces",
            "Constraints extends",
            "Default type parameters",
            "Generic utility patterns"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Advanced Types",
      "modules": [
        {
          "title": "Utility Types",
          "topics": [
            "Partial, Required, Pick, Omit",
            "Record and ReturnType",
            "Parameters type",
            "Awaited",
            "Building custom utilities"
          ],
          "project": null
        },
        {
          "title": "Mapped & Conditional Types",
          "topics": [
            "keyof operator",
            "Mapped types",
            "Conditional types ? :",
            "infer keyword",
            "Template literal types"
          ],
          "project": null
        },
        {
          "title": "Type Guards",
          "topics": [
            "typeof and instanceof guards",
            "User-defined type predicates",
            "Assertion functions",
            "in operator narrowing",
            "Safe parsing patterns"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Classes & OOP",
      "modules": [
        {
          "title": "Classes in TS",
          "topics": [
            "public private protected",
            "implements interface",
            "Abstract classes",
            "Getters/setters",
            "Class generics"
          ],
          "project": null
        },
        {
          "title": "Modules",
          "topics": [
            "ES modules import/export",
            "Namespace awareness",
            "Path aliases",
            "Declaration files .d.ts",
            "DefinitelyTyped @types"
          ],
          "project": null
        },
        {
          "title": "Enums & Literals",
          "topics": [
            "String literal unions",
            "const enums",
            "as const assertions",
            "satisfies operator",
            "Branded types intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "TS with React",
      "modules": [
        {
          "title": "Typing Components",
          "topics": [
            "FC vs explicit props types",
            "Children typing",
            "Event types",
            "useState generics",
            "useRef types"
          ],
          "project": null
        },
        {
          "title": "Hooks & Context",
          "topics": [
            "Custom hook types",
            "Context with generics",
            "Reducer typing",
            "Form libraries with TS",
            "Common React+TS errors"
          ],
          "project": null
        },
        {
          "title": "Third-Party Types",
          "topics": [
            "Installing @types packages",
            "Module augmentation",
            "Typing API responses",
            "zod for runtime validation",
            "End-to-end type safety"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "TS with Node",
      "modules": [
        {
          "title": "Node + TypeScript Setup",
          "topics": [
            "ts-node vs compiled",
            "ESM in Node",
            "tsconfig for backend",
            "nodemon workflow",
            "Debugging TS Node"
          ],
          "project": null
        },
        {
          "title": "Express Typing",
          "topics": [
            "Request/Response generics",
            "Typed middleware",
            "Router types",
            "Error handler typing",
            "Shared types package"
          ],
          "project": null
        },
        {
          "title": "Prisma & tRPC Intro",
          "topics": [
            "Prisma client types",
            "tRPC end-to-end types",
            "Compared to REST",
            "Monorepo types",
            "Production builds"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "Tooling & Quality",
      "modules": [
        {
          "title": "Strict Mode",
          "topics": [
            "strict flag family",
            "noImplicitAny",
            "strictNullChecks",
            "Migrating JS to TS",
            "Incremental adoption"
          ],
          "project": null
        },
        {
          "title": "ESLint & Prettier",
          "topics": [
            "typescript-eslint",
            "Type-aware lint rules",
            "Prettier integration",
            "CI typecheck",
            "Pre-commit hooks"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Capstone",
      "modules": [
        {
          "title": "Capstone Typed App",
          "topics": [
            "Shared types package",
            "React or Node app",
            "Zod validation layer",
            "Tests with types",
            "Build pipeline"
          ],
          "project": "Full-stack typed mini app"
        },
        {
          "title": "Interview Prep",
          "topics": [
            "Variance awareness",
            "any vs unknown",
            "Generic constraints",
            "TS compiler errors reading",
            "Designing API types"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Advanced TypeScript",
      "modules": [
        {
          "title": "Template Literal Types",
          "topics": [
            "String manipulation types",
            "Route typing",
            "SQL query builders",
            "Event name typing",
            "Practical patterns"
          ],
          "project": null
        },
        {
          "title": "Module Augmentation",
          "topics": [
            "Extending third-party types",
            "Global augmentation risks",
            "Declaration merging",
            "Ambient modules",
            "Publishing types"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Tooling & Monorepos",
      "modules": [
        {
          "title": "Project References",
          "topics": [
            "Composite projects",
            "Incremental builds",
            "Monorepo with pnpm workspaces",
            "Shared tsconfig",
            "CI typecheck"
          ],
          "project": null
        },
        {
          "title": "API Codegen",
          "topics": [
            "OpenAPI to types",
            "GraphQL codegen",
            "tRPC routers",
            "Keeping types in sync",
            "Breaking change detection"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "11",
      "title": "Career",
      "modules": [
        {
          "title": "Migrating Large Codebases",
          "topics": [
            "allowJs strategy",
            "JSDoc migration",
            "Team rollout plan",
            "Measuring progress",
            "Interview type challenges"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "TypeScript Plus",
      "modules": [
        {
          "title": "Decorators Stage 3",
          "topics": [
            "Class decorators",
            "Method decorators",
            "Metadata reflection",
            "NestJS connection",
            "Experimental flags"
          ],
          "project": null
        },
        {
          "title": "Performance & Build",
          "topics": [
            "Project references build order",
            "Incremental watch",
            "SWC/esbuild",
            "Bundle size types",
            "Tree shaking TS"
          ],
          "project": null
        },
        {
          "title": "Domain Modeling Types",
          "topics": [
            "Branded IDs",
            "Discriminated unions for state",
            "Parse don't validate",
            "zod infer types",
            "API boundary types"
          ],
          "project": null
        }
      ]
    }
  ]
};
