const db = require('../../db');
module.exports = 
{
    async fetch({id})
    {
        try
        {
            const user = (await db.getUserById(id)).rows[0];
            const res = {avatar_id : user.avatar_id, nickname : user.nickname}
            this.emit('success fetch user', res)
        } catch (err)
        {
            console.log(err)
        }
    },
    
    async fetchByKey ({sessionID}) 
    {
        let user;
        try
        {
            user = (await db.getUserBySession(sessionID)).rows[0];
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "November", "December"]
            let birthdate;
            if (user.birthdate) 
            {
                birthdate = user.birthdate.toString().slice(4, 15).split(' ');
                let res = '' + birthdate[2] + '-' + (+monthNames.indexOf(birthdate[0] + 1) > 10? (+monthNames.indexOf(birthdate[0]) + 1) : '0' + (1  + monthNames.indexOf(birthdate[0])))  + '-' +  birthdate[1]; 
                user.birthdate = res;
            }
        }
        catch (err)
        {
            this.emit('failed fetch by key', {reason : "invalid sessionID"});
            console.log(err)
            return;
        }
        if (!user) 
        {   
            this.emit('failed fetch by key', {reason : "invalid sessionID"});
            return;
        }
        const resUser = {nickname : user.nickname, admin : user.admin, 
            timestamp : user.timestamp, email : user.email, phone: user.phone_number, telegram: user.telegram, 
            avatar_id : user.avatar_id, 
            name : user.name, surname : user.surname, patronymic : user.patronymic, birthdate: user.birthdate, country : user.country, city : user.city, sex : user.sex, hee : user.hee, speciality : user.hee_speciality,  graduation : user.hee_graduation, 
            occupation : user.occupation_status, experience : user.experience, patent : user.patent, company : user.company, inn : user.inn, description : user.user_description, citizenship : user.citizenship}
        this.emit('successful fetch by key', {resUser});
    }
}