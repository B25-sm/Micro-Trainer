// ===============================================
// 🎛️ MICRO TRAINER - POPUP SCRIPT
// Handles popup interactions
// ===============================================

const toggleBtn = document.getElementById('toggleBtn');
const startInterview = document.getElementById('startInterview');
const settings = document.getElementById('settings');
const statusText = document.getElementById('statusText');

// Toggle side panel
toggleBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, (response) => {
    if (chrome.runtime.lastError) {
      statusText.textContent = 'Error: Refresh page';
      console.error(chrome.runtime.lastError);
    } else {
      statusText.textContent = 'Panel toggled';
      setTimeout(() => {
        window.close();
      }, 500);
    }
  });
});

// Start interview
startInterview.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Send message to iframe to start interview
  chrome.tabs.sendMessage(tab.id, { 
    action: 'startInterview',
    subject: 'React'
  });
  
  statusText.textContent = 'Interview starting...';
  
  setTimeout(() => {
    window.close();
  }, 1000);
});

// Settings
settings.addEventListener('click', () => {
  chrome.tabs.create({
    url: 'settings.html'
  });
});

// Check panel state on load
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, (response) => {
    if (response && response.visible) {
      statusText.textContent = 'Panel open';
    } else {
      statusText.textContent = 'Panel closed';
    }
  });
});
