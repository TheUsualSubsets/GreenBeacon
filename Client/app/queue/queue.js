//Queue controller
angular.module('app.queue', [])

.controller('QueueController', ['$scope', 'Tickets', 'Auth', '$location', function($scope, Tickets, Auth, $location){
  $scope.isadmin = false;
  $scope.view = 'lobby';
  $scope.pageload = true;
  $scope.toggleView = function(room){
    console.log('room', room)
    $scope.view = room;
    if($scope.view === 'lobby') {
     $scope.filtervalue = '!' + $scope.userID;
    } else {
      $scope.filtervalue = $scope.userID;
    }
    console.log('$scope.view', $scope.view);

  };
  $scope.isRed = false;
  $scope.data = {};
  var SVGpulse;
  var SVGdot;

  Socket.on('ticketChange', function() {
   $scope.initializeQueue();
  });

  //set threshold levels for ticket colors
  var displayThresholds = function(){
    Tickets.getThresholds()
    .then(function(levels) {
      var setLevels = levels.data;

      $scope.student = setLevels.filter(function(level){
        return level.authorizationlevel === 1;
      })[0];

      $scope.fellow = setLevels.filter(function(level){
        return level.authorizationlevel === 2;
      })[0];

      $scope.teacher = setLevels.filter(function(level){
        return level.authorizationlevel === 3;
      })[0];
    })
  };

  $scope.initializeQueue = function() {
    //retrieve tickets from database
    displayThresholds();
    Tickets.getTickets()
      .then(function(results){
        $scope.isadmin = results.data.isadmin;
        $scope.userID = results.data.userID;
        $scope.name = results.data.displayname.split(" ")[0];
        $scope.authorizationlevel = results.data.authorizationlevel;
        if ($scope.pageload) {
          $scope.filtervalue = '!' + $scope.userID;
        }
        $scope.pageload = false;

        $scope.setUserRole = function() {
          if ($scope.authorizationlevel === 1) {
            $scope.role = 'Student';
          } else if ($scope.authorizationlevel === 2) {
            $scope.role = 'Fellow';
          } else {
            $scope.role = 'Instructor';
          }
        };
        $scope.setUserRole();



        SVGpulse = document.getElementsByClassName('pulse');
        SVGdot = document.getElementsByClassName('dot');

        //add tickets to the scope
        $scope.data.tickets = results.data.tickets;
        //iterate through all tickets
        for (var ticket of $scope.data.tickets) {
          //if the userId of the ticket matches the current session user
          if (ticket.userId === results.data.userID) {

            //add and set isMine attribute to true
            ticket.ismine = true;
          } else {
            ticket.ismine = false;
          }

          if (ticket.claimed && !ticket.preSolved && ticket.userId === results.data.userID) {
            var claimer = ticket.claimer;
            Tickets.setPresolve(ticket).then(function(response){
              alert(claimer + ' is on their way!');
              Socket.emit('addTicket');

            })

          }
        }
      })
      .catch(function(error){
        console.error(error);
      })
  };

  $scope.ticket = {};

  $scope.getCoordinates = function(event) {
    $scope.ticket.x = event.offsetX - 5;
    $scope.ticket.y = event.offsetY - 5;
    $scope.bathroomAlert = false;

    if ($scope.ticket.x <= 258 && $scope.ticket.x >= 102 && $scope.ticket.y <= 85 && $scope.ticket.y >= 16) {
      $scope.ticket.location = 'Lecture Hall';
    };

    if ($scope.ticket.x <= 258 && $scope.ticket.x >= 102 && $scope.ticket.y <= 159 && $scope.ticket.y >= 86) {
      $scope.ticket.location = 'Pairing Stations';
    };

    if ($scope.ticket.x <= 258 && $scope.ticket.x >= 102 && $scope.ticket.y <= 255 && $scope.ticket.y >= 160) {
      $scope.ticket.location = 'Kitchen';
    };

    if ($scope.ticket.x <=393 && $scope.ticket.x >= 259 && $scope.ticket.y <= 255 && $scope.ticket.y >= 160) {
      $scope.ticket.location = 'Couch';
    };
    if ($scope.ticket.x <=393 && $scope.ticket.x >= 232 && $scope.ticket.y <= 484 && $scope.ticket.y >=257) {
      $scope.ticket.location = 'Senior Zone';
    };
    if ($scope.ticket.x <=231 && $scope.ticket.x >= 102 && $scope.ticket.y <= 433 && $scope.ticket.y >=340) {
      $scope.ticket.location = 'The Hopper';
    };
    if ($scope.ticket.x <=231 && $scope.ticket.x >= 102 && $scope.ticket.y <= 507 && $scope.ticket.y >=434) {
      $scope.ticket.location = 'The Dijkstra';
    };
    if ($scope.ticket.x <=393 && $scope.ticket.x >= 311 && $scope.ticket.y <= 595 && $scope.ticket.y >=485) {
      $scope.ticket.location = 'The Ada';
    };
    if ($scope.ticket.x <=310 && $scope.ticket.x >= 101 && $scope.ticket.y <= 595 && $scope.ticket.y >=508) {
     $scope.ticket.location = 'Entrance Hall';
    }
    //  water closet
    if ($scope.ticket.x <=231 && $scope.ticket.x >= 102 && $scope.ticket.y <= 339 && $scope.ticket.y >=256) {
     $scope.ticket.location = '';
     //turn on when click
     //turn off when click somewhere else
     $scope.bathroomAlert = true;
    };
    // instructors office
    if ($scope.ticket.x <= 400 && $scope.ticket.x >= 259 && $scope.ticket.y <= 159 && $scope.ticket.y >=16) {
     $scope.ticket.location = '';
    };


}


  $scope.mustAdd = function () {

    if(!$scope.ticket.location){
      $scope.isRed = true;
    } else {

    //assign random color for each ticket's dot
     function getRandomColor() {
        var letters = '0123456789ABCDEF'.split(''),
            color = '#';
        for(var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };

    $scope.ticket.color =  getRandomColor();

    //retrieve new ticket from html form, pass to add Ticket function

    Tickets.addTicket($scope.ticket)
      .then(function () {
        $scope.ticket = {};
        $scope.isRed = false;
      })
      .catch(function (err) {
        console.log(err);
      });
    }
  }

  $scope.signout = function () {
    Auth.signout();
  }

  $scope.admin = function() {
    $location.path('/admin');
  }


  $scope.solveTicket = function (ticket) {

    //if 'Solved' has been clicked on the ticket, pass that ticket into solveTicket service
     Tickets.solveTicket(ticket)
       .then(function () {
       })
       .catch(function (err) {
         console.log(err);
       });
  }

  $scope.claimTicket = function (ticket) {
    //once 'claim' has been clicked'
      //pass the claimed ticket to claim Ticket service
    Tickets.claimTicket(ticket)
      .catch(function (err) {
        alert('ticket has already been claimed');
      });

  }

  $scope.unsolveTicket = function (ticket) {
    //if 'Not Solved' is clicked, pass the ticket to unsolveTicket service
     Tickets.unsolveTicket(ticket)
      .then(function () {
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  //functionality: on hover of ticket, hide all dots that do not match ticket's x and y coordinates
  $scope.showDot = function (ticketX, ticketY) {

    //iterate through all dots
    for (var i = 0; i < SVGdot.length; i++) {
      //find each dot's x and y coordinates
      var x = SVGdot[i].parentElement.parentElement.getAttribute('x');
      var y = SVGdot[i].parentElement.parentElement.getAttribute('y');

      //given the x and y coordinates of the ticket (ticketX, ticketY, if the dot and the ticket coordinates do NOT match, add class 'hidden' to dot.
      if (x !== ticketX.toString() && y !== ticketY.toString()) {
        SVGpulse[i].setAttribute('class', 'pulse hiddenPulse');
        SVGdot[i].setAttribute('class', 'dot hiddenDot');
      }
    }
  }

  $scope.showAllDots = function() {
    Socket.emit('addTicket')
  }

  $scope.initializeQueue();

}]);
