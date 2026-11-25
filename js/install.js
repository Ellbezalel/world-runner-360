// ==========================================
// INSTALL: CHROME PWA INSTALL SCREEN LOGIC
// ==========================================

let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').catch(function(err) {
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

// Chrome fires this ONLY when the app is NOT installed on the device
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Clear old flag if the user previously uninstalled the app
  localStorage.removeItem('wr360_installed');

  if (!isRunningStandalone()) {
    showInstallScreen();
  }
});

// Fires immediately when the user finishes installing the PWA
window.addEventListener('appinstalled', function() {
  deferredInstallPrompt = null;
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
    installBtn.onclick = function() {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function(choiceResult) {
          if (choiceResult.outcome === 'accepted') {
            localStorage.setItem('wr360_installed', 'true');
            hideInstallScreen();
          }
          deferredInstallPrompt = null;
        });
      } else {
        alert('To install: tap the browser menu (⋮ or Share) at the top/bottom of your screen and select "Install App" or "Add to Home Screen".');
      }
    };
  }

  if (skipBtn) {
    skipBtn.onclick = function() {
      hideInstallScreen();
    };
  }
});
