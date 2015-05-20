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
var DgcHomeModule = angular.module("DgcHomeModule", []);


DgcHomeModule.controller("headerController", ['$scope', '$window', '$location', '$stateParams', function($scope, $window, $location, $stateParams) {
    $scope.executeSearch = function executeSearch() {
        $window.location.href = "#Search/" + $scope.query;


    }
    $scope.query = $stateParams.searchid;
}]);

DgcHomeModule.controller("footerController", ['$scope', '$http', function($scope, $http) {
    $http.get('/api/metadata/admin/version')
        .success(function(data) {
            $scope.iserror1 = false;
            $scope.apiVersion = data.Version;

        })
        .error(function() {
            // alert("Sorry No response");

        });

}]);


DgcHomeModule.controller("NavController", ['$scope', '$http', '$filter', 'sharedProperties', function($scope, $http, $filter, sharedProperties) {

    $http.get('/api/metadata/types')
        .success(function(data) {
            $scope.iserror1 = false;
            $scope.leftnav = angular.fromJson(data.results);

            //limit
            var pagesShown = 1;
            var pageSize = 10;
            $scope.itemsLimit = function() {
                return pageSize * pagesShown;

            };
            $scope.hasMoreItemsToShow = function() {

                return pagesShown < ($scope.items.length / pageSize);


            };

            $scope.showMoreItems = function() {

                pagesShown = pagesShown + 5;
                $scope.exporting = true;
            };


        })
        .error(function() {


        });
    //Nav to textbox

    $scope.updateVar = function(event) {
        $scope.$$prevSibling.query = angular.element(event.target).text();

    };


}]);