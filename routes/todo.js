const express = require('express');
const {errors} = require("pg-promise");
const router = express.Router();

const pgp = require("pg-promise")(/*options*/);
const db = pgp("postgres://samoylovdb:123@database:5432/todo");

router.get('/', function (req, res, next) {
    const data = req.query
    if (isNotEmpty(data.user_id)) {
        db.any('SELECT * FROM tasks WHERE user_id=$1', [data.user_id])
            .then(tasks => {
                db.any('SELECT * FROM users WHERE id=$1', [data.user_id])
                    .then(users => {
                        if (isNotEmpty(users[0])) {
                            res.send(tasks)
                        } else {
                            res.send('There is no such user.')
                        }
                    })
                    .catch(error => {
                        res.send(error)
                    })
            })
            .catch(error => {
                res.send(error)
            })
    } else {
        res.send('Please, specify user.')
    }
});

router.post('/', function (req, res, next) {
    const data = req.body
    if (isNotEmpty(data.user_id)) {
        if (isNotEmpty(data.text)) {
            db.any('SELECT * FROM users WHERE id=$1', [data.user_id])
                .then(users => {
                    if (isNotEmpty(users[0])) {
                        db.none('INSERT INTO tasks(user_id, text) VALUES($1, $2)', [data.user_id, data.text])
                            .then(() => {
                                res.send('Task have been added.')
                            })
                            .catch(error => {
                                res.send(error)
                            })
                    } else {
                        res.send('There is no such user.')
                    }
                })
                .catch(error => {
                    res.send(error)
                })
        } else {
            res.send('Please, enter task.')
        }
    } else {
        res.send('Please, specify user.')
    }
});

router.put('/:id', function (req, res, next) {
    const data = req.body
    if (isNotEmpty(data.user_id)) {
        if (isNotEmpty(data.text)) {
            db.any('SELECT * FROM users WHERE id=$1', [data.user_id])
                .then(users => {
                    if (isNotEmpty(users[0])) {
                        db.any('SELECT * FROM tasks WHERE id=$1', [req.params.id])
                            .then(tasks => {
                                if (isNotEmpty(tasks[0])) {
                                    if (users[0].id === tasks[0].user_id) {
                                        db.none('UPDATE tasks SET text=$1 WHERE id=$2', [data.text, req.params.id])
                                            .then(() => {
                                                res.send('Task have been successfully updated.')
                                            })
                                            .catch(error => {
                                                res.send(error)
                                            })
                                    } else {
                                        res.send('This is not the task of the user.')
                                    }
                                } else {
                                    res.send('There is no such task.')
                                }
                            })
                            .catch(error => {
                                res.send(error)
                            })
                    } else {
                        res.send('There is no such user.')
                    }
                })
                .catch(error => {
                    res.send(error)
                })
        } else {
            res.send('Please, enter task.')
        }
    } else {
        res.send('Please, specify user.')
    }
});

router.delete('/:id', function (req, res, next) {
    const data = req.body
    if (isNotEmpty(data.user_id)) {
        db.any('SELECT * FROM users WHERE id=$1', [data.user_id])
            .then(users => {
                if (isNotEmpty(users[0])) {
                    db.any('SELECT * FROM tasks WHERE id=$1', [req.params.id])
                        .then(tasks => {
                            if (isNotEmpty(tasks[0])) {
                                if (users[0].id === tasks[0].user_id) {
                                    db.none('DELETE FROM tasks WHERE id=$1', [req.params.id])
                                        .then(() => {
                                            res.send('Task have been successfully deleted.')
                                        })
                                        .catch(error => {
                                            res.send(error)
                                        })
                                } else {
                                    res.send('This is not the task of the user.')
                                }
                            } else {
                                res.send('There is no such task.')
                            }
                        })
                        .catch(error => {
                            res.send(error)
                        })
                } else {
                    res.send('There is no such user.')
                }
            })
            .catch(error => {
                res.send(error)
            })
    } else {
        res.send('Please, specify user.')
    }
});

function isNotEmpty(string) {
    return string != null && string !== ''
}

module.exports = router;
