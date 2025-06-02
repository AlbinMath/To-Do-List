var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var MongoStore = require('connect-mongo');
require('dotenv').config();

var app = express();
var port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/todo", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Get the default connection
var db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Bind connection to open event (to get notification of successful connection)
db.once('open', function() {
    console.log('MongoDB successfully connected!');
});

// Middleware
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/todo'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// User Schema
var userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

var User = mongoose.model("User", userSchema);

// Todo Schema 
var todoSchema = new mongoose.Schema({
    name: String,
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

var Todo = mongoose.model("Todo", todoSchema);

// Passport configuration
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Incorrect username.' });
            bcrypt.compare(password, user.password, function(err, res) {
                if (err) return done(err);
                if (!res) return done(null, false, { message: 'Incorrect password.' });
                return done(null, user);
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Routes
app.get("/", isAuthenticated, (req, res) => {
    Todo.find({ user: req.user._id }, (error, todoList) => {
        if (error) {
            console.log(error);
        } else {
            res.render("index", { 
                todoList: todoList,
                user: req.user
            });
        }
    });
});

// Login routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Register routes
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        var newUser = new User({
            username: req.body.username,
            password: hash
        });
        newUser.save((err) => {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                res.redirect('/login');
            }
        });
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

// Todo routes
app.post("/newtodo", isAuthenticated, (req, res) => {
    var newTask = new Todo({
        name: req.body.task,
        user: req.user._id
    });
    Todo.create(newTask, (err, Todo) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

app.get("/delete/:id", isAuthenticated, (req, res) => {
    Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id }, (err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});

app.post("/toggle/:id", isAuthenticated, (req, res) => {
    Todo.findOne({ _id: req.params.id, user: req.user._id }, (err, todo) => {
        if (err) {
            console.log(err);
        } else {
            todo.completed = !todo.completed;
            todo.save();
        }
        res.redirect("/");
    });
});

app.post("/delAlltodo", isAuthenticated, (req, res) => {
    Todo.deleteMany({ user: req.user._id }, (err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});

// Edit todo route
app.get("/edit/:id", isAuthenticated, (req, res) => {
    Todo.findOne({ _id: req.params.id, user: req.user._id }, (err, todo) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("edit", { todo: todo });
        }
    });
});

// Update todo route
app.post("/update/:id", isAuthenticated, (req, res) => {
    Todo.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { name: req.body.task },
        (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/");
        }
    );
});

// Catch invalid routes
app.get("*", (req, res) => {
    res.send("<h1>Invalid Page</h1>");
});

// Start server
app.listen(port, (error) => {
    if (error) {
        console.log("Issue in connecting to the server");
    } else {
        console.log(`Server successfully running on port ${port}`);
    }
});