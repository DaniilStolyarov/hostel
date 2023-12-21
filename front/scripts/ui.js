window.addEventListener("DOMContentLoaded", main)
async function main()
{
    const body = document.querySelector('body');
    const initHeight = body.clientHeight;
    body.style.minHeight = initHeight + "px";
    document.querySelector('#input-file').addEventListener('change', async (event) =>
    {
        const image = event.target.files[0];
        const imageUrl = URL.createObjectURL(image)
        document.querySelector('label[for = input-file]').style["background-image"] = `url(${imageUrl})`;
        [...document.querySelectorAll('.avatar-preview')].forEach(elem =>
            {
                elem.style["background-image"] = `url(${imageUrl})`;
            })
    })
    document.querySelectorAll('input').forEach(elem =>
        {
            elem.addEventListener('keydown', (ev) =>
            {
                if (ev.key == 'Enter') ev.preventDefault();
            })
        })  
    
    document.querySelector('.toggle-comments-container').addEventListener('click', () =>
    {
        const topic = document.querySelector('.topic-container .topic');
        const comments = document.querySelector('.topic-container .comments');
        const view = comments.querySelector('.view');
        const commentsDOM = view.children;
        topic.style.display = 'none';
        comments.style.display = 'block';
        for (const commentDOM of commentsDOM)
        {
            if (!commentDOM.classList.contains('comment-container')) continue;
            const contentDOM = commentDOM.querySelector('.comment-content');
            if (contentDOM.clientHeight > commentDOM.clientHeight)
            {
                const id = contentDOM.id.split('-').at(-1);
                const showFullButton = comments.querySelector('#button-' + id);
                showFullButton.style.display = "block";
            }
        }
    })
    document.querySelector('.disable-comments-container').addEventListener('click', () =>
    {
        const topic = document.querySelector('.topic-container .topic');
        const comments = document.querySelector('.topic-container .comments');
        topic.style.display = "block";
        comments.style.display = "none";
    })
    initEditors();
    document.querySelector("#theme-toggle").addEventListener("click", () => 
    {
        localStorage.setItem("theme", localStorage.getItem("theme") === "light" ? "dark" : "light")
        location.reload();
    })
    enableCurrentColorTheme();
    
}
function getId(input)
{
    console.log(input)
}
async function initEditors()
{
    const editorOptions = {
        logLevel: 'ERROR',
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
                            embedUrl: 'https://imgur.com/<%= remote_id %>/embed',
                            html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000"></iframe>'
                        }
                    }
                }
            },
            image :
            {
                class : ImageTool,
                config : 
                {
                    endpoints : 
                    {
                        byUrl : `${location.origin}/upload-image-url`,
                        byFile : `${location.origin}/upload-image-file`
                    }
                }
            }
        },
        i18n :
        {
            messages : 
            {
                ui: {
                    "blockTunes": {
                      "toggler": {
                        "Click to tune": "Нажмите, чтобы настроить",
                        "or drag to move": "или перетащите"
                      },
                    },
                    "inlineToolbar": {
                      "converter": {
                        "Convert to": "Назначить"
                      }
                    },
                    "toolbar": {
                      "toolbox": {
                        "Add": "Добавить"
                      }
                    }
                  },
                toolNames: {
                    "Text": "Параграф",
                    "Heading": "Заголовок",
                    "List": "Список",
                    "Warning": "Примечание",
                    "Checklist": "Чеклист",
                    "Quote": "Цитата",
                    "Code": "Код",
                    "Delimiter": "Разделитель",
                    "Raw HTML": "HTML-фрагмент",
                    "Table": "Таблица",
                    "Link": "Ссылка",
                    "Marker": "Маркер",
                    "Bold": "Полужирный",
                    "Italic": "Курсив",
                    "InlineCode": "Моноширинный",
                    "Image" : "Картинка",
            
                  },
                  tools :
                  {
                    "link": {
                        "Add a link": "Вставьте ссылку"
                      },
                      "warning": { // <-- 'Warning' tool will accept this dictionary section
                        "Title": "Название",
                        "Message": "Сообщение"
                        
                      },
                      /**
                       * The "stub" is an internal block tool, used to fit blocks that does not have the corresponded plugin
                       */
                      "stub": {
                        'The block can not be displayed correctly.': 'Блок не может быть отображен',
                      }
                  }
            }
        }
    }
    const optionsApplyEditor = {};
    Object.assign(optionsApplyEditor, editorOptions, {holder: "apply-form", placeholder : "Текст вашей заявки"})
    const applyEditor = new EditorJS(optionsApplyEditor);
    await applyEditor.isReady; 
    window.applyEditor = applyEditor;

    const optionsCommentEditor = {};
    Object.assign(optionsCommentEditor, editorOptions, {holder: "myComment", placeholder : "Ответьте на заявку"})
    const commentEditor = new EditorJS(optionsCommentEditor);
    await commentEditor.isReady;
    window.commentEditor = commentEditor;
}   

function enableCurrentColorTheme()
{
    // --color60: rgb(14, 14, 23);
    // --color30: rgb(255, 196, 0);
    // --color10:white;
    // --slight: rgb(26, 28, 36);
    const isLightTheme = localStorage.getItem("theme") == "light";
    if (isLightTheme)
    {
        document.documentElement.style.setProperty('--color60', '#fbf8cc')
        document.documentElement.style.setProperty('--color30', '#d62828')
        document.documentElement.style.setProperty('--slight', '#3a0ca3')
        document.documentElement.style.setProperty('--color10', 'black')

    }
}