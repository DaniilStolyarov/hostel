const editorDefaults = { // шаблон для настроек EditorJS
    logLevel: 'ERROR',
    readOnly : true,
    data : undefined,
    holder : undefined,
    // data : JSON.parse(topic.description),
    // holder : topic.application_id,
    tools :
    {
        header : {
            class : Header,
            inlineToolbar : ['link', 'bold']
        },
        list : 
        {
            class : List,
            inlineToolbar : true
        },
        embed :
        {
            class : Embed,
            inlineToolbar : false,
            config : 
            {
                services : 
                {
                    youtube : true,
                    coub : true,
                    imgur : 
                    {
                        regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
                        embedUrl: 'http://imgur.com/<%= remote_id %>/embed',
                        html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000;"></iframe>'
                    }
                }
            }
        },
        image :
        {
            class : ImageTool
        }
    }
}
window.addEventListener("DOMContentLoaded", main)
async function main()
{
    document.querySelector('head title').textContent = 'МыслЯ'
    const userPromise = fetchUser()
        .catch(reason =>
        {
            console.log(reason);
            deleteCookie('authKey');
            location.replace(location.origin)
        })
    const user = await userPromise;
    if (user) 
    onFetchedUser(user);
    if (location.href.includes('topics/'))
    {
        const splitted = location.href.split('topics/')
        loadTopic(splitted[splitted.length - 1])
    }
    
    document.querySelector('#sign-container form').addEventListener('submit', registerEvent)
    document.querySelector('#login-container form').addEventListener('submit', loginEvent)
    document.querySelector('#apply-container #submit-apply').addEventListener('click', topicApplyEvent)
    document.querySelector('#profile-container #logout').addEventListener('click', logoutEvent)
    document.querySelector('.topic-container .comment-submit').addEventListener('click', commentSubmitEvent)
    document.querySelector('form.user-info').addEventListener('submit', updateUserInfo)
    document.querySelector('#feed-container .search-group button').addEventListener('click', searchTopic)
  
    fetchTopics();
}
async function searchTopic()
{
    const searchInputDOM = document.querySelector('.search-group input');
    const feedHeader = document.querySelector('.feed-list header')
    const feedList = document.querySelector('.feed-list')
    const value = searchInputDOM.value;
    if (!value) return; 
    const searchPromise = new Promise((resolve, reject) =>
    {
        socket.on('successful search topic', (searchResult) =>
        {
            resolve(searchResult);
        })
        socket.emit('search topic', {value});
        setTimeout(() => {
            reject('Долгий ответ')
        }, 60000);
    })
    const result = await searchPromise;
    const sortedResult = bubbleSort(result);

    const fields = feedList.querySelectorAll('div');
    fields.forEach((field) =>
    {
        field.remove();
    })
    
    feedHeader.textContent = `По запросу ${value}:`


    sortedResult.forEach(res =>
        {
            const container = document.createElement('div');
                    container.classList.add('feed-element');
                const title = document.createElement('a');
                    title.textContent = res.name;
                    title.classList.add('feed-title');
                    title.href = "/topics/" + res.application_id;
                const authorNick = document.createElement('div');
                    // todo : определять данные автора по его list.id
                const dateStamp = new Date(Date.parse(res.timestamp));
                const timestampDOM = document.createElement('div');
                    timestampDOM.classList.add('feed-timestamp')
                    timestampDOM.textContent = `${dateStamp.getDate()}.${dateStamp.getMonth() + 1}.${dateStamp.getFullYear()}`;
       
                const feedGroup = document.createElement('div');
                    feedGroup.classList.add('feed-group');
                const avatar = document.createElement('div');
                    avatar.classList.add('feed-avatar')
                feedGroup.append(title, timestampDOM);
                container.append(avatar, feedGroup);
                document.querySelector('.feed-list').append(container)
        })
    if (sortedResult.length == 0) 
    {
        const container = document.createElement('div');
        const icon = document.createElement('div');
        const text = document.createElement('div');
        const back = document.createElement('a');
        back.style.display = 'block';
        back.style.margin = '0 auto';
        back.style.width = 'fit-content';
        back.textContent = 'Назад';
        back.href = '/';
        back.style.fontSize = '18px';
        back.style.border = '2px solid var(--color30)'
        back.style.borderRadius = '5px'
        back.style.textDecoration = 'none';
        back.style.padding = '5px 10px'
        back.style.color = 'var(--color30)';
        text.textContent = "...ничего не найдено"
        text.style.textAlign = "center";
        text.style.fontSize = '18px';
        text.style.marginBottom = '30px'
        icon.style.backgroundImage = `url(/images/icons/empty_light.png)`
        icon.style.backgroundSize = 'contain'
        icon.style.width = '200px';
        icon.style.height = '200px';
        icon.style.margin = '0 auto';
        container.style.width = 'fit-content'
        container.style.margin = '50px auto';   
        container.append(icon, text, back);
        feedList.innerHTML = feedHeader.outerHTML + container.outerHTML;
    }
}
function bubbleSort(list)
{
    function checkSorted(arr)
    {
        for (let i = 0; i < arr.length - 1; i++)
        {
            if (arr[i].rate < arr[i + 1].rate) return false;
        }
        return true;
    }
    let tempElem;
    while (!checkSorted(list))
    {
        for (let i = 0; i < list.length - 1; i++)
        {
            if (list[i].rate < list[i + 1].rate)
            {
                tempElem = list[i];
                list[i] = list[i + 1];
                list[i + 1] = tempElem;
            }
        }
    }
    return list;
}
async function fetchTopics()
{
    window.socket.on('successful fetch topics list', (list) =>
    {
        const listDOM = document.querySelector('.feed-list');
        const newHeader = listDOM.querySelector('header').cloneNode(true);
        listDOM.querySelector('header').remove();
        list.forEach(elem =>
            {
                const container = document.createElement('div');
                    container.classList.add('feed-element');
                const title = document.createElement('a');
                    title.textContent = elem.name;
                    title.classList.add('feed-title');
                    title.href = "/topics/" + elem.application_id;
                const authorNick = document.createElement('div');
                    // todo : определять данные автора по его list.id
                const dateStamp = new Date(Date.parse(elem.timestamp));
                const timestampDOM = document.createElement('div');
                    timestampDOM.classList.add('feed-timestamp')
                    timestampDOM.textContent = `${dateStamp.getDate()}.${dateStamp.getMonth() + 1}.${dateStamp.getFullYear()}`;
                const feedGroup = document.createElement('div');
                    feedGroup.classList.add('feed-group');
                const avatar = document.createElement('div');
                    avatar.classList.add('feed-avatar')
                feedGroup.append(title, authorNick, timestampDOM);
                container.append(avatar, feedGroup);
                listDOM.prepend(container)
            }) 
            console.log(newHeader)
            listDOM.prepend(newHeader);
    }) 
    window.socket.emit('fetch topics list')
}
async function updateUserInfo(event)
{
    event.preventDefault();
    if (!confirm('Сохранить?')) return;
    const formData = new FormData(document.querySelector('form.user-info'))
    formData.append('authKey', getCookie('authKey'));
    const result = await fetch('/update-user-data', {method : "POST", body : formData})
    const resJson = await result.json();
    if (!resJson.ok) 
    {
        alert('что-то пошло не так. Проверьте правильность введённых данных')
        console.log(resJson);
        return;
        
    }   
    location.reload();
}
async function commentSubmitEvent(event)
{
    const authKey = getCookie('authKey');
    const data = await window.commentEditor.save();
    const stringData = JSON.stringify(data);
    const topicID = window.currentTopicID; // ID загруженного на странице topic
    if (data.blocks.length != 0)
    {
        window.socket.emit('comment apply', {content : stringData, topicID, authKey});
        location.reload();
    }
    else
    alert('Пустой комментарий!')

}
async function logoutEvent(event)
{ // удаляем authKey
    deleteCookie('authKey');
    location.replace(location.origin)
}
async function onFetchedUser(user)
{
    const loginTitle = document.querySelector('#login-title');
    const profileButton = document.querySelector('#profile-trigger');
    const nameDOM = document.querySelector('#profile-container .name');
    const emailDOM = document.querySelector('#profile-container .email');
    const avatarDOM = document.querySelector('#profile-container .avatar');
    const userIconDOM = document.querySelector('#profile-trigger');
    const telegramDOM = document.querySelector('#profile-container .telegram-text')
    const phoneDOM = document.querySelector('#profile-container .phone_number')

    console.log(user)
    profileButton.classList.add('active');
    loginTitle.classList.remove('active');
    
    nameDOM.textContent = user.nickname;
    emailDOM.textContent = user.email;
    telegramDOM.textContent = user.telegram;
    phoneDOM.textContent = user.phone;
    avatarDOM.style["background-image"] = `url(/images/${user.avatar_id})`
    userIconDOM.style["background-image"] = `url(/images/${user.avatar_id})`
    userIconDOM.classList.add('disabled')
    const propForm = document.querySelector('form.user-info');
    propForm.querySelectorAll('input, select').forEach(elem =>
        {
            const elemName = elem.name;
            if (elemName in user)
            {   
                elem.value = user[elemName];

            }

            if (elemName == "country")
            {
                const changeEv = new Event("change");
                elem.dispatchEvent(changeEv);  
            } 
        })
    document.querySelector('textarea[name = "description"').value = user.description;
}
async function fetchUser()
{
    const sessionID = getCookie('authKey');
    const socket = window.socket;
    if (!sessionID) return;
    const getUserData = new Promise((resolve, reject) =>
    {
        socket.on('successful fetch by key', ({resUser}) =>
        {
            resolve(resUser);
        })
        socket.on('failed fetch by key', ({reason}) =>
        {
            reject(reason);
        })
        setTimeout(() => {
            reject("Timeout")
        }, 30000);
        socket.emit('fetch by key', {sessionID})
    })
    return getUserData;
} 
function loadComments(topicID)
{
    window.socket.on('comments fetch success', async ({comments}) =>
    {
        comments.reverse();
        for (const comment of comments)
            {
                const {author_id, content} = comment;
                const commentPromise = new Promise((resolve, reject) =>
                {
                    setTimeout(() => {
                        reject()
                    }, 5000);
                    window.socket.on('success fetch user', ({nickname, avatar_id}) =>
                    {
                        resolve({nickname, avatar_id})
                    })
                    socket.emit('fetch user', {id : author_id})
                })
                const {avatar_id, nickname} = await commentPromise;
                const commentContainerDOM = document.createElement('div');
                    commentContainerDOM.classList.add('comment-container');
                    commentContainerDOM.id = "comment-" + comment.message_id;
                const commentAvatarDOM = document.createElement('div');
                    commentAvatarDOM.classList.add('comment-avatar');
                    commentAvatarDOM.style["background-image"] = `url(/images/${avatar_id})`;
                const contentGroup = document.createElement('div');
                    contentGroup.classList.add('content-group');
                const commentNickname = document.createElement('div');
                    commentNickname.classList.add('comment-nickname');
                    commentNickname.textContent = nickname;
                const commentContent = document.createElement('div');
                    commentContent.classList.add('comment-content');
                    commentContent.id = "message-" + comment.message_id;
                const showFullButton = document.createElement('button');
                    showFullButton.classList.add('show-full-comment');
                    showFullButton.textContent = "Показать полностью..."
                    showFullButton.id = "button-" + comment.message_id;
                contentGroup.append(commentNickname, commentContent);
                commentContainerDOM.append(commentAvatarDOM, contentGroup);
                document.querySelector('.comments .view').append(commentContainerDOM, showFullButton);
                const commentEditorOptions = {}
                Object.assign(commentEditorOptions, editorDefaults, {data : JSON.parse(content), holder : "message-" + comment.message_id})
                const commentEditor = new EditorJS(commentEditorOptions);
                showFullButton.onclick = () =>
                {
                    commentContainerDOM.style.maxHeight = "none";
                    showFullButton.style.display = "none";
                }
                commentEditor.isReady.then(() =>
                {
                    if (commentContent.scrollHeight < 500)
                    {
                        showFullButton.style.display = "none";
                    }
                })
             }
             if (comments.length < 1)
             {
                const icon = document.createElement('div');
                const emptyBlock = document.createElement('div');
                emptyBlock.style.width = "fit-content";
                emptyBlock.style.color = "var(--color10)";
                emptyBlock.style.margin = "20px auto 0";
                emptyBlock.innerHTML = "<i>Пока нет комментариев...</i>";
                const view = document.querySelector('.view.active');
                icon.style.height = "100px";
                icon.style["background"] = `url(/images/icons/empty_light.png) no-repeat center`;
                icon.style.backgroundSize = "contain";
                icon.style.marginTop = "100px";
                view.append(icon)
                view.append(emptyBlock)
             }
  
    })
    window.socket.emit('comments fetch', {topicID})
}
function loadTopic(topicID)
{
   
    window.socket.on('application fetch success', async ({topic}) =>
    {
        console.log(topic)
        const title = (topic.name.length > 0 ? topic.name : "Идея, которой не нужно имя")
        const author = topic.author;
        const timestamp = topic.timestamp;
        let dateStamp = new Date(timestamp);

        if ({topic})
        {
            document.querySelector('head title').textContent = title + ' - Мысля'
            document.querySelector('.topic-container .title').textContent = title;
            document.querySelector('.topic-container .description .text').id = topic.application_id;
            document.querySelector('.topic-container .info .author-info div').textContent = author.name;
            document.querySelector('.topic-container .info .date-info div').textContent = `${dateStamp.getDate()}.${dateStamp.getMonth() + 1}.${dateStamp.getFullYear()}`
            const teamLink = document.querySelector('.topic-container .info .team-info div')
            teamLink.textContent = title;
            teamLink.href = `/teams/${topic.application_id}`
            teamLink.style.cursor = 'pointer';
            teamLink.addEventListener('click', (event) =>
            {
                location.replace(teamLink.href)
            })
            const authorAvatarDOM = document.querySelector('.topic-container .author-icon');
            authorAvatarDOM.style["background-image"]= `url(/images/${author.avatar_id})`
            authorAvatarDOM.classList.add('disabled')
            const editorOptions = {};
            Object.assign(editorOptions, editorDefaults, {data : JSON.parse(topic.description), holder : topic.application_id})
            const editor = new EditorJS(editorOptions)
            await editor.isReady;
        }
        else
        {
            location.href = '/'
            
        }
        window.currentTopicID = topic.application_id;
        const descriptionDOM = document.querySelector('.topic .description');
        const titleDOM = document.querySelector('.topic .title');
        descriptionDOM.style.height = `calc(100% - 50px - ${titleDOM.clientHeight}px)`
        loadComments(topicID);
    })
    window.socket.emit('application fetch', {topicID});

}
async function registerEvent(event)
{
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = await fetch('/register', {method : "POST", body : formData })
    const JsonResult = await result.json();
    if (!JsonResult.valid) 
    {
        alert(JsonResult.reason);
        return;
    }
    alert('Регистрация успешна. Теперь попробуйте войти')
}
async function loginEvent(event)
{
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = await fetch('/login', {method : "POST", body : formData })
    const JsonResult = await result.json();
    if (!JsonResult.valid) 
    {
        alert(JsonResult.reason);
        return; 
    }
    setCookie('authKey', JsonResult.authKey);
    location.replace(location.origin);
}   
async function topicApplyEvent(event)
{
    const socket = window.socket;
    const authKey = getCookie('authKey')
    socket.on('successful application apply', ({id}) =>
    {
        window.location.pathname = '/topics/' + id;
    })
    socket.on('failed application apply', ({reason}) =>
    {
        alert(reason);
    })
    const JSONdata = await window.applyEditor.save();
    const topicDescription = JSON.stringify(JSONdata);
    const topicTitle = document.querySelector('#apply-title').value 
    // todo : сделать проверку на наличие title
    socket.emit('application apply', {topicDescription, topicTitle, authKey});
}