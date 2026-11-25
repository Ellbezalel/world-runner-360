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

function showInstallScreen() {
  const screen = document.getElementById('install-screen');
  if (screen) screen.classList.remove('hidden');
}

function hideInstallScreen() {
  const screen = document.getElementById('install-screen');
  if (screen) screen.classList.add('hidden');
}

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  window.deferredPWA = e;
  localStorage.removeItem('wr360_installed');
  if (!isRunningStandalone()) {
    showInstallScreen();
  }
});

window.addEventListener('appinstalled', function() {
  window.deferredPWA = null;
  localStorage.setItem('wr360_installed', 'true');
  hideInstallScreen();
});

document.addEventListener('DOMContentLoaded', function() {
  const alreadyInstalled = localStorage.getItem('wr360_installed') === 'true';

  if (isRunningStandalone() || alreadyInstalled) {
    hideInstallScreen();
  } else {
    showInstallScreen();
  }

  const installBtn = document.getElementById('btn-install-app');
  const skipBtn = document.getElementById('btn-skip-install');

  if (installBtn) {
    installBtn.onclick = async function() {
      if (window.deferredPWA) {
        window.deferredPWA.prompt();
        const choice = await window.deferredPWA.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem('wr360_installed', 'true');
          hideInstallScreen();
        }
        window.deferredPWA = null;
      } else {
        alert('Tap Chrome menu (⋮) at the top-right and tap "Install app" or "Add to Home screen".');
      }
    };
  }

  if (skipBtn) {
    skipBtn.onclick = function() {
      hideInstallScreen();
    };
  }
});
