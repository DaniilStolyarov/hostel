const express = require('express');
const app = express();
const https = require('https');
const http = require('http');
const fs = require('fs');
const v4 = require('uuid').v4; 
const options = 
{
    key: fs.readFileSync(__dirname + '/yourdea.ga/privkey1.pem'),
    cert: fs.readFileSync(__dirname + '/yourdea.ga/fullchain1.pem'),
    rejectUnathourized : false
}
const server = https.createServer(options, app);
const {Server} = require('socket.io');
const handleEvents = require('./backend/socket-events/main')
const formidable = require('express-formidable');
const io = new Server(server);
const {validRegister, validLogin} = require("./backend/validation");
const db = require('./db');
handleEvents(io);
app.use(express.static('./front'));

app.get('*', (req,res,next) =>
{
    if (req.originalUrl.includes('/images/'))
    {
        return next();
    };
    res.sendFile(__dirname + '/front/index.html');
})
app.get('/images/*', (req, res, next) =>
{
    const path = req.originalUrl.split('/images/').at(-1);
    if (fs.existsSync('./backend/images/' + path))
    {
        res.sendFile(__dirname + '/backend/images/' + path)
    }
})
app.post('/register', formidable(), async (req, res) =>
{
    const {email, name, password, telegram, phone} = req.fields;    
    const passwordConfirm = req.fields["password-confirm"];
    const avatar = req.files.avatar;
    const result = await validRegister({email, name, password, telegram, phone, passwordConfirm, avatar});
    if (result.valid)
    {   
        const randomId = v4();
        let resAvatarPath = 'none';
        if (avatar.name)
        {
            const path = [randomId.slice(0, 2), randomId.slice(2, 4), randomId + '.' + avatar.name.split('.').at(-1)]
            fs.mkdirSync('./backend/images/' + path.slice(0, 2).join('/'), {recursive : true}, (err) => console.log(err))
            fs.writeFileSync(`./backend/images/${path.join('/')}`, fs.readFileSync(avatar.path))
            resAvatarPath = path.join('/');
        }
        await db.addUser({email, password, name, phoneNum : phone, telegram, avatar_id : resAvatarPath});
    }
    res.send(result);
})
app.post('/login', formidable(), async (req,res) =>
{
    const {email, password} = req.fields;
    const result = await validLogin({email, password})
    res.send(result);
})
app.post('/upload-image-file', formidable(), async (req, res) =>
{
    const image = req.files.image
    if (image.size > 12582912)
    {
        res.send({success : 0, reason : "файл весит более 8Мб"})
        return;
    }
    if (!image) return;
    const randomId = v4();
    let path;
    try
    {
        path = [randomId.slice(0, 2), randomId.slice(2, 4), randomId + '.' + (image.name.split('.')).at(-1)]
    }
    catch(err)
    {
        console.log(image)
    }
   
    fs.mkdirSync('./backend/images/' + path.slice(0, 2).join('/'), {recursive : true}, (err) => console.log(err))
    fs.writeFileSync(`./backend/images/${path.join('/')}`, fs.readFileSync(image.path))
    const answer = 
    {
        success : 1, 
        file : {url : req.get('origin') + '/images/' + path.join('/')}
    }
    res.send(answer)
})
app.post('/upload-image-url', formidable(), async (req, res) =>
{
    const answer = 
    {
        success : 1,
        file : { url : req.fields.url}
    }
    res.send(answer)
})
app.post('/update-user-data', formidable(), async (req, res) =>
{
    try
    {
        const userInfo = req.fields;
        for (prop in userInfo)
        {
            if (typeof userInfo[prop] !== 'string')
            {
                res.send('Неизвестная ошибка')
                throw new Error('ОШЫБКА')
            }
        }
        
        if (!userInfo.authKey) return;
        
        const id = (await db.getUserBySession(userInfo.authKey)).rows[0].user_id;
        userInfo.id = id;
        const result = await db.updateUserInfo(userInfo);
        
        
    } catch (err)
    {
        console.log(err);
        res.send({ok : false});
        return;
    }
    res.status(200);
    res.send({ok : true});
})
server.listen(443, () =>
{
    console.log('listening on ' + 443);
}); 
let legacy_server = http.createServer((req, res) =>
{
    res.writeHead(301, {Location : `https://${req.headers.host}`});
    res.end();
})
legacy_server.listen(80);