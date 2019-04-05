var app =  angular.module('ngIotBrowser', [
	'ngRoute',
	'nvd3',
	'ng-awspaho',
	'ng.deviceDetector',
	'ngDialog'
]);


app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	// $locationProvider.html5Mode(true);
	// $locationProvider.hashPrefix('');


	$routeProvider.
		when("/", {redirectTo: '/iotchartDefault'}).
		// when("/iotchart", {templateUrl: "views/iotchart.html", controller: "iotchartController"}).
		when("/iotchartDefault", {templateUrl: "views/iotchart.html", controller: "iotchartDefaultController"});

}]);
