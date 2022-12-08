const UserModel = require("./models/user");
const server = require("./setup/server");
const jwt = require('./setup/jwt');
const md5 = require("md5");

const authMiddleware = async (req, res, next) => {    
    const [, token] = req.headers.authorization.split(' ');

    try {
        const payload = jwt.verify(token);
        const user = await UserModel.findById(payload.user);

        if (!user) res.send(401);

        req.auth = user;

        next();
    } catch(error) {
        res.sendStatus(401);
    }
}

server.post('/cadastro', async (req, res) => {
    try {
        const { nameBody, passBody, emailBody } = req.body;
        const user = await UserModel.novoUsuario(nameBody, passBody, emailBody);        
        const token = jwt.sign({ user: emailBody });  

        res.status(201).send({ user, token});
    } catch (error) {        
        res.sendStatus(401);
    }
});

server.get('/login', async (req, res) => {
    try {        
        const [, hash] = req.headers.authorization.split(' ');
        const [emailBody, passBody] = Buffer.from(hash, 'base64').toString().split(':');

        const credenciais = await UserModel.findOne(emailBody, passBody);
        
        if (credenciais.length === 0) return res.sendStatus(401);
        else {
            //variáveis para tratar retornos do banco (email, pass)
            const emailDB = await credenciais[0].EMAIL;
            const passDB = await credenciais[0].PASS;

            if (emailDB === emailBody && passDB === md5(passBody)) {
                //retornar confirmação das credenciais + token
                const token = jwt.sign({ user: emailBody });
                
                return res.status(200).send({ credenciais, token });                
            } else {
                return res.sendStatus(401);
            }
        }
    } catch(error) {
        res.sendStatus(401);
    }
});

server.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await UserModel.find();

        res.send(users);
    } catch (error) {
        res.sendStatus(401);
    }
});

server.get('/me', authMiddleware, async (req, res) => {
    res.send(req.auth);
});