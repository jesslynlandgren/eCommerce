var app = angular.module('sailfish', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state({
            name: 'products',
            url: '/products',
            templateUrl: 'products.html',
            controller: 'ProductsController'
        })

        .state({
            name: 'product',
            url: '/{id}',
            templateUrl: 'product.html',
            controller: 'ProductController'
        })

        .state({
            name: 'view_cart',
            url: '/products/cart',
            templateUrl: 'cart.html',
            controller: 'CartController'
        })

        .state({
            name: 'checkout',
            url: '/products/cart/checkout',
            templateUrl: 'checkout.html',
            controller: 'CheckoutController'
        })

        .state({
            name: 'thank_you',
            url: '/products/cart/checkout/thank_you',
            templateUrl: 'thank_you.html',
            controller: 'ThankYouController'
        });

    $urlRouterProvider.otherwise('/products');
});

app.factory('API', function($http) {

    var service = {'auth_token':''};

    service.allProducts = function() {
        var url = 'http://localhost:5000/api/products';
        return $http({
            method: 'GET',
            url: url
        });
    };

    service.getProduct = function(productId) {
        var url = 'http://localhost:5000/api/product/' + productId;
        return $http({
            method: 'GET',
            url: url
        });
    };

    service.login = function(formData) {
        var url = 'http://localhost:5000/api/user/login';
        return $http({
            method: 'POST',
            url: url,
            data: formData
        });
    };

    service.signup = function(formData) {
        var url = 'http://localhost:5000/api/customer/signup';
        return $http({
            method: 'POST',
            url: url,
            data: formData
        });
    };

    service.addToCart = function(token, product_id) {
        var url = 'http://localhost:5000/api/shopping_cart';
        return $http({
            method: 'POST',
            url: url,
            data: {'auth_token': token,
                   'product_id': product_id}
        });
    };

    service.removeFromCart = function(token, product_id) {
        var url = 'http://localhost:5000/api/remove_item';
        return $http({
            method: 'POST',
            url: url,
            data: {'auth_token': token,
                   'product_id': product_id}
        });
    };

    service.getCart = function(token) {
        var url = 'http://localhost:5000/api/shopping_cart';
        return $http({
            method: 'GET',
            url: url,
            params: {
                auth_token: token
            }
        });
    };

    service.checkout = function(token, shipping) {
        var url = 'http://localhost:5000/api/shopping_cart/checkout';
        return $http({
            method: 'POST',
            url: url,
            data: {'auth_token': token,
                   'shipping': shipping}
        });
    };

    return service;
});

app.controller('NavController', function($scope, $state, $cookies, $rootScope, API){
    $rootScope.getNumItems = function(){
        API.getCart(API.auth_token)
            .success(function(results) {
                $scope.numItems = results[0].length;
                console.log($scope.numItems);
            });
    };

    $rootScope.login = false;
    $rootScope.loginerror = false;
    $rootScope.loginform = {};
    $rootScope.signup = false;
    $rootScope.signuperror = false;
    $rootScope.signupform = {};
    if ($rootScope.loggedin === true){
        $rootScope.getNumItems();
    } else if ($rootScope.loggedin === false){
        try {
            $rootScope.user = $cookies.getObject('user').user;
            API.auth_token = $cookies.getObject('user').auth_token;
            $rootScope.loggedin = true;
            $rootScope.getNumItems();
        } catch (e) {

        }
    } else {
        $rootScope.loggedin = false;
    }
    $scope.openLogin = function(){
        $scope.login= !$scope.login;
        $scope.signup = false;
    };
    $scope.openSignUp = function(){
        $scope.signup = !$scope.signup;
        $scope.login = false;
    };

    $scope.submitLogin = function() {
        API.login($scope.loginform).success(function(result){
                $cookies.putObject('user', result);
                API.auth_token = result.auth_token;
                $rootScope.user = result.user;
                $rootScope.loggedin = true;
                $scope.login = false;
                $state.go('products', {});
            }).error(function(){
                $scope.loginerror = true;
            });
    };

    $scope.submitSignUp = function() {
        API.signup($scope.signupform).success(function(){
                $state.go('products', {});
            }).error(function(){
                $scope.signuperror = true;
            });
    };

    $scope.logout = function() {
        $cookies.remove('user');
        API.auth_token = undefined;
        $rootScope.user = undefined;
        $rootScope.loggedin = false;
        $state.go('products', {});
    };

    $scope.viewCart = function() {
        $state.go('view_cart', {});
    };

});

app.controller('ProductsController', function($scope, $state, $rootScope, API){
    API.allProducts()
        .success(function(productResults) {
            $scope.products = productResults;
        });

        $scope.addToCart = function(prod_id){
            if ($rootScope.loggedin){
                API.addToCart(API.auth_token, prod_id)
                    .success(function(result) {
                        $rootScope.getNumItems();
                    });
            } else {
                $rootScope.login = true;
            }

        };
});

app.controller('ProductController', function($scope, $state, $stateParams, $rootScope, API){
    API.getProduct($stateParams.id)
        .success(function(product) {
            $scope.product = product;
        });

        $scope.addToCart = function(prod_id){
            if ($rootScope.loggedin){
                API.addToCart(API.auth_token, prod_id)
                    .success(function(result) {
                        $rootScope.getNumItems();
                    });
            } else {
                $rootScope.login = true;
            }

        };
});

app.controller('CartController', function($scope, $state, $rootScope, API){
    $scope.getCart = function(){
        API.getCart(API.auth_token)
            .success(function(results) {
                $scope.cart = results[0];
                $scope.total = results[1][0].total;
                if ($scope.cart.length > 0){
                    $scope.hasItems = true;
                } else {
                    $scope.hasItems = false;
                }
            })
            .error(function(){
                console.log("problem showing cart");
            });
    };

    $scope.getCart();

    $scope.removeFromCart = function(prod_id) {
        console.log(prod_id);
        API.removeFromCart(API.auth_token, prod_id).success(function(result){
            $rootScope.getNumItems();
            $scope.getCart();
        });
    };
});

app.controller('CheckoutController', function($scope, $state, API){
    API.getCart(API.auth_token)
        .success(function(results) {
            $scope.cart = results[0];
            $scope.total = results[1][0].total;
            if ($scope.cart.length > 0){
                $scope.hasItems = true;
            } else {
                $scope.hasItems = false;
            }
        })
        .error(function(){
            console.log("problem showing cart");
        });

    $scope.submitCheckoutForm = function() {
        $scope.shippingform = {};
        $scope.paymentform = {};
        $scope.submitCheckoutForm = function() {
            API.checkout(API.auth_token, $scope.shippingform).success(function(){
                    $state.go('thank_you', {});
                });
        };
    };
});

app.controller('ThankYouController', function($scope, $state, API){

});
