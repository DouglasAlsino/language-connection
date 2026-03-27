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
    console.log('Connected to database home');
});

const Home = (req, res) => {
    const sql = 'SELECT * FROM usuario';
    db.query(sql, (err, result) => {
        console.log(result);
        if (err) {
            console.log(err);
            return;
        }
        if (result.length > 0) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: 'Not found' });
        }
        
    });
    
};

module.exports = {Home}