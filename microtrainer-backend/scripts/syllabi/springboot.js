/** Auto-generated syllabus spec for Spring Boot */
module.exports = {
  "technology": "Spring Boot",
  "idPrefix": "sb",
  "domainHint": "Spring Boot 3 microservices and enterprise Java APIs",
  "sections": [
    {
      "id": "01",
      "title": "Spring Boot Foundations",
      "modules": [
        {
          "title": "Spring Ecosystem",
          "topics": [
            "Spring vs Spring Boot",
            "Auto-configuration",
            "Starter dependencies",
            "Spring Initializr",
            "Enterprise Java careers"
          ],
          "project": null
        },
        {
          "title": "First Application",
          "topics": [
            "@SpringBootApplication",
            "Embedded Tomcat",
            "application.properties",
            "Running JAR",
            "Actuator health intro"
          ],
          "project": "Hello REST endpoint"
        },
        {
          "title": "Dependency Injection",
          "topics": [
            "@Component, @Service, @Repository",
            "@Autowired",
            "Constructor injection",
            "ApplicationContext",
            "Bean scopes"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "REST APIs",
      "modules": [
        {
          "title": "REST Controllers",
          "topics": [
            "@RestController",
            "@GetMapping, PostMapping",
            "RequestBody and ResponseEntity",
            "PathVariable, RequestParam",
            "HTTP status codes"
          ],
          "project": null
        },
        {
          "title": "Validation & DTOs",
          "topics": [
            "@Valid and Bean Validation",
            "DTO pattern",
            "Exception handling @ControllerAdvice",
            "Error response format",
            "API documentation with Springdoc"
          ],
          "project": "CRUD REST API for Product"
        },
        {
          "title": "Testing Controllers",
          "topics": [
            "@WebMvcTest",
            "MockMvc",
            "Integration tests @SpringBootTest",
            "Testcontainers intro",
            "Test profiles"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Data Access",
      "modules": [
        {
          "title": "Spring Data JPA",
          "topics": [
            "Entity and @Id",
            "JpaRepository",
            "Query methods",
            "Relationships @OneToMany",
            "Transactions @Transactional"
          ],
          "project": null
        },
        {
          "title": "Database Configuration",
          "topics": [
            "H2 dev vs PostgreSQL prod",
            "Flyway/Liquibase migrations",
            "Connection pooling",
            "Lazy loading pitfalls",
            "N+1 solutions"
          ],
          "project": null
        },
        {
          "title": "Advanced JPA",
          "topics": [
            "JPQL and @Query",
            "Specifications",
            "Pagination Pageable",
            "Auditing",
            "Projections"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Security",
      "modules": [
        {
          "title": "Spring Security Basics",
          "topics": [
            "SecurityFilterChain",
            "In-memory auth demo",
            "PasswordEncoder BCrypt",
            "Form login vs API",
            "CSRF for APIs"
          ],
          "project": null
        },
        {
          "title": "JWT Authentication",
          "topics": [
            "Stateless APIs",
            "JWT generation and validation",
            "Filter chain for JWT",
            "Role-based access @PreAuthorize",
            "Refresh token pattern"
          ],
          "project": null
        },
        {
          "title": "OAuth2 Overview",
          "topics": [
            "OAuth2 flows",
            "Spring Authorization Server awareness",
            "Social login",
            "Resource server",
            "Enterprise SSO intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Microservices",
      "modules": [
        {
          "title": "Configuration",
          "topics": [
            "application.yml profiles",
            "Externalized config",
            "@ConfigurationProperties",
            "Secrets management",
            "12-factor config"
          ],
          "project": null
        },
        {
          "title": "OpenFeign & REST Client",
          "topics": [
            "Service-to-service calls",
            "Resilience4j circuit breaker",
            "Timeouts and retries",
            "Service discovery intro",
            "API gateway awareness"
          ],
          "project": null
        },
        {
          "title": "Messaging",
          "topics": [
            "Spring Kafka/Rabbit intro",
            "Event-driven design",
            "Idempotent consumers",
            "Saga pattern awareness",
            "When messaging fits"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Observability & Ops",
      "modules": [
        {
          "title": "Actuator & Metrics",
          "topics": [
            "Health, info endpoints",
            "Micrometer metrics",
            "Prometheus/Grafana intro",
            "Distributed tracing",
            "Structured logging"
          ],
          "project": null
        },
        {
          "title": "Docker & Kubernetes Intro",
          "topics": [
            "Dockerfile for Spring Boot",
            "K8s deployment overview",
            "Liveness/readiness probes",
            "ConfigMaps",
            "Cloud-native patterns"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "Capstone",
      "modules": [
        {
          "title": "Capstone Microservice",
          "topics": [
            "Domain design",
            "JPA entities",
            "Secured REST API",
            "Tests and docs",
            "Docker deploy"
          ],
          "project": "E-commerce or library API service"
        },
        {
          "title": "Interview Prep",
          "topics": [
            "Bean lifecycle",
            "Transaction propagation",
            "Security filter order",
            "JPA vs JDBC",
            "System design Java"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Integration & Messaging",
      "modules": [
        {
          "title": "Spring Integration",
          "topics": [
            "@Scheduled tasks",
            "Email with JavaMailSender",
            "File processing batches",
            "Retry with Spring Retry",
            "Idempotent consumers"
          ],
          "project": null
        },
        {
          "title": "Caching",
          "topics": [
            "@Cacheable",
            "Redis cache manager",
            "Cache eviction",
            "Performance testing",
            "Cache pitfalls"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Cloud Native",
      "modules": [
        {
          "title": "Spring Cloud Config",
          "topics": [
            "Centralized configuration",
            "Refresh scope",
            "Secrets in cloud",
            "Profiles per env",
            "Git-backed config"
          ],
          "project": null
        },
        {
          "title": "Resilience Patterns",
          "topics": [
            "Circuit breaker deep dive",
            "Bulkhead",
            "Rate limiter",
            "Timeout configuration",
            "Chaos testing intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Testing & Quality",
      "modules": [
        {
          "title": "Contract Testing",
          "topics": [
            "Consumer-driven contracts",
            "Spring Cloud Contract intro",
            "API compatibility",
            "CI pipelines",
            "Versioning services"
          ],
          "project": null
        },
        {
          "title": "Performance Testing",
          "topics": [
            "JMeter/Gatling intro",
            "Load test Spring Boot",
            "Connection pool tuning",
            "GC awareness",
            "Profiling tools"
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
          "title": "Enterprise Patterns",
          "topics": [
            "DDD bounded contexts",
            "Hexagonal architecture",
            "Event sourcing intro",
            "CQRS awareness",
            "Interview architecture questions"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "Spring Plus",
      "modules": [
        {
          "title": "Batch Processing",
          "topics": [
            "Spring Batch jobs",
            "Chunk-oriented processing",
            "Scheduling",
            "Error skip policies",
            "Large file imports"
          ],
          "project": null
        },
        {
          "title": "GraphQL Java",
          "topics": [
            "Spring GraphQL",
            "Schema mapping",
            "Data fetchers",
            "vs REST controllers",
            "When GraphQL in Java"
          ],
          "project": null
        },
        {
          "title": "Kotlin Interop",
          "topics": [
            "Kotlin with Spring",
            "Data classes",
            "Coroutines awareness",
            "Mixed projects",
            "Team adoption"
          ],
          "project": null
        },
        {
          "title": "Native Images & GraalVM",
          "topics": [
            "AOT compilation intro",
            "Startup time benefits",
            "Reflection config",
            "Trade-offs vs JVM",
            "When teams adopt native"
          ],
          "project": null
        }
      ]
    }
  ]
};
