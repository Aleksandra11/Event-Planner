angular.module('eventApp', ['ui.router', 'firebase', 'ngMessages'])
.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider.state('main', {
		url: '/',
		templateUrl: 'views/main.html',
		controller: 'EventListController',
		controllerAs: 'eventsCtrl',
		resolve: {
			initialData: ['eventFactory', function(eventFactory) {
				return eventFactory.getAll();
			}]
		}
	});

	$stateProvider.state('create', {
		url: '/create',
		templateUrl: 'views/create.html',
		controller: 'NewEventController',
		controllerAs: 'newEventCtrl',
		resolve: {
			"currentAuth": ['authFactory', function(authFactory){
				var auth = authFactory.auth();
				console.log(auth);
				return auth.$requireAuth();
			}]
		}
	});

	$stateProvider.state('loginn', {
		url: '/login',
		templateUrl: 'views/login.html',
		controller: 'loginController',
		controllerAs: 'loginCtrl'
	});

	$stateProvider.state('signup', {
		url: '/signup',
		templateUrl: 'views/signup.html',
		controller: 'signupController',
		controllerAs: 'signCtrl'
	});

}])

.constant('FBMSG', 'https://eventplannerapp-098.firebaseio.com/Events')

.factory('eventFactory', ['FBMSG', '$firebaseArray', function(FBMSG, $firebaseArray) {
	var eventFactory = {};
	var ref = new Firebase(FBMSG);
	var events = $firebaseArray(ref);

	eventFactory.getAll = function() {
		console.log(events);
		return events;
	};
	//eventFactory.deleteEvent = function(event) {
	//	return events.$remove(event);
	//};

	//eventFactory.updateEvent = function(event) {
    // return events.$save(event);
    //};
	return eventFactory;
}])

.factory('authFactory', ['FBMSG', '$firebaseAuth', function(FBMSG, $firebaseAuth) {
	var authFactory = {};
	var ref = new Firebase(FBMSG);
	var auth = $firebaseAuth(ref);
	console.log(auth);
	authFactory.createUser = function(email, password, userName) {
		return auth.$createUser({
			userName: userName,
			email: email,
			password: password
		});
	};
	authFactory.authUser = function(email, password) {
		return auth.$authWithPassword({
			email: email,
			password: password
		});
	};
	authFactory.logout = function() {
		auth.$unauth();
	};

	authFactory.auth = function() {
		return auth;
	};
	return authFactory;
}])

.factory('addressService', function() {
	return {
		autocomplete: null,
		initAutocomplete: function(elementId) {
			this.autocomplete = new google.maps.places.Autocomplete(
				document.getElementById(elementId),
				{types: ['geocode']}
			);
		},
		getLocation: function() {
			var _this = this;
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var geolocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					var circle = new google.maps.Circle({
						center: geolocation,
						radius: position.coords.accuracy
					});
					_this.autocomplete.setBounds(circle.getBounds());
				});
			}
		}
	};
})

.directive('focusElement', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
				element.focus();
			}
	};
})

.controller('NavController', ['$scope', function($scope) {
	$scope.toggleNb = function() {
		angular.element(document.querySelector('.navbar-collapse')).removeClass('in');
	};
}])

.controller('NewEventController', ['$scope', 'FBMSG', '$state', 'addressService', function($scope, FBMSG, $state, addressService) {
	//$scope.myData = new Firebase("https://eventplannerapp-098.firebaseio.com/Events");
	$scope.myData = new Firebase(FBMSG);
	$scope.addEvent = function() {
		$scope.event.start = $scope.event.evstart.getTime();
		$scope.event.end = $scope.event.evend.getTime();
		alert('You have saved:' + $scope.event.title);
		$scope.myData.push($scope.event);
		console.log("User successfully created event");
		$state.go('main');
	};

	$scope.validTime = function() {
		if(!$scope.event || !$scope.event.evend) {
			return true;
		}
		return $scope.event.evstart < $scope.event.evend;
	};

	$scope.futureDate = function(form, value) {
		var currentDate = new Date();
		var date = new Date(value);
		if(currentDate > date) {
			form.$setValidity('pastEvent', false);//validationErrorKey (camelCase will get converted in dash-case for class name)
		} else {
			form.$setValidity('pastEvent', true);
		}
	};

	var $loc = $('#location');
	$loc.on('focus', function() {
		var $input = $(this);

		addressService.initAutocomplete($input.attr('id'));
		addressService.getLocation();

		addressService.autocomplete.addListener('place_changed', function() {
			$scope.event.location = $loc.val();
		});
	});

}])

.controller('EventListController', ['eventFactory', 'authFactory', '$scope', '$state', 'initialData', function(eventFactory, authFactory, $scope, $state, initialData) {
	var self = this;
	self.eventList = initialData;
	self.delete = function(event) {
		eventFactory.deleteEvent(event).then(function(data) {
			return;
		});
	};

	//eventFactory.getAll().$loaded(function(data) {
	//	$scope.events = data;
	//	console.log($scope.events);
	//});   //works fine with ng-repeat="event in events" in main.html

}])

.controller('loginController', ['authFactory', '$scope', '$state', function(authFactory, $scope, $state) {
	var self = this;
	var alertBox = $('#login-alert');
	self.login = function() {
		var result = authFactory.authUser(self.loginEmail, self.loginPassword);
		result.then(function(authData) {
			console.log("User successfully logged in with uid: ", authData.uid);
			$state.go('create');
		}, function(error) {
			console.log("Authentication failed: ", error);
			showAlert({
				title: 'You are not logged in',//error.code,
				detail: 'Invalid email/password combination',
				className: 'alert-danger'
			});
		});
	};
	function showAlert(opts) {
		var title = opts.title;
		var detail = opts.detail;
		var className = 'alert ' + opts.className;
		alertBox.removeClass().addClass(className);
		alertBox.children('#alert-title').text(title);
		alertBox.children('#alert-detail').text(detail);
	}
}])

.controller('signupController', ['FBMSG', 'authFactory', '$scope', '$state', function(FBMSG, authFactory, $scope, $state) {
	var self = this;
	var eightPlus = document.getElementById('eight-plus');
  	var uppercase = document.getElementById('uppercase');
  	var numbers = document.getElementById('numbers');
	var passwordInput = document.getElementById('password');
	var containsUppercase = /[A-Z]/;
  	var containsLowercase = /[a-z]/;
  	var containsNumbers = /[0-9]/;
  	//var containsPunctuation = /[^\w\s]|_/;

  	passwordInput.addEventListener('input', function() {

    var value = passwordInput.value;

    // More than 8 characters
    if (value.length >= 8)
      eightPlus.classList.add('glyphicon-ok');
    else
      eightPlus.classList.remove('glyphicon-ok');

    // Contains uppercase
    if (containsUppercase.test(value) && (containsLowercase.test(value)))
      uppercase.classList.add('glyphicon-ok');
    else
      uppercase.classList.remove('glyphicon-ok');

    // Contains numbers
    if (containsNumbers.test(value))
      numbers.classList.add('glyphicon-ok');
    else
      numbers.classList.remove('glyphicon-ok');

    // Contains punctuation
    //if (containsPunctuation.test(value))
    //  punctuation.classList.add('complete');
    //else
    //  punctuation.classList.remove('complete');

    var passwordIsValid = (value.length >= 8) &&
        containsUppercase.test(value) &&
        containsNumbers.test(value);
    }); 
	self.signUp = function() {

		var result = authFactory.createUser(self.email, self.password, self.userName);
		result.then(function(userData) {
			console.log("User successfully created with uid: ", userData.uid);
			console.log(userData);
			$state.go('loginn');
		}, function(error) {
			console.log("Error creating user: ", error);
		});
	};
}])

.run(['$rootScope','$state', function($rootScope, $state) {
	$rootScope.$on('$stateChangeError', function (event, next, previous, error) {
		console.log(error);
		if (error = "AUTH_REQUIRED") {
			console.log("Error in Auth");
			$state.go('loginn');
		}
	});
}]);

