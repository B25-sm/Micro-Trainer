/** Auto-generated syllabus spec for CSS */
module.exports = {
  "technology": "CSS",
  "idPrefix": "css",
  "domainHint": "modern CSS3 layout, responsive design, and maintainable styles",
  "sections": [
    {
      "id": "01",
      "title": "CSS Foundations",
      "modules": [
        {
          "title": "How CSS Works",
          "topics": [
            "Cascade, specificity, inheritance",
            "Selectors overview",
            "DevTools Styles panel",
            "External vs internal vs inline",
            "CSS career skills"
          ],
          "project": null
        },
        {
          "title": "Selectors Deep Dive",
          "topics": [
            "Element, class, ID",
            "Descendant and child combinators",
            "Attribute selectors",
            ":hover, :focus, :nth-child",
            "Specificity calculation"
          ],
          "project": "Style a profile card"
        },
        {
          "title": "The Cascade & Specificity",
          "topics": [
            "Origin and importance",
            "!important pitfalls",
            "Layer (@layer) intro",
            "Inheritance control",
            "Debugging specificity wars"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Typography & Color",
      "modules": [
        {
          "title": "Fonts & Text",
          "topics": [
            "font-family stacks",
            "font-size, weight, line-height",
            "Google Fonts",
            "text-align, decoration",
            "Readable typography scale"
          ],
          "project": null
        },
        {
          "title": "Colors & Backgrounds",
          "topics": [
            "color formats: hex, rgb, hsl",
            "background-color, image",
            "gradients linear/radial",
            "opacity vs transparency",
            "Dark mode color tokens"
          ],
          "project": null
        },
        {
          "title": "Box Model",
          "topics": [
            "content, padding, border, margin",
            "box-sizing: border-box",
            "Margin collapse",
            "Outline vs border",
            "Sizing width/height"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Layout Fundamentals",
      "modules": [
        {
          "title": "Display & Positioning",
          "topics": [
            "block, inline, inline-block",
            "none and visibility",
            "static, relative, absolute",
            "fixed and sticky",
            "z-index stacking"
          ],
          "project": null
        },
        {
          "title": "Flexbox",
          "topics": [
            "flex container and items",
            "justify-content, align-items",
            "flex-direction, wrap",
            "flex-grow/shrink/basis",
            "Common flex patterns"
          ],
          "project": "Responsive navbar with flex"
        },
        {
          "title": "CSS Grid",
          "topics": [
            "grid-template-columns/rows",
            "gap, fr units",
            "grid-area and placement",
            "Auto-fit/minmax responsive grids",
            "Flexbox vs Grid decision"
          ],
          "project": null
        },
        {
          "title": "Responsive Design",
          "topics": [
            "Mobile-first CSS",
            "Media queries",
            "clamp() and fluid type",
            "Container queries intro",
            "Breakpoints strategy"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Visual Design",
      "modules": [
        {
          "title": "Borders & Shadows",
          "topics": [
            "border-radius",
            "box-shadow layers",
            "filter: blur, brightness",
            "Clipping and masking intro",
            "Neumorphism awareness"
          ],
          "project": null
        },
        {
          "title": "Transitions & Animations",
          "topics": [
            "transition property",
            "transform: translate, scale",
            "@keyframes animations",
            "Animation performance",
            "prefers-reduced-motion"
          ],
          "project": null
        },
        {
          "title": "Modern Effects",
          "topics": [
            "backdrop-filter",
            "blend modes",
            "clip-path",
            "CSS variables (--token)",
            "Theming with custom properties"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Components & Patterns",
      "modules": [
        {
          "title": "Buttons & Cards",
          "topics": [
            "Button states and focus rings",
            "Card layout patterns",
            "Hover/focus accessibility",
            "Component tokens",
            "BEM naming intro"
          ],
          "project": null
        },
        {
          "title": "Navigation Patterns",
          "topics": [
            "Horizontal nav",
            "Hamburger menu CSS",
            "Dropdown basics",
            "Breadcrumbs styling",
            "Sticky header"
          ],
          "project": null
        },
        {
          "title": "Forms Styling",
          "topics": [
            "Input styling cross-browser",
            "Custom checkboxes intro",
            "Validation styles",
            "Focus-visible",
            "Accessible form design"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Advanced CSS",
      "modules": [
        {
          "title": "Pseudo Elements",
          "topics": [
            "::before, ::after",
            "Content property",
            "Decorative patterns",
            "Tooltips with CSS",
            "Counters"
          ],
          "project": null
        },
        {
          "title": "Functions & Units",
          "topics": [
            "calc(), min(), max()",
            "vh/vw/dvh units",
            "aspect-ratio",
            "env() for safe areas",
            "Logical properties"
          ],
          "project": null
        },
        {
          "title": "Architecture",
          "topics": [
            "BEM, ITCSS overview",
            "CSS Modules awareness",
            "Tailwind philosophy",
            "Design systems",
            "Avoiding global leaks"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "Preprocessors & Tooling",
      "modules": [
        {
          "title": "Sass/SCSS Intro",
          "topics": [
            "Variables and nesting",
            "Mixins and extends",
            "Partials and imports",
            "When preprocessors still matter",
            "Compiling Sass"
          ],
          "project": null
        },
        {
          "title": "PostCSS & Autoprefixer",
          "topics": [
            "Vendor prefixes",
            "PostCSS plugins",
            "Build pipeline with Vite",
            "Source maps",
            "Production minification"
          ],
          "project": null
        },
        {
          "title": "Linting & Formatting",
          "topics": [
            "stylelint rules",
            "Prettier for CSS",
            "Style guides",
            "CI checks",
            "Team conventions"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Projects & Capstone",
      "modules": [
        {
          "title": "Clone a Landing Page",
          "topics": [
            "Analyze reference design",
            "HTML structure first",
            "Mobile layout",
            "Desktop enhancements",
            "Polish and QA"
          ],
          "project": null
        },
        {
          "title": "Design System Mini",
          "topics": [
            "Color and type scale",
            "Spacing system",
            "Reusable utility classes",
            "Component library CSS",
            "Documentation"
          ],
          "project": null
        },
        {
          "title": "CSS Interview Topics",
          "topics": [
            "Specificity scenarios",
            "Centering techniques",
            "Flex vs Grid",
            "Performance (repaints)",
            "Common gotchas"
          ],
          "project": null
        },
        {
          "title": "Capstone: Responsive Dashboard",
          "topics": [
            "Sidebar + main grid",
            "Charts area placeholder",
            "Dark/light theme toggle",
            "Accessible focus states",
            "Deploy static site"
          ],
          "project": "Build responsive dashboard UI"
        }
      ]
    },
    {
      "id": "09",
      "title": "Advanced Layout & Motion",
      "modules": [
        {
          "title": "Subgrid & Advanced Grid",
          "topics": [
            "subgrid",
            "Named lines",
            "Overlapping grid items",
            "Masonry intro",
            "Complex layouts"
          ],
          "project": null
        },
        {
          "title": "Motion & Accessibility",
          "topics": [
            "prefers-reduced-motion",
            "Animation performance",
            "Focus-visible styles",
            "Skip animations",
            "Inclusive motion design"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Professional CSS",
      "modules": [
        {
          "title": "Cross-Browser QA",
          "topics": [
            "@supports",
            "Progressive enhancement",
            "Testing matrix",
            "Bug workarounds",
            "Can I Use workflow"
          ],
          "project": null
        },
        {
          "title": "CSS at Scale",
          "topics": [
            "Refactoring strategies",
            "Token pipelines",
            "Documentation",
            "Code review checklist",
            "Senior interview topics"
          ],
          "project": null
        }
      ]
    }
  ]
};
