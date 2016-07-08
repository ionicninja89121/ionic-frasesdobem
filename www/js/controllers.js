angular.module('application.controllers', ['ngCordova.plugins.instagram'])

/**********************************   App Controller    *************************************/

    .controller('AppCtrl', function($scope, $http, $ionicModal, $timeout, SERVER_INFO, $state) {

      $scope.error = "";
      $scope.loaded = true;
      /** load Category list **/
      $scope.categoryList = [];
      $scope.loadCategoryList = function() {
        for (var i=1; i < 9; i++) {
          $http.get(SERVER_INFO.API_PREFIX+'/categories?page='+i).success(function(response) {
            if (response.length === 0) {
              console.log('Response Null');
            }
            for (var j=0; j<response.length; j++) {
              $scope.categoryList.push(response[j]);
            }
            $scope.categoryList.sort(function(a,b){
              var x = a.name < b.name? -1:1;
              return x;
            });
          }).error(function(error) {
            $scope.error = error;
          });
        }
      };

      /*************** For Search Post ***************/
      // Create the search post modal
      $scope.searchData = {
        keyword: ""
      };
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.search_post_modal = modal;
      });

      // Triggered in the search modal to close it
      $scope.closeSearch = function() {
        $scope.search_post_modal.hide();
      };

      // Open the Search Post modal
      $scope.searchPost = function() {
        $scope.search_post_modal.show();
      };

      $scope.doSearchtoResultPage = function() {
        $scope.closeSearch();
        $timeout(function() {
          $state.go('app.search', { 'searchKeyword': $scope.searchData.keyword});
        }, 500);
      }

      // Perform the login action when the user submits the login form
      $scope.doSearch = function() {
        console.log('Doing Search', $scope.searchData.keyword);
        $scope.loaded = false;
        $scope.noResult = false;

        $("#searchResult")[0].scrollTop = 0;

        /** Search Posts list **/

        $scope.postslistbysearch = [];
        $scope.searchPostsList = function() {
          $http.get(SERVER_INFO.API_PREFIX+'/posts?filter[s]='+$scope.searchData.keyword).success(function(response) {
            $scope.postslistbysearch = response;
            $scope.loaded = true;
            if (response.length === 0) {
              $scope.noResult = true;
            }
          }).error(function(error) {
            $scope.error = error;
            $scope.loaded = true;
          });
        };
        $scope.searchPostsList();
      };

      $scope.loadCategoryList();

      /*$timeout(function() {
        $scope.search_post_modal.show();
      },500);*/
    })

/**********************************   Splash Controller    *************************************/
    .controller('SplashCtrl', function($timeout, $state) {

      $timeout(function() {
        $state.go('app.home');
       },3000);
    })

/**********************************   Home Controller    *************************************/

    .controller('HomeCtrl', function($scope, $http, SERVER_INFO, $timeout, $ionicPlatform, $window, $cordovaGoogleAnalytics, AdMobService) {

      $ionicPlatform.ready(function() {
        if(typeof $cordovaGoogleAnalytics !== undefined) {
          $cordovaGoogleAnalytics.trackView('Home Page');
          console.log('*** Tracking Home Page ***');
        } else {
          console.log("Failt to Track View");
        }
      });

      /************ AdMob Service ***********/
      $scope.$on('$ionicView.beforeEnter', function(e) {
        // console.log("Entering");
        AdMobService.showAdMobInterstitial();
      });

      /*************  AdMob Plugin  *************/
      /*$ionicPlatform.ready(function() {

        // Configuration object holding keys
        var adMobId = {
          admob_banner_key: 'ca-app-pub-6869992474017983/9375997553',
          admob_interstitial_key: 'ca-app-pub-6869992474017983/1657046752'
        };

        $scope.showBannerAd = function() {

          try {

            console.log('Show Banner Ad');

            $window.AdMob.createBanner({
              adId: adMobId.admob_banner_key,
              position: $window.AdMob.AD_POSITION.BOTTOM_CENTER,
              isTesting: true,
              autoShow: true
            });

          } catch (e) {
            alert(e);
          }
        }

        $scope.showInterstitialAd = function() {

          try {

            console.log('Show Interstitial Ad');

            $window.AdMob.prepareInterstitial( {adId:adMobId.admob_interstitial_key, autoShow:false} );
            $window.AdMob.showInterstitial();

          } catch (e) {
            alert(e);
          }
        }

        $scope.showInterstitialAd();
      });
*/
      $scope.error = "";
      $scope.loaded = false;
      $scope.moreLoaded = true;
      $scope.api_url = SERVER_INFO.API_PREFIX+'/posts?page=';

      $scope.page_no = 0;
      $scope.all_loaded = false;

      $scope.loadMore = function() {
        if ($scope.loaded) {
          $scope.moreLoaded = false;
        }

        if (!$scope.all_loaded) {
          $scope.page_no++;

          $http.get($scope.api_url+$scope.page_no).success(function(response) {
            if (response.length === 0) {
              $scope.loaded = true;
              $scope.all_loaded = true;
              $scope.moreLoaded = true;
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            for (var j=0; j<response.length; j++) {
              $scope.postslist.push(response[j]);
            }
            $scope.loaded = true;
            $scope.moreLoaded = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');
            window.localStorage['postlist'] = JSON.stringify($scope.postslist);
          }).error(function(error) {
            $scope.error = error;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
        } else {
          $timeout(function() {
            $scope.moreLoaded = true;
          }, 1000);
        }
      };

      /**
      * Pull to Refresh ...
      * **/

      $scope.doRefresh  = function() {
        $scope.page_no = 1;
        $http.get(SERVER_INFO.API_PREFIX+'/posts?filter[posts_per_page]=10').success(function(response) {
          $scope.loaded = true;
          $scope.postslist = response;
          window.localStorage['postlist'] = JSON.stringify($scope.postslist);
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      /** load Recent-Post list **/
      $scope.postslist = [];
      $scope.loadPostsList = function() {
        $http.get(SERVER_INFO.API_PREFIX+'/posts?filter[posts_per_page]=20').success(function(response) {
          $scope.loaded = true;
          $scope.postslist = response;
          window.localStorage['postlist'] = JSON.stringify($scope.postslist);
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        });
      };
//      $scope.loadPostsList();
    })

/**********************************   Search Controller    *************************************/

    .controller('SearchCtrl', function($scope, $http, SERVER_INFO, $stateParams, $timeout, $ionicPlatform, $cordovaGoogleAnalytics) {

      $ionicPlatform.ready(function() {
        if(typeof $cordovaGoogleAnalytics !== undefined) {
          $cordovaGoogleAnalytics.trackView('Search for ('+$stateParams.searchKeyword+') Page');
          console.log('*** Tracking Search for ('+$stateParams.searchKeyword+') Page ***');
        } else {
          console.log("Failt to Track View");
        }
      });

      $scope.error = "";
      $scope.loaded = false;
      $scope.noResult = false;
      $scope.searchKeyword = $stateParams.searchKeyword;

      $scope.error = "";
      $scope.loaded = false;
      $scope.moreLoaded = true;
      $scope.api_url = SERVER_INFO.API_PREFIX+'/posts?filter[s]='+$scope.searchKeyword+'&page=';

      $scope.page_no = 0;
      $scope.all_loaded = false;

      $scope.postslistbysearch = [];

      $scope.loadMore = function() {
        if ($scope.loaded) {
          $scope.moreLoaded = false;
        }

        if (!$scope.all_loaded) {
          $scope.page_no++;

          $http.get($scope.api_url+$scope.page_no).success(function(response) {
            if (response.length === 0) {
              $scope.loaded = true;
              $scope.all_loaded = true;
              $scope.moreLoaded = true;
              if ($scope.page_no === 1) {
                $scope.noResult = true;
              }
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            for (var j=0; j<response.length; j++) {
              $scope.postslistbysearch.push(response[j]);
            }
            $scope.loaded = true;
            $scope.moreLoaded = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');
            window.localStorage['postlist'] = JSON.stringify($scope.postslistbysearch);
          }).error(function(error) {
            $scope.error = error;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
        } else {
          $timeout(function() {
            $scope.moreLoaded = true;
          }, 0);
        }
      };

      /**
       * Pull to Refresh ...
       * **/

      $scope.doRefresh  = function() {
        $scope.page_no = 1;
        $http.get(SERVER_INFO.API_PREFIX+'/posts?filter[s]='+$stateParams.searchKeyword).success(function(response) {
          $scope.loaded = true;
          $scope.postslistbysearch = response;
          window.localStorage['postlist'] = JSON.stringify($scope.postslistbysearch);
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      /** load Search-Post list **/
      $scope.searchPostsList = function() {
        $http.get(SERVER_INFO.API_PREFIX+'/posts?filter[s]='+$stateParams.searchKeyword).success(function(response) {
          $scope.loaded = true;
          $scope.postslistbysearch = response;
          window.localStorage['postlist'] = JSON.stringify($scope.postslistbysearch);
          if (response.length === 0) {
            $scope.noResult = true;
          }
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        });
      };
//      $scope.searchPostsList();
    })

/**********************************   Category Controller    *************************************/

    .controller('CategoryCtrl', function($scope, $http, SERVER_INFO, $stateParams, $timeout, $ionicPlatform, $cordovaGoogleAnalytics, AdMobService) {

      $ionicPlatform.ready(function() {
        if(typeof $cordovaGoogleAnalytics !== undefined) {
          $cordovaGoogleAnalytics.trackView('Category('+$stateParams.categoryDesc+') Page');
          console.log('*** Tracking Category('+$stateParams.categoryDesc+') Page ***');
        } else {
          console.log("Failt to Track View");
        }
      });

      /************ AdMob Service ***********/
      $scope.$on('$ionicView.beforeEnter', function(e) {
        // console.log("Entering");
        AdMobService.showAdMobInterstitial();
      });

      $scope.error = "";
      $scope.loaded = false;
      $scope.moreLoaded = true;
      $scope.categoryDesc = $stateParams.categoryDesc;
      $scope.api_url = SERVER_INFO.API_PREFIX+'/posts?filter[cat]='+$stateParams.categoryId;

      $scope.page_no = 0;
      $scope.all_loaded = false;

      $scope.loadMore = function() {
        if ($scope.loaded) {
          $scope.moreLoaded = false;
        }

        if (!$scope.all_loaded) {
          $scope.page_no++;

          $http.get($scope.api_url+'&page='+$scope.page_no).success(function(response) {
            if (response.length === 0) {
              $scope.loaded = true;
              $scope.all_loaded = true;
              $scope.moreLoaded = true;
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            for (var j=0; j<response.length; j++) {
              $scope.postslistbycat.push(response[j]);
            }
            $scope.loaded = true;
            $scope.moreLoaded = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');

            window.localStorage['postlist'] = JSON.stringify($scope.postslistbycat);
          }).error(function(error) {
            $scope.error = error;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
        } else {
          $timeout(function() {
            $scope.moreLoaded = true;
          }, 1000);
        }
      };
//      $scope.loadMore();

      /**
       * Pull to Refresh ...
       * **/

      $scope.doRefresh  = function() {
        $scope.page_no = 0;
        $http.get(SERVER_INFO.API_PREFIX+'/posts?filter[cat]='+$stateParams.categoryId).success(function(response) {
          $scope.loaded = true;
          $scope.postslistbycat = response;
          window.localStorage['postlist'] = JSON.stringify($scope.postslistbycat);
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      /** load Post list **/
      $scope.postslistbycat = [];
      $scope.loadPostsListByCategory = function() {
        $scope.page_no = 1;
        $http.get($scope.api_url).success(function(response) {
          $scope.postslistbycat = response;
          $scope.loaded = true;
          window.localStorage['postlist'] = JSON.stringify($scope.postslistbycat);
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        });
      };

      /** load Category Info **/
      $scope.categoryInfo = [];
      $scope.loadCategoryInfo = function() {
        $http.get(SERVER_INFO.API_PREFIX+'/categories/'+$stateParams.categoryId).success(function(response) {
          $scope.categoryInfo = response;
        }).error(function(error) {
          $scope.error = error;
        });
      };
      $scope.loadCategoryInfo();
//      $scope.loadPostsListByCategory();
    })

/**********************************   Favorite Controller    *************************************/

    .controller('FavoriteCtrl', function($scope, $ionicPopup, $timeout, $ionicPlatform, $cordovaGoogleAnalytics, AdMobService) {
      $ionicPlatform.ready(function() {
        if(typeof $cordovaGoogleAnalytics !== undefined) {
          $cordovaGoogleAnalytics.trackView('Favorite Page');
          console.log('*** Tracking Favorite Page ***');
        } else {
          console.log("Failt to Track View");
        }
      });

      /************ AdMob Service ***********/
      $scope.$on('$ionicView.beforeEnter', function(e) {
        // console.log("Entering");
        AdMobService.showAdMobInterstitial();
      });

      $scope.error = "";
      $scope.loaded = false;
      $scope.noFavorite = false;
      /** load Favorite list **/
      $scope.favlist = [];
      $scope.loadFavoriteList = function() {
        $timeout(function() {
          $scope.loaded = true;
          $scope.favlist = JSON.parse(window.localStorage['favlist'] || '[]');
          if (typeof $scope.favlist === undefined || $scope.favlist.length === 0) {
            $scope.noFavorite = true;
          } else {
            $scope.noFavorite = false;
          }
          window.localStorage['postlist'] = JSON.stringify($scope.favlist);
        }, 1000);
      };
      $scope.loadFavoriteList();

      $scope.doRefresh = function() {
        $scope.loadFavoriteList();
        $timeout(function() {
          $scope.$broadcast('scroll.refreshComplete');
        }, 1000);
      };

      $scope.onDeleteFav = function(post_id) {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Você tem certeza?',
          template: 'Você tem certeza que deseja remover esta imagem dos seus favoritos?',
          cssClass: 'ionic-app-alert',
          cancelText: 'Cancelar',
          okText: 'Sim'
        });
        confirmPopup.then(function(res) {
          if(res) {
            console.log('You are sure');
            for(var i = $scope.favlist.length - 1; i >= 0; i--) {
              if($scope.favlist[i].id === post_id) {
                $scope.favlist.splice(i, 1);
              }
            }
            if (typeof $scope.favlist === undefined || $scope.favlist.length === 0) {
              $scope.noFavorite = true;
            } else {
              $scope.noFavorite = false;
            }
            window.localStorage['favlist'] = JSON.stringify($scope.favlist);
            window.localStorage['postlist'] = JSON.stringify($scope.favlist);
          } else {
            console.log('You are not sure');
          }
        });
      };
    })

/**********************************   Post Controller    *************************************/

    .controller('PostCtrl', function($scope, $http, SERVER_INFO, $stateParams, $ionicPopup, $ionicLoading, $ionicPlatform,
                                     $cordovaClipboard, $cordovaToast,  $cordovaSocialSharing, $cordovaInstagram, ionicToast, $cordovaFileTransfer,
                                     $cordovaDevice, $base64, $timeout, $cordovaGoogleAnalytics, $window, AdMobService) {

      $ionicPlatform.ready(function() {
        if(typeof $cordovaGoogleAnalytics !== undefined) {
          $cordovaGoogleAnalytics.trackView('Post('+$stateParams.postId+') Page');
          console.log('*** Tracking Post('+$stateParams.postId+') Page ***');
        } else {
          console.log("Failt to Track View");
        }
      });

      /************ AdMob Service ***********/
      $scope.$on('$ionicView.beforeEnter', function(e) {
        // console.log("Entering");
        AdMobService.showAdMobInterstitial();
      });

      $scope.error = "";
      $scope.categoryDesc = $stateParams.categoryDesc;
      $scope.loaded = false;
      $scope.bookmarked = false;
      /** load Post Info **/
      $scope.postInfo = {};
      $scope.loadPostInfo = function() {
        $scope.loaded = false;
        $scope.bookmarked = false;
        $scope.postInfo = {};
        $http.get(SERVER_INFO.API_PREFIX+'/posts/'+$stateParams.postId).success(function(response) {
          $scope.postInfo = response;
          $scope.loaded = true;
          if ($scope.isBookmarked($scope.postInfo.id)) {
            console.log('its already bookmarked');
            $scope.bookmarked = true;
          }
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        });
      };
      $scope.loadPostInfo();

      /**
       * Pull to Refresh ...
       * **/

      $scope.doRefresh  = function() {
        $http.get(SERVER_INFO.API_PREFIX+'/posts/'+$stateParams.postId).success(function(response) {
          $scope.loaded = true;
          $scope.postInfo = response;
          if ($scope.isBookmarked($scope.postInfo.id)) {
            console.log('its already bookmarked');
            $scope.bookmarked = true;
          }
        }).error(function(error) {
          $scope.error = error;
          $scope.loaded = true;
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      };

      $scope.onBookmark = function() {
        if ($scope.bookmarked) {
          $scope.showToast('Já está em seus favoritos!');
//          $cordovaToast.showShortCenter('   Already bookmarked!   ');
          return;
        }

        var favlist = JSON.parse(window.localStorage['favlist'] || '[]');
        if (typeof favlist === undefined || favlist.length === 0) {
          favlist.push($scope.postInfo);
        } else {
          var i;
          for (i=0; i<favlist.length; i++) {
            if (favlist[i].id === $scope.postInfo.id) {
              break;
            }
          }
          if (i === favlist.length) {
            favlist.push($scope.postInfo);
          }
        }
        window.localStorage['favlist'] = JSON.stringify(favlist);

        /*$ionicPopup.alert({
          title: 'Favoritado!',
          template: '',
          cssClass: 'ionic-app-alert'
        });*/

        $scope.showToast("Favoritado!");
//        $cordovaToast.showShortCenter('   Favoritado!   ');

        $scope.bookmarked = true;
        $scope.trackEventbyGoogle('Imagens', 'Favoritados', 'Imagens favoritadas');
      };

      $scope.isBookmarked = function(post_id) {
        console.log('checking bookmarked post_id = ', post_id);
        var flist = JSON.parse(window.localStorage['favlist'] || '[]');
        for (var i=0; i<flist.length; i++) {
          if (flist[i].id === post_id) {
            return true;
          }
        }
        return false;
      };

      /********* Convert 64base Image Data uri **********/
      $scope.getDataUri = function(url, callback) {
        var image = new Image();

        image.onload = function () {
          var canvas = document.createElement('canvas');
          canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
          canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

          canvas.getContext('2d').drawImage(this, 0, 0);

          // Get raw image data
          //callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

          // ... or get as Data URI
          callback(canvas.toDataURL('image/png'));
        };

        image.src = url;
      }

      $scope.copyText = function() {
        var value = $('div.post-content').text();
        console.log("Selected Text: ", value);
        $cordovaClipboard.copy(value).then(function() {
          console.log("Copied text");
          $scope.showToast("Texto copiado!");
//          $cordovaToast.showShortCenter('   Content copied!   ');
        }, function() {
          console.error("There was an error copying");
        });
      };

      $scope.downloadProgress = 0;
      $scope.downloadFile = function(imgUrl, postId) {
        $ionicLoading.show({
          template: 'Salvando imagem...'
        });

        document.addEventListener('deviceready', function () {

          var targetPath;
          var trustHosts = true
          var options = {};

          if ($cordovaDevice.getPlatform() === "Android") {
            targetPath = cordova.file.externalRootDirectory + "Frasesdobem/post-"+postId+".jpg";
          } else {
            targetPath = cordova.file.documentsDirectory + "Frasesdobem/post-"+postId+".jpg";
          }

          $cordovaFileTransfer.download(imgUrl, targetPath, options, trustHosts)
              .then(function(result) {
                // Success!
                $ionicLoading.hide();
                $scope.showToast('Imagem salva');//+targetPath);
//                $cordovaToast.showLongCenter('Imagem salva in '+targetPath);
              }, function(err) {
                // Error
              }, function (progress) {
                $timeout(function () {
                  $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                }, 100)
              });

        }, false);
      }

      $scope.downloadImg = function(imgUrl, postId) {
        document.addEventListener('deviceready', function () {
          $ionicLoading.show({
            template: 'Salvando imagem...'
          });
          var image_url = imgUrl.substring(0, imgUrl.length-4)+"-640x512.jpg";
          var image = new Image();
          image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
            canvas.getContext('2d').drawImage(this, 0, 0);

            $window.canvas2ImagePlugin.saveImageDataToLibrary(
              function(msg){
                console.log(msg);
                $ionicLoading.hide();
                $scope.showToast('Imagem salva');
                $scope.trackEventbyGoogle('Imagens', 'Downloads', 'Downloads de imagens');
                AdMobService.showAdMobInterstitial();
              },
              function(err){
                console.log(err);
              },
              canvas
            );

          };
          image.src = image_url;
        });

        /*document.addEventListener('deviceready', function () {
          window.requestFileSystem(LocalFileSystem, 0, function(fileSystem) {
              fileSystem.root.getDirectory(
                "DCIM",
                {
                  create: true
                },
                function(dirEntry) {
                  dirEntry.getFile(
                    "post-"+postId+".jpg",
                    {
                      create: true,
                      exclusive: false
                    },
                    function gotFileEntry(fe) {
                      var p = fe.toURL();
                      fe.remove();
                      ft = new FileTransfer();
                      ft.download(
                        encodeURI(imgUrl),
                        p,
                        function(entry) {
                          $ionicLoading.hide();
                          $scope.showToast('Imagem salva: '+entry.toURL());
//                          $scope.imgFile = entry.toURL();
                        },
                        function(error) {
                          $ionicLoading.hide();
                          alert("Download Error Source -> " + error.source);
                        },
                        false,
                        null
                      );
                    },
                    function() {
                      $ionicLoading.hide();
                      console.log("Get file failed");
                    }
                  );
                }
              );
            },
            function() {
              $ionicLoading.hide();
              console.log("Request for filesystem failed");
            });
        });*/
      }

      /***************** Social Sharing *****************/

      $scope.onSocialShare = function () {
        $ionicPopup.alert({
          title: 'Compartilhe',
          templateUrl: 'templates/social-share.html',
          okText: 'Cancelar',
          cssClass: 'ionic-app-alert'
        });
      }

      $scope.shareAnywhere = function(message, image, link) {
        $cordovaSocialSharing.share('', '', image, '');
        $scope.trackEventbyGoogle('Imagens', 'Compartilhamentos', 'Compartilhamentos nas redes sociais');
      }

      $scope.shareFacebook = function(message, image, link) {
        $cordovaSocialSharing
          .shareViaFacebook('', image, '')
          .then(function(result) {
            // Success!
            $scope.trackEventbyGoogle('Imagens', 'Compartilhamentos', 'Compartilhamentos nas redes sociais');
            AdMobService.showAdMobInterstitial();
          }, function(err) {
            // An error occurred. Show a message to the user
          });
      }

      $scope.shareWhatsApp = function(message, image, link) {
        $cordovaSocialSharing
          .shareViaWhatsApp('', image, '')
          .then(function(result) {
            // Success!
            $scope.trackEventbyGoogle('Imagens', 'Compartilhamentos', 'Compartilhamentos nas redes sociais');
            AdMobService.showAdMobInterstitial();
          }, function(err) {
            // An error occurred. Show a message to the user
          });
      }

      $scope.shareInstagram = function(message, image, link) {
        document.addEventListener("deviceready", function () {
          var image_url = image.substring(0, image.length-4)+"-640x512.jpg";
          $scope.getDataUri(image_url, function(dataUri) {
            //alert(dataUri);
            $cordovaInstagram.share({image: dataUri, caption: ''});
            $scope.trackEventbyGoogle('Imagens', 'Compartilhamentos', 'Compartilhamentos nas redes sociais');
            AdMobService.showAdMobInterstitial();
          });


//          var img_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAGElEQVQIW2P4DwcMDAxAfBvMAhEQMYgcACEHG8ELxtbPAAAAAElFTkSuQmCC";
          /*var img_data = "";

          try {
            //$cordovaInstagram.share({image: img_data, caption: 'testtag'}).then(function() {
            $cordovaInstagram.share({image: img_data, caption: 'testtag'}).then(function() {
              $ionicPopup.alert({
                title: 'Instagram',
                template: 'and now?'
              });
            }, function(err) {
              $ionicPopup.alert({
                title: 'Instagram',
                template: 'Error'
              });
            });
          } catch (e) {
            $ionicPopup.alert({
              title: 'Instagram',
              template: 'Is not installed'
            });
          }*/
        });

       /* $cordovaInstagram
        //    .share({image: image, caption: message})
            .share($base64.encode(image), message)
            .then(function(result) {
              // Success!
            }, function(err) {
              $cordovaToast.showLongCenter('Instagram Error!').then(function(success) {
                // success
              }, function (error) {
                // error
              });
            });*/
      }

      $scope.onLoadPrevPost = function() {
        var postlist = JSON.parse(window.localStorage['postlist'] || '[]');
        var i;
        for (i = postlist.length-1; i >= 0; i--) {
          if (postlist[i].id == $scope.postInfo.id) break;
        }
        i--;
        var post = $scope.postInfo;
        if (i >= 0 && i <= postlist.length-1) {
          post = postlist[i];
        }
        $stateParams.postId = post.id;
        $ionicLoading.show({
          template: 'Carregando...',
        });
        $timeout(function () {
          $ionicLoading.hide();
          $scope.postInfo = post;
          $scope.bookmarked = false;
          if ($scope.isBookmarked($scope.postInfo.id)) {
            $scope.bookmarked = true;
          }
          AdMobService.showAdMobInterstitial();
        }, 1000);
      }

      $scope.onLoadNextPost = function() {
        var postlist = JSON.parse(window.localStorage['postlist'] || '[]');
        var i;
        for (i = postlist.length-1; i >= 0; i--) {
          if (postlist[i].id == $scope.postInfo.id) break;
        }
        i++;
        var post = $scope.postInfo;
        if (i >= 0 && i <= postlist.length-1) {
          post = postlist[i];
        }
        $stateParams.postId = post.id;
        $ionicLoading.show({
          template: 'Carregando...',
        });
        $timeout(function () {
          $ionicLoading.hide();
          $scope.postInfo = post;
          $scope.bookmarked = false;
          if ($scope.isBookmarked($scope.postInfo.id)) {
            $scope.bookmarked = true;
          }
          AdMobService.showAdMobInterstitial();
        }, 1000);
      }

      $scope.showToast = function(title) {
        $ionicLoading.show({
          template: title,
          duration: 1000
        });
      }

      $scope.trackEventbyGoogle = function (eventCategory, eventAction, eventLabel) {
        $ionicPlatform.ready(function() {
          if(typeof $cordovaGoogleAnalytics !== undefined) {
            $cordovaGoogleAnalytics.trackEvent(eventCategory, eventAction, eventLabel);
            console.log('*** Tracking Event('+eventCategory+', '+eventAction+', '+eventLabel+') ***');
          } else {
            console.log("Failt to Track Event");
          }
        });
      }

    });
