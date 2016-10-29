var pg = require('pg');
var Sequelize = require('sequelize');

// postgres models
var User = require('./db/schema').User;
var Ticket = require('./db/schema').Ticket;
var TicketLevel = require('./db/schema').TicketLevel;


// establish database connection for querying
var db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/beacon', {
  dialect: 'postgres'
});

db
 .authenticate()
 .then(function(err) {
   console.log('Connection established');
 })
 .catch(function(err) {
   console.log('Unable to connect: ', err);
 });


module.exports = {

  // if the current user does not exist in the users table, create a new record,
  // then retrieve the user's information
  newUser: function(req, res, next) {
    User.findOrCreate({ where: { username: req.session.passport.user.username, displayname: req.session.passport.user.displayName } })
      .then(function(user) {
        req.session.userID = user[0].dataValues.id;
        next();
      });
  },

  // middleware that validates the user is currently logged in by analyzing the session
  isLoggedIn: function(req, res, next) {
    if(req.session && req.session.passport && req.session.passport.user.username && req.session.passport.user.provider === 'github'){
      next();
    } else {
      res.end('failed');
    }
  },

  //validates whether the user is an administrator
  isAdmin: function(req, res, next) {
    User.find({where: {username: req.session.passport.user.username}})
    .then(function(user){
      if(user.isadmin === true){
      next();
    } else {
      res.sendStatus(401);
    }
  });
  },

  getUsers: function(req, res) {
    User.findAll({})
    .then(function(users) {
      res.json(users);
    });
  },

  updateUser: function(req, res) {
    User.find({where: {username: req.body.username}})
    .then(function(user){
      user.update({ authorizationlevel: req.body.authorizationlevel, isadmin: req.body.isadmin})
    })
    .then(function(user){
      res.json(user);
    })
  },

  terminateSession: function(req, res) {
    req.session.destroy();
    res.redirect('/#/signin');
  },

  // query for all tickets and claims that exist in DB and send to client
  getTickets: function(req, res) {

    User.find({ where: { username: req.user.username } }).then(function(user){

      TicketLevel.find({where: { authorizationlevel: user.authorizationlevel }}).then(function(ticketLevel) {

        Ticket.findAll({ include: [User], where: {$or: [{unsolvedCount: {lt: ticketLevel.threshold} }, {userId:user.id} ]}})
        .then(function(tickets) {
          res.send({ tickets: tickets, userID: req.session.userID, isadmin: user.isadmin, displayname: user.displayname, authorizationlevel: user.authorizationlevel });
        });
      })
    })

  },

 

  // create a new ticket instance and add it to the tickets table
  addToQueue: function(req, res) {
    Ticket.create({ message: req.body.message, location: req.body.location, x: req.body.x, y: req.body.y, color: req.body.color, userId: req.session.userID })
      .then(function(ticket) {
        Ticket.findAll({})
          .then(function(tickets) {
            res.json(tickets);
          });
      });
  },

  // mark the given ticket as claimed in the tickets table,
  // then add a new claim to the claims table
  tagClaimed: function(req, res) {
    Ticket.find({ where: { id: req.body.id}})
      .then(function(ticket) {
        if (ticket.claimed) {
          res.sendStatus(418);
        } else {
          console.log('req.user.name', req.user.displayName);
          ticket.update({ claimed: true, claimer: req.user.displayName })
          .then(function() {
            res.end();
          });  
        }
      });
  },

  // delete the given claim from the claims table,
  // then flag the corresponding ticket as 'preSolved'
  setPresolve: function(req, res) {
    Ticket.find({ where: { id: req.body.id}})
    .then(function (ticket) {
      console.log('ticket before update', ticket.preSolved);
      ticket.update({ preSolved: true })
        .then(function() {
          console.log('ticket after update', ticket.preSolved);
          res.end();
        })
      });

  },

  // flag the given ticket as solved in the tickets table
  tagSolved: function(req, res) {
    Ticket.find({ where: { id: req.body.id } })
      .then(function(ticket) {
        ticket.update({ solved: true })
          .then(function () {
            res.end();
          });
      });
  },

  // flag the given ticket as not solved in the tickets table
  tagUnSolved: function(req, res) {
    Ticket.find({ where: { id: req.body.id } })
      .then(function(ticket) {
        ticket.update({ preSolved: false, claimed: false, unsolvedCount: ticket.get('unsolvedCount') + 1})
          .then(function () {
            res.end();
          });
      });
  },

  getThresholds: function(req, res) {
    TicketLevel.findAll({})
      .then(function(tickets){
        res.json(tickets);
      })
  },

  updateThresholds: function(req, res) {
    TicketLevel.find({ where: { authorizationlevel: req.body.authorizationlevel } })
      .then(function(ticketLevel) {
        ticketLevel.update({ threshold: req.body.threshold});
      })
        .then(function(result) {
          res.json(result)
      });
  }


};
