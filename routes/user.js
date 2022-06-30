const express = require('express');
const router = express.Router();

const pgp = require("pg-promise")(/*options*/);
const db = pgp("postgres://samoylovdb:123@database:5432/todo");

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Registration');
});

router.post('/', function (req, res, next) {
    const credentials = req.body
    if (isNotEmpty(credentials.username) && isNotEmpty(credentials.password)) {
        db.any('SELECT * FROM users WHERE username=$1', [credentials.username])
            .then(userdata => {
                if (isNotEmpty(userdata[0])) {
                    if (userdata[0].password === credentials.password) {
                        res.send('Welcome, ' + userdata[0].username + '!')
                    } else {
                        res.send('Wrong password!')
                    }
                } else {
                    db.none('INSERT INTO users(username, password) VALUES($1, $2)', [credentials.username, credentials.password])
                        .then(() => {
                            res.send('You are successfully registered, ' + credentials.username + '!')
                        })
                        .catch(error => {
                            res.send(error)
                        })
                }
            })
            .catch(error => {
                res.send(error)
            })
    } else {
        res.send('Bad credentials!')
    }
});

function isNotEmpty(string) {
    return string != null && string !== ''
}

module.exports = router;
