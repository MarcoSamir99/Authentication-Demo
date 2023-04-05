const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt'); 
const user = require('./models/user');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/authDemo', { useNewUrlParser: true })
.then (() => {     
   console.log('Mongo connection open')
})
.catch(err => {
    console.log('oh no mongo connection error!!!!!!!!!!')
    console.log(err)
    }) ;

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true })); //to read req. body
app.use(session({ secret: 'notasecret'}));

const requireLogin = (req, res, next)=> {  //to check authentication
    if(!req.session.user_id) {
        return res.redirect('/login')
    } 
    next();
}

app.get('/', (req, res) => {
    res.send('Home Page..............')
})
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async(req, res)=> {
    //first way of hashing before saving to mongo
//    const {password, username} = req.body; 
//    const hash =  await bcrypt.hash(password, 12);
//    const user = new User({
//     username,
//     password: hash
// })
//////////////////second way to passs the password to the model and make the model hashes it 
    const {password, username} = req.body;
    const user = new User({ username, password })
    
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
} )

app.get('/login', (req, res)=> {
    res.render('login')
})

app.post('/login', async(req, res)=> {
    const { username, password } = req.body;
    // const user = await User.findOne({ username })
    // const validPassword = await bcrypt.compare(password, user.password)
//     if(validPassword){
//          req.session.user_id = user._id;  //to store user id in the session
//         res.redirect('/secret');
//     } else {
//         res.redirect('/login')
//     }
////////////////////////other way by using model validation 
const foundUser = await User.findAndValidate(username, password)
if(foundUser){
             req.session.user_id = foundUser._id;  //to store user id in the session
            res.redirect('/secret');
        } else {
            res.redirect('/login')
        }
})


app.post('/logout', (req, res)=> {
    req.session.user_id = null; //this 
    // req.session.destroy();         //or this
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
    })


app.listen(3000, ()=> {
    console.log('CONNECTED TO 3000 PORT')
})