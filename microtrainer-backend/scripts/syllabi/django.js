/** Auto-generated syllabus spec for Django */
module.exports = {
  "technology": "Django",
  "idPrefix": "dj",
  "domainHint": "Django 4+ web framework and Django REST patterns",
  "sections": [
    {
      "id": "01",
      "title": "Django Foundations",
      "modules": [
        {
          "title": "Django Landscape",
          "topics": [
            "Batteries-included philosophy",
            "MVT pattern",
            "Django vs Flask/FastAPI",
            "Python prerequisite",
            "Career paths"
          ],
          "project": null
        },
        {
          "title": "Project Setup",
          "topics": [
            "django-admin startproject",
            "Settings.py overview",
            "runserver",
            "Apps concept",
            "Virtual environment"
          ],
          "project": "Create first Django project"
        },
        {
          "title": "URLs & Views",
          "topics": [
            "urlpatterns",
            "Function-based views",
            "HttpRequest, HttpResponse",
            "Path converters",
            "Reverse URLs"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Templates & Models",
      "modules": [
        {
          "title": "Templates",
          "topics": [
            "Django template language",
            "Template inheritance",
            "Static files",
            "Context variables",
            "Filters and tags"
          ],
          "project": null
        },
        {
          "title": "Models & ORM",
          "topics": [
            "Model fields",
            "Migrations makemigrations migrate",
            "Admin site",
            "QuerySet basics",
            "CRUD in shell"
          ],
          "project": "Blog models with admin"
        },
        {
          "title": "Database Queries",
          "topics": [
            "filter, exclude, get",
            "Ordering and slicing",
            "ForeignKey relations",
            "select_related intro",
            "Aggregation Count, Avg"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Forms & Auth",
      "modules": [
        {
          "title": "Django Forms",
          "topics": [
            "ModelForm",
            "Form validation",
            "Rendering forms in templates",
            "CSRF protection",
            "Form errors UX"
          ],
          "project": null
        },
        {
          "title": "User Authentication",
          "topics": [
            "User model",
            "Login, logout views",
            "LoginRequiredMixin",
            "Permissions",
            "Custom user model intro"
          ],
          "project": null
        },
        {
          "title": "Sessions & Messages",
          "topics": [
            "Session framework",
            "Messages framework",
            "Flash messages",
            "Cookie settings",
            "Security settings"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Class-Based Views",
      "modules": [
        {
          "title": "CBV Fundamentals",
          "topics": [
            "ListView, DetailView",
            "CreateView, UpdateView",
            "DeleteView",
            "Mixins",
            "Generic views workflow"
          ],
          "project": null
        },
        {
          "title": "Templates & Static Advanced",
          "topics": [
            "Custom template tags",
            "Media files",
            "collectstatic",
            "Whitenoise intro",
            "Front-end integration"
          ],
          "project": null
        },
        {
          "title": "Testing Django",
          "topics": [
            "TestCase and Client",
            "Factory fixtures intro",
            "Testing views and models",
            "Coverage",
            "CI for Django"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "REST APIs",
      "modules": [
        {
          "title": "Django REST Framework",
          "topics": [
            "Serializers",
            "APIView and ViewSets",
            "Routers",
            "Browsable API",
            "Permissions classes"
          ],
          "project": "REST API for blog posts"
        },
        {
          "title": "Authentication API",
          "topics": [
            "Token auth",
            "JWT with simplejwt intro",
            "Throttling",
            "Pagination",
            "API versioning"
          ],
          "project": null
        },
        {
          "title": "Filtering & Docs",
          "topics": [
            "django-filter",
            "Search and ordering",
            "OpenAPI/Swagger",
            "API testing with Postman",
            "Error response format"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Advanced Django",
      "modules": [
        {
          "title": "Signals & Middleware",
          "topics": [
            "post_save signals",
            "Custom middleware",
            "Request/response cycle",
            "Caching intro",
            "Celery tasks overview"
          ],
          "project": null
        },
        {
          "title": "Performance",
          "topics": [
            "Query optimization",
            "N+1 problem",
            "Database indexes",
            "Caching with Redis",
            "Profiling queries"
          ],
          "project": null
        },
        {
          "title": "Security",
          "topics": [
            "CSRF, XSS, SQL injection prevention",
            "SECURE_* settings",
            "Password validators",
            "Deployment security",
            "OWASP for Django"
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
          "title": "Production Settings",
          "topics": [
            "DEBUG=False",
            "ALLOWED_HOSTS",
            "Static/media on S3",
            "PostgreSQL",
            "Environment variables"
          ],
          "project": null
        },
        {
          "title": "Deploy Django",
          "topics": [
            "Gunicorn + Nginx",
            "Docker deploy",
            "Heroku/Render intro",
            "Migrations in prod",
            "Logging and monitoring"
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
          "title": "Capstone Web App",
          "topics": [
            "Requirements",
            "Models and admin",
            "Auth and permissions",
            "DRF API optional",
            "Deployed demo"
          ],
          "project": "Full CRUD web app with auth"
        },
        {
          "title": "Channels & Async Intro",
          "topics": [
            "WebSockets in Django",
            "ASGI",
            "When async views help",
            "Django 5 features",
            "Learning roadmap"
          ],
          "project": null
        },
        {
          "title": "Interview Prep",
          "topics": [
            "ORM query questions",
            "MVT explanation",
            "Middleware order",
            "Migration conflicts",
            "System design with Django"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Production Django",
      "modules": [
        {
          "title": "Caching Framework",
          "topics": [
            "Per-view cache",
            "Template fragment cache",
            "Redis cache backend",
            "Cache invalidation",
            "Performance wins"
          ],
          "project": null
        },
        {
          "title": "Custom Management Commands",
          "topics": [
            "management/commands",
            "Cron with django-crontab",
            "Data migrations scripts",
            "Seeding databases",
            "Ops automation"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Scaling & Teams",
      "modules": [
        {
          "title": "Multi-tenant Patterns",
          "topics": [
            "Schema per tenant awareness",
            "Shared database isolation",
            "Subdomain routing",
            "Security implications",
            "SaaS architecture"
          ],
          "project": null
        },
        {
          "title": "Django in Teams",
          "topics": [
            "Code review standards",
            "Settings split",
            "Feature flags",
            "Release process",
            "Interview scenarios"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "11",
      "title": "Advanced Topics",
      "modules": [
        {
          "title": "GeoDjango Intro",
          "topics": [
            "PostGIS awareness",
            "Location queries",
            "Maps integration",
            "Use cases",
            "Learning resources"
          ],
          "project": null
        },
        {
          "title": "GraphQL with Django",
          "topics": [
            "Strawberry/Graphene intro",
            "vs DRF",
            "N+1 in GraphQL",
            "When to adopt",
            "Schema design"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "Django Plus",
      "modules": [
        {
          "title": "Content Security",
          "topics": [
            "CSP headers",
            "XSS in templates",
            "Safe string marking",
            "File upload security",
            "Pen test checklist"
          ],
          "project": null
        }
      ]
    }
  ]
};
