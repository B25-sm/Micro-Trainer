/** Auto-generated syllabus spec for Java */
module.exports = {
  "technology": "Java",
  "idPrefix": "java",
  "domainHint": "Java SE applications and backend services",
  "sections": [
    {
      "id": "01",
      "title": "Java Platform & Setup",
      "modules": [
        {
          "title": "Java Ecosystem & Careers",
          "topics": [
            "JVM, JRE, JDK explained",
            "Java in enterprise, Android, backend",
            "JDK vendors: Oracle, Temurin",
            "IDEs: IntelliJ, VS Code",
            "Career paths with Java"
          ],
          "project": null
        },
        {
          "title": "First Java Program",
          "topics": [
            "class and main method",
            "Compilation vs interpretation on JVM",
            "Packages and directory structure",
            "javac and java commands",
            "Reading compiler errors"
          ],
          "project": "Hello World and simple calculator CLI"
        },
        {
          "title": "Maven/Gradle Intro",
          "topics": [
            "Build tools purpose",
            "pom.xml basics",
            "Dependencies and repositories",
            "Project structure standard",
            "Running tests from build tool"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Language Fundamentals",
      "modules": [
        {
          "title": "Variables & Primitive Types",
          "topics": [
            "byte, short, int, long, float, double",
            "char and boolean",
            "Variable declaration and scope",
            "Literals and constants",
            "Type promotion rules"
          ],
          "project": null
        },
        {
          "title": "Operators & Strings",
          "topics": [
            "Arithmetic and logical operators",
            "String immutability",
            "StringBuilder vs StringBuffer",
            "String methods",
            "Text blocks (Java 15+)"
          ],
          "project": null
        },
        {
          "title": "Control Flow",
          "topics": [
            "if-else and switch",
            "switch expressions",
            "for, while, do-while",
            "break and continue",
            "Enhanced for loop"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Arrays & Collections",
      "modules": [
        {
          "title": "Arrays",
          "topics": [
            "Declaring and initializing arrays",
            "Multi-dimensional arrays",
            "Arrays class utilities",
            "ArrayList vs arrays",
            "Common array algorithms"
          ],
          "project": "Sort and search an array of records"
        },
        {
          "title": "ArrayList & LinkedList",
          "topics": [
            "List interface",
            "ArrayList internals",
            "LinkedList use cases",
            "Iterators",
            "List methods"
          ],
          "project": null
        },
        {
          "title": "Set & Map",
          "topics": [
            "HashSet, TreeSet",
            "HashMap, TreeMap",
            "equals and hashCode contract",
            "Map iteration patterns",
            "Choosing collection types"
          ],
          "project": null
        },
        {
          "title": "Generics",
          "topics": [
            "Generic classes and methods",
            "Type parameters",
            "Wildcards ? extends/super",
            "Type erasure awareness",
            "Generic collections best practices"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "OOP in Java",
      "modules": [
        {
          "title": "Classes & Objects",
          "topics": [
            "Fields, methods, constructors",
            "this keyword",
            "static members",
            "Object class methods",
            "Modeling domain entities"
          ],
          "project": "Design a Student class"
        },
        {
          "title": "Inheritance & Interfaces",
          "topics": [
            "extends keyword",
            "method overriding",
            "abstract classes",
            "interfaces and default methods",
            "Composition vs inheritance"
          ],
          "project": null
        },
        {
          "title": "Polymorphism & Casting",
          "topics": [
            "Upcasting and downcasting",
            "instanceof pattern matching",
            "Dynamic dispatch",
            "Designing for interfaces",
            "Liskov substitution intro"
          ],
          "project": null
        },
        {
          "title": "Encapsulation & Access",
          "topics": [
            "Access modifiers",
            "Getters and setters",
            "Immutable objects",
            "Records (Java 16+)",
            "Sealed classes intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Exceptions & I/O",
      "modules": [
        {
          "title": "Exception Handling",
          "topics": [
            "try-catch-finally",
            "Checked vs unchecked",
            "Custom exceptions",
            "try-with-resources",
            "Best practices"
          ],
          "project": null
        },
        {
          "title": "File I/O & NIO",
          "topics": [
            "File and Path (java.nio.file)",
            "Reading/writing text files",
            "Buffered streams",
            "Serialization awareness",
            "CSV processing"
          ],
          "project": null
        },
        {
          "title": "Logging",
          "topics": [
            "java.util.logging",
            "SLF4J and Logback intro",
            "Log levels",
            "Structured logging",
            "Debugging production issues"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Advanced Java Features",
      "modules": [
        {
          "title": "Lambdas & Streams",
          "topics": [
            "Functional interfaces",
            "Lambda syntax",
            "Method references",
            "Stream pipeline: map/filter/collect",
            "Optional class"
          ],
          "project": null
        },
        {
          "title": "Concurrency Basics",
          "topics": [
            "Threads and Runnable",
            "ExecutorService",
            "Synchronized blocks",
            "Concurrent collections intro",
            "Virtual threads awareness"
          ],
          "project": null
        },
        {
          "title": "Modern Java Features",
          "topics": [
            "var local inference",
            "Records and pattern matching",
            "Modules (JPMS) overview",
            "New API additions by version",
            "Migration strategies"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "JDBC & Database",
      "modules": [
        {
          "title": "JDBC Fundamentals",
          "topics": [
            "Connection, Statement, ResultSet",
            "PreparedStatement and SQL injection",
            "Transactions",
            "Connection pooling intro",
            "CRUD operations"
          ],
          "project": "JDBC CRUD for a simple table"
        },
        {
          "title": "JPA & Hibernate Intro",
          "topics": [
            "ORM concepts",
            "Entity mapping",
            "Repository pattern",
            "Relationships",
            "When to use JPA"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Spring Ecosystem Intro",
      "modules": [
        {
          "title": "Spring Core Concepts",
          "topics": [
            "IoC and DI",
            "@Component, @Autowired",
            "ApplicationContext",
            "Configuration classes",
            "Spring vs plain Java"
          ],
          "project": null
        },
        {
          "title": "Spring Boot Basics",
          "topics": [
            "Starters and auto-configuration",
            "application.properties",
            "REST controllers",
            "Spring Data JPA intro",
            "Running Spring Boot apps"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Testing & Build",
      "modules": [
        {
          "title": "JUnit 5",
          "topics": [
            "@Test, assertions",
            "BeforeEach/AfterEach",
            "Parameterized tests",
            "Mockito intro",
            "Integration tests"
          ],
          "project": null
        },
        {
          "title": "Build & CI",
          "topics": [
            "Maven lifecycle",
            "Packaging JARs",
            "CI with GitHub Actions",
            "Code coverage",
            "Static analysis tools"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Design & Architecture",
      "modules": [
        {
          "title": "SOLID Principles",
          "topics": [
            "Single responsibility",
            "Open-closed",
            "Liskov, Interface segregation, DI",
            "Applying SOLID in Java",
            "Code smells"
          ],
          "project": null
        },
        {
          "title": "Design Patterns",
          "topics": [
            "Singleton, Factory",
            "Strategy, Observer",
            "Repository pattern",
            "When patterns help"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "11",
      "title": "Capstone & Interview",
      "modules": [
        {
          "title": "Capstone: Console or API App",
          "topics": [
            "Requirements and design",
            "Layered architecture",
            "Persistence with JDBC or JPA",
            "REST API with Spring Boot",
            "Documentation"
          ],
          "project": null
        },
        {
          "title": "Deployment & DevOps Intro",
          "topics": [
            "JAR deployment",
            "Docker for Java apps",
            "Health checks",
            "Environment profiles",
            "Monitoring basics"
          ],
          "project": null
        },
        {
          "title": "Java Interview Prep",
          "topics": [
            "Collections deep questions",
            "equals/hashCode",
            "Concurrency scenarios",
            "JVM memory model intro",
            "System design basics"
          ],
          "project": null
        }
      ]
    }
  ]
};
