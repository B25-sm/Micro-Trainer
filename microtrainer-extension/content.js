// ===============================================
// 🚀 MICRO TRAINER - CONTENT SCRIPT
// Injects side panel into all web pages
// ===============================================

console.log('🧠 Micro Trainer: Content script loaded');

// Check if panel already exists (prevent duplicates)
if (!document.getElementById('microtrainer-panel')) {
  
  // Create side panel container
  const panel = document.createElement('div');
  panel.id = 'microtrainer-panel';
  panel.className = 'microtrainer-hidden'; // Start hidden
  
  // Create iframe to load React app
  const iframe = document.createElement('iframe');
  iframe.id = 'microtrainer-iframe';
  iframe.src = 'https://micro-trainer.vercel.app';
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
  
  // Toggle functionality
  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('microtrainer-hidden');
    toggleBtn.classList.toggle('active');
  });
  
  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      panel.classList.toggle('microtrainer-hidden');
      toggleBtn.classList.toggle('active');
      sendResponse({ success: true });
    }
    
    if (request.action === 'getState') {
      sendResponse({ 
        visible: !panel.classList.contains('microtrainer-hidden')
      });
    }
  });
  
  console.log('✅ Micro Trainer: Panel injected');
}
