var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer");
    
// ============ APP CONFIG ======================
    
// Connect mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/restful_blog_app", {useMongoClient: true});

// To leave out typing ejs
app.set("view engine", "ejs");

// For custom style sheets
app.use(express.static("public"));

// Tell express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));

// Tell express to use method-override
app.use(methodOverride("_method"));

// Tell app to exrpress-sanitizer
app.use(expressSanitizer());

// ============ MONGOOSE/MODEL CONFIG ================

// SCHEMA SETUP
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

// Compile the Blog Model
var Blog = mongoose.model("Blog", blogSchema);

// ============ RESTful ROUTES ======================

// INDEX Route - shows all blog posts

app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if (err){
            console.log("ERROR!");
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW Route - form to create new blog post

app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE Route

app.post("/blogs", function(req, res){
    // create blog
    // express-santizie
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log("==============");
    console.log(req.body);
    Blog.create(req.body.blog, function(err, newBlog){
       if (err){
           res.render("new");
       } else {
           // then, redirect to the index
           res.redirect("/blogs");
       }
   });
});

// SHOW Route

app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if (err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   });
});

// EDIT Route

app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE Route

app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE Route

app.delete("/blogs/:id", function(req, res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

// Setup template
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The RESTful Blog App Server Has Started!");
});