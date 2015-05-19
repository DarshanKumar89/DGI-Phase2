/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var DgcSearchModule = angular.module("DgcSearchModule", []);


DgcSearchModule.controller("ListController", ['$scope', '$http', '$filter', '$stateParams', '$timeout', 'sharedProperties', function($scope, $http, $filter, $stateParams, $timeout, sharedProperties) {


    $scope.isUndefined = function(strval) {

        return (typeof strval === "undefined");
    }

    $scope.StoreJson = function(strval) {
        sharedProperties.setProperty(strval);
    }

    $scope.Showpaging = function(itemlength) {

        return (itemlength > 1);
    }

    $scope.isString = function isString(value) {
        return typeof value === 'string';
    }

    $scope.isObject = function isObject(value) {

        return typeof value === 'object';
    }
    $scope.Storeqry = function Storeqry(value) {

        return typeof value === 'object';
    }



    $scope.executeSearchForleftNav = function executeSearchForleftNav(strSearch) {
        $scope.query = strSearch;
        sharedProperties.setQuery(strSearch);
        //$scope.executeSearch();
    }

    console.log($stateParams.searchid);
    $scope.SearchQuery = $stateParams.searchid;
    $scope.reverse = false;
    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.itemsPerPage = 10;
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.itemlength = 0;
    $scope.noofresults = 0;
    $scope.configdata = [];
    $scope.results = [];
    $scope.datatype = "";
    $http.get('../modules/search/config.json').success(function(data) {
        $scope.configdata = data.Search;

    });

    $scope.loading = true;
    //timeout
    $timeout(function() {

        $scope.noofresults = 1
        $scope.loading = false
    }, 2000);
    $http.get('/api/metadata/discovery/search?query=' + $scope.SearchQuery)
        .success(function(data) {
            $scope.iserror = false;
            $scope.entities = angular.fromJson(data.results.rows);
            $scope.loading = false;
            if (!$scope.isUndefined($scope.entities)) {
                $scope.itemlength = $scope.entities.length;
                $scope.noofresults = 1;
                $scope.datatype = data.results.dataType.typeName;

                var i = 0;
                angular.forEach($scope.configdata, function(values, key) {
                    if (key === data.results.dataType.typeName) {
                        i = 1;
                    }
                });
                if (i === 0) {
                    var tempdataType = "__tempQueryResultStruct";
                    //console.log(tempdataType);
                    var datatype1 = $scope.datatype.substring(0, tempdataType.length);
                    // console.log(datatype1);
                    if (datatype1 === tempdataType) {
                        $scope.datatype = tempdataType;
                    }

                }

                sharedProperties.setProperty($scope.datatype);
            }


            $scope.currentPage = 0;
            // now group by pages
            $scope.groupToPages();


        })
        .error(function() {


            $scope.loading = false;
            $scope.errormessage = True;

            $scope.iserror = true;

            $scope.noofresults = 0;
            $scope.status = "Finished";




        });


    //click value to textbox

    $scope.updateVars = function(event) {
        var appElement = document.querySelector('[ng-model=query]');
        var $scope = angular.element(appElement).scope();
        $scope.query = angular.element(event.target).text();



        console.log("test");
        console.log(angular.element(event.target).text());
        console.log("testingFact");
    };
    //click value to textbox
    $scope.getGuidName = function getGuidName(val) {
        $http.get('/api/metadata/entities/' + val)
            .success(function(data) {
                $scope.iserror1 = false;
                if (!$scope.isUndefined(data.results)) {
                    $scope.gname = angular.fromJson(data.results);
                    console.log(angular.fromJson(data.results));

                }

            })
            .error(function() {

                $scope.loading = false;
            });

    }


    // calculate page in place
    $scope.groupToPages = function() {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.itemlength; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.entities[i]];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.entities[i]);
            }
        }

    };

    $scope.range = function(start, end) {
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

    $scope.prevPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };


    $scope.firstPage = function() {
        if ($scope.currentPage > 0) {
            $scope.currentPage = 0;
        }
    };

    $scope.lastPage = function() {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage = $scope.pagedItems.length - 1;
        }
    };
    $scope.setPage = function() {
        $scope.currentPage = this.n;
    };

}]);