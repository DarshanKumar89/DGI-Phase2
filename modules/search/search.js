
var DgcControllers = angular.module("DgcControllers", []);

 DgcControllers.service('sharedProperties', function () {
        var property="";
		var Query="";

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            },
			getQuery: function () {
                return Query;
            },setQuery: function(value) {
                Query = value;
            }
        };
});



DgcControllers.controller("headerController", ['$scope', '$window', '$location', '$stateParams', function($scope, $window, $location,$stateParams)
    {
		$scope.executeSearch=function executeSearch() {
            $window.location.href = "#Search/" + $scope.query;


        }
		$scope.query=$stateParams.searchid;
    }]
);

DgcControllers.controller("footerController", ['$scope','$http', function($scope, $http)
    {
        $http.get('/api/metadata/admin/version')
            .success(function (data) {
                $scope.iserror1=false;
                $scope.apiVersion=data.Version;

            })
                .error(function () {
                                     alert("Sorry No response");

                                 });

    }]
);


DgcControllers.controller("NavController", ['$scope','$http', '$filter', 'sharedProperties', function($scope, $http, $filter, sharedProperties)
{

    $http.get('/api/metadata/types')
        .success(function (data) {
            $scope.iserror1=false;
            $scope.leftnav=angular.fromJson(data.results);

//limit
 var pagesShown = 1;
    var pageSize = 5;
  $scope.itemsLimit = function() {
        return pageSize * pagesShown;
    };
    $scope.hasMoreItemsToShow = function() {
        return pagesShown < ($scope.items.length / pageSize);
    };
    $scope.showMoreItems = function() {
        pagesShown = pagesShown + 1;
    };


        })
         .error(function () {
                          alert("Sorry No response");

                      });
        //Nav to textbox

         $scope.updateVar = function (event) {
         $scope.$$prevSibling.query = angular.element(event.target).text();

    };


}]
);

