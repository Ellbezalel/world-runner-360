// ==========================================
// ADS: ADSTERRA SMARTLINK & SOCIAL BAR
// ==========================================

const ADSTERRA_SMARTLINK = 'https://araplhn.org/4/7ab75acbfecf7c6523538a3bba0b68b2';
const ADSTERRA_SOCIAL_BAR = 'https://bauval.org/14/3dbdc69af7d512630602c5f464dd3d12';

let socialBarLoaded = false;

// Injects your Adsterra Social Bar script on Game Over / Menus (never interrupts running)
function loadSocialBarAd() {
  if (socialBarLoaded) return;
  socialBarLoaded = true;
  const s = document.createElement('script');
  s.setAttribute('data-cfasync', 'false');
  s.src = ADSTERRA_SOCIAL_BAR;
  document.body.appendChild(s);
}

// Called automatically after EVERY race in handleCrash()
function showInterstitialAd(onFinishedCallback) {
  loadSocialBarAd();
  if (onFinishedCallback) onFinishedCallback();
}

// Opens your Adsterra Smartlink and rewards the player after 5 seconds
function triggerSmartlinkReward(buttonEl, originalText, onRewardEarned) {
  window.open(ADSTERRA_SMARTLINK, '_blank', 'noopener,noreferrer');

  if (!buttonEl) {
    if (onRewardEarned) onRewardEarned();
    return;
  }

  let secondsLeft = 5;
  buttonEl.disabled = true;
  buttonEl.textContent = '⏳ Verifying Ad (' + secondsLeft + 's)...';

  const countdown = setInterval(function() {
    secondsLeft--;
    if (secondsLeft > 0) {
      buttonEl.textContent = '⏳ Verifying Ad (' + secondsLeft + 's)...';
    } else {
      clearInterval(countdown);
      buttonEl.disabled = false;
      buttonEl.textContent = originalText;
      if (onRewardEarned) onRewardEarned();
    }
  }, 1000);
}

document.addEventListener('DOMContentLoaded', function() {
  const reviveAdBtn = document.getElementById('btn-revive-ad');
  if (reviveAdBtn) {
    reviveAdBtn.onclick = function() {
      triggerSmartlinkReward(reviveAdBtn, '🎬 Watch Ad to Revive (Free)', function() {
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
      triggerSmartlinkReward(shopAdCoinsBtn, '🎬 Watch Ad for +50 Free Coins', function() {
        saveData.coins += 50;
        persistSave();
        playSound('powerup');
        alert('You earned +50 Free Coins!');
      });
    };
  }
});
