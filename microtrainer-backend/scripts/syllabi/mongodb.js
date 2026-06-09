/** Auto-generated syllabus spec for MongoDB */
module.exports = {
  "technology": "MongoDB",
  "idPrefix": "mongo",
  "domainHint": "MongoDB document database design and operations",
  "sections": [
    {
      "id": "01",
      "title": "MongoDB Foundations",
      "modules": [
        {
          "title": "NoSQL & MongoDB Landscape",
          "topics": [
            "Document model vs relational",
            "When to choose MongoDB",
            "Atlas vs self-hosted",
            "Roles: DBA, backend dev",
            "CAP theorem intro"
          ],
          "project": null
        },
        {
          "title": "Installation & mongosh",
          "topics": [
            "Atlas cluster setup",
            "mongosh shell",
            "databases and collections",
            "insert, find basics",
            "BSON types overview"
          ],
          "project": "Insert and query sample documents"
        },
        {
          "title": "CRUD Operations",
          "topics": [
            "insertOne/Many",
            "find with filters",
            "update operators $set, $inc",
            "delete operations",
            "upsert behavior"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Querying Data",
      "modules": [
        {
          "title": "Query Operators",
          "topics": [
            "Comparison: $gt, $in",
            "Logical: $and, $or",
            "Element: $exists",
            "Array operators",
            "Regex queries"
          ],
          "project": null
        },
        {
          "title": "Projection & Sorting",
          "topics": [
            "Projection inclusion/exclusion",
            "sort, limit, skip",
            "Covered queries intro",
            "Cursor batching",
            "Explain plans"
          ],
          "project": null
        },
        {
          "title": "Aggregation Pipeline",
          "topics": [
            "$match, $group, $project",
            "$lookup join",
            "$unwind",
            "$sort, $limit",
            "Pipeline optimization"
          ],
          "project": "Analytics aggregation report"
        }
      ]
    },
    {
      "id": "03",
      "title": "Data Modeling",
      "modules": [
        {
          "title": "Schema Design Patterns",
          "topics": [
            "Embedding vs referencing",
            "One-to-many patterns",
            "Many-to-many",
            "Bucket pattern intro",
            "Anti-patterns"
          ],
          "project": null
        },
        {
          "title": "Validation & Schema",
          "topics": [
            "JSON Schema validation",
            "Required fields",
            "Enum validation",
            "Migration strategies",
            "Flexible schema trade-offs"
          ],
          "project": null
        },
        {
          "title": "Indexes",
          "topics": [
            "single and compound indexes",
            "Multikey indexes",
            "Text indexes",
            "Index selectivity",
            "explain() for indexes"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Performance & Admin",
      "modules": [
        {
          "title": "Performance Tuning",
          "topics": [
            "Working set",
            "Write concern, read preference",
            "Connection pooling",
            "Profiling slow queries",
            "Sharding intro"
          ],
          "project": null
        },
        {
          "title": "Replication",
          "topics": [
            "Replica set architecture",
            "Primary/secondary elections",
            "Read preferences",
            "Failover",
            "Backup strategies"
          ],
          "project": null
        },
        {
          "title": "Sharding",
          "topics": [
            "Shard key selection",
            "Chunks and balancer",
            "When to shard",
            "Global clusters awareness",
            "Atlas sharding"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Drivers & Apps",
      "modules": [
        {
          "title": "Node.js Driver",
          "topics": [
            "MongoClient connection",
            "CRUD with driver",
            "Sessions and transactions",
            "Change streams intro",
            "Error handling"
          ],
          "project": null
        },
        {
          "title": "Mongoose ODM",
          "topics": [
            "Schemas and models",
            "Middleware hooks",
            "Virtuals and methods",
            "Population",
            "Validation in Mongoose"
          ],
          "project": "Express API with Mongoose"
        },
        {
          "title": "Python PyMongo",
          "topics": [
            "Connection strings",
            "CRUD in Python",
            "Aggregation in PyMongo",
            "pandas integration intro",
            "Choosing driver"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Security & Ops",
      "modules": [
        {
          "title": "Authentication & RBAC",
          "topics": [
            "Users and roles",
            "Least privilege",
            "Network security IP whitelist",
            "TLS connections",
            "Auditing"
          ],
          "project": null
        },
        {
          "title": "Atlas Operations",
          "topics": [
            "Backups and restores",
            "Monitoring alerts",
            "Performance advisor",
            "Data explorer",
            "Triggers/functions intro"
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
          "title": "Capstone Database Design",
          "topics": [
            "Domain modeling exercise",
            "Indexes for queries",
            "Aggregation reports",
            "API integration",
            "Documentation"
          ],
          "project": "Design DB for e-commerce or LMS"
        },
        {
          "title": "Interview Prep",
          "topics": [
            "Embedding vs reference",
            "Index strategies",
            "Aggregation interview tasks",
            "Consistency models",
            "Comparison with SQL"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Atlas & Search",
      "modules": [
        {
          "title": "Atlas Search",
          "topics": [
            "Search indexes",
            "Autocomplete",
            "Facets",
            "Relevance tuning",
            "Comparison with Elasticsearch"
          ],
          "project": null
        },
        {
          "title": "Atlas Data Federation",
          "topics": [
            "Query across S3",
            "Analytics nodes",
            "Data lake use cases",
            "Cost awareness",
            "When to use"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Transactions & Consistency",
      "modules": [
        {
          "title": "Multi-Document ACID",
          "topics": [
            "Sessions API",
            "Transaction limits",
            "Retry logic",
            "Write concern levels",
            "Design for consistency"
          ],
          "project": null
        },
        {
          "title": "Change Streams & Events",
          "topics": [
            "Watching collections",
            "Resume tokens",
            "Event-driven architectures",
            "Outbox with Mongo",
            "Integration patterns"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Migration & Ops",
      "modules": [
        {
          "title": "SQL to Mongo Migration",
          "topics": [
            "Schema mapping",
            "ETL tools",
            "Dual-write period",
            "Validation",
            "Rollback planning"
          ],
          "project": null
        },
        {
          "title": "Backup & Disaster Recovery",
          "topics": [
            "Point-in-time recovery",
            "Cross-region backups",
            "Restore drills",
            "RPO/RTO",
            "Compliance"
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
          "title": "MongoDB Certifications",
          "topics": [
            "Associate DBA path",
            "Study resources",
            "Hands-on labs",
            "Production war stories",
            "Interview whiteboard tasks"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "MongoDB Plus",
      "modules": [
        {
          "title": "Time Series Collections",
          "topics": [
            "timeField and metaField",
            "Retention policies",
            "IoT metrics use case",
            "Query patterns",
            "vs regular collections"
          ],
          "project": null
        },
        {
          "title": "Atlas Triggers & Functions",
          "topics": [
            "Database triggers",
            "Serverless functions",
            "Event bridges",
            "Limits and costs",
            "Integration examples"
          ],
          "project": null
        },
        {
          "title": "Compass & Data Tools",
          "topics": [
            "Schema analysis",
            "Index suggestions",
            "Aggregation builder",
            "Import/export",
            "Team collaboration"
          ],
          "project": null
        },
        {
          "title": "Polyglot Persistence",
          "topics": [
            "MongoDB with PostgreSQL",
            "CQRS read models",
            "Sync strategies",
            "Choosing document vs relational",
            "Hybrid architectures"
          ],
          "project": null
        }
      ]
    }
  ]
};
