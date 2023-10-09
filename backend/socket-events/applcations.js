const db = require('../../db');
module.exports = 
{
    async apply({topicDescription, topicTitle, authKey})
    {
        {
            if (!authKey) return;
            if ((typeof topicDescription) != "string" || (typeof topicTitle) != "string")
            {
                return
            }
            try
            {   
                JSON.parse(topicDescription)
                const {user_id} = (await db.getUserBySession(authKey)).rows[0];
                
                const {group_id : id} = (await db.addApplication(topicTitle, topicDescription, user_id)).rows[0];
                this.emit('successful application apply',  {id})
            }
            catch (err) 
            {
                this.emit('failed application apply', {reason : "Неизвестная ошибка"})
                console.log(err)
                return;
            }
        }
    },

    async fetch({topicID}) 
    {
        try 
        {
            const topic = (await db.getApplicationById(topicID)).rows[0];
            const authorID = topic.author_id;
            const {name, avatar_id} = (await db.getUserById(authorID)).rows[0];
            delete topic.author_id;
            topic.author = {name, avatar_id};
            this.emit('application fetch success', ({topic}))
        }
        catch (err)
        {
            console.log(err)
            this.emit('application fecth failed', {errorMessage : err.message});
        }
    }

}