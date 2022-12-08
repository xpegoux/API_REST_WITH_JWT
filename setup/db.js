require('dotenv').config();

//criando conexão com base de dados!
const connect = async () => {
    if (global.connection && global.connection.state != 'disconnected')
        return global.connection;

    const mysql = require('mysql2/promise')
    const con = mysql.createConnection({
        host:     process.env.HOST,
        user:     process.env.USER,
        password: process.env.PASS,
        database: process.env.DB
    });
    console.log(`\tBanco Conectado!\n`);
    global.connection = con;
    return con;
}

module.exports = {
    connect
}