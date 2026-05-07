// =======================================================
// 🎓 ANALOGY DATABASE - LEVEL 1 (BEGINNER)
// Story-based explanations for complete beginners
// =======================================================

const BEGINNER_ANALOGIES = {
  // JavaScript Concepts
  closure: {
    concept: "Closure",
    story: `Let me explain closure in the simplest way possible.

Imagine you're a person going on a trip.

Before you leave home, you pack a backpack. You put some things from home into that backpack - maybe your favorite book, a photo of your family, and some snacks.

Now you travel far away from home. You're in a different city, maybe even a different country.

Here's the important part: Even when you're far away from home, you STILL have access to what you brought from home. You can still read that book, look at that photo, eat those snacks.

You didn't leave them behind. They traveled with you.

That's EXACTLY how closure works in programming.

A function is like you going on a trip. The variables from the outer function are like the things you packed from home. Even when the function goes somewhere else in your code (far from where it was created), it STILL has access to what it brought from home.

It didn't leave those variables behind. They traveled with the function.

Make sense?`,
    crossQuestion: "Can you tell me WHY we would need this 'backpack' concept in programming? What problem does it solve?"
  },

  promise: {
    concept: "Promise / Async",
    story: `Let me explain promises in the simplest way possible.

Imagine you're at a restaurant with friends.

You call the waiter and say "I'd like a pizza, please." The waiter says "Sure! I'll bring it when it's ready" and walks away to the kitchen.

Now here's what you do: You DON'T sit there frozen, staring at the kitchen door, waiting for your pizza. That would be weird, right?

Instead, you continue talking with your friends, laughing, enjoying your time. You're doing other things while the pizza is being made.

When the pizza is ready, the waiter brings it to your table. You stop your conversation for a moment, take the pizza, and continue.

That's EXACTLY how promises work in programming.

When you ask for data (like from a server), you don't freeze your entire program waiting for it. You tell the program "Hey, go get this data, and when it's ready, let me know."

Meanwhile, your program continues doing other things - showing animations, responding to clicks, whatever.

When the data arrives, the program handles it, just like you handle the pizza when it arrives.

Make sense?`,
    crossQuestion: "Why would we want the program to continue doing other things instead of just waiting? What's the benefit?"
  },

  variable: {
    concept: "Variables (let vs const)",
    story: `Let me explain variables in the simplest way possible.

Imagine you have a notebook where you write things down.

With a PENCIL, you can write something, then erase it and write something new. You can change what's written as many times as you want.

With a PERMANENT MARKER, once you write something, it stays there forever. You can't erase it or change it.

That's EXACTLY the difference between 'let' and 'const' in programming.

'let' is like writing with a pencil - you can change the value later if you need to.

'const' is like writing with a permanent marker - once you set the value, it can't be changed.

Make sense?`,
    crossQuestion: "When would you want to use a permanent marker (const) instead of a pencil (let)?"
  },

  array: {
    concept: "Array",
    story: `Let me explain arrays in the simplest way possible.

Imagine you have a row of lockers at school, numbered 0, 1, 2, 3, 4...

Each locker can hold something inside - maybe books, a jacket, or a lunch box.

When you want to get something from a specific locker, you just use its number. "Give me what's in locker 3" and you open locker 3.

You can also put new things in any locker, or take things out.

That's EXACTLY how arrays work in programming.

An array is like a row of lockers. Each position has a number (we call it an index). You can store things in each position, and you can access them by their number.

array[3] means "give me what's in position 3" - just like opening locker 3.

Make sense?`,
    crossQuestion: "Why would we want to store multiple things in numbered positions instead of giving each thing its own separate name?"
  },

  function: {
    concept: "Function",
    story: `Let me explain functions in the simplest way possible.

Imagine you have a recipe for making chocolate chip cookies.

The recipe tells you: Take flour, sugar, butter, and chocolate chips. Mix them together, bake for 15 minutes, and you get cookies.

Every time you follow that recipe with the same ingredients, you get the same delicious cookies.

You don't have to figure out how to make cookies from scratch each time. You just follow the recipe.

That's EXACTLY how functions work in programming.

A function is like a recipe. You give it some ingredients (we call them parameters), it does some steps, and gives you back a result.

Every time you use that function with the same inputs, you get the same output - just like following a recipe.

Make sense?`,
    crossQuestion: "Why would we want to write a recipe (function) instead of just doing the steps manually each time?"
  },

  loop: {
    concept: "Loop (for/while)",
    story: `Let me explain loops in the simplest way possible.

Imagine you have a sink full of dirty dishes - 10 plates that need washing.

You pick up the first plate, wash it with soap, rinse it, and put it on the drying rack.

Then you pick up the second plate, wash it with soap, rinse it, and put it on the drying rack.

You do the SAME THING for each plate until all 10 plates are clean.

You don't do something different for each plate - it's the same action repeated 10 times.

That's EXACTLY how loops work in programming.

A loop says "Do this same action for each item in a list" or "Do this action 10 times."

You write the action once, and the loop repeats it automatically - just like you wash each plate the same way.

Make sense?`,
    crossQuestion: "What would happen if we didn't have loops? How would we wash 100 plates in code?"
  },

  object: {
    concept: "Object",
    story: `Let me explain objects in the simplest way possible.

Imagine you have a person - let's say your friend John.

John has different properties: He has a name (John), an age (25), a job (teacher), and a favorite color (blue).

When someone asks "What's John's age?", you say "25". When they ask "What's John's job?", you say "teacher".

All of John's information is grouped together because it belongs to the same person.

That's EXACTLY how objects work in programming.

An object is like a person (or any thing) with multiple properties. Instead of having separate variables for name, age, job, and color, you group them all together in one object.

person.age gives you the age, person.job gives you the job - just like asking about John's properties.

Make sense?`,
    crossQuestion: "Why would we want to group related information together instead of keeping everything separate?"
  },

  callback: {
    concept: "Callback Function",
    story: `Let me explain callbacks in the simplest way possible.

Imagine you're at home and you order a package online.

You tell the delivery person: "When you arrive with my package, ring the doorbell."

You don't stand at the door waiting all day. You go about your life - watching TV, cooking, working.

When the delivery person arrives, they ring the doorbell. That's your signal to go to the door and get your package.

The doorbell ring is like a callback - it's an action that happens LATER, when something is ready.

That's EXACTLY how callbacks work in programming.

You tell the program: "When this task is done, call this function." Then your program continues doing other things.

When the task finishes, the callback function runs - just like the doorbell rings when the package arrives.

Make sense?`,
    crossQuestion: "Why would we want to be notified when something is done, instead of just waiting for it?"
  },

  scope: {
    concept: "Scope",
    story: `Let me explain scope in the simplest way possible.

Imagine you have a house with different rooms.

In the kitchen, you have kitchen stuff - pots, pans, a stove. In the bedroom, you have bedroom stuff - a bed, a closet, pillows.

When you're in the kitchen, you can use the kitchen stuff easily. But you can't reach into the bedroom and grab a pillow without walking there first.

Each room has its own stuff, and you can only use what's in the room you're currently in.

That's EXACTLY how scope works in programming.

Each function is like a room. Variables created inside that function are like items in that room - they only exist in that room.

You can't access a variable from outside its function, just like you can't grab a pillow from the kitchen without going to the bedroom.

Make sense?`,
    crossQuestion: "Why would we want variables to be limited to certain 'rooms' instead of everything being available everywhere?"
  },

  hoisting: {
    concept: "Hoisting",
    story: `Let me explain hoisting in the simplest way possible.

Imagine you're reading a book, but before you start reading, someone tells you "By the way, there's a character named Sarah who appears later."

Now when you're reading and suddenly Sarah is mentioned, you're not confused. You already know Sarah exists, even though you haven't met her in the story yet.

That's similar to how hoisting works in programming.

JavaScript reads your entire code first and says "Okay, I see you're going to create these variables and functions later." So when your code runs and uses those variables, JavaScript already knows they exist.

It's like JavaScript gives you a preview of what's coming, so nothing is a complete surprise.

Make sense?`,
    crossQuestion: "Why would JavaScript want to know about variables before it actually runs the code that creates them?"
  }
};

// =======================================================
// 🎓 CROSS-QUESTION BANK (For Level Detection)
// =======================================================

const LEVEL_KEYWORDS = {
  beginner: [
    "don't know", "not sure", "no idea", "store", "save", "keep", 
    "hold", "remember", "because", "to use", "to have"
  ],
  intermediate: [
    "private", "encapsulation", "callback", "state", "manage", 
    "handle", "scope", "reference", "memory", "access", "protect"
  ],
  advanced: [
    "lexical", "scope chain", "execution context", "closure scope",
    "memory leak", "garbage collection", "performance", "optimization",
    "heap", "stack", "binding", "hoisting mechanism"
  ]
};

// =======================================================
// 🎓 DETECT STUDENT LEVEL
// =======================================================

function detectLevel(answer) {
  if (!answer || answer.trim().length < 5) {
    return "beginner";
  }

  const lower = answer.toLowerCase();
  
  // Count keyword matches
  const advancedCount = LEVEL_KEYWORDS.advanced.filter(kw => 
    lower.includes(kw)
  ).length;
  
  const intermediateCount = LEVEL_KEYWORDS.intermediate.filter(kw => 
    lower.includes(kw)
  ).length;
  
  const beginnerCount = LEVEL_KEYWORDS.beginner.filter(kw => 
    lower.includes(kw)
  ).length;
  
  // Decision logic
  if (advancedCount >= 2) return "advanced";
  if (intermediateCount >= 2) return "intermediate";
  if (advancedCount >= 1 && intermediateCount >= 1) return "intermediate";
  if (intermediateCount >= 1 && answer.length > 30) return "intermediate";
  
  return "beginner";
}

// =======================================================
// 🎓 GET ANALOGY
// =======================================================

function getAnalogy(concept) {
  const normalized = concept.toLowerCase().trim();
  
  // Direct match
  if (BEGINNER_ANALOGIES[normalized]) {
    return BEGINNER_ANALOGIES[normalized];
  }
  
  // Fuzzy match
  for (const [key, value] of Object.entries(BEGINNER_ANALOGIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

module.exports = {
  BEGINNER_ANALOGIES,
  LEVEL_KEYWORDS,
  detectLevel,
  getAnalogy
};
