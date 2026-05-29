// ===============================================
// 🚀 MICRO TRAINER - CONTENT SCRIPT
// Injects side panel into all web pages
// ===============================================

console.log('🧠 Micro Trainer: Content script loaded');

const DEFAULT_FRONTEND_URL = 'https://micro-trainer.vercel.app';
const PANEL_PATH = '/extension';

const SETUP_HOST_PATTERNS = [
  'micro-trainer-1.onrender.com',
  'setup.microtrainer.com',
];

function isSetupOrLicensePage() {
  const host = window.location.hostname;
  const path = window.location.pathname || '';
  if (SETUP_HOST_PATTERNS.some((pattern) => host.includes(pattern))) return true;
  if (path.startsWith('/setup')) return true;
  return false;
}

if (isSetupOrLicensePage()) {
  console.log('ℹ️ Micro Trainer: Setup/license page — extension panel skipped');
} else {

let lastSavedFrontendUrl = null;
let connectWriteTimer = null;

function saveFrontendUrl(frontendUrl, iframe) {
  if (!frontendUrl || frontendUrl === lastSavedFrontendUrl) return;

  if (connectWriteTimer) clearTimeout(connectWriteTimer);
  connectWriteTimer = setTimeout(() => {
    chrome.storage.sync.get(['frontendUrl'], (data) => {
      if (data.frontendUrl === frontendUrl) {
        lastSavedFrontendUrl = frontendUrl;
        if (iframe) iframe.src = buildAppUrl(frontendUrl);
        return;
      }

      chrome.storage.sync.set({ frontendUrl }, () => {
        if (chrome.runtime.lastError) {
          console.warn('Micro Trainer: storage sync skipped:', chrome.runtime.lastError.message);
          return;
        }
        lastSavedFrontendUrl = frontendUrl;
        if (iframe) iframe.src = buildAppUrl(frontendUrl);
        console.log('✅ Micro Trainer: Official app connected', frontendUrl);
      });
    });
  }, 500);
}

function buildAppUrl(frontendUrl, path = PANEL_PATH) {
  try {
    const url = new URL(frontendUrl || DEFAULT_FRONTEND_URL);
    url.pathname = path;
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (_) {
    return `${DEFAULT_FRONTEND_URL}${path}`;
  }
}

// Function to inject the panel
function injectPanel() {
  // Check if panel already exists (prevent duplicates)
  if (document.getElementById('microtrainer-panel')) {
    console.log('⚠️ Micro Trainer: Panel already exists');
    return;
  }

  // Check if body exists
  if (!document.body) {
    console.log('⚠️ Micro Trainer: Body not ready, waiting...');
    setTimeout(injectPanel, 100);
    return;
  }
  
  console.log('🔧 Micro Trainer: Injecting panel...');
  
  // Create side panel container
  const panel = document.createElement('div');
  panel.id = 'microtrainer-panel';
  panel.className = 'microtrainer-hidden'; // Start hidden
  
  // Create iframe to load React app
  const iframe = document.createElement('iframe');
  iframe.id = 'microtrainer-iframe';
  iframe.src = buildAppUrl(DEFAULT_FRONTEND_URL);
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;
  
  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'microtrainer-toggle';
  toggleBtn.innerHTML = '🧠';
  toggleBtn.title = 'Toggle Micro Trainer';
  
  // Assemble panel
  panel.appendChild(iframe);
  document.body.appendChild(panel);
  document.body.appendChild(toggleBtn);
  
  console.log('✅ Micro Trainer: Panel and button added to DOM');
  
  // Toggle functionality
  toggleBtn.addEventListener('click', () => {
    console.log('🖱️ Micro Trainer: Toggle button clicked');
    panel.classList.toggle('microtrainer-hidden');
    toggleBtn.classList.toggle('active');
  });

  chrome.storage.sync.get(['frontendUrl'], (data) => {
    iframe.src = buildAppUrl(data.frontendUrl);
  });

  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow && event.source !== window) return;

    const message = event.data || {};
    if (message.type !== 'MICROTRAINER_CONNECT' || !message.frontendUrl) return;

    try {
      const frontendUrl = new URL(message.frontendUrl).origin;
      saveFrontendUrl(frontendUrl, iframe);
    } catch (error) {
      console.error('Invalid MicroTrainer frontend URL:', error);
    }
  });
  
  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle' || request.action === 'openPanel') {
      if (request.path) {
        chrome.storage.sync.get(['frontendUrl'], (data) => {
          iframe.src = buildAppUrl(data.frontendUrl, request.path);
        });
      }

      if (request.action === 'openPanel') {
        panel.classList.remove('microtrainer-hidden');
        toggleBtn.classList.add('active');
      } else {
        panel.classList.toggle('microtrainer-hidden');
        toggleBtn.classList.toggle('active');
      }

      sendResponse({ success: true });
    }

    if (request.action === 'navigatePanel') {
      chrome.storage.sync.get(['frontendUrl'], (data) => {
        iframe.src = buildAppUrl(data.frontendUrl, request.path || PANEL_PATH);
        panel.classList.remove('microtrainer-hidden');
        toggleBtn.classList.add('active');
        sendResponse({ success: true });
      });
      return true;
    }
    
    if (request.action === 'getState') {
      sendResponse({ 
        visible: !panel.classList.contains('microtrainer-hidden')
      });
    }
  });
  
  console.log('✅ Micro Trainer: Panel injected successfully');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectPanel);
} else {
  injectPanel();
}

}
