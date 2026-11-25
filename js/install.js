// ==========================================
// INSTALL: CHROME PWA INSTALL SCREEN LOGIC
// ==========================================

let deferredInstallPrompt = null;

// Register the offline Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').catch(function(err) {
      console.log('Service Worker notice:', err);
    });
  });
}

// Check if already running as an installed app
function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Chrome fires this ONLY if the app is NOT currently installed on the device
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredInstallPrompt = e;

  if (!isRunningStandalone()) {
    const installOverlay = document.getElementById('install-screen');
    if (installOverlay) {
      installOverlay.classList.remove('hidden');
    }
  }
});

// Hide install screen automatically as soon as installation finishes
window.addEventListener('appinstalled', function() {
  deferredInstallPrompt = null;
  const installOverlay = document.getElementById('install-screen');
  if (installOverlay) {
    installOverlay.classList.add('hidden');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const installBtn = document.getElementById('btn-install-app');
  const skipBtn = document.getElementById('btn-skip-install');

  if (installBtn) {
    installBtn.onclick = function() {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function(choiceResult) {
          if (choiceResult.outcome === 'accepted') {
            document.getElementById('install-screen').classList.add('hidden');
          }
          deferredInstallPrompt = null;
        });
      }
    };
  }

  if (skipBtn) {
    skipBtn.onclick = function() {
      document.getElementById('install-screen').classList.add('hidden');
    };
  }
});
