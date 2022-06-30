const express = require('express');
const {errors} = require("pg-promise");
const router = express.Router();
const fs = require("fs");
const pgp = require("pg-promise")(/*options*/);
const db = pgp("postgres://samoylovdb:123@database:5432/todo");
const multer = require("multer");

let dir = "./upload"

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log("create dir", dir);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./upload");
    }, 
    filename: function(req, file, cb){
        cb(null, file.fieldname);
    }
});
let upload = new multer({storage: storage});

router.get('/', (req, res) => {
    files = db.any('SELECT * FROM files')
    if (files.length != 0){
        res.status(200).send({success: true, msg: "ok", files});
    } else {
        res.status(200).send({success: false, msg: "no files found"});
    }
});
router.get('/', (req, res) => {
    const path = db.any('SELECT path FROM files WHERE name=$1', [req.query.name]);
    if (path || path != ""){
        res.status(200).sendFile(__dirname + path.replace("./", "/") + req.query.name);
    } else {
        res.status(200).send({success: false, msg: "no file found"});
    }
});
router.post('/', upload.any(), (req, res) => {
    let data = [];
    for (let file of req.files) {
        let object = {
            name: file.filename,
            path: file.destination + "/",
            size: file.size
        };
        data.push(object);
    }
    db.any('INSERT INTO files (name, size, path) VALUES($1, $2, $3)', [data.name, data.path, data.size]);
    if (files) {
        console.log("files", files);
        res.status(200).send({ success: true, status: "ok", files });
    } else {
        res.status(200).send({ success: false, status: "no files save" });
    }
});
router.delete("/", (req, res) => {
    const file = db.any('SELECT * FROM files WHERE name = $1', [req.query.name]);
    if (file){
        db.any('DELETE FROM files WHERE name = $1', [req.query.name])
        fs.unlink(__dirname + file.path.replace("./", "/") + file.name, function(err){
            if(err) {
                console.log(err);
                res.status(200).send({success: false, msg: "no file deleted"});
            } else{
                res.status(200).send({success: true, msg: "ok", file});
            }
       });
    } else {
        res.status(200).send({success: false, msg: "no file found"});
    }
});

module.exports = router;
