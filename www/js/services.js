angular.module('application.services', [])

.factory('AdMobService', function() {
  var categories = [];

  return {
    all: function() {
      return categories;
    },
    showAdMobInterstitial: function() {
      var lastTime = window.localStorage['lastAdMobDate'];
      var d = new Date();
      var currentTime = d.valueOf();
      var showInterval = 4*60*1000;
      console.log('******** The latest AdMob Date:'+lastTime+':');
      if (lastTime === undefined) {
        console.log('******** Undefined **********');
        if (window.AdMob) {
          console.log('******** Show AdMob (1) **********');
          window.localStorage['lastAdMobDate'] = currentTime;
          AdMob.showInterstitial();
        }
        return;
      }
      if (parseInt(currentTime)-parseInt(lastTime) >= showInterval) {
        if (window.AdMob) {
          console.log('******** Show AdMob (2) **********');
          window.localStorage['lastAdMobDate'] = currentTime;
          AdMob.showInterstitial();
        }
      }
    }
  };
});
