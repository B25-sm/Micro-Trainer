const frontendUrlInput = document.getElementById('frontendUrl');
const saveButton = document.getElementById('save');
const clearButton = document.getElementById('clear');
const openAppButton = document.getElementById('openApp');
const statusBox = document.getElementById('status');

const DEFAULT_FRONTEND_URL = 'https://micro-trainer.vercel.app';

function normalizeUrl(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('URL must start with https:// or http://');
  }
  return url.origin;
}

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.background = isError ? '#fef2f2' : '#eff6ff';
  statusBox.style.color = isError ? '#991b1b' : '#1e3a8a';
}

chrome.storage.sync.get(['frontendUrl'], (data) => {
  const params = new URLSearchParams(window.location.search);
  const urlFromQuery = params.get('frontendUrl');
  if (urlFromQuery) {
    try {
      const frontendUrl = normalizeUrl(urlFromQuery);
      chrome.storage.sync.set({ frontendUrl }, () => {
        frontendUrlInput.value = frontendUrl;
        setStatus(`Connected to ${frontendUrl}`);
      });
      return;
    } catch (_) {
      /* Fall back to saved value below. */
    }
  }

  if (data.frontendUrl) {
    frontendUrlInput.value = data.frontendUrl;
    setStatus(`Connected to ${data.frontendUrl}`);
    return;
  }

  setStatus('No student frontend is connected yet.');
});

saveButton.addEventListener('click', () => {
  try {
    const frontendUrl = normalizeUrl(frontendUrlInput.value.trim());
    chrome.storage.sync.set({ frontendUrl }, () => {
      setStatus(`Saved. Extension will load ${frontendUrl}`);
    });
  } catch (error) {
    setStatus(error.message || 'Enter a valid frontend URL.', true);
  }
});

clearButton.addEventListener('click', () => {
  chrome.storage.sync.remove(['frontendUrl'], () => {
    frontendUrlInput.value = '';
    setStatus('Connection cleared. The extension will use the default app until reconnected.');
  });
});

openAppButton.addEventListener('click', () => {
  const frontendUrl = frontendUrlInput.value.trim() || DEFAULT_FRONTEND_URL;
  try {
    chrome.tabs.create({ url: normalizeUrl(frontendUrl) });
  } catch (error) {
    setStatus(error.message || 'Enter a valid frontend URL first.', true);
  }
});
