// =======================================================
// 🔹 PROBLEM SOLVING QUESTION BANK
// Comprehensive coding challenges for interview preparation
// =======================================================

const PROBLEM_SOLVING_BANK = {
  
  // =======================================================
  // EASY LEVEL - Number Problems
  // =======================================================
  easyNumbers: {
    topic: "Easy Number Problems",
    difficulty: "easy",
    problems: [
      {
        id: "easy-num-1",
        title: "Sum of Digits",
        description: "Write a program to print the sum of the digits in the number.",
        testCases: [
          {
            input: 101,
            output: 2,
            explanation: "Sum of the digits in the number 1+0+1 = 2"
          },
          {
            input: 567,
            output: 18,
            explanation: "Sum of the digits in the number 5+6+7 = 18"
          }
        ],
        hints: ["Convert number to string", "Iterate through each digit", "Sum them up"]
      },
      {
        id: "easy-num-2",
        title: "Reverse a Number",
        description: "Write a program to print reverse of the given number.",
        testCases: [
          {
            input: 721,
            output: 127,
            explanation: "Reverse of the number 721 is 127"
          },
          {
            input: 765,
            output: 567,
            explanation: "Reverse of the number 765 is 567"
          }
        ],
        hints: ["Convert to string and reverse", "Or use modulo operator"]
      },
      {
        id: "easy-num-3",
        title: "Factorial of a Number",
        description: "Write a program to print factorial of the number.",
        testCases: [
          {
            input: 3,
            output: 6,
            explanation: "Factorial of 3 is 3*2*1 = 6"
          },
          {
            input: 4,
            output: 24,
            explanation: "Factorial of 4 is 4*3*2*1 = 24"
          }
        ],
        hints: ["Use recursion or loop", "Multiply from n down to 1"]
      }
    ]
  },

  // =======================================================
  // EASY LEVEL - String Problems
  // =======================================================
  easyStrings: {
    topic: "Easy String Problems",
    difficulty: "easy",
    problems: [
      {
        id: "easy-str-1",
        title: "Middle Character(s)",
        description: "Write a program to print middle character(s) in the given string or number.",
        testCases: [
          {
            input: "Wonder",
            output: "nd",
            explanation: "The middle characters in Wonder is nd"
          },
          {
            input: "World",
            output: "r",
            explanation: "The middle character in World is r"
          },
          {
            input: 6969,
            output: "96",
            explanation: "The middle characters in 6969 is 96"
          }
        ],
        hints: ["Find the length", "Calculate middle index", "Handle even/odd length"]
      },
      {
        id: "easy-str-2",
        title: "Sum of First and Last vs Middle Digits",
        description: "Check whether the sum of digits except first and last is equal to sum of first and last digit.",
        testCases: [
          {
            input: 75547,
            output: "equal",
            explanation: "sum(7,7)=14 equals sum(5,5,4)=14"
          },
          {
            input: 765,
            output: "not equal",
            explanation: "sum(7,5)=12 and sum(6)=6, not equal"
          }
        ],
        hints: ["Extract first and last digits", "Sum middle digits", "Compare both sums"]
      },
      {
        id: "easy-str-3",
        title: "Check Middle Digits Less Than First and Last",
        description: "Check whether digits in-between first and last are less than first and last digit.",
        testCases: [
          {
            input: 1672,
            output: false,
            explanation: "Middle digits 6,7 are not less than 1 and 7"
          },
          {
            input: 84719,
            output: true,
            explanation: "Middle digits 4,7,1 are less than 8 and 9"
          }
        ],
        hints: ["Extract first, last, and middle digits", "Compare each middle digit"]
      },
      {
        id: "easy-str-4",
        title: "Vowels in Reverse Order",
        description: "Print the vowels in the given string in reverse order.",
        testCases: [
          {
            input: "Helloworld",
            output: "ooe",
            explanation: "Vowels are e,o,o. Reverse is ooe"
          },
          {
            input: "JackspArrow",
            output: "oAa",
            explanation: "Vowels are a,A,o. Reverse is oAa"
          }
        ],
        hints: ["Extract vowels", "Reverse the vowel array", "Join and return"]
      },
      {
        id: "easy-str-5",
        title: "Unique Vowels",
        description: "Print vowels in the string and repeated vowel should be printed only once.",
        testCases: [
          {
            input: "Helloworld",
            output: "eo",
            explanation: "Vowels are e,o,o. Unique vowels are eo"
          },
          {
            input: "Jacksparrow",
            output: "ao",
            explanation: "Vowels are a,a,o. Unique vowels are ao"
          }
        ],
        hints: ["Extract vowels", "Use Set to remove duplicates", "Maintain order"]
      },
      {
        id: "easy-str-6",
        title: "Remove Duplicate Characters",
        description: "Print the string after removing the duplicate characters.",
        testCases: [
          {
            input: "madam",
            output: "d",
            explanation: "Duplicates are m,a. After removing: d"
          },
          {
            input: "donkey",
            output: "donkey",
            explanation: "No duplicate characters"
          }
        ],
        hints: ["Count character frequency", "Keep only characters that appear once"]
      },
      {
        id: "easy-str-7",
        title: "Toggle Case",
        description: "Convert all upper case letters to lower case and vice versa.",
        testCases: [
          {
            input: "JohnWick",
            output: "jOHNwICK",
            explanation: "All cases toggled"
          },
          {
            input: "Korean",
            output: "kOREAN",
            explanation: "All cases toggled"
          }
        ],
        hints: ["Check if character is uppercase", "Use toUpperCase/toLowerCase"]
      },
      {
        id: "easy-str-8",
        title: "Uppercase in Reverse + Lowercase",
        description: "Print all uppercase letters in reverse order followed by lowercase letters.",
        testCases: [
          {
            input: "NumberOne",
            output: "ONumberne",
            explanation: "Uppercase N,O reversed to ON, then lowercase"
          },
          {
            input: "ClassLeader",
            output: "LClasseader",
            explanation: "Uppercase C,L reversed to LC, then lowercase"
          }
        ],
        hints: ["Separate uppercase and lowercase", "Reverse uppercase", "Concatenate"]
      },
      {
        id: "easy-str-9",
        title: "Reverse a String",
        description: "Write a function to reverse a given string.",
        testCases: [
          {
            input: "hello",
            output: "olleh",
            explanation: "Reverse of hello is olleh"
          },
          {
            input: "",
            output: "",
            explanation: "Reversing an empty string yields an empty string"
          }
        ],
        hints: ["Use built-in reverse", "Or iterate backwards"]
      },
      {
        id: "easy-str-10",
        title: "Check Palindrome",
        description: "Check if a given string is a palindrome.",
        testCases: [
          {
            input: "racecar",
            output: true,
            explanation: "racecar reads same forward and backward"
          },
          {
            input: "hello",
            output: false,
            explanation: "hello reversed is olleh, not the same"
          }
        ],
        hints: ["Compare string with its reverse"]
      },
      {
        id: "easy-str-11",
        title: "Count Vowels",
        description: "Count the number of vowels in a given string.",
        testCases: [
          {
            input: "hello world",
            output: 3,
            explanation: "Vowels are e, o, o"
          },
          {
            input: "sky",
            output: 0,
            explanation: "No vowels (a, e, i, o, u) in 'sky'"
          }
        ],
        hints: ["Check each character", "Count if it's a vowel"]
      },
      {
        id: "easy-str-12",
        title: "Remove Vowels",
        description: "Remove all vowels from a given string.",
        testCases: [
          {
            input: "hello world",
            output: "hll wrld",
            explanation: "After removing e, o, o"
          },
          {
            input: "sky",
            output: "sky",
            explanation: "No vowels to remove"
          }
        ],
        hints: ["Filter out vowels", "Join remaining characters"]
      },
      {
        id: "easy-str-13",
        title: "Title Case",
        description: "Convert string to title case (capitalize first letter of each word).",
        testCases: [
          {
            input: "hello world",
            output: "Hello World",
            explanation: "First letter of each word capitalized"
          },
          {
            input: "javascript",
            output: "Javascript",
            explanation: "Single word, first letter capitalized"
          }
        ],
        hints: ["Split by space", "Capitalize first letter", "Join back"]
      },
      {
        id: "easy-str-14",
        title: "String to Number",
        description: "Convert a string to a number without using parseInt or Number.",
        testCases: [
          {
            input: "123",
            output: 123,
            explanation: "String 123 converted to number"
          },
          {
            input: "-45",
            output: -45,
            explanation: "Negative sign is preserved in the conversion"
          }
        ],
        hints: ["Use unary plus operator", "Or multiply by 1"]
      },
      {
        id: "easy-str-15",
        title: "Check Only Digits",
        description: "Check if a string contains only numeric digits.",
        testCases: [
          {
            input: "12345",
            output: true,
            explanation: "All characters are digits"
          },
          {
            input: "12a45",
            output: false,
            explanation: "Contains a non-digit character 'a'"
          }
        ],
        hints: ["Use regex", "Or check each character"]
      },
      {
        id: "easy-str-16",
        title: "Count Character Occurrences",
        description: "Count occurrences of a specific character in a string.",
        testCases: [
          {
            input: ["hello world", "l"],
            output: 3,
            explanation: "Character 'l' appears 3 times"
          },
          {
            input: ["hello world", "z"],
            output: 0,
            explanation: "Character 'z' does not appear"
          }
        ],
        hints: ["Loop through string", "Count matches"]
      }
    ]
  },

  // =======================================================
  // EASY LEVEL - Array Problems
  // =======================================================
  easyArrays: {
    topic: "Easy Array Problems",
    difficulty: "easy",
    problems: [
      {
        id: "easy-arr-1",
        title: "Find Largest Element",
        description: "Find the largest number in an array.",
        testCases: [
          {
            input: [3, 1, 4, 1, 5, 9],
            output: 9,
            explanation: "9 is the largest number"
          },
          {
            input: [-5, -2, -9, -1],
            output: -1,
            explanation: "-1 is the largest (least negative) value"
          }
        ],
        hints: ["Use Math.max", "Or iterate and track maximum"]
      },
      {
        id: "easy-arr-2",
        title: "Find Second Largest",
        description: "Find the second largest number in an array.",
        testCases: [
          {
            input: [3, 1, 4, 1, 5, 9],
            output: 5,
            explanation: "Second largest after 9 is 5"
          },
          {
            input: [10, 20, 30, 40],
            output: 30,
            explanation: "40 is largest, 30 is second largest"
          }
        ],
        hints: ["Sort array", "Or track first and second max"]
      },
      {
        id: "easy-arr-3",
        title: "Sum of All Elements",
        description: "Return the sum of all elements in an array.",
        testCases: [
          {
            input: [1, 2, 3, 4],
            output: 10,
            explanation: "1+2+3+4 = 10"
          },
          {
            input: [],
            output: 0,
            explanation: "Sum of an empty array is 0"
          }
        ],
        hints: ["Use reduce", "Or loop and accumulate"]
      },
      {
        id: "easy-arr-4",
        title: "Remove Duplicates",
        description: "Remove duplicate values from an array.",
        testCases: [
          {
            input: [1, 2, 2, 3, 4, 4, 5],
            output: [1, 2, 3, 4, 5],
            explanation: "Duplicates removed"
          },
          {
            input: [1, 2, 3],
            output: [1, 2, 3],
            explanation: "No duplicates to remove"
          }
        ],
        hints: ["Use Set", "Or filter with indexOf"]
      },
      {
        id: "easy-arr-5",
        title: "Check if Array is Sorted",
        description: "Check if an array is sorted in ascending order.",
        testCases: [
          {
            input: [1, 2, 3, 4, 5],
            output: true,
            explanation: "Array is sorted"
          },
          {
            input: [3, 1, 2],
            output: false,
            explanation: "3 > 1, not sorted ascending"
          }
        ],
        hints: ["Compare each element with next", "Return false if any is greater"]
      },
      {
        id: "easy-arr-6",
        title: "Reverse an Array",
        description: "Reverse the elements in an array.",
        testCases: [
          {
            input: [1, 2, 3, 4, 5],
            output: [5, 4, 3, 2, 1],
            explanation: "Array reversed"
          },
          {
            input: [7],
            output: [7],
            explanation: "A single-element array reversed is itself"
          }
        ],
        hints: ["Use reverse method", "Or swap elements"]
      },
      {
        id: "easy-arr-7",
        title: "Remove Falsy Values",
        description: "Remove all falsy values from an array.",
        testCases: [
          {
            input: [0, 1, false, 2, '', 3],
            output: [1, 2, 3],
            explanation: "Falsy values removed"
          },
          {
            input: [1, 0, 2, 0, 3],
            output: [1, 2, 3],
            explanation: "0 values (falsy) removed, others kept"
          }
        ],
        hints: ["Use filter with Boolean", "Or check each value"]
      },
      {
        id: "easy-arr-8",
        title: "Find Unique Elements",
        description: "Find elements that appear only once in an array.",
        testCases: [
          {
            input: [1, 2, 2, 3, 4, 4, 5],
            output: [1, 3, 5],
            explanation: "Elements appearing once"
          },
          {
            input: [1, 2, 3],
            output: [1, 2, 3],
            explanation: "All elements appear exactly once"
          }
        ],
        hints: ["Count frequency", "Filter elements with count 1"]
      },
      {
        id: "easy-arr-9",
        title: "Sum of Even Numbers",
        description: "Return the sum of all even numbers in an array.",
        testCases: [
          {
            input: [1, 2, 3, 4, 5],
            output: 6,
            explanation: "2+4 = 6"
          },
          {
            input: [1, 3, 5],
            output: 0,
            explanation: "No even numbers present"
          }
        ],
        hints: ["Filter even numbers", "Sum them"]
      }
    ]
  },

  // =======================================================
  // EASY LEVEL - Object Problems
  // =======================================================
  easyObjects: {
    topic: "Easy Object Problems",
    difficulty: "easy",
    problems: [
      {
        id: "easy-obj-1",
        title: "Convert Array to Object",
        description: "Convert an array of key-value pairs into an object.",
        testCases: [
          {
            input: [["name", "Alice"], ["age", 25]],
            output: {name: "Alice", age: 25},
            explanation: "Array converted to object"
          },
          {
            input: [],
            output: {},
            explanation: "Empty array converts to an empty object"
          }
        ],
        hints: ["Use Object.fromEntries", "Or loop and assign"]
      },
      {
        id: "easy-obj-2",
        title: "Merge Two Objects",
        description: "Merge two objects, second object properties override first.",
        testCases: [
          {
            input: [{a: 1, b: 2}, {b: 3, c: 4}],
            output: {a: 1, b: 3, c: 4},
            explanation: "Objects merged, b overridden"
          },
          {
            input: [{a: 1}, {b: 2}],
            output: {a: 1, b: 2},
            explanation: "No overlapping keys, both merged directly"
          }
        ],
        hints: ["Use spread operator", "Or Object.assign"]
      },
      {
        id: "easy-obj-3",
        title: "Count Object Properties",
        description: "Return the number of properties in an object.",
        testCases: [
          {
            input: {a: 1, b: 2, c: 3},
            output: 3,
            explanation: "Object has 3 properties"
          },
          {
            input: {},
            output: 0,
            explanation: "Empty object has 0 properties"
          }
        ],
        hints: ["Use Object.keys().length"]
      },
      {
        id: "easy-obj-4",
        title: "Get Object Keys",
        description: "Return an array of all keys in an object.",
        testCases: [
          {
            input: {a: 1, b: 2, c: 3},
            output: ["a", "b", "c"],
            explanation: "Keys extracted"
          },
          {
            input: {},
            output: [],
            explanation: "No keys in an empty object"
          }
        ],
        hints: ["Use Object.keys()"]
      },
      {
        id: "easy-obj-5",
        title: "Get Object Values",
        description: "Return an array of all values in an object.",
        testCases: [
          {
            input: {a: 1, b: 2, c: 3},
            output: [1, 2, 3],
            explanation: "Values extracted"
          },
          {
            input: {},
            output: [],
            explanation: "No values in an empty object"
          }
        ],
        hints: ["Use Object.values()"]
      },
      {
        id: "easy-obj-6",
        title: "Check if Object is Empty",
        description: "Check if an object has no properties.",
        testCases: [
          {
            input: {},
            output: true,
            explanation: "Object is empty"
          },
          {
            input: {a: 1},
            output: false,
            explanation: "Object has a property, so it's not empty"
          }
        ],
        hints: ["Check Object.keys().length === 0"]
      }
    ]
  }
};

module.exports = {
  PROBLEM_SOLVING_BANK
};

// =======================================================
// MEDIUM LEVEL - Number & String Problems
// =======================================================
PROBLEM_SOLVING_BANK.mediumNumbersStrings = {
  topic: "Medium Number & String Problems",
  difficulty: "medium",
  problems: [
    {
      id: "med-ns-1",
      title: "Equal Vowel Count in Two Halves",
      description: "String should be even length. Divide into two equal parts, check if vowel count is same.",
      testCases: [
        {
          input: "rebels",
          output: true,
          explanation: "reb has 1 vowel (e), els has 1 vowel (e)"
        },
        {
          input: "apples",
          output: true,
          explanation: "app has 1 vowel (a), les has 1 vowel (e)"
        },
        {
          input: "mars",
          output: false,
          explanation: "ma has 1 vowel, rs has 0 vowels"
        }
      ],
      hints: ["Split string in half", "Count vowels in each half", "Compare counts"]
    },
    {
      id: "med-ns-2",
      title: "Numbers Starting with Same Digit",
      description: "Count how many numbers in array start and end with same digit.",
      testCases: [
        {
          input: [34, 88, 423, 121, 2382, 10],
          output: 3,
          explanation: "88, 121, 2382 start and end with same digit"
        },
        {
          input: [102, 56, 42, 11, 64, 10],
          output: 1,
          explanation: "Only 11 starts and ends with same digit"
        }
      ],
      hints: ["Convert to string", "Compare first and last character"]
    },
    {
      id: "med-ns-3",
      title: "Numbers That Form Prime When Incremented",
      description: "Print numbers which form prime numbers when 1 is added.",
      testCases: [
        {
          input: [7, 4, 7, 23, 10],
          output: [4, 10],
          explanation: "4+1=5 (prime), 10+1=11 (prime)"
        },
        {
          input: [8, 14, 20],
          output: [],
          explanation: "9, 15, and 21 are all non-prime, so none qualify"
        }
      ],
      hints: ["Add 1 to each number", "Check if result is prime"]
    },
    {
      id: "med-ns-4",
      title: "Find Factorial Position in Array",
      description: "Check position of factorial of given number in array.",
      testCases: [
        {
          input: [[61, 4, 6, 7, 120, 10], 5],
          output: 4,
          explanation: "Factorial of 5 is 120, at index 4"
        },
        {
          input: [[61, 4, 6, 7, 120, 10], 7],
          output: "Factorial of 7 is not presented",
          explanation: "5040 not in array"
        }
      ],
      hints: ["Calculate factorial", "Find index in array"]
    },
    {
      id: "med-ns-5",
      title: "Sum of Duplicate Digits",
      description: "Print sum of duplicate digits in the number.",
      testCases: [
        {
          input: 7473183,
          output: 10,
          explanation: "Duplicates: 7 and 3, sum = 7+3 = 10"
        },
        {
          input: 234234,
          output: 9,
          explanation: "Duplicates: 2,3,4, sum = 2+3+4 = 9"
        }
      ],
      hints: ["Count digit frequency", "Sum digits with count > 1"]
    },
    {
      id: "med-ns-6",
      title: "Second Duplicate Number",
      description: "Print the second duplicate number and its occurrence count.",
      testCases: [
        {
          input: [64, 1, 2, 7, 79, 7, 7, 1, 22],
          output: "Second duplicate number is 7 and it occurred 3 times",
          explanation: "First duplicate is 1, second is 7"
        },
        {
          input: [121, 8, 1, 4, 5, 4, 8, 1],
          output: "Second duplicate number is 1 and it occurred 2 times",
          explanation: "Duplicates in order: 8, 1"
        }
      ],
      hints: ["Track duplicates in order", "Count occurrences"]
    }
  ]
};

// =======================================================
// MEDIUM LEVEL - Pattern Printing
// =======================================================
PROBLEM_SOLVING_BANK.mediumPatterns = {
  topic: "Medium Pattern Printing",
  difficulty: "medium",
  problems: [
    {
      id: "med-pat-1",
      title: "Incremental Number Pattern",
      description: "Print pattern with incrementing numbers per row.",
      testCases: [
        {
          input: 4,
          output: "1\n1 2\n1 2 3\n1 2 3 4",
          explanation: "Each row has numbers from 1 to row number"
        },
        {
          input: 2,
          output: "1\n1 2",
          explanation: "Two rows: row 1 has just '1', row 2 has '1 2'"
        }
      ],
      hints: ["Nested loops", "Inner loop from 1 to i"]
    },
    {
      id: "med-pat-2",
      title: "Decremental Number Pattern",
      description: "Print pattern with decrementing numbers.",
      testCases: [
        {
          input: 4,
          output: "4 3 2 1\n4 3 2\n4 3\n4",
          explanation: "Each row starts from n and decreases"
        },
        {
          input: 2,
          output: "2 1\n2",
          explanation: "Row 1 counts down from 2 to 1, row 2 is just '2'"
        }
      ],
      hints: ["Outer loop for rows", "Inner loop decrements"]
    },
    {
      id: "med-pat-3",
      title: "Cumulative Sum Pattern",
      description: "Print pattern with cumulative sums.",
      testCases: [
        {
          input: 4,
          output: "1\n1 1\n1 2 3\n1 2 3 6\n1 2 3 4 10",
          explanation: "Last number is sum of previous"
        }
      ],
      hints: ["Track running sum", "Print sum at end of row"]
    },
    {
      id: "med-pat-4",
      title: "Pyramid Number Pattern",
      description: "Print pyramid pattern with numbers.",
      testCases: [
        {
          input: 3,
          output: "  1\n 2 2\n3 3 3",
          explanation: "Centered pyramid"
        },
        {
          input: 2,
          output: " 1\n2 2",
          explanation: "Row 1 has 1 leading space, row 2 has none"
        }
      ],
      hints: ["Add spaces for centering", "Repeat number i times"]
    },
    {
      id: "med-pat-5",
      title: "Number with Plus Pattern",
      description: "Print numbers followed by plus signs.",
      testCases: [
        {
          input: 4,
          output: "1+\n12++\n123+++\n1234++++",
          explanation: "Numbers then plus signs"
        },
        {
          input: 2,
          output: "1+\n12++",
          explanation: "Two rows: numbers 1 to i then i plus signs"
        }
      ],
      hints: ["Print numbers first", "Then print plus signs"]
    },
    {
      id: "med-pat-6",
      title: "Plus then Number Pattern",
      description: "Print plus signs followed by numbers.",
      testCases: [
        {
          input: 4,
          output: "+1\n++2\n+++3\n++++4",
          explanation: "Plus signs then number"
        },
        {
          input: 2,
          output: "+1\n++2",
          explanation: "Row i has i plus signs then the number i"
        }
      ],
      hints: ["Print plus signs first", "Then print row number"]
    },
    {
      id: "med-pat-7",
      title: "Plus with Incremental Numbers",
      description: "Print plus signs followed by incremental numbers.",
      testCases: [
        {
          input: 4,
          output: "+1\n++12\n+++123\n++++1234",
          explanation: "Plus signs then numbers 1 to i"
        },
        {
          input: 2,
          output: "+1\n++12",
          explanation: "Row i has i plus signs then numbers 1 to i"
        }
      ],
      hints: ["Print i plus signs", "Then numbers 1 to i"]
    },
    {
      id: "med-pat-8",
      title: "Alphabet Pattern",
      description: "Print alphabet pattern.",
      testCases: [
        {
          input: 4,
          output: "A\nAB\nABC\nABCD",
          explanation: "Alphabets from A"
        },
        {
          input: 3,
          output: "A\nAB\nABC",
          explanation: "Three rows of letters starting from A"
        }
      ],
      hints: ["Use ASCII codes", "Start from 65 (A)"]
    },
    {
      id: "med-pat-9",
      title: "Spaced Alphabet Pattern",
      description: "Print alphabets with spaces.",
      testCases: [
        {
          input: 3,
          output: "A\nA B\nA B C",
          explanation: "Alphabets with spaces"
        },
        {
          input: 2,
          output: "A\nA B",
          explanation: "Two rows of space-separated letters"
        }
      ],
      hints: ["Add space between letters"]
    },
    {
      id: "med-pat-10",
      title: "Alphabet Number Mix Pattern",
      description: "Print alphabets followed by numbers.",
      testCases: [
        {
          input: 4,
          output: "A1\nAB12\nABC123\nABCD1234",
          explanation: "Letters then numbers"
        },
        {
          input: 2,
          output: "A1\nAB12",
          explanation: "Two rows: letters 1 to i then numbers 1 to i"
        }
      ],
      hints: ["Print letters first", "Then numbers"]
    },
    {
      id: "med-pat-11",
      title: "Alternating Case Pattern",
      description: "Print alternating uppercase and lowercase.",
      testCases: [
        {
          input: 4,
          output: "A\nab\nABC\nabcd",
          explanation: "Alternate case per row"
        },
        {
          input: 3,
          output: "A\nab\nABC",
          explanation: "Odd rows uppercase, even rows lowercase"
        }
      ],
      hints: ["Check if row is odd/even", "Use appropriate case"]
    }
  ]
};

// =======================================================
// MEDIUM LEVEL - Array Problems
// =======================================================
PROBLEM_SOLVING_BANK.mediumArrays = {
  topic: "Medium Array Problems",
  difficulty: "medium",
  problems: [
    {
      id: "med-arr-1",
      title: "Rotate Array",
      description: "Rotate array to the right by k steps.",
      testCases: [
        {
          input: [[1, 2, 3, 4, 5], 2],
          output: [4, 5, 1, 2, 3],
          explanation: "Rotated right by 2"
        },
        {
          input: [[1, 2, 3], 0],
          output: [1, 2, 3],
          explanation: "Rotating by 0 leaves the array unchanged"
        }
      ],
      hints: ["Slice and concatenate", "Or reverse in parts"]
    },
    {
      id: "med-arr-2",
      title: "Intersection of Two Arrays",
      description: "Return common elements between two arrays.",
      testCases: [
        {
          input: [[1, 2, 3], [2, 3, 4]],
          output: [2, 3],
          explanation: "Common elements"
        },
        {
          input: [[1, 2], [3, 4]],
          output: [],
          explanation: "No common elements"
        }
      ],
      hints: ["Use filter and includes", "Or use Set"]
    },
    {
      id: "med-arr-3",
      title: "Find Missing Number",
      description: "Find missing number in consecutive sequence.",
      testCases: [
        {
          input: [1, 2, 4, 5],
          output: 3,
          explanation: "3 is missing"
        },
        {
          input: [1, 2, 3, 5],
          output: 4,
          explanation: "4 is missing from the consecutive sequence"
        }
      ],
      hints: ["Calculate expected sum", "Subtract actual sum"]
    },
    {
      id: "med-arr-4",
      title: "Maximum Product of Two Elements",
      description: "Find maximum product of two elements.",
      testCases: [
        {
          input: [3, 5, -2, 8, 11],
          output: 88,
          explanation: "8 * 11 = 88"
        },
        {
          input: [4, 4, 2],
          output: 16,
          explanation: "The two largest values, 4 and 4, multiply to 16"
        }
      ],
      hints: ["Sort array", "Multiply largest two"]
    },
    {
      id: "med-arr-5",
      title: "Move Zeros to End",
      description: "Move all zeros to end maintaining order.",
      testCases: [
        {
          input: [0, 1, 0, 3, 12],
          output: [1, 3, 12, 0, 0],
          explanation: "Zeros moved to end"
        },
        {
          input: [1, 2, 3],
          output: [1, 2, 3],
          explanation: "No zeros to move"
        }
      ],
      hints: ["Filter non-zeros", "Add zeros at end"]
    },
    {
      id: "med-arr-6",
      title: "Pair Sum",
      description: "Find all pairs whose sum equals target.",
      testCases: [
        {
          input: [[2, 4, 3, 5, 7, 8, 9], 7],
          output: [[4, 3], [2, 5]],
          explanation: "Pairs that sum to 7"
        }
      ],
      hints: ["Use two pointers", "Or hash map"]
    },
    {
      id: "med-arr-7",
      title: "Find Peak Element",
      description: "Find element not smaller than neighbors.",
      testCases: [
        {
          input: [1, 3, 20, 4, 1, 0],
          output: 20,
          explanation: "20 is peak"
        },
        {
          input: [5, 4, 3, 2, 1],
          output: 5,
          explanation: "5 has no left neighbor and is greater than the next element, so it's a peak"
        }
      ],
      hints: ["Compare with neighbors", "Check boundaries"]
    },
    {
      id: "med-arr-8",
      title: "First Duplicate",
      description: "Return first duplicate value.",
      testCases: [
        {
          input: [2, 1, 3, 5, 3, 2],
          output: 3,
          explanation: "3 appears first as duplicate"
        },
        {
          input: [4, 4, 5, 6],
          output: 4,
          explanation: "4 repeats immediately, so it's the first duplicate found"
        }
      ],
      hints: ["Use Set to track seen", "Return when found"]
    },
    {
      id: "med-arr-9",
      title: "Flatten Nested Array",
      description: "Flatten nested array into single array.",
      testCases: [
        {
          input: [1, [2, [3, [4]], 5]],
          output: [1, 2, 3, 4, 5],
          explanation: "All levels flattened"
        },
        {
          input: [1, 2, 3],
          output: [1, 2, 3],
          explanation: "Already flat, no nested arrays to flatten"
        }
      ],
      hints: ["Use recursion", "Or flat() method"]
    },
    {
      id: "med-arr-10",
      title: "Group Anagrams",
      description: "Group anagrams from array of strings.",
      testCases: [
        {
          input: ["eat", "tea", "tan", "ate", "nat", "bat"],
          output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
          explanation: "Anagrams grouped"
        }
      ],
      hints: ["Sort each word", "Use as key in map"]
    },
    {
      id: "med-arr-11",
      title: "Longest Increasing Subsequence",
      description: "Find length of longest increasing subsequence.",
      testCases: [
        {
          input: [10, 9, 2, 5, 3, 7, 101, 18],
          output: 4,
          explanation: "[2, 3, 7, 101] or [2, 5, 7, 18]"
        },
        {
          input: [5, 4, 3, 2, 1],
          output: 1,
          explanation: "Strictly decreasing, so the longest increasing subsequence has length 1"
        }
      ],
      hints: ["Dynamic programming", "Track longest at each position"]
    },
    {
      id: "med-arr-12",
      title: "Rearrange Even Before Odd",
      description: "Place even numbers before odd, maintain relative order.",
      testCases: [
        {
          input: [3, 1, 2, 4, 7, 6, 5],
          output: [2, 4, 6, 3, 1, 7, 5],
          explanation: "Evens first, then odds"
        },
        {
          input: [1, 3, 5],
          output: [1, 3, 5],
          explanation: "No even numbers, order unchanged"
        }
      ],
      hints: ["Filter evens and odds separately", "Concatenate"]
    }
  ]
};

// =======================================================
// MEDIUM LEVEL - String Problems
// =======================================================
PROBLEM_SOLVING_BANK.mediumStrings = {
  topic: "Medium String Problems",
  difficulty: "medium",
  problems: [
    {
      id: "med-str-1",
      title: "Find Longest Word",
      description: "Find the longest word in a string.",
      testCases: [
        {
          input: "The quick brown fox jumps over the lazy dog",
          output: "jumps",
          explanation: "jumps is the longest word"
        },
        {
          input: "I love programming",
          output: "programming",
          explanation: "programming is unambiguously the longest word"
        }
      ],
      hints: ["Split by space", "Find max length"]
    },
    {
      id: "med-str-2",
      title: "Check for Anagrams",
      description: "Check if two strings are anagrams.",
      testCases: [
        {
          input: ["listen", "silent"],
          output: true,
          explanation: "Same letters, different order"
        },
        {
          input: ["hello", "world"],
          output: false,
          explanation: "Different letters, not anagrams"
        }
      ],
      hints: ["Sort both strings", "Compare"]
    },
    {
      id: "med-str-3",
      title: "First Non-Repeating Character",
      description: "Find first character that doesn't repeat.",
      testCases: [
        {
          input: "swiss",
          output: "w",
          explanation: "w appears only once"
        },
        {
          input: "aabbc",
          output: "c",
          explanation: "a and b repeat; c is the first character that doesn't repeat"
        }
      ],
      hints: ["Count frequency", "Find first with count 1"]
    },
    {
      id: "med-str-4",
      title: "Valid Number String",
      description: "Check if string is a valid number.",
      testCases: [
        {
          input: "123.45",
          output: true,
          explanation: "Valid decimal number"
        },
        {
          input: "12a.45",
          output: false,
          explanation: "Contains a non-numeric character 'a'"
        }
      ],
      hints: ["Use regex", "Or parseFloat and check"]
    },
    {
      id: "med-str-5",
      title: "String Rotation",
      description: "Check if one string is rotation of another.",
      testCases: [
        {
          input: ["abcde", "cdeab"],
          output: true,
          explanation: "cdeab is rotation of abcde"
        },
        {
          input: ["abcde", "abced"],
          output: false,
          explanation: "abced is not a rotation of abcde"
        }
      ],
      hints: ["Concatenate first string with itself", "Check if second is substring"]
    },
    {
      id: "med-str-6",
      title: "Reverse Words",
      description: "Reverse order of words in string.",
      testCases: [
        {
          input: "hello world",
          output: "world hello",
          explanation: "Words reversed"
        },
        {
          input: "hello",
          output: "hello",
          explanation: "A single word is unchanged when word order is reversed"
        }
      ],
      hints: ["Split by space", "Reverse array", "Join"]
    },
    {
      id: "med-str-7",
      title: "String Compression",
      description: "Compress string using counts of repeated characters.",
      testCases: [
        {
          input: "aabcccccaaa",
          output: "a2b1c5a3",
          explanation: "Character counts"
        },
        {
          input: "abc",
          output: "a1b1c1",
          explanation: "Each character appears once"
        }
      ],
      hints: ["Track current character", "Count consecutive occurrences"]
    },
    {
      id: "med-str-8",
      title: "String Permutations",
      description: "Find all permutations of a string.",
      testCases: [
        {
          input: "abc",
          output: ["abc", "acb", "bac", "bca", "cab", "cba"],
          explanation: "All arrangements"
        },
        {
          input: "ab",
          output: ["ab", "ba"],
          explanation: "Only two permutations of a 2-character string"
        }
      ],
      hints: ["Use recursion", "Swap characters"]
    },
    {
      id: "med-str-9",
      title: "Longest Substring Without Repeating",
      description: "Find length of longest substring without repeating characters.",
      testCases: [
        {
          input: "abcabcbb",
          output: 3,
          explanation: "abc is longest"
        },
        {
          input: "abcdef",
          output: 6,
          explanation: "All characters are unique, so the whole string is the answer"
        }
      ],
      hints: ["Sliding window", "Track seen characters"]
    },
    {
      id: "med-str-10",
      title: "Roman to Integer",
      description: "Convert Roman numeral to integer.",
      testCases: [
        {
          input: "MCMXCIV",
          output: 1994,
          explanation: "M=1000, CM=900, XC=90, IV=4"
        },
        {
          input: "III",
          output: 3,
          explanation: "I+I+I = 3"
        }
      ],
      hints: ["Map Roman to values", "Handle subtraction cases"]
    },
    {
      id: "med-str-11",
      title: "Longest Palindromic Substring",
      description: "Find longest palindromic substring.",
      testCases: [
        {
          input: "babad",
          output: "bab",
          explanation: "bab or aba are longest"
        },
        {
          input: "cbbd",
          output: "bb",
          explanation: "bb is the unique longest palindromic substring"
        }
      ],
      hints: ["Expand around center", "Check all positions"]
    },
    {
      id: "med-str-12",
      title: "Isomorphic Strings",
      description: "Check if two strings are isomorphic.",
      testCases: [
        {
          input: ["egg", "add"],
          output: true,
          explanation: "e->a, g->d mapping works"
        },
        {
          input: ["foo", "bar"],
          output: false,
          explanation: "o would need to map to both a and r, which is inconsistent"
        }
      ],
      hints: ["Create character mapping", "Check consistency"]
    }
  ]
};

// =======================================================
// MEDIUM LEVEL - Object Problems
// =======================================================
PROBLEM_SOLVING_BANK.mediumObjects = {
  topic: "Medium Object Problems",
  difficulty: "medium",
  problems: [
    {
      id: "med-obj-1",
      title: "Deep Clone Object",
      description: "Create a deep clone of an object.",
      testCases: [
        {
          input: {a: 1, b: {c: 2}},
          output: {a: 1, b: {c: 2}},
          explanation: "Deep copy created"
        },
        {
          input: {a: [1, 2, 3]},
          output: {a: [1, 2, 3]},
          explanation: "Deep clone preserves nested array values"
        }
      ],
      hints: ["Use JSON.parse(JSON.stringify())", "Or recursive copy"]
    },
    {
      id: "med-obj-2",
      title: "Deep Object Equality",
      description: "Check if two objects are deeply equal.",
      testCases: [
        {
          input: [{a: 1, b: 2}, {a: 1, b: 2}],
          output: true,
          explanation: "Objects are equal"
        },
        {
          input: [{a: 1, b: 2}, {a: 1, b: 3}],
          output: false,
          explanation: "b values differ (2 vs 3)"
        }
      ],
      hints: ["Compare keys and values recursively"]
    },
    {
      id: "med-obj-3",
      title: "Find Common Keys",
      description: "Find common keys in two objects.",
      testCases: [
        {
          input: [{a: 1, b: 2}, {b: 3, c: 4}],
          output: ["b"],
          explanation: "b is common"
        },
        {
          input: [{a: 1}, {b: 2}],
          output: [],
          explanation: "No shared keys between the two objects"
        }
      ],
      hints: ["Get keys from both", "Find intersection"]
    },
    {
      id: "med-obj-4",
      title: "Sum Values by Key",
      description: "Sum values of specific key across array of objects.",
      testCases: [
        {
          input: [[{a: 1}, {a: 2}, {a: 3}], "a"],
          output: 6,
          explanation: "1+2+3 = 6"
        },
        {
          input: [[{a: 5}], "a"],
          output: 5,
          explanation: "Only one object, sum equals its value"
        }
      ],
      hints: ["Map to extract values", "Reduce to sum"]
    },
    {
      id: "med-obj-5",
      title: "Group Objects by Property",
      description: "Group array of objects by a property.",
      testCases: [
        {
          input: [[{name: "Alice", age: 25}, {name: "Bob", age: 30}, {name: "Alice", age: 28}], "name"],
          output: {
            Alice: [{name: "Alice", age: 25}, {name: "Alice", age: 28}],
            Bob: [{name: "Bob", age: 30}]
          },
          explanation: "Grouped by name"
        },
        {
          input: [[{name: "Bob", age: 20}, {name: "Bob", age: 22}], "name"],
          output: {
            Bob: [{name: "Bob", age: 20}, {name: "Bob", age: 22}]
          },
          explanation: "Both objects share the same name, grouped together"
        }
      ],
      hints: ["Use reduce", "Create groups dynamically"]
    },
    {
      id: "med-obj-6",
      title: "Object to Query String",
      description: "Convert object to query string format.",
      testCases: [
        {
          input: {name: "Alice", age: 25},
          output: "name=Alice&age=25",
          explanation: "Query string format"
        },
        {
          input: {id: 1},
          output: "id=1",
          explanation: "Single property produces a single key=value pair"
        }
      ],
      hints: ["Map entries", "Join with &"]
    },
    {
      id: "med-obj-7",
      title: "Find Deepest Property",
      description: "Find the deepest nested property path.",
      testCases: [
        {
          input: {a: {b: {c: 1}}},
          output: "a.b.c",
          explanation: "Deepest path"
        },
        {
          input: {x: 1},
          output: "x",
          explanation: "Only one level deep, path is just the key itself"
        }
      ],
      hints: ["Recursively traverse", "Track depth"]
    },
    {
      id: "med-obj-8",
      title: "Flatten Nested Object",
      description: "Convert nested object to flat object.",
      testCases: [
        {
          input: {a: {b: {c: 1}}},
          output: {"a.b.c": 1},
          explanation: "Flattened with dot notation"
        },
        {
          input: {a: 1, b: 2},
          output: {a: 1, b: 2},
          explanation: "Already flat, keys remain unchanged"
        }
      ],
      hints: ["Recursively build keys", "Join with dots"]
    },
    {
      id: "med-obj-9",
      title: "Create Lookup Table",
      description: "Create lookup table from array of objects.",
      testCases: [
        {
          input: [[{id: 1, name: "Alice"}, {id: 2, name: "Bob"}], "id"],
          output: {
            1: {id: 1, name: "Alice"},
            2: {id: 2, name: "Bob"}
          },
          explanation: "Lookup by id"
        },
        {
          input: [[{id: 5, name: "Eve"}], "id"],
          output: {
            5: {id: 5, name: "Eve"}
          },
          explanation: "Single item produces a single-entry lookup table"
        }
      ],
      hints: ["Reduce to object", "Use key as property"]
    }
  ]
};

// =======================================================
// MEDIUM LEVEL - Fundamental Problems
// =======================================================
PROBLEM_SOLVING_BANK.mediumFundamentals = {
  topic: "Medium Fundamental Problems",
  difficulty: "medium",
  problems: [
    {
      id: "med-fund-1",
      title: "Basic Calculator",
      description: "Implement calculator with basic operations.",
      testCases: [
        {
          input: [2, 3, "+"],
          output: 5,
          explanation: "2 + 3 = 5"
        },
        {
          input: [10, 4, "-"],
          output: 6,
          explanation: "10 - 4 = 6"
        }
      ],
      hints: ["Use switch statement", "Handle all operators"]
    },
    {
      id: "med-fund-2",
      title: "FizzBuzz",
      description: "Print numbers 1-100, Fizz for multiples of 3, Buzz for 5, FizzBuzz for both.",
      testCases: [
        {
          input: 15,
          output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz",
          explanation: "FizzBuzz pattern"
        },
        {
          input: 5,
          output: "1 2 Fizz 4 Buzz",
          explanation: "Fizz for multiples of 3, Buzz for multiples of 5"
        }
      ],
      hints: ["Check divisibility", "Handle both case first"]
    },
    {
      id: "med-fund-3",
      title: "Fibonacci Sequence",
      description: "Generate first n Fibonacci numbers.",
      testCases: [
        {
          input: 5,
          output: [0, 1, 1, 2, 3],
          explanation: "First 5 Fibonacci numbers"
        },
        {
          input: 1,
          output: [0],
          explanation: "The first Fibonacci number is 0"
        }
      ],
      hints: ["Start with 0, 1", "Each is sum of previous two"]
    },
    {
      id: "med-fund-4",
      title: "Sum of Digits",
      description: "Return sum of digits in a number.",
      testCases: [
        {
          input: 123,
          output: 6,
          explanation: "1+2+3 = 6"
        },
        {
          input: 999,
          output: 27,
          explanation: "9+9+9 = 27"
        }
      ],
      hints: ["Convert to string", "Sum each digit"]
    },
    {
      id: "med-fund-5",
      title: "Binary Search",
      description: "Perform binary search on sorted array.",
      testCases: [
        {
          input: [[1, 2, 3, 4, 5], 3],
          output: 2,
          explanation: "3 is at index 2"
        },
        {
          input: [[1, 2, 3, 4, 5], 10],
          output: -1,
          explanation: "10 is not in the array, so binary search returns -1"
        }
      ],
      hints: ["Compare with middle", "Adjust search range"]
    },
    {
      id: "med-fund-6",
      title: "Armstrong Number",
      description: "Check if number is Armstrong number.",
      testCases: [
        {
          input: 153,
          output: true,
          explanation: "1³ + 5³ + 3³ = 153"
        },
        {
          input: 123,
          output: false,
          explanation: "1³+2³+3³ = 1+8+27 = 36, not equal to 123"
        }
      ],
      hints: ["Count digits", "Sum of powers equals number"]
    },
    {
      id: "med-fund-7",
      title: "Balanced Parentheses",
      description: "Check if parentheses string is balanced.",
      testCases: [
        {
          input: "{[()]}",
          output: true,
          explanation: "All brackets balanced"
        },
        {
          input: "{[(])}",
          output: false,
          explanation: "Not properly nested"
        }
      ],
      hints: ["Use stack", "Match opening with closing"]
    }
  ]
};

// =======================================================
// 🔹 HELPER FUNCTIONS
// =======================================================

function getRandomProblem(difficulty = "easy", category = null) {
  const categories = category 
    ? [PROBLEM_SOLVING_BANK[category]]
    : Object.values(PROBLEM_SOLVING_BANK);
  
  const matchingCategories = categories.filter(cat => 
    cat && cat.difficulty === difficulty
  );
  
  if (matchingCategories.length === 0) {
    return null;
  }
  
  const randomCategory = matchingCategories[Math.floor(Math.random() * matchingCategories.length)];
  const problems = randomCategory.problems;
  
  if (!problems || problems.length === 0) {
    return null;
  }
  
  return problems[Math.floor(Math.random() * problems.length)];
}

function getProblemById(id) {
  for (const category of Object.values(PROBLEM_SOLVING_BANK)) {
    if (category.problems) {
      const problem = category.problems.find(p => p.id === id);
      if (problem) return problem;
    }
  }
  return null;
}

/** Problems don't carry their own difficulty — it lives on the parent category. */
function getProblemDifficultyById(id) {
  for (const category of Object.values(PROBLEM_SOLVING_BANK)) {
    if (category.problems?.some(p => p.id === id)) {
      return category.difficulty || null;
    }
  }
  return null;
}

function getProblemsByDifficulty(difficulty) {
  const problems = [];
  for (const category of Object.values(PROBLEM_SOLVING_BANK)) {
    if (category.difficulty === difficulty && category.problems) {
      problems.push(...category.problems);
    }
  }
  return problems;
}

function getAllProblems() {
  const problems = [];
  for (const category of Object.values(PROBLEM_SOLVING_BANK)) {
    if (category.problems) {
      problems.push(...category.problems);
    }
  }
  return problems;
}

function getProblemStats() {
  const stats = {
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
    categories: {}
  };
  
  for (const [key, category] of Object.entries(PROBLEM_SOLVING_BANK)) {
    if (category.problems) {
      const count = category.problems.length;
      stats[category.difficulty] += count;
      stats.total += count;
      stats.categories[key] = {
        topic: category.topic,
        difficulty: category.difficulty,
        count: count
      };
    }
  }
  
  return stats;
}

module.exports = {
  PROBLEM_SOLVING_BANK,
  getRandomProblem,
  getProblemById,
  getProblemDifficultyById,
  getProblemsByDifficulty,
  getAllProblems,
  getProblemStats
};
