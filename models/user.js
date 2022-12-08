const { connect } = require('../setup/db');

//cadastrar novo USUARIO
const novoUsuario = async (name, pass, email) => {
    const con = await connect();
    const [rows] = await con.query(`
    INSERT INTO USER (NAME, PASS, EMAIL, DATA_CADASTRO)
    VALUES ("${name}", MD5("${pass}"), "${email}", NOW());`);
    return rows;
}

const findOne = async (email, pass) => {
    const con = await connect();
    const [rows] = await con.query(`
    SELECT EMAIL, PASS
    FROM USER
    WHERE EMAIL = "${email}" AND PASS = MD5("${pass}");
    `);
    return rows;
}

const find = async () => {
    const con = await connect();
    const [rows] = await con.query(`
    SELECT *
    FROM USER;
    `);
    return rows;
}

const findById = async (email) => {
    const con = await connect();
    const [rows] = await con.query(`
    SELECT *
    FROM USER
    WHERE EMAIL = "${email}";
    `);
    return rows;
}

module.exports = {
    novoUsuario,
    findOne,
    find,
    findById
}