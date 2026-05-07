// =======================================================
// 🔹 JAVA FULLSTACK QUESTION BANK
// Comprehensive question bank covering Java Backend + Fullstack concepts
// =======================================================

const JAVA_QUESTION_BANK = {
  
  // =======================================================
  // DAY 9: Core Java - Multithreading, JDBC, Annotations, Serialization, Lambda
  // =======================================================
  day9: {
    topic: "Core Java - Multithreading, JDBC & Advanced Features",
    concepts: [
      "Multithreading (Thread, Runnable, synchronization)",
      "JDBC (Database connectivity)",
      "Annotations",
      "Serialization & Deserialization",
      "Lambda Expressions"
    ],
    questions: {
      easy: [
        "What is a thread in Java?",
        "What is the difference between Thread and Runnable?",
        "What is JDBC?",
        "What is an annotation in Java?",
        "What is serialization?",
        "What is a lambda expression?",
        "What is the @Override annotation?",
        "What is the Serializable interface?",
        "What is a functional interface?",
        "What is the transient keyword?"
      ],
      medium: [
        "What is the difference between start() and run() methods?",
        "How do you connect to a database using JDBC?",
        "What is the difference between Statement and PreparedStatement?",
        "How do you create a custom annotation?",
        "What is the difference between serialization and deserialization?",
        "How do you implement a lambda expression?",
        "What is thread synchronization?",
        "What is the purpose of ResultSet in JDBC?",
        "What is the @FunctionalInterface annotation?",
        "How do you prevent a field from being serialized?"
      ],
      hard: [
        "Explain the thread lifecycle in Java.",
        "How do you prevent SQL injection using PreparedStatement?",
        "What is the difference between wait() and sleep()?",
        "How do you implement custom serialization?",
        "Explain the producer-consumer problem with synchronization.",
        "What are the retention policies for annotations?",
        "How do you use reflection to read annotations at runtime?",
        "What is the difference between Serializable and Externalizable?",
        "How do lambda expressions work internally?",
        "What are the JDBC driver types?"
      ]
    }
  },

  // =======================================================
  // DAY 10: Multithreading & I/O, Java 8+ Features
  // =======================================================
  day10: {
    topic: "Advanced Multithreading, File I/O & Java 8+ Features",
    concepts: [
      "Thread lifecycle & methods",
      "File handling (FileReader, FileWriter, BufferedReader)",
      "Lambda expressions",
      "Functional interfaces",
      "Stream API",
      "Method references",
      "Optional class",
      "Date & Time API"
    ],
    questions: {
      easy: [
        "What is the thread lifecycle?",
        "What is FileReader?",
        "What is FileWriter?",
        "What is the Stream API?",
        "What is a method reference?",
        "What is the Optional class?",
        "What is LocalDate?",
        "What is a Predicate?",
        "What is a Consumer?",
        "What is BufferedReader?"
      ],
      medium: [
        "What is the difference between FileReader and BufferedReader?",
        "How do you use the Stream API to filter data?",
        "What is the difference between map() and flatMap()?",
        "How do you use method references?",
        "What is the purpose of Optional.ofNullable()?",
        "How do you calculate age using the Date & Time API?",
        "What is the difference between Predicate and Function?",
        "How do you use join() in multithreading?",
        "What is the difference between intermediate and terminal operations?",
        "How do you format dates using DateTimeFormatter?"
      ],
      hard: [
        "Explain the difference between parallel and sequential streams.",
        "How do you implement custom collectors in Stream API?",
        "What are the performance implications of using Optional?",
        "How do you handle thread deadlock?",
        "What is the difference between Period and Duration?",
        "How do you implement a custom functional interface?",
        "What are the best practices for using streams?",
        "How do you handle exceptions in lambda expressions?",
        "What is the difference between forEach and forEachOrdered?",
        "How do you implement thread-safe file operations?"
      ]
    }
  },

  // =======================================================
  // DAY 11: JDBC, Spring Core & SQL Basics
  // =======================================================
  day11: {
    topic: "JDBC, Spring Framework & SQL Fundamentals",
    concepts: [
      "JDBC architecture & drivers",
      "CRUD operations with JDBC",
      "Spring Framework & IoC",
      "Dependency Injection",
      "Spring Beans & Configuration",
      "SQL basics (DDL, DML, DQL)"
    ],
    questions: {
      easy: [
        "What is JDBC architecture?",
        "What is a JDBC driver?",
        "What is Spring Framework?",
        "What is IoC (Inversion of Control)?",
        "What is Dependency Injection?",
        "What is a Spring Bean?",
        "What is SQL?",
        "What is DDL?",
        "What is DML?",
        "What is a PRIMARY KEY?"
      ],
      medium: [
        "What is the difference between Statement and PreparedStatement?",
        "How do you perform CRUD operations using JDBC?",
        "What is the difference between constructor and setter injection?",
        "What is the difference between ApplicationContext and BeanFactory?",
        "What are bean scopes in Spring?",
        "What is the difference between @Component and @Bean?",
        "How do you create a table in SQL?",
        "What is the difference between WHERE and HAVING?",
        "How do you prevent SQL injection?",
        "What is the Spring bean lifecycle?"
      ],
      hard: [
        "Explain the JDBC connection pooling mechanism.",
        "How do you implement transaction management in JDBC?",
        "What is the difference between XML and annotation-based configuration?",
        "How does Spring resolve circular dependencies?",
        "What are the phases of the Spring bean lifecycle?",
        "How do you implement custom bean post-processors?",
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "How do you optimize SQL queries?",
        "What are the best practices for JDBC resource management?",
        "How do you implement connection pooling in Spring?"
      ]
    }
  },

  // =======================================================
  // DAY 12: Spring Boot, REST APIs, SQL Intermediate & Spring Security
  // =======================================================
  day12: {
    topic: "Spring Boot, REST APIs, SQL & Security",
    concepts: [
      "Spring Boot basics",
      "REST API development",
      "Spring Boot annotations",
      "SQL joins & subqueries",
      "Spring Security",
      "JWT authentication"
    ],
    questions: {
      easy: [
        "What is Spring Boot?",
        "What is a REST API?",
        "What is @RestController?",
        "What is @GetMapping?",
        "What is @PostMapping?",
        "What is a JOIN in SQL?",
        "What is Spring Security?",
        "What is JWT?",
        "What is authentication?",
        "What is authorization?"
      ],
      medium: [
        "What is the difference between @Controller and @RestController?",
        "How do you handle request parameters in Spring Boot?",
        "What is the difference between @RequestBody and @RequestParam?",
        "What is the difference between INNER JOIN and OUTER JOIN?",
        "How do you implement JWT authentication?",
        "What is the difference between authentication and authorization?",
        "How do you use GROUP BY in SQL?",
        "What is @PathVariable used for?",
        "How do you configure CORS in Spring Boot?",
        "What is BCrypt password encoding?"
      ],
      hard: [
        "Explain the Spring Boot auto-configuration mechanism.",
        "How do you implement custom exception handling in Spring Boot?",
        "What is the difference between @Component, @Service, and @Repository?",
        "How do you implement role-based access control in Spring Security?",
        "What are the security best practices for REST APIs?",
        "How do you implement refresh tokens with JWT?",
        "What is the difference between subqueries and joins?",
        "How do you implement pagination in Spring Boot?",
        "What are the performance implications of N+1 query problem?",
        "How do you implement API versioning in Spring Boot?"
      ]
    }
  },

  // =======================================================
  // DAY 13: Fullstack Integration
  // =======================================================
  day13: {
    topic: "Fullstack Integration - Spring Boot + React",
    concepts: [
      "Backend-Frontend integration",
      "REST API consumption",
      "CORS handling",
      "JWT token management",
      "LocalStorage",
      "Protected routes"
    ],
    questions: {
      easy: [
        "How do you integrate Spring Boot with React?",
        "What is CORS?",
        "What is localStorage?",
        "How do you make API calls from React?",
        "What is axios?",
        "What is a proxy in React?",
        "How do you store JWT tokens?",
        "What is a protected route?",
        "What is the Authorization header?",
        "What is fetch API?"
      ],
      medium: [
        "How do you handle CORS in Spring Boot?",
        "What is the difference between fetch and axios?",
        "How do you send JWT tokens in API requests?",
        "How do you implement protected routes in React?",
        "What is the difference between localStorage and sessionStorage?",
        "How do you handle authentication in a fullstack app?",
        "What is the purpose of @CrossOrigin annotation?",
        "How do you handle API errors in React?",
        "What is token-based authentication?",
        "How do you implement logout functionality?"
      ],
      hard: [
        "Explain the complete authentication flow in a fullstack app.",
        "How do you implement refresh token mechanism?",
        "What are the security concerns with storing tokens in localStorage?",
        "How do you handle token expiration in React?",
        "What is the difference between session-based and token-based auth?",
        "How do you implement interceptors for API calls?",
        "What are the best practices for securing a fullstack application?",
        "How do you handle concurrent API requests?",
        "What is CSRF and how do you prevent it?",
        "How do you implement SSO (Single Sign-On)?"
      ]
    }
  },

  // =======================================================
  // DAY 14: Collections Framework & Design Patterns
  // =======================================================
  day14: {
    topic: "Java Collections & Design Patterns",
    concepts: [
      "Collection interfaces (List, Set, Queue, Map)",
      "ArrayList, LinkedList, HashSet, HashMap",
      "Collections utility class",
      "Singleton design pattern",
      "Design pattern best practices"
    ],
    questions: {
      easy: [
        "What is the Collections Framework?",
        "What is an ArrayList?",
        "What is a HashMap?",
        "What is a HashSet?",
        "What is the difference between List and Set?",
        "What is the Singleton pattern?",
        "What is a LinkedList?",
        "What is a TreeSet?",
        "What is the Collections class?",
        "What is a Queue?"
      ],
      medium: [
        "What is the difference between ArrayList and LinkedList?",
        "What is the difference between HashMap and Hashtable?",
        "How do you implement the Singleton pattern?",
        "What is the difference between HashSet and TreeSet?",
        "How do you sort a collection using Collections.sort()?",
        "What is the difference between Comparable and Comparator?",
        "What is the difference between HashMap and LinkedHashMap?",
        "How do you make a Singleton thread-safe?",
        "What is the difference between List and ArrayList?",
        "How do you iterate over a Map?"
      ],
      hard: [
        "Explain the internal working of HashMap.",
        "What is the difference between fail-fast and fail-safe iterators?",
        "How do you implement a thread-safe Singleton?",
        "What is the time complexity of operations in different collections?",
        "How does HashSet ensure uniqueness?",
        "What is the difference between synchronized and concurrent collections?",
        "How do you implement a custom comparator?",
        "What are the different ways to implement Singleton pattern?",
        "How do you handle collisions in HashMap?",
        "What is the load factor in HashMap?"
      ]
    }
  }
};

// =======================================================
// 🔹 GET RANDOM QUESTION BY DIFFICULTY
// =======================================================
function getRandomJavaQuestion(difficulty = "easy", day = null) {
  const days = day ? [JAVA_QUESTION_BANK[`day${day}`]] : Object.values(JAVA_QUESTION_BANK);
  
  const allQuestions = days.flatMap(d => d.questions[difficulty] || []);
  
  if (allQuestions.length === 0) {
    return "What is Java? Explain its features.";
  }
  
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// =======================================================
// 🔹 GET QUESTIONS BY TOPIC
// =======================================================
function getQuestionsByTopic(topic, difficulty = "easy") {
  for (const day of Object.values(JAVA_QUESTION_BANK)) {
    if (day.topic.toLowerCase().includes(topic.toLowerCase())) {
      return day.questions[difficulty] || [];
    }
  }
  return [];
}

// =======================================================
// 🔹 GET ALL CONCEPTS
// =======================================================
function getAllJavaConcepts() {
  return Object.values(JAVA_QUESTION_BANK).flatMap(day => day.concepts);
}

module.exports = {
  JAVA_QUESTION_BANK,
  getRandomJavaQuestion,
  getQuestionsByTopic,
  getAllJavaConcepts
};
