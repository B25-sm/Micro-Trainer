// ===============================================
// 🎛️ MICRO TRAINER - POPUP SCRIPT
// Handles popup interactions
// ===============================================

const openSidePanel = document.getElementById('openSidePanel');
const openFullscreen = document.getElementById('openFullscreen');
const openSyncStatus = document.getElementById('openSyncStatus');
const settings = document.getElementById('settings');
const statusText = document.getElementById('statusText');
const trackingStatus = document.getElementById('trackingStatus');
const appUrl = document.getElementById('appUrl');

const DEFAULT_FRONTEND_URL = 'https://micro-trainer.vercel.app';

function buildAppUrl(frontendUrl, path = '/') {
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

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function sendPanelMessage(tabId, message, successText) {
  chrome.tabs.sendMessage(tabId, message, () => {
    if (chrome.runtime.lastError) {
      statusText.textContent = 'Error: Refresh page';
      console.error(chrome.runtime.lastError);
    } else {
      statusText.textContent = successText;
      setTimeout(() => {
        window.close();
      }, 500);
    }
  });
}

// Open side panel
openSidePanel.addEventListener('click', async () => {
  const tab = await getActiveTab();
  sendPanelMessage(
    tab.id,
    { action: 'openPanel', path: '/extension' },
    'Side panel opened'
  );
});

// Open full app
openFullscreen.addEventListener('click', () => {
  chrome.storage.sync.get(['frontendUrl'], (data) => {
    chrome.tabs.create({
      url: buildAppUrl(data.frontendUrl, '/')
    });
  });
});

// Open sync status inside side panel
openSyncStatus.addEventListener('click', async () => {
  const tab = await getActiveTab();
  sendPanelMessage(
    tab.id,
    { action: 'navigatePanel', path: '/dashboard' },
    'Sync status opened'
  );
});

// Settings
settings.addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('settings.html')
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

chrome.storage.sync.get(['frontendUrl'], (data) => {
  if (!trackingStatus) return;

  if (data.frontendUrl) {
    trackingStatus.classList.add('connected');
    trackingStatus.textContent = `Official app connected: ${data.frontendUrl}`;
    appUrl.textContent = `Connected app: ${data.frontendUrl}`;
    return;
  }

  trackingStatus.classList.remove('connected');
  trackingStatus.textContent =
    'Not connected to an official MicroTrainer app. Progress may not count for trainer verification until setup is completed.';
  appUrl.textContent = 'No student app connected yet. Use Settings after deployment.';
});
