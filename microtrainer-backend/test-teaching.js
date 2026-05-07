// =======================================================
// 🧪 TEST ADAPTIVE TEACHING SYSTEM
// =======================================================

require("dotenv").config();
const { adaptiveTeach } = require("./services/adaptiveTeachingService");

async function testTeaching() {
  console.log("🧪 Testing Adaptive Teaching System\n");
  console.log("=" .repeat(60));
  
  // TEST 1: Ask about closure (first time)
  console.log("\n📚 TEST 1: Student asks about closure\n");
  const step1 = await adaptiveTeach({
    concept: "closure",
    studentAnswer: null,
    conversationHistory: [],
    detectedLevel: null
  });
  
  console.log("🤖 Sai's Explanation:");
  console.log(step1.explanation);
  console.log("\n❓ Cross Question:");
  console.log(step1.crossQuestion);
  console.log("\n⏳ Awaiting level detection:", step1.awaitingLevelDetection);
  
  console.log("\n" + "=".repeat(60));
  
  // TEST 2: Student answers (beginner level)
  console.log("\n📚 TEST 2: Student answers (beginner response)\n");
  console.log("👤 Student: 'Um... to store data?'\n");
  
  const step2 = await adaptiveTeach({
    concept: "closure",
    studentAnswer: "Um... to store data?",
    conversationHistory: [
      { role: "assistant", content: step1.explanation },
      { role: "user", content: "Um... to store data?" }
    ],
    detectedLevel: null
  });
  
  console.log("📊 Detected Level:", step2.level?.toUpperCase());
  console.log("\n🤖 Sai's Adapted Explanation:");
  console.log(step2.explanation);
  
  console.log("\n" + "=".repeat(60));
  
  // TEST 3: Student answers (intermediate level)
  console.log("\n📚 TEST 3: Student answers (intermediate response)\n");
  console.log("👤 Student: 'To keep variables private and use them in callbacks'\n");
  
  const step3 = await adaptiveTeach({
    concept: "closure",
    studentAnswer: "To keep variables private and use them in callbacks",
    conversationHistory: [
      { role: "assistant", content: step1.explanation },
      { role: "user", content: "To keep variables private and use them in callbacks" }
    ],
    detectedLevel: null
  });
  
  console.log("📊 Detected Level:", step3.level?.toUpperCase());
  console.log("\n🤖 Sai's Adapted Explanation:");
  console.log(step3.explanation);
  
  console.log("\n" + "=".repeat(60));
  
  // TEST 4: Student answers (advanced level)
  console.log("\n📚 TEST 4: Student answers (advanced response)\n");
  console.log("👤 Student: 'Closures create lexical scope binding and maintain references to outer variables'\n");
  
  const step4 = await adaptiveTeach({
    concept: "closure",
    studentAnswer: "Closures create lexical scope binding and maintain references to outer variables",
    conversationHistory: [
      { role: "assistant", content: step1.explanation },
      { role: "user", content: "Closures create lexical scope binding and maintain references to outer variables" }
    ],
    detectedLevel: null
  });
  
  console.log("📊 Detected Level:", step4.level?.toUpperCase());
  console.log("\n🤖 Sai's Adapted Explanation:");
  console.log(step4.explanation);
  
  console.log("\n" + "=".repeat(60));
  console.log("\n✅ Testing Complete!\n");
}

testTeaching().catch(console.error);
