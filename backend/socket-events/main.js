const db = require('../../db');
const stringSimilarity = require('string-similarity')
const maxSearchCount = 10;
function handleEvents(io)
{
    io.on('connection', (socket) =>
    {
        socket.on('info team', async (teamID) =>
        {
            try
            {
                const {author_id, name : title} = (await db.getGroupByLink(teamID)).rows[0];
                const {nickname, avatar_id} = (await db.getUserById(author_id)).rows[0];
                socket.emit('successful info team', {nickname, title, avatar_id})
            } catch (err)
            {
                socket.emit('failed info team', {reason : "Некорректная ссылка"});
                console.log(err)
            }
        })
        socket.on('join team', async ({teamID, authKey}) =>
        {
            try 
            {
                const {group_id, author_id} = (await db.getGroupByLink(teamID)).rows[0];
                const {user_id} = (await db.getUserBySession(authKey)).rows[0];
                if (!user_id)
                {
                    socket.emit('failed join team', {reason : "Вы не залогинены"})
                    return;
                }
                
                const leaderGroups = (await db.getLeaderByGroupID(user_id)).rows // проверяем что участник не является лидером какой-либо команды
                if (leaderGroups.length !== 0) 
                {
                    console.log(leaderGroups);
                    socket.emit('failed join team', {reason : "Вы уже являетесь лидером идеи"})
                    return;
                }
                const memberGroup = (await db.getGroupMemberByAuthorID(user_id)).rows;
                if (memberGroup.length !== 0)
                {
                    socket.emit('failed join team', {reason : "Вы уже являетесь участником идеи"})
                }
                await db.addGroupMember(group_id, authKey, 0);
                socket.emit('successful join team', group_id);
            } catch (err)
            {
                socket.emit('failed join team', {reason : "Неизвестная ошибка"})
                console.log(err);
                return;
            }
        })
        socket.on('fetch team', async (teamID) =>
        {
            try
            {
                const team = (await db.getTeamById(teamID)).rows;
                const {name} = (await db.getTopicById(teamID)).rows[0];
                for (member of team)
                {
                    member.role_prior = (await db.getRolePrior(teamID, member.user_id)).rows[0].role_prior;
                }
                socket.emit('successful fetch team', {team, name})
            } 
            catch(err)
            {
                console.log(err);
                return;
            }
        })
        socket.on('team link', async ({authKey}) =>
        {
            try
            {
                const groups = (await db.getLeaderGroup(authKey)).rows;
                if (groups.length == 0)
                {
                    socket.emit('failed team link', {reason : "Только лидер группы имеет доступ к ссылке-приглашению"})
                    return
                };
               
                const link = (await db.addGroupLink(groups[0].group_id)).rows[0].group_link;
                socket.emit('successful team link', {url : `/jointeam/${link}`});
            } catch(err)
            {
                console.log(err)
            }
        })
        socket.on('search topic', async ({value}) =>
        {
            if (typeof value != 'string') return;
            const groups = (await db.getTopicTitles()).rows;
            let tempCS;
            const res = [];
            let minRate = 0.15;
            
            for (let i = 0; i < groups.length; i++)
            {
                
                tempCS = stringSimilarity.compareTwoStrings(value.toLowerCase(), groups[i].name.toLowerCase());
                if (tempCS < minRate) continue;
                groups[i].rate = tempCS;
                res.push(groups[i]);
                if(res.length > maxSearchCount) minRate = tempCS;
            }
            socket.emit('successful search topic', res)
        
        })
        socket.on('fetch topics list', async () =>
        {
            const list = (await db.getLastTopics()).rows;
            socket.emit('successful fetch topics list', list);
        })
        socket.on('fetch user', async ({id}) =>
        {
            try
            {
                const user = (await db.getUserById(id)).rows[0];
                const res = {avatar_id : user.avatar_id, nickname : user.nickname}
                socket.emit('success fetch user', res)
            } catch (err)
            {
                console.log(err)
            }
        })
        socket.on('comments fetch', async ({topicID}) =>
        {
            try
            {
                const messages = (await db.getMessagesByTopicId(topicID)).rows
                socket.emit('comments fetch success', {comments : messages});
            }
            catch (err)
            {
                console.log(err)
            }
            return;
        })
        socket.on('comment apply', async ({content, topicID, authKey}) =>
        {
            try
            {
                const user = (await db.getUserBySession(authKey)).rows[0];
                const topic = (await db.getTopicById(topicID)).rows[0];
                if (user && topic)
                {
                    await db.addMessage(user.user_id, topic.group_id, content);
                }
            }
            catch (err)
            {
                console.log(err)
            }
        })
        socket.on('fetch by key', async ({sessionID}) =>
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
                socket.emit('failed fetch by key', {reason : "invalid sessionID"});
                console.log(err)
                return;
            }
            if (!user) 
            {   
                socket.emit('failed fetch by key', {reason : "invalid sessionID"});
                return;
            }
            const resUser = {nickname : user.nickname, admin : user.admin, 
                timestamp : user.timestamp, email : user.email, phone: user.phone_number, telegram: user.telegram, 
                avatar_id : user.avatar_id, 
                name : user.name, surname : user.surname, patronymic : user.patronymic, birthdate: user.birthdate, country : user.country, city : user.city, sex : user.sex, hee : user.hee, speciality : user.hee_speciality,  graduation : user.hee_graduation, 
                occupation : user.occupation_status, experience : user.experience, patent : user.patent, company : user.company, inn : user.inn, description : user.user_description, citizenship : user.citizenship}
            socket.emit('successful fetch by key', {resUser});
        })
        socket.on('topic fetch', async ({topicID}) =>
        {
            try 
            {
                const topic = (await db.getTopicById(topicID)).rows[0];
                const authorID = topic.author_id;
                const {nickname, avatar_id} = (await db.getUserById(authorID)).rows[0];
                delete topic.author_id;
                topic.author = {nickname, avatar_id};
                socket.emit('topic fetch success', ({topic}))
            }
            catch (err)
            {
                console.log(err)
                socket.emit('topic fecth failed', {errorMessage : err.message});
            }
        })
        socket.on('topic apply', async ({topicDescription, topicTitle, authKey}) =>
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
                const userGroups = (await db.getLeaderGroup(authKey)).rows;
                if (userGroups.length > 0) 
                {
                    socket.emit('failed topic apply', {reason : "Вы уже являетесь лидером группы"})
                    return;
                }
                const {group_id : id} = (await db.addGroup(topicTitle, topicDescription, user_id)).rows[0];
                await db.addGroupMember(id, authKey, 1); 
                socket.emit('successful topic apply',  {id})
            }
            catch (err) 
            {
                socket.emit('failed topic apply', {reason : "Неизвестная ошибка"})
                console.log(err)
                return;
            }
        })
    })
}
module.exports = handleEvents;