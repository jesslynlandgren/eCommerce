var app = angular.module('sailfish', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state({
            name: 'all_products',
            url: '/all_products',
            templateUrl: 'all_products.html',
            controller: 'HomeController'
        })
    $urlRouterProvider.otherwise('/now_playing');
});

app.factory('CommerceService', function($http) {

    var service = {};

    service.allProducts = function() {
        var url = 'http://localhost:5000/api/products';
        return $http({
            method: 'GET',
            url: url
        });
    };
    return service;
});

app.controller('HomeController', function($scope, $state, MovieService){
    CommerceService.allProducts()
        .success(function(productResults) {
            $scope.results = productResults;
        });
});
