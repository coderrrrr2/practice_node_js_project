const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const session = require('express-session');
const pg = require('pg');
const colorLog = require('./util/custom_log');
const csrf = require('csurf');
const flash = require('connect-flash');


require('dotenv').config();


const csrfProtection = csrf();



const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));

const pgSession = require('connect-pg-simple')(session);


const poolConfigOpts = {
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10), // Convert port to a number
};

const poolInstance = new pg.Pool(poolConfigOpts);

const postgreStore = new pgSession({
  pool: poolInstance,
  createTableIfMissing: true
})


app.use(session({
    store: postgreStore,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    secret: 'secret',
    resave: false,
    saveUninitialized:false
}));

app.use(csrfProtection);

app.use(flash());


// app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false }));


app.use((req, res, next) => {

  if (!req.session.user) {
    return next();
  }


  User.findByPk(req.session.user.id)
    .then(user => {
      req.user = user;
      next();

    })
});

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
colorLog("token is set");
  res.locals.isAuthenticated = req.session.isLoggedIn || false; // Default to false if not set
  next();
})




app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart_item');
const Order = require('./models/order');
const OrderItem = require('./models/order_item');




Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });


sequelize.
  sync()
  // sync({force :true})

  .then(result => {

    app.listen(3000);

  })
  .catch(err => {
    console.log(err);
  });

