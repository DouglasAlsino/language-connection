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
    console.log('Connected to database cadastro');
});

const Cadastro = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const sql = 'INSERT INTO usuario (usuario, senha, nome) VALUES (?, ?, ?)';
    console.log(username, password, name);
    db.query(sql, [username, password, name], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(result);
        res.send(result);
    });
};

module.exports = {Cadastro}