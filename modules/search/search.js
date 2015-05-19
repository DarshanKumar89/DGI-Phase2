
var DgcCont = angular.module("DgcCont", []);

 DgcCont.service('sharedProperties', function () {
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



DgcCont.controller("headerController", ['$scope', '$window', '$location', '$stateParams', function($scope, $window, $location,$stateParams)
    {
		$scope.executeSearch=function executeSearch() {
            $window.location.href = "#Search/" + $scope.query;


        }
		$scope.query=$stateParams.searchid;
    }]
);

DgcCont.controller("footerController", ['$scope','$http', function($scope, $http)
    {
        $http.get('http://162.249.6.50:21000/api/metadata/admin/version')
            .success(function (data) {
                $scope.iserror1=false;
                $scope.apiVersion=data.Version;

            })
                .error(function () {
                                     alert("Sorry No response");

                                 });

    }]
);


DgcCont.controller("NavController", ['$scope','$http', '$filter', 'sharedProperties', function($scope, $http, $filter, sharedProperties)
{

    $http.get('http://162.249.6.50:21000/api/metadata/types')
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


DgcCont.controller("ListController", ['$scope','$http', '$filter','$stateParams', 'sharedProperties', function($scope, $http, $filter, $stateParams, sharedProperties)
    {


        $scope.isUndefined = function (strval) {

            return (typeof strval === "undefined");
        }

		$scope.StoreJson = function (strval) {
            sharedProperties.setProperty(strval);
        }

        $scope.Showpaging = function(itemlength)
        {

            return (itemlength > 1);
        }

        $scope.isString=function isString(value){
            return typeof value === 'string';
        }

        $scope.isObject=function isObject(value){

            return typeof value === 'object';
        }
        $scope.Storeqry=function Storeqry(value){

            return typeof value === 'object';
        }



        $scope.executeSearchForleftNav = function executeSearchForleftNav(strSearch){
            $scope.query=strSearch;
			 sharedProperties.setQuery(strSearch);
            //$scope.executeSearch();
        }

        console.log($stateParams.searchid);
           $scope.SearchQuery=$stateParams.searchid;
            $scope.reverse = false;
            $scope.filteredItems = [];
            $scope.groupedItems = [];
            $scope.itemsPerPage = 10;
            $scope.pagedItems = [];
            $scope.currentPage = 0;
            $scope.itemlength=0;
            $scope.noofresults=0;
            $scope.configdata=[];
            $scope.results=[];
            $scope.datatype="";
            $http.get('../modules/search/config.json').success(function(data){
                $scope.configdata=data.Search;

            });

             $scope.loading = true;
            $http.get('http://162.249.6.50:21000/api/metadata/discovery/search?query='+$scope.SearchQuery)
                .success(function (data) {
                    $scope.iserror=false;
                    $scope.entities=angular.fromJson(data.results.rows);
                      $scope.loading = false;
                    if(!$scope.isUndefined($scope.entities)){
                        $scope.itemlength=$scope.entities.length;
                        	$scope.noofresults=1;
                        $scope.datatype=data.results.dataType.typeName;

                        var i=0;
                        angular.forEach($scope.configdata, function(values, key) {
                            if (key === data.results.dataType.typeName) {
                                i=1;
                            }
                        });
                            if(i===0){
                                var tempdataType="__tempQueryResultStruct";
                                //console.log(tempdataType);
                                var datatype1=$scope.datatype.substring(0,tempdataType.length);
                               // console.log(datatype1);
                                if(datatype1===tempdataType){
                                    $scope.datatype=tempdataType;
                                }

                            }

                        sharedProperties.setProperty($scope.datatype);
                    }

               //     console.log($scope.entities);


                    // to get value based on config but not use (used in view directly)
                  /*  angular.forEach($scope.configdata, function(values, key) {
                        if(key===data.results.dataType.typeName)
                        {
                            $scope.entities.forEach(function(k,v){
                                    angular.forEach(values, function(value, key1) {
                                        var obj = {};
                                        obj[value] = k[value];
                                    $scope.results.push(obj);
                                });
                            });
                        }
                    });
                    */

                    $scope.currentPage = 0;
                    // now group by pages
                    $scope.groupToPages();


                })
                 .error(function () {
                    // alert("Sorry No response");
//                     $scope.iserror=true;
//                     $scope.error=e;
                    $scope.noofresults=1;
                    $scope.errormessage="no response";



                 });

//click value to textbox

       $scope.updateVars = function (event) {
        var appElement = document.querySelector('[ng-model=query]');
    var $scope = angular.element(appElement).scope();
     $scope.query = angular.element(event.target).text();
    // $scope.$apply(function() {
    //   $scope.query = angular.element(event.target).text();
    // });


         console.log("test");
        console.log(angular.element(event.target).text());
         console.log("testingFact");
    };
    //click value to textbox
        $scope.getGuidName=function getGuidName(val){
            $http.get('http://162.249.6.50:21000/api/metadata/entities/'+val)
                .success(function (data) {
                    $scope.iserror1=false;
                    if(!$scope.isUndefined(data.results)){
                        $scope.gname=angular.fromJson(data.results);
                        console.log(angular.fromJson(data.results));
                        // $scope.gname=data.results.name;
                    }

                })
                    .error(function () {
                                       //  alert("Sorry No response");

                                     });
            //return $scope.gname;
        }


        // calculate page in place
        $scope.groupToPages = function () {
            $scope.pagedItems = [];

            for (var i = 0; i < $scope.itemlength; i++) {
                if (i % $scope.itemsPerPage === 0) {
                    $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.entities[i] ];
                } else {
                    $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.entities[i]);
                }
            }

        };

        $scope.range = function (start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        $scope.prevPage = function () {
            if ($scope.currentPage > 0) {
                $scope.currentPage--;
            }
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.pagedItems.length - 1) {
                $scope.currentPage++;
            }
        };


        $scope.firstPage = function () {
            if ($scope.currentPage > 0) {
                $scope.currentPage = 0;
            }
        };

        $scope.lastPage = function () {
            if ($scope.currentPage < $scope.pagedItems.length - 1) {
                $scope.currentPage = $scope.pagedItems.length-1;
            }
        };
        $scope.setPage = function () {
            $scope.currentPage = this.n;
        };

    }]
);
