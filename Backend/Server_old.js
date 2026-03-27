const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { login } = require('./Services_old/Login');
const { Cadastro } = require('./Services_old/Cadastro');
const { Home } = require('./Services_old/Home');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(cors({
    origin: '*',
}))

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
    console.log('Connected to database Server');
});

app.post('/api/AutLogin', login);
app.post('/api/Cadastro', Cadastro);
app.get('/api/Home', Home);

// Iniciar o servidor
app.listen(5000, () => {    
    console.log('Server started on port 5000');
});