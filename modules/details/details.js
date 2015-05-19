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
        $http.get('http://162.249.6.50:21000/api/metadata/admin/version')
            .success(function (data) {
                $scope.iserror1=false;
                $scope.apiVersion=data.Version;

            })
                .error(function () {
                                    // alert("Sorry No response");

                                 });

    }]
);


DgcControllers.controller("NavController", ['$scope','$http', '$filter', 'sharedProperties', function($scope, $http, $filter, sharedProperties)
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
                         // alert("Sorry No response");

                      });
        //Nav to textbox

         $scope.updateVar = function (event) {
         $scope.$$prevSibling.query = angular.element(event.target).text();

    };


}]
);

DgcControllers.controller("DefinitionController", ['$scope','$http', '$stateParams', 'sharedProperties','$q', function($scope, $http, $stateParams, sharedProperties, $q)
    {

					$scope.guidName="";
					$scope.ids=[];
					$scope.isUndefined = function (strval) {
						return (typeof strval === "undefined");
					}

					$scope.isString=function isString(value){
					 return typeof value === 'string' || getType(value)==='[object Number]';
					}

					var getType = function (elem) {
					return Object.prototype.toString.call(elem);
					};

					$scope.isObject=function isObject(value){
					 return typeof value === 'object';
					}
//onclick to textbox

       $scope.updateDetailsVariable = function (event) {
        var appElement = document.querySelector('[ng-model=query]');
    var $scope = angular.element(appElement).scope();
     $scope.query = angular.element(event.target).text();
    // $scope.$apply(function() {
    //   $scope.query = angular.element(event.target).text();
    // });


         console.log("test");
        console.log(angular.element(event.target).text());
         console.log("testing");
    };
//onclick to textbox
					$scope.getGuidName=function getGuidName(val){
					$http.get('http://162.249.6.50:21000/api/metadata/entities/'+val)
						.success(function (data) {
						$scope.iserror1=false;
							if(!$scope.isUndefined(data.results)){
							$scope.gname=angular.fromJson(data.results);
							//console.log(angular.fromJson(data.results));
                               // $scope.gname=data.results.name;
							}

						})
						       .error(function () {
                                                 //   alert("Sorry No response");

                                                });
				return true;
					}

        $scope.Name=$stateParams.Id;
        $scope.searchqry=sharedProperties.getQuery();
        $scope.datatype1=sharedProperties.getProperty();

        $http.get('http://162.249.6.50:21000/api/metadata/entities/'+$stateParams.Id)
                .success(function (data) {
                    $scope.iserror1=false;
                $scope.details=  angular.fromJson(data.results);
                if(!$scope.isUndefined( $scope.details)) {
                 //   console.log($scope.details['name']);
                     $scope.datatype1=$scope.details["$typeName$"];
                    $scope.getSchema($scope.details['name']);
                    $scope.getLinegae($scope.details['name']);
					$scope.getLinegaeforinput($scope.details['name']);
                }
            })
                  .error(function () {
                                   // alert("Sorry No response");



                                });

        $scope.getSchema= function (tableName) {

            $http.get('http://162.249.6.50:21000/api/metadata/lineage/hive/table/'+tableName +'/schema')
                .success(function (data) {
                    $scope.iserror1=false;
                    $scope.schema=  angular.fromJson(data.results.rows);
                  //  console.log(tableName);


                })
                .error(function () {
                                             //     alert("Sorry No response");



                                              });
        }

$scope.getLinegae= function (tableName) {

//            $scope.width = 900;
//            $scope.heig var arr=[];
                                 var arrmyalias={};
                                 var datatypes=[];
                                 var tags=[];
                                 $scope.vts2 = [];
                                 $scope.vts1 = [];

            $http.get('http://162.249.6.50:21000/api/metadata/lineage/hive/table/'+tableName+'/outputs')
                .success(function (data) {
                    $scope.iserror1=false;
                     $scope.lineage=  angular.fromJson(data.results.rows);
                                        console.log($scope.lineage);

                                        $scope.edges1 = [];
                                        $scope.listguid = [];
                    						var ids = {},
                                                tags={},
                                                types={},
                                                reqs = [];
                                        angular.forEach($scope.lineage, function(lineage1){
                                            var level = 0;
                                            for(var i=0;i<lineage1.path.length;i++){
                                                // unique check and then http get
                                                var req = $http.get("http://162.249.6.50:21000/api/metadata/entities/"+lineage1.path[i].guid);

                                                req.then(function(name){
                                                    var f=angular.fromJson(name.data.results);
                                                    ids[name.data['GUID']] = f['name'];
                                                    types[name.data['GUID']] = f['$typeName$'];

                                                    if(f['$typeName$']==="Table")
                                                    {
                                                        var tag1;
                                                        angular.forEach(f['$traits$'], function(key, value) {
                                                            tags[name.data['GUID']]=value;
                                                            tag1=value;
                                                        });
                                                    }
                                                    else{
                                                        tags[name.data['GUID']]=f.queryText;
                                                    }

                                                });
                                                reqs.push(req);
                                            }
                                        });


                                       $q.all(reqs).then(function(){
                                            angular.forEach($scope.lineage, function(lineage1){
                                                var level = 0;
                                                for(var i=0;i<lineage1.path.length-1;i++){
                                                  var  sourceGuid = lineage1.path[i].guid;
                                                    var targetGuid = lineage1.path[i+1].guid;

                                                    $scope.vts2.push({
                                                        "source": ids[sourceGuid],
                                                        "target": ids[targetGuid],
                                                        "sourcetype":types[sourceGuid],
                                                        "targettype":types[targetGuid],
                                                        "sourcetags":tags[sourceGuid],
                                                        "targettags":tags[targetGuid]
                                                    });
                                                }

                                            });

                                            var nodes = {};
                                            var links=$scope.vts2;
                                            // Compute the distinct nodes from the links.
                                            links.forEach(function(link) {
                                                link.source = nodes[link.source] ||
                                                        (nodes[link.source] = {name: link.source,type:link.sourcetype,tags:link.sourcetags});
                                                link.target = nodes[link.target] ||
                                                        (nodes[link.target] = {name: link.target,type:link.targettype,tags:link.targettags});

                                            });
                                            console.log(links);
                                            var width = 600,
                                                    height = 500;

                                            var force = d3.layout.force()

                                                    .nodes(d3.values(nodes))
                                                    .links(links)
                                                    .size([width, height])
                                                    .alpha(0)

                                                    .linkDistance(130)
                                                    .charge(-130)
                                                    .on("tick", tick)
                                                    .start();




                                            var svg = d3.select("svg")
                                                    .attr("width", width)
                                                    .attr("height", height);

                                               var tip = d3.tip()
                                                    .attr('class', 'd3-tip')
                                                     .offset([-10, 0])
                                                      .html(function(d) {
                                                        return "<pre class='alert alert-success' style='max-width:400px;'>" + d.tags + "</pre>";
                                                           });

                                                           if(svg){
                                                             svg.call(tip);
                                                                 }
                                                   var link = svg.selectAll(".link");

                    // build the arrow.
                                            svg.append("svg:defs").selectAll("marker")
                                                    .data(["end"])      // Different link/path types can be defined here
                                                    .enter().append("svg:marker")    // This section adds in the arrows
                                                    .attr("id", String)
                                                    .attr("viewBox", "0 -5 10 10")
                                                    .attr("refX", 21)
                                                    .attr("refY", -3)
                                                    .attr("markerWidth", 6)
                                                    .attr("markerHeight", 6)
                                                    .attr("orient", "auto")
                                                    .append("svg:path")
                                                    .attr("d", "M0,-5L10,0L0,5");

                                            svg.append("svg:pattern").attr("id","processICO").attr("width",1).attr("height",1)
                                                    .append("svg:image").attr("xlink:href","../img/process.png").attr("x",-5.5).attr("y",-4).attr("width",42).attr("height",42);
                                            svg.append("svg:pattern").attr("id","textICO").attr("width",1).attr("height",1)
                                                    .append("svg:image").attr("xlink:href","../img/tableicon.png").attr("x",2).attr("y",2).attr("width",25).attr("height",25);

                    // add the links and the arrows
                                            var path = svg.append("svg:g").selectAll("path")
                                                    .data(force.links())
                                                    .enter().append("svg:path")
                    //    .attr("class", function(d) { return "link " + d.type; })
                                                    .attr("class", "link")
                                                    .attr("marker-end", "url(#end)");




                    // define the nodes
                                            var node = svg.selectAll(".node")
                                                    .data(force.nodes())
                                                    .enter().append("g")
                                                    .attr("class", "node")
                                                     .on("mouseover", tip.show)
                                                    .on("mouseout", tip.hide)
                                                    .call(force.drag);

                    // add the nodes
                                            node.append("circle")
                                                    .attr("r", 15).style("fill", function(d) {
                                                        if(d.type=="Table"){
                                                            console.log(d);
                                                            return "url('#textICO')";

                                                        }else{
                                                            console.log(d);
                                                            return "url('#processICO')";
                                                        }
                                                        return colors(i);
                                                    });
                    // add the text
                                            node.append("text")
                                                    .attr("x", 12)
                                                    .attr("dy", ".35em")
                                                    .text(function(d) { return d.name; });



                    // add the curvy lines
                                            function tick() {
                                                path.attr("d", function(d) {
                                                    var dx = d.target.x - d.source.x,
                                                            dy = d.target.y - d.source.y,
                                                            dr = Math.sqrt(dx * dx + dy * dy);
                                                    return "M" +
                                                            d.source.x + "," +
                                                            d.source.y + "A" +
                                                            dr + "," + dr + " 0 0,1 " +
                                                            d.target.x + "," +
                                                            d.target.y;
                                                });

                                                node
                                                        .attr("transform", function(d) {
                                                            return "translate(" + d.x + "," + d.y + ")"; });
                                            }


                                        console.log($scope.vts2);

                                        });

                    				  })
                                    .error(function () {
                                    alert("Sorry No response");
                                 });

                            }


$scope.getLinegaeforinput= function (tableName) {

//            $scope.width = 900;
//            $scope.height = 900;
		var arrmyalias1={};
                                         var datatypes1=[];
                                         var tags1=[];
                                         $scope.vtsinput = [];
                                         $scope.vts1 = [];
            $http.get('http://162.249.6.50:21000/api/metadata/lineage/hive/table/'+tableName+'/inputs')
                .success(function (data) {
                    $scope.iserror1=false;
                   $scope.lineage1=  angular.fromJson(data.results.rows);
                                                           console.log($scope.lineage1);


                                                           $scope.listguid = [];
                                       						var ids = {},
                                                                   tags={},
                                                                   types={},
                                                                   reqs = [];
                                                           angular.forEach($scope.lineage1, function(lineage1){
                                                               var level = 0;
                                                               for(var i=0;i<lineage1.path.length;i++){
                                                                   // unique check and then http get
                                                                   var req = $http.get("http://162.249.6.50:21000/api/metadata/entities/"+lineage1.path[i].guid);

                                                                   req.then(function(name){
                                                                       var f=angular.fromJson(name.data.results);
                                                                       ids[name.data['GUID']] = f['name'];
                                                                       types[name.data['GUID']] = f['$typeName$'];

                                                                       if(f['$typeName$']==="Table")
                                                                       {
                                                                           var tag1;
                                                                           angular.forEach(f['$traits$'], function(key, value) {
                                                                               tags[name.data['GUID']]=value;
                                                                               tag1=value;
                                                                           });
                                                                       }
                                                                       else{
                                                                           tags[name.data['GUID']]=f.queryText;
                                                                       }

                                                                   });
                                                                   reqs.push(req);
                                                               }
                                                           });


                                                          $q.all(reqs).then(function(){
                                                               angular.forEach($scope.lineage1, function(lineage1){
                                                                   var level = 0;
                                                                   for(var i=0;i<lineage1.path.length-1;i++){
                                                                     var  sourceGuid = lineage1.path[i].guid;
                                                                       var targetGuid = lineage1.path[i+1].guid;

                                                                       $scope.vtsinput.push({
                                                                           "source": ids[sourceGuid],
                                                                           "target": ids[targetGuid],
                                                                           "sourcetype":types[sourceGuid],
                                                                           "targettype":types[targetGuid],
                                                                           "sourcetags":tags[sourceGuid],
                                                                           "targettags":tags[targetGuid]
                                                                       });
                                                                   }

                                                               });

                                                               var nodes = {};
                                                               var links=$scope.vtsinput;
                                                               // Compute the distinct nodes from the links.
                                                               links.forEach(function(link) {
                                                                   link.source = nodes[link.source] ||
                                                                           (nodes[link.source] = {name: link.source,type:link.sourcetype,tags:link.sourcetags});
                                                                   link.target = nodes[link.target] ||
                                                                           (nodes[link.target] = {name: link.target,type:link.targettype,tags:link.targettags});

                                                               });
                                                               console.log(links);
                                                               var width = 600,
                                                                       height = 500;

                                                               var force = d3.layout.force()
                                                                       .nodes(d3.values(nodes))
                                                                       .links(links)
                                                                       .size([width, height])
                                                                       .linkDistance(130)
                                                                       .charge(-100)
                                                                       .on("tick", tick)
                                                                       .start();

                                                               var svg = d3.select("svg1").append("svg")
                                                                       .attr("width", width)
                                                                       .attr("margin-left", "-500px")
                                                                       .attr("height", height);


                                                                var tip = d3.tip()
                                                               .attr('class', 'd3-tip')
                                                               .offset([-10, 0])
                                                               .html(function(d) {
                                                                   return "<pre class='alert alert-success' style='max-width:400px;'>" + d.tags + "</pre>";
                                                               });

                                             if(svg){
                                                svg.call(tip);
                                             }

                                       // build the arrow.
                                                               svg.append("svg:defs").selectAll("marker")
                                                                       .data(["end"])      // Different link/path types can be defined here
                                                                       .enter().append("svg:marker")    // This section adds in the arrows
                                                                       .attr("id", String)
                                                                       .attr("viewBox", "0 -5 10 10")
                                                                       .attr("refX", 21)
                                                                       .attr("refY", -3)
                                                                       .attr("markerWidth", 6)
                                                                       .attr("markerHeight", 6)
                                                                       .attr("orient", "auto")
                                                                       .append("svg:path")
                                                                       .attr("d", "M0,-5L10,0L0,5");

                                                               svg.append("svg:pattern").attr("id","processICO").attr("width",1).attr("height",1)
                                                                       .append("svg:image").attr("xlink:href","../img/process.png").attr("x",-5.5).attr("y",-4).attr("width",42).attr("height",42);
                                                               svg.append("svg:pattern").attr("id","textICO").attr("width",1).attr("height",1)
                                                                       .append("svg:image").attr("xlink:href","../img/tableicon.png").attr("x",2).attr("y",2).attr("width",25).attr("height",25);

                                       // add the links and the arrows
                                                               var path = svg.append("svg:g").selectAll("path")
                                                                       .data(force.links())
                                                                       .enter().append("svg:path")
                                       //    .attr("class", function(d) { return "link " + d.type; })
                                                                       .attr("class", "link")
                                                                       .attr("marker-end", "url(#end)");

                                       // define the nodes
                                                               var node = svg.selectAll(".node")
                                                                       .data(force.nodes())
                                                                       .enter().append("g")
                                                                       .attr("class", "node")

                                                                       .on("mouseover", tip.show)
                                                                             .on("mouseout", tip.hide)
                                                                       .call(force.drag);

                                       // add the nodes
                                                               node.append("circle")
                                                                       .attr("r", 15).style("fill", function(d) {
                                                                           if(d.type=="Table"){
                                                                               console.log(d);
                                                                               return "url('#textICO')";

                                                                           }else{
                                                                               console.log(d);
                                                                               return "url('#processICO')";
                                                                           }
                                                                           return colors(i);
                                                                       });
                                       // add the text
                                                               node.append("text")
                                                                       .attr("x", 12)
                                                                       .attr("dy", ".35em")
                                                                       .text(function(d) { return d.name; });


                                       // add the curvy lines

                                                               function tick() {
                                                                node[0].x = width / 20;
                                                                   node[0].y = height / 20;
                                                                   path.attr("d", function(d) {
                                                                       var dx = d.target.x - d.source.x,
                                                                               dy = d.target.y - d.source.y,
                                                                               dr = Math.sqrt(dx * dx + dy * dy);
                                                                       return "M" +
                                                                               d.source.x + "," +
                                                                               d.source.y + "A" +
                                                                               dr + "," + dr + " 0 0,1 " +
                                                                               d.target.x + "," +
                                                                               d.target.y;
                                                                   });

                                                                   node
                                                                           .attr("transform", function(d) {
                                                                               return "translate(" + d.x + "," + d.y + ")"; });
                                                               }


                                                           console.log($scope.vts2);

                                                           });

                                       				  })
                                                       .error(function () {
                                                       alert("Sorry No response");
                                                    });

                                               }



      //  console.log( $scope.vts);

        $scope.reverse = function(array) {
            var copy = [].concat(array);
            return copy.reverse();
        }

        // function back()
        //  {
        //   $window.history.back();
        //   myModule.run(function ($rootScope, $location) {

        //       var history = [];

        //       $rootScope.$on('$routeChangeSuccess', function() {
        //           history.push($location.$$path);
        //       });

        //       $rootScope.back = function () {
        //           var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        //           $location.path(prevUrl);
        //       };

        //   });
        //  }




    }]
);


DgcControllers.controller("GuidController", ['$scope','$http', '$filter','$stateParams', 'sharedProperties', function($scope, $http, $filter, $stateParams, sharedProperties)
    {



$scope.getGuidName=function getGuidName(val){

        $scope.gnew=[];
                    $http.get('http://162.249.6.50:21000/api/metadata/entities/'+val)
                        .success(function (data) {
                        $scope.iserror1=false;
                            if(!$scope.isUndefined(data.results)){

                            $scope.gname=angular.fromJson(data.results);
                             var data1=angular.fromJson(data.results);
                             //$scope.gnew({"id" : val,"name" : data1['name']});

                           $scope.gnew= $scope.gname.name;
                           // $scope.$watch($scope.gnew, true);

}
                               //dddd


                        })
                            .error(function () {
                                                       //       alert("Sorry No response");



                                                          });

                //return $scope.gnew;
                    }


 }]
);

