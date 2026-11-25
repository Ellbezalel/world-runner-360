// ==========================================
// ADS: GOOGLE H5 GAMES AD PLACEMENT API
// ==========================================

window.adsbygoogle = window.adsbygoogle || Array.of();
const adBreak = function(o) { window.adsbygoogle.push(o); };
const adConfig = function(o) { window.adsbygoogle.push(o); };

adConfig({
  preloadAdBreaks: 'on',
  sound: isMuted ? 'off' : 'on'
});

// Triggers after EVERY single race/crash
function showInterstitialAd(onFinishedCallback) {
  adBreak({
    type: 'next',
    name: 'every-race-break',
    beforeAd: function() {
      isMuted = true;
    },
    afterAd: function() {
      isMuted = false;
      if (onFinishedCallback) onFinishedCallback();
    },
    adBreakDone: function() {
      if (onFinishedCallback) onFinishedCallback();
    }
  });
}

function showRewardedAd(adName, onRewardEarned) {
  adBreak({
    type: 'reward',
    name: adName,
    beforeAd: function() {
      isMuted = true;
    },
    afterAd: function() {
      isMuted = false;
    },
    beforeReward: function(showAdFn) {
      showAdFn();
    },
    adViewed: function() {
      if (onRewardEarned) onRewardEarned();
    },
    adDismissed: function() {
      alert('Watch the full ad to receive your reward!');
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const reviveAdBtn = document.getElementById('btn-revive-ad');
  if (reviveAdBtn) {
    reviveAdBtn.onclick = function() {
      showRewardedAd('revive-reward', function() {
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
      showRewardedAd('shop-free-coins', function() {
        saveData.coins += 50;
        persistSave();
        playSound('powerup');
        alert('You earned +50 Free Coins!');
      });
    };
  }
});
