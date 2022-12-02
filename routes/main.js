module.exports = function(app, shopData) {

const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => { 
 if (!req.session.userId ) {
 res.redirect('./login') 
 } else { next (); }
 }
                                                                                                                                                                                                                                                              // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData)
    });
    app.get('/search', redirectLogin, function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result',[check('username').notEmpty()], function(req, res) {
           let sqlquery = "select * FROM books WHERE name like '%" + req.query.keyword + "%'"; // query database to get all the books
            // execute sql query
              db.query(sqlquery, (err, result) => {
                  if (err) {
                       res.redirect('./');
                  }
                 let newData = Object.assign({}, shopData, {availableBooks:result});
                 res.render("list.ejs", newData)
            });
         });
                                                                                                                                                   app.get('/api', function (req,res) {
 // Query database to get all the books
 let sqlquery = "SELECT * FROM books"; 
 // Execute the sql query
 db.query(sqlquery, (err, result) => { 
 if (err) {
 res.redirect('./');
 } 
 // Return results as a JSON object
 res.json(result); 
 });
 });

app.get('/api-b', function(req,res){
res.render("api-books.ejs",shopData);
});

app.get('/api-data', function (req,res) {
 // Query database to get all the books
 let sqlquery = "SELECT * FROM books where name like '%" + req.query.keyword + "%'";
 // Execute the sql query
 db.query(sqlquery, (err, result) => {
 if (err) {
 res.redirect('./');
 }
 // Return results as a JSON object
 res.json(result);                                                                                                                          
 });
 });                                                                                                                                                                                                                                                                             
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);
    });
app.get('/addbook', redirectLogin, function(req,res){
         res.render('addbook.ejs', shopData)
    });
app.get('/bargainbooks', redirectLogin, function(req, res) {
           let sqlquery = "SELECT name, price FROM books WHERE price<20"; // query database to get all the books
            // execute sql query
              db.query(sqlquery, (err, result) => {
                  if (err) {
                       res.redirect('./');
                  }
                 let newData = Object.assign({}, shopData, {availableBooks:result});
                 res.render("bargainbooks.ejs", newData)
            });
         });
app.get('/list', redirectLogin, function(req, res) {
 

           let sqlquery = "SELECT * FROM books"; // query database to get all the books
            // execute sql query
              db.query(sqlquery, (err, result) => {
                  if (err) {
                       res.redirect('./');
                  }
                 let newData = Object.assign({}, shopData, {availableBooks:result});
                 res.render("list.ejs", newData)
            });
         });
app.get('/logout', redirectLogin, (req,res) => { 
 req.session.destroy(err => { 
 if (err) {
 return res.redirect('./') 
 } 
 res.send('you are now logged out. <a href='+'./'+'>Home</a>');
});
});                                                                                                                                         

app.post('/registered',[check('email').isEmail()], [check('password').isLength({min:8})],[check('username').notEmpty()],[check('password').notEmpty()], [check('first').isAlpha()], [check('last').isAlpha()], function (req, res) {
const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = req.body.password;
const errors = validationResult(req);

if (!errors.isEmpty()) {
res.redirect('./register'); 
}
else {

bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {

 // Store hashed password in your database.
sqlquery = "INSERT INTO userdetails (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)";

let newrecord = [req.sanitize(req.body.username),req.sanitize(req.body.first), req.sanitize(req.body.last),req.sanitize(req.body.email), hashedPassword];

db.query(sqlquery, newrecord, (err, result) => { 

  if(err){
return console.error(err, message);
}
else{

result =(req.sanitize(req.body.first) + 'and' + req.sanitize(req.body.last) + ' you are now registered! we will send you an email to '  +  req.sanitize(req.body.email));

result += 'your password is:' + req.body.password + ' and your hashed password is:' + hashedPassword;

res.send(result + '<a href='+'./'+'>Home</a>');
}
});
});
    }
});

//list users route
app.get('/listusers', redirectLogin, function(req, res) {
 let sqlquery = "SELECT * FROM userdetails"; // Gets all userdetails from the database
 // execute sql query
db.query(sqlquery, (err, result) => {

  if(err){ 
res.redirect('./');
}
let newData = Object.assign({}, shopData, {availableUserdetails:result});
res.render("listusers.ejs", newData)
});
});

//login route
app.get('/login', function(req,res){
 res.render("login.ejs", shopData);
});

// logging in
app.post('/loggedin', function(req, res){
// data saved in database
const bcrypt = require('bcrypt');
let sqlquery = "SELECT hashedPassword FROM userdetails WHERE username ='" + req.sanitize(req.body.username) + "'";
db.query(sqlquery, (err, result) => {
                                                                                                                                           
  if(err){

res.redirect('./');
}
HashedPassword = result[0].hashedPassword;

bcrypt.compare(req.body.password, HashedPassword, function (err, result){
if (err){
res.send(err);
}
else if (result==true){
req.session.userId =req.sanitize(req.body.username);
res.send('You are logged in!!'+'<a href='+'./'+'>Home</a>');
}
else{
res.send ('You have inputed the incorrect details, Try Again!'+'<a href='+'./'+'>Home</a>');
}
});
});
});

//Delete user route
app.get('/deleteuser',redirectLogin, function(req,res){
 res.render("deleteuser.ejs", shopData);
});
//Deleted user
app.post('/deleted', function(req, res){
let sqlquery = "DELETE FROM userdetails WHERE username = '" + req.sanitize(req.body.username) + "'";
// execute sql query
db.query(sqlquery, (err, result) => {
 if(err) {
res,send('error', err)
}
result = 'user deleted:' + req.sanitize(req.body.username);
res.send(result +'<a href='+'./'+'>Home</a>');
});
});

app.get('/weather', function(req,res){
 res.render("weather.ejs", shopData);
});
app.get('/weather-search', function(req,res){
const request = require('request');
 let apiKey = 'f8eac428529690229cb70f074e0ce589';
 let city = req.query.keyword;
 let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

 request(url, function (err, response, body) {
 if(err){
 console.log('error:', error);
 } else {
// res.send(body);
var weather = JSON.parse(body)
if (weather!==undefined && weather.main!==undefined){
var wmsg = 'It is '+ weather.main.temp + ' degrees in '+ weather.name + '! <br> The humidity now is: ' + weather.main.humidity + '<br> weather wind speed' + weather.wind.speed+ '<br> weather visibility:'+weather.visibility;
res.send (wmsg);
}
else{
res.send("No data found")
}
}
});
});

//app.get('/TVshows', function (req,res){
// res.render('/TVshows.ejs', shopData);
//});

app.post('/bookadded', function (req,res) {
       // saving data in database
       let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        // execute sql query
       let newrecord = [req.body.name, req.body.price];
       db.query(sqlquery, newrecord, (err, result) => {
         if (err) {
            return console.error(err.message);
         }
         else
         res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price +'<a href='+'./'+'>Home</a>');
          });
    });
                                                                                                                                                                                                                                                                                                                                                                                                                                    
}
 



