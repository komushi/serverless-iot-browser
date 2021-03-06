var app = angular.module('ngIotBrowser');


app.controller('iotchartDefaultController', ['$scope', '$paho', '$timeout', '$q', '$http', 'deviceDetector', 'ngDialog', function($scope, $paho, $timeout, $q, $http, deviceDetector, ngDialog){


    // notify callback function
    var messageReceived = function (payload) {
        console.log('payload3', payload.message.destinationName);
        console.log('payloadString', payload.message.payloadString);

        if (payload.message.destinationName.indexOf('browser') > -1) {
          $scope.dataBrowser = JSON.parse(payload.message.payloadString);  
        } else if (payload.message.destinationName.indexOf('os') > -1) {
          $scope.dataOs = JSON.parse(payload.message.payloadString);  
        } else if (payload.message.destinationName.indexOf('device') > -1) {
          $scope.dataDevice = JSON.parse(payload.message.payloadString);  
        }
    };

    var getConfig = function() {
      var deferred = $q.defer();
      var uri = '/config/config.json';
      
      $http.get(uri)
        .then(function(response) {
          // console.log(response);
          deferred.resolve(response.data);
        })
        .catch(function(response) {
          // console.error(Failed to get ${uri}`, response.status, response.data);
          // window.alert(`Failed to get ${uri}`)
          // deferred.reject(`Failed to get ${uri}`);
          console.error('Failed to get ' + uri, response.status, response.data);
          window.alert('Failed to get ' + uri)
          deferred.reject('Failed to get ' + uri);
        });

      return deferred.promise;
    };

    var getCredentials = function(config) {
      var deferred = $q.defer();

      AWS.config.region = config.region;
      var credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: config.identityPoolId});
      AWS.config.credentials = credentials;
      config.credentials = credentials;
      deferred.resolve(config);

      return deferred.promise;
    };

    var getEndpoint = function(config) {
      var deferred = $q.defer();

      var iot = new AWS.Iot({apiVersion: '2015-05-28'});
      iot.describeEndpoint({endpointType: 'iot:Data-ATS'}, function(err, data) {
        if (err) {
          console.error("Unable to get endpoint. Error JSON:", JSON.stringify(err, null, 2));
          deferred.reject(err);
        } else {
          console.log("Get endpoint succeeded:", JSON.stringify(data, null, 2));
          config.endpoint = data.endpointAddress;
          deferred.resolve(config);
        }
      });

      return deferred.promise;
    };


    var connectIot = function (config) {
      
      // var sendTopic = `iotBrowser${config.envId}/inbound/connect`;
      // var receiveTopic = `iotBrowser${config.envId}/outbound/#`;
      // var name = `iotBrowser${config.envId}`;
      var sendTopic = 'iotBrowser' + config.envId + '/inbound/connect';
      var receiveTopic = 'iotBrowser' + config.envId + '/outbound/#';
      var name = 'iotBrowser' + config.envId;

      $paho.connect(name, config.region, config.endpoint, config.credentials)
        .then(function(payload) {
            console.log(JSON.stringify(payload));
            $paho.received(name)
                .then(null,null,messageReceived);

            $paho.subscribe(name, receiveTopic, 1)
                .then(function(payload) {
                  console.log(JSON.stringify(payload));
                }, function(payload) {
                    console.error(JSON.stringify(payload));
                });

            $paho.send(name, sendTopic,
                JSON.stringify({
                    "clientId": $paho.getClientId(name),
                    "eventType": 'connected',
                    "os": deviceDetector.os,
                    "browser": deviceDetector.browser,
                    "device": deviceDetector.device,
                    "timestamp": Date.now()
                }));

        }, function(payload) {
            console.error(JSON.stringify(payload));
        });
    };

    var initialize = function () {
      
      console.log(deviceDetector);

      // angular-nvd3
      $scope.dataBrowser = [];
      $scope.dataOs = [];
      $scope.dataDevice = [];
      $scope.optionsBrowser = {
          chart: {
              type: 'pieChart',
              height: 300,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20
              },
              x: function(d){return d.key;},
              y: function(d){return d.count;},
              showLabels: true,
              duration: 200,
              labelThreshold: 0.01,
              labelSunbeamLayout: true,
              labelType: 'value',
              PieLabelOutside: true,
              legend: {
                  margin: {
                      top: 5,
                      right: 35,
                      bottom: 5,
                      left: 0
                  }
              }
          }
      };

      getConfig(getConfig)
        .then(getCredentials)
        .then(getEndpoint)
        .then(connectIot);
    }

    initialize();
    


}]);

