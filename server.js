require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true'
    ? {
        rejectUnauthorized: false
    }
    : false,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
}); 


const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`O servidor está rodando na porta ${port}`);
})


app.use(express.json());

app.use(express.static('public'));

app.get('/usuarios', (req, res) => {
    const sql = 'SELECT * FROM usuarios';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao consultar usuários:', err);
            res.status(500).send('Erro ao consultar usuários');
            return;
        }
        res.json(results);
    });
});

app.post('/usuarios' , (req, res) =>{
    const { nome, email } = req.body;
    const sql = 'INSERT INTO usuarios (nome, email) VALUES (?, ?)';
    db.query(sql, [nome, email], (err, result) => {
        if (err) {
            console.error('Erro ao inserir usuário:', err);
            res.status(500).send('Erro ao inserir usuário');
            return;
        }
        res.status(201).send('Usuário inserido com sucesso');
    });
})

app.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email } = req.body;
    const sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
    db.query(sql, [nome, email, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar usuário:', err);
            res.status(500).send('Erro ao atualizar usuário');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Usuário não encontrado');
            return;
        }
        res.send('Usuário atualizado com sucesso');
    });
});

app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar usuário:', err);
            res.status(500).send('Erro ao deletar usuário');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Usuário não encontrado');
            return;
        }
        res.send('Usuário deletado com sucesso');
    });
});
