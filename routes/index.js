var express = require('express')
var app = express()
var http = require('http')
var async = require("async")
const moment = require('moment')
const dateformat = require('dateformat')


// SHOW Search Movie FORM
app.get('/', function (req, res, next) {
    // render to views/index.ejs template file
    res.render('search', {
        title: 'Movie Search',
        movie_name: '',
        movie_time: '',
        data: ''
    })
})

// Search Movie POST ACTION
app.post('/search', function (req, res, next) {
    req.assert('movie_name', 'Movie Name is required').notEmpty()

    var errors = req.validationErrors()

    if (!errors) {   //No errors were found.  Passed Validation!

        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var task = {
            movie_name: req.sanitize('movie_name').escape().trim(),
            movie_time: req.sanitize('movie_time').escape()
        }
        var result = []
        var finalData = []
        const getScript = (url) => {
            return new Promise((resolve, reject) => {
                const http = require('http'),
                    https = require('https');

                let client = http;

                if (url.toString().indexOf("https") === 0) {
                    client = https;
                }

                client.get(url, (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });

                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        resolve(data);
                    });

                }).on("error", (err) => {
                    reject(err);
                });
            });
        };

        (async (url) => {
            result = JSON.parse(await getScript(url));
            result.forEach(function (item) {
                var genres = item.genres;
                var rating = item.rating;
                var name = item.name;
                // console.log(genres);
                var genreArray = genres.filter(word => word.toLowerCase() == task.movie_name.toLowerCase());
                if (genreArray.length > 0) {
                    var times = item.showings;
                    times.forEach(function (time) {
                        //     //console.log(time);
                        var todayDate = new Date();
                        var currentDay = todayDate.getDate();
                        var currentMonth = todayDate.getMonth() + 1;
                        var currentYear = todayDate.getFullYear();
                        var currentDate = currentYear + '-' + currentMonth + '-' + currentDay

                        var showTime = Date.parse(currentDate + ' ' + time);
                        var userEnterTime = Date.parse(currentDate + ' ' + task.movie_time + '+11:00');
                        if (showTime > userEnterTime) {
                            finalData[rating] = { name: name, time: time, rating: rating }
                        }
                    });
                    // var tt = times.filter(time => time == '20:30:00+11:00')
                    // if (tt) {
                    //     finalData[rating] = { name: name, time: tt }
                    // }
                }
            });
            finalData.sort(function (a, b) {
                var x = a['rating']; var y = b['rating'];
                return ((x < y) ? -1 : ((x > y) ? 0 : 1));
            });
            console.log(finalData);

            // render to views/user/list.ejs template file
            res.render('search', {
                title: 'Movie List',
                movie_name: task.movie_name,
                movie_time: task.movie_time,
                data: finalData
            })
        })('https://pastebin.com/raw/cVyp3McN');
        //rdata = getScript('https://pastebin.com/raw/cVyp3McN');

    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */
        res.render('search', {
            title: 'Search Movie',
            movie_name: req.body.movie_name,
            movie_time: req.body.movie_time,
            data: ''
        })
    }
})

/** 
 * We assign app object to module.exports
 * 
 * module.exports exposes the app object as a module
 * 
 * module.exports should be used to return the object 
 * when this file is required in another module like app.js
 */
module.exports = app;