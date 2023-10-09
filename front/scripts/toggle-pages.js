// смена отображаемых страниц в зависимости от введённого url
let hideBlock; 
function togglePage(pageContainer, display = "block")
{
    const mainContainer = document.querySelector("#main-container");
    const pages = mainContainer.children;
    [...pages].forEach(page => 
    {
        page.style.display = "none";
    })
    pageContainer.style.display = display;
    setTimeout(() => {
        hideBlock.classList.remove('active');
    }, 600);
}
document.addEventListener("DOMContentLoaded", () =>
{
    hideBlock = document.querySelector("#hide-all");
    toggleMainContainer();
    document.querySelectorAll('a').forEach(elem =>
        {
            elem.addEventListener('click', ev =>
            {
                ev.preventDefault();
                const href = elem.href.split('/');
                const path = href[href.length - 1];
                toggleMainContainer('/' + path);
            })
        })
})
function toggleMainContainer(path = location.pathname, isPopstate = false)
{
    const topicDisplay = document.querySelector('.topic-container').style.display;
    hideBlock.classList.add('active');
    switch (path)
    {
        case '/register':
            togglePage(document.querySelector('#sign-container'));
            break;
        case '/login':
            togglePage(document.querySelector('#login-container'));
            break;
        case '/apply':
            togglePage(document.querySelector('#apply-container'));
            break;
        case '/profile':
            togglePage(document.querySelector('#profile-container'))
            break;
        default:
            if (path.includes('topics')) togglePage(document.querySelector('.topic-container'), 'flex');
            else if (path.includes('teams')) togglePage(document.querySelector('#team-container'))
            else if (path.includes('jointeam')) togglePage(document.querySelector('#confirm-container'))
            else togglePage(document.querySelector('#feed-container'))
            break;
    }
    if (!isPopstate)
    {
        window.history.pushState({path}, '', path)
    }
}
window.addEventListener('popstate', (event) =>
{
    console.log(event.target.history.state)
    toggleMainContainer(event.target.history.state.path, true)
})