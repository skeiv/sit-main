const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const todoRouter = require('./routes/todo');
const filesRouter = require('./routes/files');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/todo', todoRouter);
app.use('/files', filesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const pgp = require("pg-promise")(/*options*/);
const db = pgp("postgres://samoylovdb:123@database:5432/todo");

db.none('create table if not exists users (id serial constraint users_pk primary key, username varchar not null, password varchar not null)')
db.none('alter table users owner to samoylovdb')
db.none('create unique index if not exists users_id_uindex on users (id)')
db.none('create unique index if not exists users_username_uindex on users (username)')
db.none('create table if not exists tasks (id serial constraint tasks_pk primary key, user_id integer not null constraint tasks_users_id_fk references users, text text not null)')
db.none('alter table tasks owner to samoylovdb')
db.none('create unique index if not exists tasks_id_uindex on tasks (id)')
db.none('create table if not exists files (id serial constraint files_pk primary key, name varchar, size varchar, path varchar)')
db.none('create unique index if not exists files_id_uindex on files (id)')
db.none('alter table files owner to samoylovdb')

module.exports = app;
