angular.module('app.admin', [])

.controller('AdminController', ['Users', '$scope', 'Tickets', '$location', '$route', function(Users, $scope, Tickets, $location, $route){
  //used for mapping authorization levels to titles
  $scope.authorizationLevelTitleMap = {
    Student: 1,
    Fellow: 2,
    Instructor: 3
  };

  $scope.authorizationTitleLevelMap = {
    1: 'Student',
    2: 'Fellow',
    3: 'Instructor'
  };

  $scope.loadData = function(){
    Users.getUsers()
      .then(function(result){
        $scope.users = result;
      });
    Tickets.getThresholds()
      .then(function(result){
        $scope.levels = result.data;
        $scope.ticketThresholds = {};
        $scope.levels.forEach(function(item){
          $scope.ticketThresholds[item.authorizationlevel] = item.threshold;
        });
      });
    };

  $scope.updateTable = function() {
    //pull user data from users array (returned from DB) by filtering
      //set selectedPerson model equal to the user that matches displayname in the menu

    $scope.selectedPerson = $scope.users
    .filter(function(user){
        return user.displayname === $scope.person;
     })[0];


     $scope.selectedPerson.authorizationTitle =
      $scope.authorizationTitleLevelMap[$scope.selectedPerson.authorizationlevel];

  };

  $scope.displayThreshold = function() {
    $scope.threshold = $scope.ticketThresholds[$scope.authorizationLevelTitleMap[$scope.role]];
  }

  $scope.updateUser = function() {
    $scope.selectedPerson.authorizationlevel = $scope.authorizationLevelTitleMap[$scope.selectedPerson.authorizationTitle];
    Users.updateUser($scope.selectedPerson).then(function(results) {
      $route.reload();
    });
  };

  $scope.updateThresholds = function() {
    $scope.ticket = {
      authorizationlevel: $scope.authorizationLevelTitleMap[$scope.role],
      threshold: $scope.threshold
    }
    Tickets.updateThresholds($scope.ticket).then(function(results){
      $route.reload();
    })
  };

  $scope.redirect = function() {
    $location.path('/#/tickets');
  }

}]);
