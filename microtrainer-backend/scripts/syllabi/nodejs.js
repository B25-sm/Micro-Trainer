/** Auto-generated syllabus spec for Node.js */
module.exports = {
  "technology": "Node.js",
  "idPrefix": "nodejs",
  "domainHint": "Node.js server-side JavaScript and backend APIs",
  "sections": [
    {
      "id": "01",
      "title": "Node Foundations",
      "modules": [
        {
          "title": "Node.js Ecosystem",
          "topics": [
            "V8, libuv, event loop",
            "Node vs browser JS",
            "npm registry",
            "LTS versions",
            "Backend career paths"
          ],
          "project": null
        },
        {
          "title": "First Server",
          "topics": [
            "node command",
            "package.json scripts",
            "CommonJS vs ESM",
            "Reading files with fs",
            "Environment variables"
          ],
          "project": "CLI script that reads a JSON file"
        },
        {
          "title": "Modules & npm",
          "topics": [
            "require/import",
            "Publishing packages intro",
            "semver",
            "package-lock.json",
            "npm scripts workflow"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Core APIs",
      "modules": [
        {
          "title": "File System & Path",
          "topics": [
            "fs promises API",
            "path.join, resolve",
            "Watching files",
            "Streams intro",
            "Working with directories"
          ],
          "project": null
        },
        {
          "title": "HTTP Module",
          "topics": [
            "createServer basics",
            "req, res objects",
            "Routing manually",
            "Status codes",
            "Why frameworks exist"
          ],
          "project": null
        },
        {
          "title": "Events & Streams",
          "topics": [
            "EventEmitter pattern",
            "Readable/writable streams",
            "Pipe and backpressure",
            "Buffer basics",
            "Practical stream use cases"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Express.js",
      "modules": [
        {
          "title": "Express Setup",
          "topics": [
            "Installing express",
            "app, listen",
            "Middleware chain",
            "req.params, query, body",
            "JSON body parser"
          ],
          "project": "REST API for todos"
        },
        {
          "title": "Routing & Middleware",
          "topics": [
            "Router modularization",
            "Custom middleware",
            "Error-handling middleware",
            "Static files",
            "CORS middleware"
          ],
          "project": null
        },
        {
          "title": "Validation & Security",
          "topics": [
            "express-validator",
            "Helmet headers",
            "Rate limiting intro",
            "Input sanitization",
            "Secrets in .env"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Databases",
      "modules": [
        {
          "title": "MongoDB with Mongoose",
          "topics": [
            "Schemas and models",
            "CRUD operations",
            "Population",
            "Indexes intro",
            "Validation in schema"
          ],
          "project": null
        },
        {
          "title": "SQL with pg/Prisma intro",
          "topics": [
            "SQL vs NoSQL trade-offs",
            "Prisma schema",
            "Migrations awareness",
            "Relations",
            "Choosing database"
          ],
          "project": null
        },
        {
          "title": "Authentication",
          "topics": [
            "JWT tokens",
            "bcrypt password hashing",
            "Auth middleware",
            "Refresh tokens intro",
            "Session vs stateless"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Advanced Node",
      "modules": [
        {
          "title": "Async Patterns",
          "topics": [
            "Callbacks to promises",
            "async/await in routes",
            "Parallel vs sequential",
            "Error propagation",
            "Unhandled rejections"
          ],
          "project": null
        },
        {
          "title": "Testing APIs",
          "topics": [
            "Supertest with Jest",
            "Mocking DB",
            "Integration tests",
            "Test databases",
            "CI pipeline"
          ],
          "project": null
        },
        {
          "title": "Logging & Monitoring",
          "topics": [
            "Winston/pino",
            "Request logging",
            "Health check endpoints",
            "PM2 intro",
            "12-factor app"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Architecture",
      "modules": [
        {
          "title": "Project Structure",
          "topics": [
            "MVC / layered architecture",
            "Service layer",
            "Config per environment",
            "Dependency injection intro",
            "API versioning"
          ],
          "project": null
        },
        {
          "title": "WebSockets & Real-time",
          "topics": [
            "socket.io basics",
            "Rooms and events",
            "Scaling websockets",
            "Use cases",
            "Fallback polling"
          ],
          "project": null
        },
        {
          "title": "File Uploads & Jobs",
          "topics": [
            "multer for uploads",
            "Cloud storage intro",
            "Background jobs with Bull",
            "Cron jobs",
            "Email with nodemailer"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "Deployment",
      "modules": [
        {
          "title": "Docker for Node",
          "topics": [
            "Dockerfile basics",
            "docker-compose",
            "Multi-stage builds",
            "Env in containers",
            "Local prod parity"
          ],
          "project": null
        },
        {
          "title": "Cloud Deploy",
          "topics": [
            "Render/Railway/Fly intro",
            "CI/CD GitHub Actions",
            "HTTPS and domains",
            "Scaling awareness",
            "Secrets management"
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
          "title": "Capstone API",
          "topics": [
            "Design REST resources",
            "Auth + CRUD",
            "Tests and docs",
            "Deploy live API",
            "Postman collection"
          ],
          "project": "Production-ready REST API with auth"
        },
        {
          "title": "GraphQL Intro",
          "topics": [
            "Schema and resolvers",
            "vs REST trade-offs",
            "Apollo Server awareness",
            "When GraphQL fits",
            "Learning path"
          ],
          "project": null
        },
        {
          "title": "Interview Prep",
          "topics": [
            "Event loop questions",
            "Express middleware order",
            "Security checklist",
            "System design for APIs",
            "Debugging production Node"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Production Node",
      "modules": [
        {
          "title": "Caching Strategies",
          "topics": [
            "In-memory cache",
            "Redis with ioredis",
            "HTTP cache headers",
            "Cache invalidation",
            "CDN edge caching"
          ],
          "project": null
        },
        {
          "title": "API Design",
          "topics": [
            "REST conventions",
            "Versioning",
            "Pagination patterns",
            "HATEOAS intro",
            "OpenAPI spec"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Microservices & Scale",
      "modules": [
        {
          "title": "Message Queues",
          "topics": [
            "BullMQ jobs",
            "Retry and DLQ",
            "Idempotency keys",
            "Outbox pattern intro",
            "Event-driven APIs"
          ],
          "project": null
        },
        {
          "title": "Observability",
          "topics": [
            "OpenTelemetry intro",
            "Correlation IDs",
            "Metrics and alerts",
            "Load testing k6",
            "Capacity planning"
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
          "title": "Node in Enterprise",
          "topics": [
            "Monolith vs microservices",
            "TypeScript adoption",
            "Legacy migration",
            "On-call practices",
            "Interview system design"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "Node Plus",
      "modules": [
        {
          "title": "Serverless Node",
          "topics": [
            "AWS Lambda handler",
            "Cold starts",
            "Serverless framework intro",
            "Edge functions",
            "When serverless fits"
          ],
          "project": null
        },
        {
          "title": "GraphQL Server",
          "topics": [
            "Apollo Server setup",
            "Resolvers",
            "DataLoader N+1 fix",
            "vs REST",
            "Schema-first design"
          ],
          "project": null
        }
      ]
    }
  ]
};
