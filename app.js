const express = require('express')
const cookieParser = require("cookie-parser")
const { v4: uuidv4 } = require('uuid');
const fake_db = require('./db.js')
const matchCredentials = require('./utils.js')

const app = express()

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

/*const fake_db = {
    users: {},
    sessions: {}
}
*/

//show home with forms
app.get('/', function(req, res){
    res.render('pages/home')
})

//create a user account

app.post('/create', function(req,res){
  let errors = []
  if (req.body.username.length === 0) {
    let msg = "u need a username"
    errors.push(msg)
 }
    
  if (req.body.password.length === 0) {
    let msg = "u need a password"
    errors.push(msg)
 }
    
  if (errors.length === 0) {
    let body =req.body
    let user = {
        username: body.username,
        password: body.password
 }

    fake_db.users[user.username] = user
    res.redirect('/')
}
 else {
     res.redirect('/error')
 }

})

//login
app.post('/login', function(req,res){
    if(matchCredentials(req.body)) {
        let user = fake_db.users[req.body.username]
        console.log(user)

        /*this creates a random  id that is
        for all practical purposes,
        guaranteed to be unique. we are 
        going to use it to represent the 
        logged in user, and their session
        */
       let id = uuidv4()
       // create session record
       // Use the UUID as a key
       // for an object that holds 
       // a pointer to the user 
       // and their time of login. 
       // If we have any data that we 
       // want to hold that doesn’t belong in 
       // database, can put it here as well.

       fake_db.sessions[id] = {
           user: user, 
           timeOfLogin: Date.now() 
        }

        console.log(fake_db)

        // create cookie that holds the UUID (the Session ID) 
        res.cookie('SID', id, { 
            expires: new Date(Date.now() + 900000),
            httpOnly: true 
        })

        res.render('pages/members')
    } else { 
        res.redirect('/error') }

})

//this is the protected route
app.get('/supercoolmembersonlypage', function(req, res){ 
    let id = req.cookies.SID
    // attempt to retrieve the session. 
    // if session exists, get session 
    // otherwise, session === undefined.
    let session;
    if (fake_db.sessions[id]!==undefined) {
    session = fake_db.sessions[id]
    // if session is undefined, then
    // this will be false, and we get sent
    // to error.ejs
    console.log(fake_db.sessions[id])
    }
    if (session) { 
        res.render('pages/members') 
    } else { res.render('pages/error') 
}
})

// if something went wrong, you get sent here
 app.get('/error', function(req, res){ 
     res.render('pages/error') 
    })

app.get('/logout', function(req,res){
    console.log('moston')
    console.log(fake_db.sessions)
    let id = req.cookies.SID
    delete fake_db.sessions[id]
    console.log(fake_db.sessions)

    res.cookie('SID','', { 
        expires: new Date(Date.now()),
        httpOnly: true 
    })

    res.redirect('/')

    
})


//  404 handling 
app.all('*', function(req, res){ 
    res.render('pages/error') 
})



app.listen(1612)

console.log("listening to port 1612")

 