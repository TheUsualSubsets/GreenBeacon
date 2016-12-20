angular.module('app.services', [])

//Tickets factory - handles all tickets manipulations
.factory('Tickets', ['$http', '$location', function ($http, $location) {

  //Sends GET request to the server in order to render tickets
  var getTickets = function () {
    return $http({
      method: 'GET',
      url: '/tickets'
    })
    .then(function (resp) {
      if (resp.data === 'failed') {
        //Redirects to signing if authentication fails
        $location.path('/signin');
      }
      return resp;
    });
  };

  //Sends GET request to the server in order to render users tickets

  var getUserTickets = function() {
    return $http({
      method: 'GET',
      url: '/userTickets'
    }).then(function (resp) {
      if (resp.data === 'failed') {
        $location.path('/signin');
      }
      return resp;
    })
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

  //Sends GET request to the server in order to get current ticket thresholds
  var getThresholds = function() {
    return $http ({
      method: 'GET',
      url: '/ticketLevel'
    })
    .then(function(data){
      return data;
    });
  };
  //Sends PUT request to the server in order to reset the thresholds for ticket
  //importance
  var updateThresholds = function(ticket) {
    return $http({
      method: 'PUT',
      url: '/ticketLevel',
      data: ticket
    })
      .then(function() {
        Socket.emit('updateThresholds');
      })
  };

  var setPresolve = function(ticket) {
    return $http({
      method: 'PUT',
      url: '/setpresolve',
      data: ticket
    })
  }

  return {
    getTickets: getTickets,
    addTicket: addTicket,
    claimTicket: claimTicket,
    eraseClaim: eraseClaim,
    solveTicket: solveTicket,
    unsolveTicket: unsolveTicket,
    getUserTickets: getUserTickets,
    getThresholds: getThresholds,
    updateThresholds: updateThresholds,
    setPresolve: setPresolve

  }
}])

//Auth factory - handles authentication processes
.factory('Auth', ['$http', '$location', function($http, $location){

  //Redirects to path, so GitHub OAuth process will be triggered
  var signin = function () {
    $location.path('/auth/github');
  };

  //Redirects to path, so signout process will be triggered and handled on the server side
  var signout = function () {
    $location.path('/signout')
  };

  return {
    signin: signin,
    signout: signout
  }
}])

//Users factory - handles user roles
.factory('Users', ['$http', '$location', function($http, $location){

  var getUsers = function(){
    return $http({
      method: 'GET',
      url: '/users'
    })
    .then(function(res){
      return res.data;
    })
    .catch(function(err) {
      console.log('err', err.status)
      if(err.status === 401) {
        $location.path('/notauthorized');
      } else {
        console.log(err, 'error');
      }
    })
  };

  var updateUser = function(user){
    return $http({
      method: 'PUT',
      url: '/users',
      data: user
    })
      .then(function() {
        Socket.emit('updateUser');
      })
  }
  return {
    getUsers: getUsers,
    updateUser: updateUser
  }
}]);
