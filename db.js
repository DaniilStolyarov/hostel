// функции для работы с базой данных
const pg = require('pg')
const config = require('./db-config.json')
const client = new pg.Client(config)
client.connect();

async function insertUser(user)
{
    const {email, password, name, timestamp} = user;       
}   
async function createExtension()
{
    await client.query(`create extension "uuid-ossp"`)
}
async function createUsersTable() // не используется вне этого файла
{
    await client.query(`create table users
    (
        USER_ID BIGSERIAL PRIMARY KEY,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        ADMIN BOOLEAN,
        EMAIL TEXT UNIQUE,
        PASSWORD TEXT,
        NICKNAME TEXT,
        PHONE_NUMBER TEXT,
        TELEGRAM TEXT,
        USER_DESCRIPTION TEXT,
        AVATAR_ID TEXT,
        NAME TEXT,
        SURNAME TEXT,
        PATRONYMIC TEXT,
        BIRTHDATE DATE,
        SEX TEXT,
        ROOM BIGINT
    )`)
}
async function createApplicationsTable() // не используется вне этого файла
{
    await client.query(`create table applications
    (
        APPLICATION_ID BIGSERIAL PRIMARY KEY,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        NAME TEXT UNIQUE,
        DESCRIPTION TEXT,
        AUTHOR_ID BIGINT,
        IS_OPENED BOOLEAN        
    )`)
}
async function createMessagesTable() // не используется вне этого файла
{
    await client.query(`create table messages
    (
        AUTHOR_ID BIGINT,
        CONTENT TEXT,
        TIMESTAMP TIMESTAMP WITHOUT TIME ZONE,
        APPLICATION_ID BIGINT,
        MESSAGE_ID BIGSERIAL PRIMARY KEY       
    )`)
}
async function createConnectionsTable()
{
    await client.query(`create table connections
    (
        USER_ID BIGINT UNIQUE,
        SESSION UUID UNIQUE          
    )`)
}
async function initDatabase() // не используется вне этого файла
{
    return Promise.all(
        [
            createUsersTable(),
            createApplicationsTable(),
            createMessagesTable(),
            createConnectionsTable(),
            createExtension()
        ]);
}
async function selectFrom(tableName) // не используется вне этого файла
{
    return await client.query(`select * from ${tableName.toString()}`);
}
async function addUser({email, admin = false, password, phoneNum, telegram, description = "empty", avatar_id,
 room, name, surname, patronymic
})
{
    return await client.query(`insert into users 
    (   
        EMAIL, ADMIN, TIMESTAMP,
        PASSWORD, PHONE_NUMBER, TELEGRAM, USER_DESCRIPTION, AVATAR_ID,
        ROOM, NAME, SURNAME, PATRONYMIC
    ) values
    (
        $1::text, $2::boolean, $3::timestamp without time zone, 
        $4::text, $5::text, $6::text, $7::text, $8::text, 
        $9::bigint, $10::text, $11::text, $12::text
    )`, 
    [
        email, admin, new Date (Date.now()).toLocaleString(),
        password, phoneNum, telegram, description, avatar_id,
        room, name, surname, patronymic
    ])
}
async function addApplication(title, content, author_id)
{
    try
    {
        return client.query(`insert into applications
        (
            TIMESTAMP,
            NAME,
            DESCRIPTION,
            AUTHOR_ID,
            IS_OPENED    
        ) values
        (
            $1::TIMESTAMP WITHOUT TIME ZONE,
            $2::text,
            $3::text,
            $4::bigint,
            $5::boolean
        ) RETURNING APPLICATION_ID`, [new Date (Date.now()).toLocaleString(), title, content, author_id, true])
    }
    catch(err)
    {
        console.log(err)
    }
}


async function addMessage(author_id, application_id, content)
{
    return client.query(`insert into messages
    (
        AUTHOR_ID,
        CONTENT,
        TIMESTAMP,
        APPLICATION_ID
    ) values
    (
        $1::bigint,
        $2::text,
        $3::TIMESTAMP WITHOUT TIME ZONE,
        $4::bigint
    )`, [author_id, content, new Date (Date.now()).toLocaleString(), application_id])
}

async function getApplicationById(id)
{
    return client.query('select * from applications where application_id = $1::bigint', [id]);
}
/*
async function getNews()
{
    return client.query('select * from news')
}
async function getTopicTitles()
{
    return client.query('select name, group_id, timestamp from news')
}
*/
async function getUserById(id)
{
    return client.query('select * from users where user_id = $1::bigint', [id]);
}
async function getUserByEmail(email)
{
    return client.query('select * from users where email = $1::text', [email]);
}
async function getUserBySession(key)
{
    return client.query('select * from users where user_id = (select user_id from connections where session = $1::uuid)', [key])
        .catch(err => console.log(err))
}
async function getAuthKey(user_id)
{
    return client.query('select * from connections where user_id = $1::bigint', [user_id])
}
async function upsertConnection(user_id)
{
    return client.query('insert into connections (user_id, session) values($1::bigint, uuid_generate_v4()) on conflict (user_id) do update set session = uuid_generate_v4()', [user_id]);
}
async function getLastGroup()
{
    return client.query('SELECT * FROM APPLICATIONS ORDER BY application_id DESC LIMIT 1');
}
async function getMessagesByTopicId(application_id)
{
    return client.query('SELECT * FROM MESSAGES WHERE APPLICATION_ID = $1::BIGINT', [application_id])
}
async function updateUserInfo(userInfo)
{
    return client.query(`UPDATE USERS SET 
    NAME = $1::TEXT,
    SURNAME = $2::TEXT,
    PATRONYMIC = $3::TEXT,
    BIRTHDATE = $4::DATE,
    SEX = $5::TEXT,
    USER_DESCRIPTION = $6::TEXT,
    ROOM = $7::BIGINT
    WHERE USER_ID = $8::BIGINT`
    , [userInfo.name, userInfo.surname, userInfo.patronymic, userInfo.birthdate, userInfo.sex, userInfo.description, userInfo.room, +userInfo.id])
}
module.exports =
{
    getApplicationById, getUserByEmail, getUserById, addUser, getUserBySession, addApplication, getAuthKey, updateUserInfo, upsertConnection, getLastGroup, 
    addMessage, getMessagesByTopicId, /*getLastTopics, getTopicTitles,*/ 
}
if (process.argv[2] == 'initAll')
{
    client.query('drop table users, connections, applications, messages').finally(() =>
    {
        client.query('drop extension "uuid-ossp"').then(() =>
        {
            initDatabase();
        })
    })
}
else if (process.argv[2] == 'startAll')
{
    initDatabase();
}
