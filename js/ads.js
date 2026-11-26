// ==========================================
// ADS & IN-APP PRIVACY OVERLAY CONTROLLER
// ==========================================

const ADSTERRA_SMARTLINK = 'https://araplhn.org';
const ADSTERRA_SOCIAL_BAR = 'https://bauval.org';

let socialBarLoaded = false;

// Injects Social Bar ONLY after a race finishes so it never blocks Main Menu buttons
function loadSocialBarAd() {
  if (socialBarLoaded) return;
  socialBarLoaded = true;
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.setAttribute('data-cfasync', 'false');
  s.src = ADSTERRA_SOCIAL_BAR;
  document.body.appendChild(s);
}

function showInterstitialAd(onFinishedCallback) {
  loadSocialBarAd();
  if (onFinishedCallback) onFinishedCallback();
}

// Opens the Ad inside the app with a 5-second countdown before showing the top-right X
function openInAppAd(onRewardEarned) {
  const adModal = document.getElementById('ad-modal');
  const adIframe = document.getElementById('ad-iframe');
  const adTimerText = document.getElementById('ad-timer-text');
  const closeAdBtn = document.getElementById('btn-close-ad');

  if (!adModal || !adIframe) {
    if (onRewardEarned) onRewardEarned();
    return;
  }

  let secondsLeft = 5;
  closeAdBtn.classList.add('hidden');
  adTimerText.textContent = '⏳ Reward ready in ' + secondsLeft + 's...';
  adIframe.src = ADSTERRA_SMARTLINK;
  adModal.classList.remove('hidden');

  const countdown = setInterval(function() {
    secondsLeft--;
    if (secondsLeft > 0) {
      adTimerText.textContent = '⏳ Reward ready in ' + secondsLeft + 's...';
    } else {
      clearInterval(countdown);
      adTimerText.textContent = '✅ Reward Unlocked! Tap X to continue';
      closeAdBtn.classList.remove('hidden');
    }
  }, 1000);

  closeAdBtn.onclick = function() {
    clearInterval(countdown);
    adIframe.src = 'about:blank';
    adModal.classList.add('hidden');
    if (onRewardEarned) onRewardEarned();
  };
}

document.addEventListener('DOMContentLoaded', function() {
  const reviveAdBtn = document.getElementById('btn-revive-ad');
  if (reviveAdBtn) {
    reviveAdBtn.onclick = function() {
      openInAppAd(function() {
        clearEntities();
        document.getElementById('gameover-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        isPlaying = true;
        playSound('powerup');
      });
    };
  }

  const shopAdCoinsBtn = document.getElementById('btn-ad-coins');
  if (shopAdCoinsBtn) {
    shopAdCoinsBtn.onclick = function() {
      openInAppAd(function() {
        saveData.coins += 50;
        persistSave();
        playSound('powerup');
        alert('You earned +50 Free Coins!');
      });
    };
  }

  const openPrivacyLink = document.getElementById('btn-open-privacy');
  const closePrivacyBtn = document.getElementById('btn-close-privacy');
  const privacyModal = document.getElementById('privacy-modal');

  if (openPrivacyLink && privacyModal) {
    openPrivacyLink.onclick = function(e) {
      e.preventDefault();
      privacyModal.classList.remove('hidden');
    };
  }

  if (closePrivacyBtn && privacyModal) {
    closePrivacyBtn.onclick = function() {
      privacyModal.classList.add('hidden');
    };
  }
});
