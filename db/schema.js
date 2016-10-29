var pg = require('pg')
var Sequelize = require('sequelize');
var db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/beacon', {
  dialect: 'postgres',
  logging: false
});


//Establishes the connection to the database
db
  .authenticate()
  .then(function (err) {
    console.log('Connection established');
  })
  .catch(function (err) {
    console.log('Unable to connect: ', err);
  });

//Creates table of users
var User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING, //GitHub username
  displayname: Sequelize.STRING, //full first and last name

  authorizationlevel: {
    type: Sequelize.INTEGER, //1 is Student
    defaultValue: 1
  },
  isadmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

//Creates table for Ticket Importance Levels
var TicketLevel = db.define('ticketlevel', {
  authorizationlevel: {
    type: Sequelize.INTEGER,
    unique: false
  },
  threshold: Sequelize.INTEGER
});

//Creates table of tickets
var Ticket = db.define('ticket', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: Sequelize.TEXT,
  location: Sequelize.STRING,
  //pulsing dot coordinates
  x: Sequelize.INTEGER,
  y: Sequelize.INTEGER,
  //dot color
  color: Sequelize.STRING,

  claimed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  solved: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  preSolved: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  unsolvedCount:{
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  claimer: {
    type: Sequelize.STRING
  }
});



//Defines relationships between tables
User.hasMany(Ticket);
Ticket.belongsTo(User);



//Create Tables
db
  .sync({force: Boolean(Number(process.env.SYNCFORCE))})
  .then(function() {
    console.log('Tables created');
    //invoking of the ticketlevel intialization function - only if environment variable INITIALIZE is set to true
    if(process.env.INITIALIZE === 'true') {
      initializeTicketLevels();
    }

 });

//this function initializes the ticketlevels table with initial values, only if the environment variable INITITALIZE is set to true.  The function invocation is called in server.js
//after app is initially set up, this function does not need to be run
//values can be updated from any superuser (auth level of 0)
var initializeTicketLevels = function() {
  var initialLevels = [
  {
    authorizationlevel: 1,
    threshold: 1
  },
  {
    authorizationlevel: 2,
    threshold: 2
  },
  {
    authorizationlevel: 3,
    threshold: 100
  }];
  //this empties the TicketLevel relation, and then intializes it with default values.  These values can be changed by administrators.
  TicketLevel.destroy({where: {}}).then(function(){
    TicketLevel.bulkCreate(initialLevels).then(function(){
      return TicketLevel.findAll();
    }).then(function(data){
      console.log('Ticket Levels initialized');
    });
  });
}

module.exports = {
  User: User,
  Ticket: Ticket,
  TicketLevel: TicketLevel
};
