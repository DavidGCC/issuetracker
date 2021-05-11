'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');

const apiRouter = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

// LIBRARIES
const mongoose = require("mongoose");

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MONGODB CONNECTION

mongoose.connect(process.env.DB, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => console.log("Successfuly connected to database."))
    .catch(err => console.log("Error when connecting to db", err));


//Sample front-end
app.route('/:project/')
    .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/issue.html');
    });

//Index page (static HTML)
app.route('/')
    .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
app.use("/api/issues", apiRouter);

//404 Not Found Middleware
app.use(function (req, res, next) {
    res.status(404)
        .type('text')
        .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
            try {
                runner.run();
            } catch (e) {
                let error = e;
                console.log('Tests are not valid:');
                console.log(error);
            }
        }, 3500);
    }
});

module.exports = app; //for testing
