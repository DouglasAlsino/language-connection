const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tcc',
});

db.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Connected to database login');
});

const login = (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);
    const sql = 'SELECT * FROM usuario WHERE usuario = ? AND senha = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        if (result.length > 0) {
            res.send({ success: true });
        } else {
            res.send({ success: false });
        }
    });
}

module.exports = {login}