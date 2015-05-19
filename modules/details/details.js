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
var DgcDetailModule = angular.module("DgcDetailModule", []);


DgcDetailModule.controller("DefinitionController", ['$scope', '$http', '$stateParams', 'sharedProperties', '$q', function($scope, $http, $stateParams, sharedProperties, $q) {

    $scope.guidName = "";
    $scope.ids = [];
    $scope.isUndefined = function(strval) {
        return (typeof strval === "undefined");
    }

    $scope.isString = function isString(value) {
        return typeof value === 'string' || getType(value) === '[object Number]';
    }

    var getType = function(elem) {
        return Object.prototype.toString.call(elem);
    };

    $scope.isObject = function isObject(value) {
            return typeof value === 'object';
        }
        //onclick to textbox

    $scope.updateDetailsVariable = function(event) {
        var appElement = document.querySelector('[ng-model=query]');
        var $scope = angular.element(appElement).scope();
        $scope.query = angular.element(event.target).text();

    };
    //onclick to textbox
    $scope.getGuidName = function getGuidName(val) {
        $http.get('/api/metadata/entities/' + val)
            .success(function(data) {
                $scope.iserror1 = false;
                if (!$scope.isUndefined(data.results)) {
                    $scope.gname = angular.fromJson(data.results);

                }

            })
            .error(function() {

            });
        return true;
    }

    $scope.Name = $stateParams.Id;
    $scope.searchqry = sharedProperties.getQuery();
    $scope.datatype1 = sharedProperties.getProperty();

    $http.get('/api/metadata/entities/' + $stateParams.Id)
        .success(function(data) {
            $scope.iserror1 = false;
            $scope.details = angular.fromJson(data.results);
            if (!$scope.isUndefined($scope.details)) {

                $scope.datatype1 = $scope.details["$typeName$"];
                $scope.getSchema($scope.details['name']);
                $scope.getLinegae($scope.details['name']);
                $scope.getLinegaeforinput($scope.details['name']);
            }
        })
        .error(function() {




        });

    $scope.getSchema = function(tableName) {

        $http.get('/api/metadata/lineage/hive/table/' + tableName + '/schema')
            .success(function(data) {
                $scope.iserror1 = false;
                $scope.schema = angular.fromJson(data.results.rows);
                //  console.log(tableName);


            })
            .error(function() {
                //     alert("Sorry No response");



            });
    }

    $scope.getLinegae = function(tableName) {

        $scope.vts2 = [];
        $scope.vts1 = [];

        $http.get('/api/metadata/lineage/hive/table/' + tableName + '/outputs')
            .success(function(data) {
                $scope.iserror1 = false;
                $scope.lineage = angular.fromJson(data.results.rows);
                $scope.listguid = [];
                var ids = {},
                    tags = {},
                    types = {},
                    reqs = [];
                angular.forEach($scope.lineage, function(lineage1) {
                    var level = 0;
                    for (var i = 0; i < lineage1.path.length; i++) {
                        // unique check and then http get
                        var req = $http.get("/api/metadata/entities/" + lineage1.path[i].guid);

                        req.then(function(name) {
                            var f = angular.fromJson(name.data.results);
                            ids[name.data['GUID']] = f['name'];
                            types[name.data['GUID']] = f['$typeName$'];

                            if (f['$typeName$'] === "Table") {
                                var tag1;
                                angular.forEach(f['$traits$'], function(key, value) {
                                    tags[name.data['GUID']] = value;
                                    tag1 = value;
                                });
                            } else {
                                tags[name.data['GUID']] = f.queryText;
                            }

                        });
                        reqs.push(req);
                    }
                });


                $q.all(reqs).then(function() {
                    angular.forEach($scope.lineage, function(lineage1) {
                        var level = 0;
                        for (var i = 0; i < lineage1.path.length - 1; i++) {
                            var sourceGuid = lineage1.path[i].guid;
                            var targetGuid = lineage1.path[i + 1].guid;

                            $scope.vts2.push({
                                "source": ids[sourceGuid],
                                "target": ids[targetGuid],
                                "sourcetype": types[sourceGuid],
                                "targettype": types[targetGuid],
                                "sourcetags": tags[sourceGuid],
                                "targettags": tags[targetGuid]
                            });
                        }

                    });

                    var nodes = {};
                    var links = $scope.vts2;
                    // Compute the distinct nodes from the links.
                    links.forEach(function(link) {
                        link.source = nodes[link.source] ||
                            (nodes[link.source] = {
                                name: link.source,
                                type: link.sourcetype,
                                tags: link.sourcetags
                            });
                        link.target = nodes[link.target] ||
                            (nodes[link.target] = {
                                name: link.target,
                                type: link.targettype,
                                tags: link.targettags
                            });

                    });

                    var width = 600,
                        height = 500;

                    var force = d3.layout.force()

                    .nodes(d3.values(nodes))
                        .links(links)
                        .size([width, height])
                        .linkDistance(130)
                        .gravity(0.3)
                        .charge(-1000)
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

                    if (svg) {
                        svg.call(tip);
                    }
                    var link = svg.selectAll(".link");

                    // build the arrow.

                    svg.append("svg:pattern").attr("id", "processICO").attr("width", 1).attr("height", 1)
                        .append("svg:image").attr("xlink:href", "../img/process.png").attr("x", -5.5).attr("y", -4).attr("width", 42).attr("height", 42);
                    svg.append("svg:pattern").attr("id", "textICO").attr("width", 1).attr("height", 1)
                        .append("svg:image").attr("xlink:href", "../img/tableicon.png").attr("x", 2).attr("y", 2).attr("width", 25).attr("height", 25);

                    // define the nodes
                    var node = svg.selectAll(".node")
                        .data(force.nodes())
                        .enter().append("g")
                        .attr("class", "node")
                        .on("mouseover", tip.show)
                        .on("mouseout", tip.hide)
                        .call(force.drag);

                    var link = svg.selectAll(".link")
                        .data(force.links())
                        .enter().append("line")
                        .attr("class", "link");

                    svg.append("svg:defs")
                        .append("svg:marker")
                        .attr("id", "arrow")
                        .attr("viewBox", "0 0 10 10")
                        .attr("refX", 15)
                        .attr("refY", 5)
                        .attr("markerUnits", "strokeWidth")
                        .attr("markerWidth", 8)
                        .attr("markerHeight", 8)
                        .attr("orient", "auto")
                        .append("svg:path")
                        .attr("d", "M 0 0 L 10 5 L 0 10 z");
                    // add the nodes
                    node.append("circle")
                        .attr("r", 15).style("fill", function(d) {
                            if (d.type == "Table") {
                                return "url('#textICO')";

                            } else {
                                return "url('#processICO')";
                            }
                            return colors(i);
                        });
                    // add the text
                    node.append("text")
                        .attr("x", 12)
                        .attr("dy", ".35em")
                        .text(function(d) {
                            return d.name;
                        });

                    // add the links and the arrows
                    link.attr("marker-end", "url(#arrow)");

                    // add the curvy lines
                    function tick() {
                        link
                            .attr("x1", function(d) {
                                return d.source.x;
                            })
                            .attr("y1", function(d) {
                                return d.source.y;
                            })
                            .attr("x2", function(d) {
                                return d.target.x;
                            })
                            .attr("y2", function(d) {
                                return d.target.y;
                            });


                        node
                            .attr("transform", function(d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            });
                    }

                });

            })
            .error(function() {

            });

    }


    $scope.getLinegaeforinput = function(tableName) {

        $scope.vtsinput = [];
        $http.get('/api/metadata/lineage/hive/table/' + tableName + '/inputs')
            .success(function(data) {
                $scope.iserror1 = false;
                $scope.lineage1 = angular.fromJson(data.results.rows);
                var ids = {},
                    tags = {},
                    types = {},
                    reqs = [];
                angular.forEach($scope.lineage1, function(lineage1) {
                    var level = 0;
                    for (var i = 0; i < lineage1.path.length; i++) {
                        // unique check and then http get
                        var req = $http.get("/api/metadata/entities/" + lineage1.path[i].guid);

                        req.then(function(name) {
                            var f = angular.fromJson(name.data.results);
                            ids[name.data['GUID']] = f['name'];
                            types[name.data['GUID']] = f['$typeName$'];

                            if (f['$typeName$'] === "Table") {
                                var tag1;
                                angular.forEach(f['$traits$'], function(key, value) {
                                    tags[name.data['GUID']] = value;
                                    tag1 = value;
                                });
                            } else {
                                tags[name.data['GUID']] = f.queryText;
                            }

                        });
                        reqs.push(req);
                    }
                });


                $q.all(reqs).then(function() {
                    angular.forEach($scope.lineage1, function(lineage1) {
                        var level = 0;
                        for (var i = 0; i < lineage1.path.length - 1; i++) {
                            var sourceGuid = lineage1.path[i].guid;
                            var targetGuid = lineage1.path[i + 1].guid;

                            $scope.vtsinput.push({
                                "source": ids[sourceGuid],
                                "target": ids[targetGuid],
                                "sourcetype": types[sourceGuid],
                                "targettype": types[targetGuid],
                                "sourcetags": tags[sourceGuid],
                                "targettags": tags[targetGuid]
                            });
                        }

                    });

                    var nodes = {};
                    var links = $scope.vtsinput;
                    // Compute the distinct nodes from the links.
                    links.forEach(function(link) {
                        link.source = nodes[link.source] ||
                            (nodes[link.source] = {
                                name: link.source,
                                type: link.sourcetype,
                                tags: link.sourcetags
                            });
                        link.target = nodes[link.target] ||
                            (nodes[link.target] = {
                                name: link.target,
                                type: link.targettype,
                                tags: link.targettags
                            });

                    });

                    var width = 600,
                        height = 500;

                    var force = d3.layout.force()
                        .nodes(d3.values(nodes))
                        .links(links)
                        .size([width, height])
                        .linkDistance(130)
                        .gravity(0.3)
                        .charge(-1000)
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

                    if (svg) {
                        svg.call(tip);
                    }

                    // build the arrow.
                    svg.append("svg:defs")
                        .append("svg:marker")
                        .attr("id", "arrow")
                        .attr("viewBox", "0 0 10 10")
                        .attr("refX", 15)
                        .attr("refY", 5)
                        .attr("markerUnits", "strokeWidth")
                        .attr("markerWidth", 8)
                        .attr("markerHeight", 8)
                        .attr("orient", "auto")
                        .append("svg:path")
                        .attr("d", "M 0 0 L 10 5 L 0 10 z");

                    svg.append("svg:pattern").attr("id", "processICO").attr("width", 1).attr("height", 1)
                        .append("svg:image").attr("xlink:href", "../img/process.png").attr("x", -5.5).attr("y", -4).attr("width", 42).attr("height", 42);
                    svg.append("svg:pattern").attr("id", "textICO").attr("width", 1).attr("height", 1)
                        .append("svg:image").attr("xlink:href", "../img/tableicon.png").attr("x", 2).attr("y", 2).attr("width", 25).attr("height", 25);


                    // define the nodes
                    var node = svg.selectAll(".node")
                        .data(force.nodes())
                        .enter().append("g")
                        .attr("class", "node")

                    .on("mouseover", tip.show)
                        .on("mouseout", tip.hide)
                        .call(force.drag);

                    var link = svg.selectAll(".link")
                        .data(force.links())
                        .enter().append("line")
                        .attr("class", "link");
                    // add the nodes
                    node.append("circle")
                        .attr("r", 15).style("fill", function(d) {
                            if (d.type == "Table") {
                                return "url('#textICO')";

                            } else {
                                return "url('#processICO')";
                            }
                            return colors(i);
                        });

                    // add the links and the arrows
                    link.attr("marker-end", "url(#arrow)");


                    // add the text
                    node.append("text")
                        .attr("x", 12)
                        .attr("dy", ".35em")
                        .text(function(d) {
                            return d.name;
                        });


                    // add the curvy lines

                    function tick() {
                        link
                            .attr("x1", function(d) {
                                return d.source.x;
                            })
                            .attr("y1", function(d) {
                                return d.source.y;
                            })
                            .attr("x2", function(d) {
                                return d.target.x;
                            })
                            .attr("y2", function(d) {
                                return d.target.y;
                            });

                        node
                            .attr("transform", function(d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            });
                    }

                });

            })
            .error(function() {});

    }




    $scope.reverse = function(array) {
        var copy = [].concat(array);
        return copy.reverse();
    }

}]);


DgcDetailModule.controller("GuidController", ['$scope', '$http', '$filter', '$stateParams', 'sharedProperties', function($scope, $http, $filter, $stateParams, sharedProperties) {



    $scope.getGuidName = function getGuidName(val) {

        $scope.gnew = [];
        $http.get('/api/metadata/entities/' + val)
            .success(function(data) {
                $scope.iserror1 = false;
                if (!$scope.isUndefined(data.results)) {

                    $scope.gname = angular.fromJson(data.results);
                    var data1 = angular.fromJson(data.results);


                    $scope.gnew = $scope.gname.name;


                }


            })
            .error(function() {




            });

    }


}]);