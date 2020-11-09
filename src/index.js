const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const { log } = require("console");

//Inicializations
const app = express();
require("./database");
require("./config/passport");

//Settings
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: "hbs",
    helpers: {
      if_equal: function (a, b, opts) {
        if (a == b) {
          return opts.fn(this);
        } else {
          return opts.inverse(this);
        }
      },
      isSelected: function (value,  selectedValue) {
        return value === selectedValue ? 'selected' : '';
      }
    },
  })
);
app.set("view engine", ".hbs");

//Middleware (Todas las funciones que van a ser ejecutadas antes de llegar al servidor o cuando llegan antes de pasarselas a las rutas)
app.use(express.urlencoded({ extended: false })); //Un formulario envia datos y se pueda entender y no aceptar imagenes solo datos.
app.use(methodOverride("_method")); //Envia put y delete en el metodo oculto _method
app.use(
  session({
    secret: "mysecretapp",
    reseave: true,
    saveUninitializated: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//Global variables

//Routes
app.use(require("./routes/index"));
app.use(require("./routes/notes"));
app.use(require("./routes/users"));
app.use(require("./routes/images"));

//Static Files
app.use(express.static(path.join(__dirname, "public")));

//Server is litenning
app.listen(app.get("port"), () => {
  console.log("Server on port: ", app.get("port"));
});
