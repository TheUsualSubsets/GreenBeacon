

angular.module('app.services', [])

//Tickets factory - handles all tickets manipulations
.factory('Tickets', ['$http', '$window', function ($http, $window) {

  //Sends GET request to the server in order to render tickets
  var getTickets = function () {
    return $http({
      method: 'GET',
      url: '/tickets'
    })
    .then(function (resp) {
      if (resp.data === 'failed') {
        //Redirects to signing if authentication fails
        $window.location = '/#/signin';
      }
      return resp;
    });
  };

  //Sends POST request to the server in order to post a new ticket
  var addTicket = function (ticket) {
    return $http({
      method: 'POST',
      url: '/tickets',
      data: ticket
    })
    .then(function () {
      console.log('emmitting addTicket event');
      Socket.emit('addTicket');
    });
  };

  //Sends PUT request to the server in order to mark the ticket as claimed
  var claimTicket = function (ticket) {
    return $http({
      method: 'PUT',
      url: '/claimed',
      data: ticket
    })
    .then(function () {
      console.log('emitting claimed ticket event');
      Socket.emit('claimTicket');
    });;
  };

  //Sends POST request to the server in order to erase the ticket from claims table
  var eraseClaim = function (data) {
    return $http({
      method: 'POST',
      url: '/eraseClaim',
      data: data
    })
    .then(function () {
      console.log('emitting erase claim event');
      Socket.emit('eraseClaim');
    });;
  };

  //Sends PUT request to the server in order to mark the ticket as solved
  var solveTicket = function (ticket) {
    return $http({
      method: 'PUT',
      url: '/solved',
      data: ticket
    })
    .then(function () {
      console.log('emitting solve ticket event');
      Socket.emit('solveTicket');
    });;
  };

  //Sends PUT request to the server in order to mark the ticket as NOT solved
  var unsolveTicket = function (ticket) {
    return $http({
      method: 'PUT',
      url: '/unsolved',
      data: ticket
    })
    .then(function () {
      console.log('emitting unsolve ticket event');

      Socket.emit('unsolveTicket');
    });;
  };

  return {
    getTickets: getTickets,
    addTicket: addTicket,
    claimTicket: claimTicket,
    eraseClaim: eraseClaim,
    solveTicket: solveTicket,
    unsolveTicket: unsolveTicket
  }
}])

//Auth factory - handles authentication processes
.factory('Auth', ['$http', '$window', function($http, $window){

  //Redirects to path, so GitHub OAuth process will be triggered
  var signin = function () {
    $window.location = '/auth/github';
  };

  //Redirects to path, so signout process will be triggered and handled on the server side
  var signout = function () {
    $window.location = '/signout';
  };

  return {
    signin: signin,
    signout: signout
  }
}])

//Users factory - handles user roles
.factory('Users', ['$http', function($http){

  var getUsers = function(){
    return $http({
      method: 'GET',
      url: '/users'
    })
    .then(function(res){
      console.log('SERVICES', res);
      return res.data;
    })
  };

  var updateUser = function(user){
    return $http({
      method: 'PUT',
      url: '/users',
      data: user
    })
  }
  return {
    getUsers: getUsers,
    updateUser: updateUser
  }
}]);
