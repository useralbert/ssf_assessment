const hbs = require('express-handlebars')
const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser');
const request = require('request');
const cookieParser = require('cookie-parser');
const config = require('./config.json');

//const SQL_SELECT_BGG_GAME = "select * from employees limit ? offset ?";
const SQL_SELECT_BGG_GAME_BY_NAMES = "select name from game where name like ?";
const SQL_SELECT_BGG_GAME_BY_NAME = "select name, year, ranking, users_rated from game where name = ?"; 

const SQL_SELECT_BGG_COMMENT_BY_USER_RATING_C_TEXT = "select user, rating, c_text from comment where gid = ? limit ? offset ?";

//const Pool = mysql.createPool(config.bgg)
const pool = mysql.createPool(require('./config.json'));

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

const app = express();

app.engine('hbs', hbs())
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/display/:gameId', (req, resp) => {
    const gameId = parseInt(req.params.gameId);
    
        conn.query(SQL_SELECT_BGG_GAME_BY_NAME, [ gameId ],
            (err, result) => {
            //Release the connection
                conn.release();
                console.info(result);
                console.info(typeof result[1]);
                if (err) {
                    resp.status(500);
                    resp.type('text/plain');
                    resp.send(err);
                    return;
                }
                resp.status(200);
                resp.type('text/html');
                resp.render('comment', { 
                    
                    result: result,
                    name: result.name,
                    year: result.year,
                    user_rated: result.user_rated,
                    ranking: result.ranking,
                    noResult: result.length <= 0,
                    layout: false 
                });
            }
        )
    });
})

 


app.get('/search', (req, resp) => {
    const q = req.query.q;
    pool.getConnection((err, conn) => {
        if (err) {
            resp.status(500);
            resp.type('text/plain');
            resp.send(err);
            return;
        }   
        conn.query(SQL_SELECT_BGG_GAME_BY_NAMES,
            [ `%${q}%` ],
            (err, result) => {
            //Release the connection
                conn.release();
                console.info(result);
                console.info(typeof result[1]);
                if (err) {
                    resp.status(500);
                    resp.type('text/plain');
                    resp.send(err);
                    return;
                }
                resp.status(200);
                resp.type('text/html');
                resp.render('games', { 
                    name: name, 
                    result: result,
                    q: q,
                    noResult: result.length <= 0,
                    layout: false 
                });
            }
        )
    });
})


















app.get(/.*/, express.static(__dirname + '/public'));

app.listen(PORT, () => {
	console.info(`Application started at ${new Date()} on port ${PORT}`);
});
