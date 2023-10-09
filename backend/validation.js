const db = require('../db');
async function validRegister(user)
{
    const {email, password, name, phone, telegram, avatar, passwordConfirm} = user; 
    try
    {
        if (email.length > 64)
        return {valid : false, reason : "Длина эл. почты превышает 64 символа"}
    if (password.length > 64)
        return {valid : false, reason : "Длина пароля превышает 64 символа"}
    if (name.length > 32 || name.length < 3)
        return {valid : false, reason : "Длина имени превышает 32 символа или меньше 3 символов"}
    if (phone.length > 32) 
        return {valid : false, reason : "Длина номера телефона превышает 32 цифры"}
    if (telegram.length > 64)
        return {valid : false, reason : "Длина тега telegram превышает 64 символа"}
    if (avatar.size > 10485760)
        return {valid : false, reason : "Размер аватара превышает 10 МБайт"}
    const ExpReg = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    if (!ExpReg.test(email))
        return {valid : false, reason : "Некорректный адрес электронной почты"}
    const ExpPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!ExpPass.test(password))
        return {valid : false, reason : "Пароль должен содержать минимум 8 символов и одну цифру"}
    if (password != passwordConfirm)
        return {valid : false, reason : "Пароль и подтверждение пароля не совпадают"}
    if ((await db.getUserByEmail(email)).rowCount > 0)
        return {valid : false, reason : "Пользователь с данным email уже зарегистрирован, используйте другой"}
    }
    catch(err)
    {
        return {valid : false, reason : "Неизвестная ошибка"}
    }
    return {valid : true}    
}
async function validLogin(logData)
{
    try
    {
        const {email, password} = logData;
        const foundUser = (await db.getUserByEmail(email)).rows[0]
        if (!foundUser) return {valid : false, reason : "пользователь с данным email не найден"};
        if (foundUser.password != password) return {valid : false, reason: "неверный пароль!"};
        await db.upsertConnection(foundUser.user_id);
        const authKey = (await db.getAuthKey(foundUser["user_id"])).rows[0].session
        return {valid : true, authKey} 
    }

    catch(err)
    {
        console.log(err)
        return {valid : false, reason : "неизвестная ошибка"}
    }
}
module.exports = {validRegister, validLogin};