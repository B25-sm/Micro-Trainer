// ===============================================
// 🔧 MICRO TRAINER - BACKGROUND SERVICE WORKER
// Handles extension lifecycle and messaging
// ===============================================

console.log('🧠 Micro Trainer: Background service worker started');

// Production URLs
const BACKEND_URL = 'https://micro-trainer.onrender.com';
const FRONTEND_URL = 'https://micro-trainer.vercel.app';

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✅ Micro Trainer installed');
    
    // Open welcome page
    chrome.tabs.create({
      url: FRONTEND_URL
    });
  }
  
  if (details.reason === 'update') {
    console.log('🔄 Micro Trainer updated to', chrome.runtime.getManifest().version);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle panel in active tab
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error toggling panel:', chrome.runtime.lastError);
    }
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.action === 'getConfig') {
    // Return configuration
    chrome.storage.sync.get(['apiUrl', 'studentId'], (data) => {
      sendResponse({
        apiUrl: data.apiUrl || BACKEND_URL,
        frontendUrl: FRONTEND_URL,
        studentId: data.studentId || 'student_' + Date.now()
      });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'saveConfig') {
    // Save configuration
    chrome.storage.sync.set(request.config, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'trackEvent') {
    // Analytics tracking (implement later)
    console.log('📊 Event:', request.event);
    sendResponse({ success: true });
  }
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('🔌 Port connected:', port.name);
});
