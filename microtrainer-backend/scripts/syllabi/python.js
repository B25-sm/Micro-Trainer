/** Auto-generated syllabus spec for Python */
module.exports = {
  "technology": "Python",
  "idPrefix": "py",
  "domainHint": "Python 3 scripts, notebooks, and backend development",
  "sections": [
    {
      "id": "01",
      "title": "Python Foundations & Environment",
      "modules": [
        {
          "title": "Python Landscape & Career Paths",
          "topics": [
            "What Python is and where it runs",
            "Roles: backend, data science, automation, DevOps",
            "Python 2 vs 3 (always use 3)",
            "Installing Python, pip, and virtual environments",
            "How teams use Python in industry"
          ],
          "project": null
        },
        {
          "title": "First Programs & REPL",
          "topics": [
            "print, input, and running .py files",
            "Indentation and Python syntax rules",
            "Comments and docstrings",
            "Using IDLE, terminal, and Jupyter",
            "Debugging syntax errors"
          ],
          "project": "Hello-world CLI that greets the user"
        },
        {
          "title": "Code Style & Tooling",
          "topics": [
            "PEP 8 naming and formatting",
            "Linting with ruff/flake8 intro",
            "Type hints overview (optional)",
            "Project layout for small apps",
            "Reading tracebacks"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "02",
      "title": "Variables, Types & Operators",
      "modules": [
        {
          "title": "Variables & Assignment",
          "topics": [
            "Dynamic typing",
            "Naming rules and conventions",
            "Multiple assignment",
            "Constants by convention",
            "id() and object identity intro"
          ],
          "project": null
        },
        {
          "title": "Numbers, Strings & Booleans",
          "topics": [
            "int, float, Decimal awareness",
            "String methods and slicing",
            "f-strings and formatting",
            "bool and comparison operators",
            "None type"
          ],
          "project": null
        },
        {
          "title": "Operators & Expressions",
          "topics": [
            "Arithmetic and assignment operators",
            "Logical operators",
            "Membership: in, not in",
            "Operator precedence",
            "Walrus operator := (awareness)"
          ],
          "project": null
        },
        {
          "title": "Type Conversion & Validation",
          "topics": [
            "int(), str(), float() conversion",
            "Handling invalid input safely",
            "isinstance() checks",
            "Truthy/falsy in Python",
            "Common conversion bugs"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "03",
      "title": "Control Flow",
      "modules": [
        {
          "title": "Conditionals",
          "topics": [
            "if / elif / else",
            "Nested conditions",
            "Ternary expressions",
            "match/case (3.10+) intro",
            "Guard clauses"
          ],
          "project": null
        },
        {
          "title": "Loops",
          "topics": [
            "while loops",
            "for loops over sequences",
            "range() function",
            "break, continue, else on loops",
            "Avoiding infinite loops"
          ],
          "project": null
        },
        {
          "title": "Comprehensions & Iteration",
          "topics": [
            "List comprehensions",
            "Dict and set comprehensions",
            "enumerate and zip",
            "Iterators vs iterables",
            "When comprehensions hurt readability"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "04",
      "title": "Functions",
      "modules": [
        {
          "title": "Defining Functions",
          "topics": [
            "def syntax and return",
            "Docstrings",
            "Function scope",
            "Pure functions intro",
            "Organizing code into modules"
          ],
          "project": null
        },
        {
          "title": "Parameters & Arguments",
          "topics": [
            "Positional and keyword args",
            "Default parameters",
            "*args and **kwargs",
            "Unpacking in calls",
            "Mutable default argument trap"
          ],
          "project": null
        },
        {
          "title": "Advanced Functions",
          "topics": [
            "Lambda expressions",
            "map, filter, reduce",
            "Closures and nested functions",
            "Recursion basics",
            "functools.partial intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "05",
      "title": "Data Structures",
      "modules": [
        {
          "title": "Lists",
          "topics": [
            "Creating and indexing lists",
            "Slicing and copying",
            "List methods: append, extend, pop",
            "Sorting lists",
            "List as stack/queue"
          ],
          "project": "Analyze a list of student scores"
        },
        {
          "title": "Tuples & Sets",
          "topics": [
            "Immutable tuples",
            "Named tuples intro",
            "Sets for uniqueness",
            "Set operations",
            "Choosing list vs tuple vs set"
          ],
          "project": null
        },
        {
          "title": "Dictionaries",
          "topics": [
            "Key-value pairs",
            "dict methods and get()",
            "Nested dictionaries",
            "defaultdict and Counter intro",
            "Hashability requirements"
          ],
          "project": "Word frequency counter"
        },
        {
          "title": "Collections Module",
          "topics": [
            "deque for queues",
            "Counter for tallies",
            "defaultdict patterns",
            "OrderedDict (historical)",
            "Choosing the right structure"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "06",
      "title": "Object-Oriented Python",
      "modules": [
        {
          "title": "Classes & Objects",
          "topics": [
            "class and __init__",
            "Instance vs class attributes",
            "self parameter",
            "Methods vs functions",
            "Modeling real entities"
          ],
          "project": "Bank account class"
        },
        {
          "title": "Inheritance & Polymorphism",
          "topics": [
            "super() and method override",
            "isinstance and issubclass",
            "Composition vs inheritance",
            "Abstract base classes intro",
            "Designing class hierarchies"
          ],
          "project": null
        },
        {
          "title": "Special Methods & Dataclasses",
          "topics": [
            "__str__, __repr__",
            "__len__, __getitem__",
            "dataclasses module",
            "Properties with @property",
            "When OOP helps vs hurts"
          ],
          "project": null
        },
        {
          "title": "Encapsulation & Patterns",
          "topics": [
            "Private naming _ and __",
            "Properties for validation",
            "Factory functions",
            "Singleton awareness",
            "SOLID intro for Python"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "07",
      "title": "Files, Errors & Logging",
      "modules": [
        {
          "title": "File I/O",
          "topics": [
            "open(), read, write",
            "Context managers with with",
            "Pathlib for paths",
            "CSV and JSON files",
            "Binary files awareness"
          ],
          "project": null
        },
        {
          "title": "Exception Handling",
          "topics": [
            "try / except / else / finally",
            "Raising exceptions",
            "Custom exception classes",
            "Exception hierarchy",
            "EAFP vs LBYL style"
          ],
          "project": null
        },
        {
          "title": "Logging & Debugging",
          "topics": [
            "logging module basics",
            "Log levels",
            "pdb debugger intro",
            "Assertions",
            "Production error handling"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "08",
      "title": "Modules, Packages & Ecosystem",
      "modules": [
        {
          "title": "Imports & Modules",
          "topics": [
            "import styles",
            "Creating your own modules",
            "__name__ == '__main__'",
            "Package structure",
            "Relative imports"
          ],
          "project": null
        },
        {
          "title": "Virtual Envs & pip",
          "topics": [
            "venv and pip install",
            "requirements.txt",
            "pyproject.toml awareness",
            "pip freeze workflow",
            "Dependency conflicts"
          ],
          "project": null
        },
        {
          "title": "Standard Library Highlights",
          "topics": [
            "datetime and timedelta",
            "os, sys, pathlib",
            "json, csv, urllib",
            "random and math",
            "itertools and functools intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "09",
      "title": "Advanced Python",
      "modules": [
        {
          "title": "Decorators",
          "topics": [
            "Functions as objects",
            "Writing decorators",
            "@wraps",
            "Decorator parameters",
            "Common decorator patterns"
          ],
          "project": null
        },
        {
          "title": "Generators & Iterators",
          "topics": [
            "yield keyword",
            "Generator expressions",
            "Lazy evaluation benefits",
            "itertools recipes",
            "Memory efficiency"
          ],
          "project": null
        },
        {
          "title": "Context Managers",
          "topics": [
            "with statement internals",
            "__enter__ and __exit__",
            "contextlib.contextmanager",
            "Managing resources",
            "Custom context managers"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "10",
      "title": "Data, Web & APIs",
      "modules": [
        {
          "title": "Working with APIs",
          "topics": [
            "requests library",
            "JSON responses",
            "Headers and auth basics",
            "Error handling for HTTP",
            "Rate limits and retries"
          ],
          "project": null
        },
        {
          "title": "Data Analysis Intro",
          "topics": [
            "NumPy arrays overview",
            "Pandas DataFrame basics",
            "Reading CSV with pandas",
            "Simple plots with matplotlib",
            "When to use pandas vs pure Python"
          ],
          "project": null
        },
        {
          "title": "Web Frameworks Overview",
          "topics": [
            "Flask vs Django vs FastAPI",
            "HTTP request/response cycle",
            "REST API concepts",
            "Choosing a framework",
            "Python in microservices"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "11",
      "title": "Testing & Quality",
      "modules": [
        {
          "title": "pytest Fundamentals",
          "topics": [
            "Writing test functions",
            "assert and fixtures intro",
            "Parametrized tests",
            "Mocking with unittest.mock",
            "Test coverage awareness"
          ],
          "project": null
        },
        {
          "title": "Code Quality",
          "topics": [
            "Black, ruff, mypy intro",
            "Writing testable code",
            "CI pipelines awareness",
            "Code reviews",
            "Documentation with Sphinx intro"
          ],
          "project": null
        }
      ]
    },
    {
      "id": "12",
      "title": "Capstone & Career",
      "modules": [
        {
          "title": "Capstone Planning",
          "topics": [
            "Choosing a project scope",
            "CLI vs web vs data project",
            "Requirements and milestones",
            "Git workflow",
            "README and demo"
          ],
          "project": null
        },
        {
          "title": "Build & Present",
          "topics": [
            "Implement core features",
            "Handle errors and edge cases",
            "Package for distribution intro",
            "Deploy script or Streamlit demo",
            "Present trade-offs made"
          ],
          "project": null
        },
        {
          "title": "Interview Prep",
          "topics": [
            "Common Python interview questions",
            "Big-O with Python collections",
            "Debugging live exercises",
            "Portfolio tips",
            "Contributing to open source"
          ],
          "project": null
        },
        {
          "title": "Professional Practices",
          "topics": [
            "Virtual envs in teams",
            "Secrets and .env",
            "Async intro with asyncio",
            "Performance profiling basics",
            "Continuing learning path"
          ],
          "project": null
        },
        {
          "title": "Capstone Project",
          "topics": [
            "Choose CLI, web, or data project",
            "Requirements and milestones",
            "Implement with tests",
            "README and demo video",
            "Present trade-offs"
          ],
          "project": "Grade manager, API client, or mini data dashboard"
        }
      ]
    }
  ]
};
