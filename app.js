const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/blogApp', { useNewUrlParser: true, useUnifiedTopology: true });
const User = require('./models/user');
const Blog = require('./models/blog');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', async (req, res) => {
  const blogs = await Blog.find({});
  res.render('index', { blogs, user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/create', (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    res.render('create');
  }
});

app.post('/create', async (req, res) => {
  const { title, content } = req.body;
  const blog = new Blog({ title, content, author: req.session.user._id });
  await blog.save();
  res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    const blog = await Blog.findById(req.params.id);
    res.render('edit', { blog });
  }
});

app.post('/edit/:id', async (req, res) => {
  const { title, content } = req.body;
  await Blog.findByIdAndUpdate(req.params.id, { title, content });
  res.redirect('/');
});

app.get('/delete/:id', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/');
  }
});



app.get('/register', (req, res) => {
    res.render('register');
  });
  
  app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.redirect('/register');
    }
  
    const newUser = new User({ username, password });
    await newUser.save();
  
    req.session.user = newUser;
    res.redirect('/');
  });
  


app.get('/edit/:id', async (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      const blog = await Blog.findById(req.params.id);
      res.render('edit', { blog });
    }
  });
  
  app.post('/edit/:id', async (req, res) => {
    const { title, content } = req.body;
    await Blog.findByIdAndUpdate(req.params.id, { title, content });
    res.redirect('/');
  });
  
  app.get('/delete/:id', async (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      await Blog.findByIdAndDelete(req.params.id);
      res.redirect('/');
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
