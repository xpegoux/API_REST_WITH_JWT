require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const PORTA = process.env.SERVER_PORT;

const server = express();

//Config Body Parser
server.use(bodyParser.urlencoded({ extended:false }));
server.use(bodyParser.json());

//Error on Server Side
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo está errado :$');
});

server.listen(PORTA,() =>{console.log(`\tServidor Ativo!\n\t\tPara cancelar pressione: CTRL+C`)});

module.exports = server;