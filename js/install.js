// ==========================================
// INSTALL: CHROME PWA INSTALL SCREEN LOGIC
// ==========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function(err) {
      console.log('Service Worker notice:', err);
    });
  });
}

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

window.addEventListener('appinstalled', function() {
  window.deferredPWA = null;
  localStorage.setItem('wr360_installed', 'true');
  const screen = document.getElementById('install-screen');
  if (screen) screen.classList.add('hidden');
});

function handleInstallClick() {
  const screen = document.getElementById('install-screen');
  const installBtn = document.getElementById('btn-install-app');

  if (window.deferredPWA) {
    window.deferredPWA.prompt();
    window.deferredPWA.userChoice.then(function(choice) {
      if (choice.outcome === 'accepted') {
        localStorage.setItem('wr360_installed', 'true');
        if (screen) screen.classList.add('hidden');
      }
      window.deferredPWA = null;
    });
  } else if (installBtn) {
    installBtn.textContent = '📲 Tap Chrome Menu (⋮) → Install App';
  }
}

function handleSkipInstallClick() {
  const screen = document.getElementById('install-screen');
  if (screen) screen.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
  const screen = document.getElementById('install-screen');
  const alreadyInstalled = localStorage.getItem('wr360_installed') === 'true';

  if (screen) {
    if (isRunningStandalone() || alreadyInstalled) {
      screen.classList.add('hidden');
    } else {
      screen.classList.remove('hidden');
    }
  }

  const installBtn = document.getElementById('btn-install-app');
  const skipBtn = document.getElementById('btn-skip-install');

  if (installBtn) installBtn.onclick = handleInstallClick;
  if (skipBtn) skipBtn.onclick = handleSkipInstallClick;
});
