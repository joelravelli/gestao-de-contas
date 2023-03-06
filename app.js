var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var db = require("./database/appDatabase");
const constants = require("./resources/appConstants");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./resources/swagger.json");

// Routers
var indexRouter = require("./routes/index");
var pessoaRouter = require("./routes/pessoa");
var contaRouter = require("./routes/conta");
var transacaoRouter = require("./routes/transacao");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Path route defines
app.use("/", indexRouter);
app.use(constants.API_VERSION + "/pessoa", pessoaRouter);
app.use(constants.API_VERSION + "/conta", contaRouter);
app.use(constants.API_VERSION + "/transacao", transacaoRouter);

// Extended: https://swagger.io/specification/#infoObject
var swaggerUiOpts = {
    swaggerOptions: {
        validatorUrl: null,
    },
    operationsSorter: "alpha",
    customCssUrl: "../stylesheets/swagger-theme-feeling-blue.css",
};

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerUiOpts)
);

// Connect to database
db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch((err) => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
