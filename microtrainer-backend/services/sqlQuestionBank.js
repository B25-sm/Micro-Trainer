// =======================================================
// 🔹 SQL COMPLETE QUESTION BANK
// Comprehensive question bank covering 150 SQL concepts
// =======================================================

const SQL_QUESTION_BANK = {
  
  // =======================================================
  // SECTION 1: SQL Basics (Concepts 1-10)
  // =======================================================
  sqlBasics: {
    topic: "SQL Basics - Introduction & Core Concepts",
    concepts: [
      "SQL fundamentals",
      "Databases",
      "SQL vs NoSQL",
      "Tables, rows, columns",
      "Keys and constraints",
      "Data types"
    ],
    questions: {
      easy: [
        "What is SQL?",
        "What are databases?",
        "What is the difference between SQL and NoSQL?",
        "What is a table?",
        "What is a row and column?",
        "What is a primary key?",
        "What is a foreign key?",
        "What is a constraint?",
        "What is NULL?",
        "What are SQL data types?"
      ],
      medium: [
        "What is the difference between SQL and NoSQL databases?",
        "What are the advantages of relational databases?",
        "What is the difference between a primary key and a unique key?",
        "How do foreign keys maintain referential integrity?",
        "What are the common SQL data types?",
        "What is the difference between CHAR and VARCHAR?",
        "What is the difference between INT and BIGINT?",
        "How do you handle NULL values in SQL?",
        "What is the difference between a table and a view?",
        "What are the ACID properties?"
      ],
      hard: [
        "Explain the CAP theorem in the context of databases.",
        "What are the trade-offs between SQL and NoSQL?",
        "How do you design a database schema?",
        "What is database normalization?",
        "What are the different normal forms?",
        "How do you handle data integrity?",
        "What is referential integrity?",
        "What are composite keys?",
        "How do you choose appropriate data types?",
        "What are the performance implications of different data types?"
      ]
    }
  },

  // =======================================================
  // SECTION 2: DDL Commands (Concepts 11-20)
  // =======================================================
  ddlCommands: {
    topic: "DDL - Data Definition Language",
    concepts: [
      "CREATE, ALTER, DROP",
      "TRUNCATE",
      "Constraints (NOT NULL, UNIQUE, CHECK, DEFAULT)"
    ],
    questions: {
      easy: [
        "What is DDL?",
        "What is the CREATE statement?",
        "What is the ALTER statement?",
        "What is the DROP statement?",
        "What is the TRUNCATE statement?",
        "What is the difference between DROP and TRUNCATE?",
        "What is NOT NULL constraint?",
        "What is UNIQUE constraint?",
        "What is CHECK constraint?",
        "What is DEFAULT constraint?"
      ],
      medium: [
        "How do you create a table with multiple constraints?",
        "What is the difference between DROP TABLE and DELETE FROM?",
        "How do you add a column to an existing table?",
        "How do you modify a column's data type?",
        "How do you drop a column from a table?",
        "What is the difference between TRUNCATE and DELETE?",
        "How do you add a constraint to an existing table?",
        "How do you remove a constraint?",
        "What is the syntax for CHECK constraint?",
        "How do you set a default value for a column?"
      ],
      hard: [
        "What are the performance implications of TRUNCATE vs DELETE?",
        "How do you handle schema migrations in production?",
        "What are the best practices for ALTER TABLE operations?",
        "How do you implement cascading constraints?",
        "What is the difference between RESTRICT and CASCADE?",
        "How do you rename a table safely?",
        "What are the locking implications of DDL statements?",
        "How do you implement database versioning?",
        "What are the risks of dropping columns?",
        "How do you handle backward compatibility in schema changes?"
      ]
    }
  },

  // =======================================================
  // SECTION 3: DML Commands (Concepts 21-30)
  // =======================================================
  dmlCommands: {
    topic: "DML - Data Manipulation Language",
    concepts: [
      "INSERT, UPDATE, DELETE",
      "WHERE clause",
      "LIMIT, ORDER BY, DISTINCT",
      "Handling NULL values"
    ],
    questions: {
      easy: [
        "What is DML?",
        "What is the INSERT statement?",
        "What is the UPDATE statement?",
        "What is the DELETE statement?",
        "What is the difference between DELETE and TRUNCATE?",
        "What is the WHERE clause?",
        "What is LIMIT / TOP?",
        "What is ORDER BY?",
        "What is DISTINCT?",
        "How do you handle NULL values?"
      ],
      medium: [
        "How do you insert multiple rows at once?",
        "How do you update multiple columns?",
        "What is the difference between DELETE and DROP?",
        "How do you use WHERE with multiple conditions?",
        "How do you sort data in descending order?",
        "What is the difference between DISTINCT and GROUP BY?",
        "How do you handle NULL in comparisons?",
        "What is the difference between IS NULL and = NULL?",
        "How do you use LIMIT with OFFSET?",
        "How do you update data from another table?"
      ],
      hard: [
        "What are the performance implications of DELETE vs TRUNCATE?",
        "How do you implement bulk insert operations?",
        "What is the difference between UPDATE and MERGE?",
        "How do you handle concurrent updates?",
        "What are the locking mechanisms in DML?",
        "How do you optimize DELETE operations on large tables?",
        "What is the difference between soft delete and hard delete?",
        "How do you implement audit trails for DML operations?",
        "What are the best practices for batch updates?",
        "How do you handle NULL values in calculations?"
      ]
    }
  },

  // =======================================================
  // SECTION 4: Filtering & Operators (Concepts 31-40)
  // =======================================================
  filteringOperators: {
    topic: "Filtering Data & SQL Operators",
    concepts: [
      "Comparison operators",
      "Logical operators (AND, OR)",
      "BETWEEN, IN, LIKE",
      "Wildcards",
      "IS NULL / IS NOT NULL",
      "Aliases",
      "CASE statement"
    ],
    questions: {
      easy: [
        "What are comparison operators?",
        "What are logical operators?",
        "What is BETWEEN?",
        "What is IN?",
        "What is LIKE?",
        "What are wildcards?",
        "What is IS NULL / IS NOT NULL?",
        "What is the difference between AND and OR?",
        "What are aliases?",
        "What is a CASE statement?"
      ],
      medium: [
        "How do you use BETWEEN for date ranges?",
        "What is the difference between IN and OR?",
        "How do you use LIKE with wildcards?",
        "What are the different wildcard characters?",
        "How do you combine AND and OR operators?",
        "What is operator precedence in SQL?",
        "How do you use aliases for tables and columns?",
        "How do you write a CASE statement?",
        "What is the difference between CASE and IF?",
        "How do you use NOT with operators?"
      ],
      hard: [
        "What are the performance implications of LIKE with leading wildcards?",
        "How do you optimize queries with multiple OR conditions?",
        "What is the difference between IN and EXISTS?",
        "How do you implement complex CASE logic?",
        "What are the best practices for using wildcards?",
        "How do you handle NULL in CASE statements?",
        "What is short-circuit evaluation in SQL?",
        "How do you optimize BETWEEN queries?",
        "What are the indexing strategies for LIKE queries?",
        "How do you implement fuzzy matching?"
      ]
    }
  },

  // =======================================================
  // SECTION 5: Aggregate Functions & Grouping (Concepts 41-50)
  // =======================================================
  aggregateFunctions: {
    topic: "Aggregate Functions & GROUP BY",
    concepts: [
      "COUNT, SUM, AVG, MIN, MAX",
      "GROUP BY",
      "HAVING",
      "Difference between WHERE and HAVING",
      "ROLLUP / CUBE"
    ],
    questions: {
      easy: [
        "What is COUNT()?",
        "What is SUM()?",
        "What is AVG()?",
        "What is MIN()?",
        "What is MAX()?",
        "What is GROUP BY?",
        "What is HAVING?",
        "What is the difference between WHERE and HAVING?",
        "What are aggregate vs scalar functions?",
        "What is ROLLUP / CUBE?"
      ],
      medium: [
        "How do you count distinct values?",
        "What is the difference between COUNT(*) and COUNT(column)?",
        "How do you use GROUP BY with multiple columns?",
        "How do you filter grouped data with HAVING?",
        "What is the order of execution: WHERE vs HAVING?",
        "How do you use aggregate functions with NULL values?",
        "What is the difference between SUM and COUNT?",
        "How do you calculate running totals?",
        "What is the difference between ROLLUP and CUBE?",
        "How do you use GROUP BY with CASE?"
      ],
      hard: [
        "What are the performance implications of GROUP BY?",
        "How do you optimize aggregate queries?",
        "What is the difference between HAVING and WHERE in terms of performance?",
        "How do you implement custom aggregate functions?",
        "What are window functions vs aggregate functions?",
        "How do you handle NULL in aggregate functions?",
        "What is the difference between GROUPING SETS and UNION?",
        "How do you implement hierarchical aggregations?",
        "What are the best practices for using GROUP BY?",
        "How do you optimize queries with multiple aggregates?"
      ]
    }
  },

  // =======================================================
  // SECTION 6: Joins (Concepts 51-60)
  // =======================================================
  joins: {
    topic: "SQL Joins - Combining Tables",
    concepts: [
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "SELF JOIN",
      "CROSS JOIN",
      "Join conditions"
    ],
    questions: {
      easy: [
        "What is a JOIN?",
        "What is INNER JOIN?",
        "What is LEFT JOIN?",
        "What is RIGHT JOIN?",
        "What is FULL JOIN?",
        "What is SELF JOIN?",
        "What is CROSS JOIN?",
        "What is the difference between JOIN and subquery?",
        "What are join conditions?",
        "What are common join mistakes?"
      ],
      medium: [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "How do you join three or more tables?",
        "What is the difference between LEFT JOIN and RIGHT JOIN?",
        "How do you perform a SELF JOIN?",
        "What is a CROSS JOIN used for?",
        "How do you handle NULL values in joins?",
        "What is the difference between ON and WHERE in joins?",
        "How do you join tables with multiple conditions?",
        "What is a natural join?",
        "How do you implement a FULL OUTER JOIN in MySQL?"
      ],
      hard: [
        "What are the performance implications of different join types?",
        "How do you optimize join queries?",
        "What is the difference between nested loops and hash joins?",
        "How do you implement a many-to-many join?",
        "What are the best practices for join conditions?",
        "How do you handle Cartesian products?",
        "What is the difference between implicit and explicit joins?",
        "How do you optimize multi-table joins?",
        "What are join algorithms (nested loop, merge, hash)?",
        "How do you debug slow join queries?"
      ]
    }
  },

  // =======================================================
  // SECTION 7: Subqueries & CTEs (Concepts 61-70)
  // =======================================================
  subqueriesCTEs: {
    topic: "Subqueries & Common Table Expressions",
    concepts: [
      "Single-row subquery",
      "Multi-row subquery",
      "Correlated subquery",
      "EXISTS",
      "IN vs EXISTS",
      "CTE (WITH clause)",
      "Recursive CTE"
    ],
    questions: {
      easy: [
        "What is a subquery?",
        "What is a single-row subquery?",
        "What is a multi-row subquery?",
        "What is a correlated subquery?",
        "What is EXISTS?",
        "What is the difference between IN and EXISTS?",
        "What is a Common Table Expression (CTE)?",
        "What is a recursive CTE?",
        "What is the WITH clause?",
        "What is the difference between CTE and subquery?"
      ],
      medium: [
        "How do you write a subquery in the WHERE clause?",
        "What is the difference between correlated and non-correlated subqueries?",
        "How do you use EXISTS for existence checks?",
        "When should you use IN vs EXISTS?",
        "How do you create a CTE?",
        "What is the syntax for recursive CTE?",
        "How do you use multiple CTEs?",
        "What is the difference between CTE and temporary table?",
        "How do you use subqueries in SELECT?",
        "How do you use subqueries in FROM?"
      ],
      hard: [
        "What are the performance implications of correlated subqueries?",
        "How do you optimize subqueries?",
        "When should you use CTE vs subquery?",
        "How do you implement hierarchical queries with recursive CTE?",
        "What are the limitations of recursive CTEs?",
        "How do you convert subqueries to joins?",
        "What is the execution order of subqueries?",
        "How do you handle NULL in subqueries?",
        "What are the best practices for using CTEs?",
        "How do you debug complex subqueries?"
      ]
    }
  },

  // =======================================================
  // SECTION 8: Indexes & Performance (Concepts 71-80)
  // =======================================================
  indexesPerformance: {
    topic: "Indexes & Query Performance",
    concepts: [
      "Index types",
      "Clustered vs non-clustered",
      "Composite index",
      "Query execution plan",
      "Performance tuning",
      "Normalization"
    ],
    questions: {
      easy: [
        "What is an index?",
        "What are the types of indexes?",
        "What is a clustered vs non-clustered index?",
        "What is a composite index?",
        "When should you not use an index?",
        "What is a query execution plan?",
        "What are performance tuning basics?",
        "What is the difference between SELECT * and column selection?",
        "What is normalization?",
        "What is denormalization?"
      ],
      medium: [
        "How do you create an index?",
        "What is the difference between clustered and non-clustered indexes?",
        "How do you create a composite index?",
        "When should you use indexes?",
        "How do you analyze a query execution plan?",
        "What is the cost of maintaining indexes?",
        "What are covering indexes?",
        "How do you identify missing indexes?",
        "What is index fragmentation?",
        "How do you rebuild indexes?"
      ],
      hard: [
        "What are the performance trade-offs of indexes?",
        "How do you choose which columns to index?",
        "What is the difference between B-tree and hash indexes?",
        "How do you optimize queries with indexes?",
        "What is index selectivity?",
        "How do you handle index maintenance?",
        "What are filtered indexes?",
        "How do you implement full-text indexes?",
        "What is the impact of indexes on INSERT/UPDATE/DELETE?",
        "How do you monitor index usage?"
      ]
    }
  },

  // =======================================================
  // SECTION 9: Transactions & ACID (Concepts 81-90)
  // =======================================================
  transactionsACID: {
    topic: "Transactions & ACID Properties",
    concepts: [
      "Transaction basics",
      "ACID properties",
      "COMMIT, ROLLBACK, SAVEPOINT",
      "Isolation levels",
      "Concurrency issues"
    ],
    questions: {
      easy: [
        "What is a transaction?",
        "What are ACID properties?",
        "What is COMMIT?",
        "What is ROLLBACK?",
        "What is SAVEPOINT?",
        "What is auto-commit?",
        "What are isolation levels?",
        "What is a dirty read?",
        "What is a phantom read?",
        "What is deadlock?"
      ],
      medium: [
        "How do you start a transaction?",
        "What is the difference between COMMIT and ROLLBACK?",
        "How do you use SAVEPOINT?",
        "What are the different isolation levels?",
        "What is the difference between READ COMMITTED and REPEATABLE READ?",
        "How do you handle deadlocks?",
        "What is transaction log?",
        "How do you implement nested transactions?",
        "What is two-phase commit?",
        "How do you handle long-running transactions?"
      ],
      hard: [
        "Explain ACID properties in detail.",
        "What are the trade-offs between isolation levels?",
        "How do you implement distributed transactions?",
        "What is optimistic vs pessimistic locking?",
        "How do you prevent deadlocks?",
        "What is MVCC (Multi-Version Concurrency Control)?",
        "How do you handle transaction failures?",
        "What are the performance implications of different isolation levels?",
        "How do you implement saga pattern for distributed transactions?",
        "What is the CAP theorem and how does it relate to transactions?"
      ]
    }
  },

  // =======================================================
  // SECTION 10: Views, Procedures & Functions (Concepts 91-100)
  // =======================================================
  viewsProceduresFunctions: {
    topic: "Views, Stored Procedures & Functions",
    concepts: [
      "Views",
      "Stored procedures",
      "Stored functions",
      "Triggers",
      "Parameters"
    ],
    questions: {
      easy: [
        "What is a view?",
        "How do you create a view?",
        "Can you update a view?",
        "What are stored procedures?",
        "What are stored functions?",
        "What are parameters in procedures?",
        "What are triggers?",
        "What is the difference between BEFORE and AFTER trigger?",
        "What are use cases of triggers?",
        "What is the difference between view and table?"
      ],
      medium: [
        "How do you create a view with joins?",
        "What is the difference between simple and complex views?",
        "How do you create a stored procedure?",
        "What is the difference between procedure and function?",
        "How do you pass parameters to procedures?",
        "What are IN, OUT, and INOUT parameters?",
        "How do you create a trigger?",
        "What is the difference between row-level and statement-level triggers?",
        "How do you drop a view?",
        "What are materialized views?"
      ],
      hard: [
        "What are the performance implications of views?",
        "How do you optimize views?",
        "What are indexed views?",
        "How do you implement complex business logic in stored procedures?",
        "What are the security benefits of stored procedures?",
        "How do you handle errors in stored procedures?",
        "What are the limitations of triggers?",
        "How do you debug stored procedures?",
        "What is the difference between views and CTEs?",
        "How do you implement audit logging with triggers?"
      ]
    }
  },

  // =======================================================
  // SECTION 11: Database Design & Security (Concepts 101-120)
  // =======================================================
  designSecurity: {
    topic: "Database Design & Security",
    concepts: [
      "Normalization (1NF, 2NF, 3NF)",
      "Star vs snowflake schema",
      "OLTP vs OLAP",
      "Data integrity",
      "SQL injection",
      "User roles & privileges",
      "GRANT, REVOKE"
    ],
    questions: {
      easy: [
        "What are database normalization forms?",
        "What is 1NF, 2NF, 3NF?",
        "What is star vs snowflake schema?",
        "What is OLTP vs OLAP?",
        "What is data integrity?",
        "What is referential integrity?",
        "What are cascading actions?",
        "What is SQL injection?",
        "How do you prevent SQL injection?",
        "What are user roles & privileges?"
      ],
      medium: [
        "How do you normalize a database to 3NF?",
        "What is the difference between star and snowflake schema?",
        "What is the difference between OLTP and OLAP?",
        "How do you implement referential integrity?",
        "What are CASCADE, SET NULL, and RESTRICT?",
        "How do you prevent SQL injection with prepared statements?",
        "What is the GRANT statement?",
        "What is the REVOKE statement?",
        "How do you create database users?",
        "What are the different privilege levels?"
      ],
      hard: [
        "What are the trade-offs of normalization vs denormalization?",
        "How do you design a data warehouse schema?",
        "What is the difference between fact and dimension tables?",
        "How do you implement row-level security?",
        "What are the best practices for database security?",
        "How do you implement encryption at rest and in transit?",
        "What is database auditing?",
        "How do you handle PII (Personally Identifiable Information)?",
        "What are the compliance requirements (GDPR, HIPAA)?",
        "How do you implement database backup and recovery?"
      ]
    }
  },

  // =======================================================
  // SECTION 12: Advanced SQL & Real-World (Concepts 121-150)
  // =======================================================
  advancedSQL: {
    topic: "Advanced SQL & Real-World Scenarios",
    concepts: [
      "Window functions",
      "ROW_NUMBER, RANK, DENSE_RANK",
      "PARTITION BY",
      "LEAD and LAG",
      "Pivot and unpivot",
      "Date & time functions",
      "JSON support",
      "Recursive queries",
      "Analytics",
      "Best practices"
    ],
    questions: {
      easy: [
        "What are window functions?",
        "What is ROW_NUMBER()?",
        "What is RANK() and DENSE_RANK()?",
        "What is PARTITION BY?",
        "What are LEAD and LAG?",
        "What are running totals?",
        "What is pivot and unpivot?",
        "What are date & time functions?",
        "What are string functions?",
        "What is JSON support in SQL?"
      ],
      medium: [
        "How do you use ROW_NUMBER() for pagination?",
        "What is the difference between RANK() and DENSE_RANK()?",
        "How do you use PARTITION BY with window functions?",
        "How do you calculate running totals?",
        "What is the difference between LEAD and LAG?",
        "How do you pivot data?",
        "How do you work with dates in SQL?",
        "How do you extract JSON data?",
        "What are recursive queries used for?",
        "How do you implement pagination?"
      ],
      hard: [
        "What are the performance implications of window functions?",
        "How do you optimize window function queries?",
        "What is the difference between window functions and GROUP BY?",
        "How do you implement complex analytics with window functions?",
        "What are the best practices for using window functions?",
        "How do you handle hierarchical data?",
        "What are slowly changing dimensions?",
        "How do you implement data warehousing concepts?",
        "What are query anti-patterns?",
        "What are SQL best practices for production?",
        "How do you handle large datasets?",
        "What is the difference between MySQL and PostgreSQL?",
        "What is ACID vs BASE?",
        "How do you implement sharding?",
        "What is database partitioning?",
        "How do you monitor database performance?",
        "What is query refactoring?",
        "How do you implement ETL processes?",
        "What are the best practices for SQL in microservices?",
        "What is the difference between SQL and ORM?"
      ]
    }
  }
};

// =======================================================
// 🔹 GET RANDOM QUESTION BY DIFFICULTY
// =======================================================
function getRandomSQLQuestion(difficulty = "easy", section = null) {
  let sections;
  
  if (section) {
    if (SQL_QUESTION_BANK[section]) {
      sections = [SQL_QUESTION_BANK[section]];
    } else {
      sections = Object.values(SQL_QUESTION_BANK);
    }
  } else {
    sections = Object.values(SQL_QUESTION_BANK);
  }
  
  const allQuestions = sections.flatMap(s => s.questions && s.questions[difficulty] ? s.questions[difficulty] : []);
  
  if (allQuestions.length === 0) {
    return "What is SQL? Explain its uses.";
  }
  
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// =======================================================
// 🔹 GET QUESTIONS BY TOPIC
// =======================================================
function getQuestionsByTopic(topic, difficulty = "easy") {
  for (const section of Object.values(SQL_QUESTION_BANK)) {
    if (section.topic.toLowerCase().includes(topic.toLowerCase())) {
      return section.questions[difficulty] || [];
    }
  }
  return [];
}

// =======================================================
// 🔹 GET ALL CONCEPTS
// =======================================================
function getAllSQLConcepts() {
  return Object.values(SQL_QUESTION_BANK).flatMap(section => section.concepts);
}

module.exports = {
  SQL_QUESTION_BANK,
  getRandomSQLQuestion,
  getQuestionsByTopic,
  getAllSQLConcepts
};
