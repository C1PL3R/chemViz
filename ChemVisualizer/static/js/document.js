var hasUnsavedChanges = false;


window.addEventListener('beforeunload', function (e) {
    if (hasUnsavedChanges) {
        e.preventDefault();
    }
});

var iconName;

var preButton;

function ChooseIcon(icon_name, element) {
    if (preButton && preButton !== element) {
        preButton.style.backgroundColor = '#31315a';
        preButton.setAttribute("title", "Натиснувши ви можете підтвердити вибір іконки");
    }

    if (preButton !== element) {
        element.style.backgroundColor = '#678765';
        iconName = icon_name;
        preButton = element;
        element.removeAttribute("title");
    } else {
        element.style.backgroundColor = '#31315a';
        iconName = null;

        element.setAttribute("title", "Натиснувши ви можете підтвердити вибір іконки");
        preButton = null;
    }
}


function CreateNewDoc() {
    const title = document.getElementById("NewDocInputTitle").value;
    axios.post(window.location.origin + "/document/create-new-doc/", { title: title, icon: iconName }, {
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json"
        }
    })
        .then(function (response) {
            hasUnsavedChanges = false;
            Swal.fire({
                title: 'Документ створено',
                text: "Зайдіть на сторінку, де є список ваших документів, і ви там його побачите! Або почекайте ще трішки часу сторінка сама перезавантажиться!",
                icon: 'success',
                confirmButtonText: 'ОК'
            }).then(() => {
                var doc = response.data.doc;

                var document_ui = document.createElement("div");
                document_ui.classList.add("doc");

                var title = document.createElement("a");
                title.innerText = doc.title;
                title.href = window.location.origin + "/document/" + doc.id;
                document_ui.appendChild(title);

                var docs = document.getElementsByClassName("docs");
                if (docs.length > 0) {
                    docs[docs.length - 1].appendChild(document_ui);
                }

                window.location.href = window.location.origin + "/document/" + doc.id;

            });

        })
        .catch(function (error) {
            const errorMessage = error.response?.data?.error || "Сталася помилка!";
            Swal.fire({
                title: 'Помилка',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
}

function OpenContextMenu(element, docId) {
    const contextMenu = document.getElementById("customMenu");

    const updateMenuPosition = (x, y) => {
        const maxLeft = window.innerWidth - contextMenu.offsetWidth;
        const maxTop = window.innerHeight - contextMenu.offsetHeight;
        contextMenu.style.left = `${Math.min(maxLeft, x)}px`;
        contextMenu.style.top = `${Math.min(maxTop, y)}px`;
    };

    const showMenu = (ev) => {
        ev.preventDefault();
        updateMenuPosition(ev.clientX, ev.clientY);
        contextMenu.style.display = "flex";
        contextMenu.setAttribute("doc_id", docId);

        document.addEventListener("click", hideMenu, { once: true });
    };

    const hideMenu = () => {
        contextMenu.removeAttribute("doc_id");
        contextMenu.style.display = "none";
    };

    element.removeEventListener("contextmenu", showMenu);
    element.addEventListener("contextmenu", showMenu);
}

function DeleteDocument() {
    const contextMenu = document.getElementById("customMenu");
    var doc_id = contextMenu.getAttribute("doc_id");

    Swal.fire({
        title: 'Ви дійсно хочете видалити цей документ!',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post(window.location.origin + "/document/delete-document/", {
                doc_id: doc_id
            }, {
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    "Content-Type": "application/json"
                }
            })
                .then(function (response) {
                    hasUnsavedChanges = false;
                    Swal.fire({
                        title: 'Документ видалено!',
                        text: "Зайдіть на сторінку, де є список ваших документів, і ви там його побачите! Або почекайте ще трішки часу — сторінка сама перезавантажиться!",
                        icon: 'success',
                        confirmButtonText: 'ОК'
                    }).then(() => {
                        window.location.href = window.location.origin + "/document/";
                    });
                })
                .catch(function (error) {
                    const errorMessage = error.response?.data?.error || "Сталася помилка!";
                    Swal.fire({
                        title: 'Помилка',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        }
    });

}

var initial_scroll = null;


function OpenDocSettings() {
    var DocSettings = document.getElementById("DocSettings");
    var checkbox = document.getElementById("isPrivate");
    var allowedUsers = document.getElementById("allowedUsers");

    DocSettings.style.display = 'flex';
    setTimeout(() => {
        DocSettings.classList.add('show');
    }, 10);

    document.body.style.overflow = "hidden";
    hasUnsavedChanges = true;
    
    initial_scroll = window.scrollY;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (checkbox.checked) {
        allowedUsers.style.display = "flex";
    } else {
        allowedUsers.style.display = "none";
    }


    const currentDocIcon = document.getElementById('currentDocIcon').innerText;
    const iconBtn = document.getElementById(currentDocIcon);
    ChooseIcon(currentDocIcon, iconBtn);


}

function CloseSettings() {
    const DocSettings = document.getElementById("DocSettings");

    DocSettings.classList.remove('show');

    setTimeout(() => {
        DocSettings.style.display = 'none';
        document.body.style.overflow = "";
    }, 300);

    hasUnsavedChanges = false;

    window.scrollTo({ top: initial_scroll, behavior: 'smooth' });
}

function SaveSettings() {
    var DocSettings = document.getElementById("DocumentId");
    var checkbox = document.getElementById("isPrivate");

    if (!iconName) {
        Swal.fire({
            title: 'Виберіть іконку документа!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    axios.post(window.location.origin + "/document/save-settings/", {
        "doc_id": parseInt(DocSettings.innerText.trim(), 10),
        "is_private": checkbox.checked,
        "icon": iconName,
    }, {
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json"
        }
    })
        .then(function (response) {
            hasUnsavedChanges = false;
            Swal.fire({
                title: 'Налаштування документу збережено!',
                icon: 'success',
                confirmButtonText: 'ОК'
            }).then(() => {
                CloseSettings();
                window.location.reload();
            });

        })
        .catch(function (error) {
            const errorMessage = error.response?.data?.error || "Сталася помилка!";
            Swal.fire({
                title: 'Помилка',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    iconName = null;
    preButton = null;
}




document.getElementById('addAllowedUser').addEventListener('click', function () {
    var emailInput = document.getElementById("allowedUserEmail");
    var DocSettings = document.getElementById("DocumentId");

    var email = emailInput.value.trim();

    if (!email) {
        Swal.fire({
            title: 'Помилка',
            text: "Будь ласка, введіть електронну пошту.",
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    if (!emailInput.checkValidity()) {
        Swal.fire({
            title: 'Помилка',
            text: "Введіть правильну електронну пошту.",
            icon: 'error',
            confirmButtonText: 'OK'
        });
        emailInput.focus();
        return;
    }

    axios.post(window.location.origin + "/document/add-allowed-user/", {
        doc_id: DocSettings.innerText.trim(),
        email: email,
    }, {
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json"
        }
    })
        .then(function (response) {
            hasUnsavedChanges = false;
            Swal.fire({
                title: 'Користувачеві надано доступ до документу!',
                icon: 'success',
                confirmButtonText: 'ОК'
            }).then(() => {
                CloseSettings();
                window.location.reload();
            });

        })
        .catch(function (error) {
            const errorMessage = error.response?.data?.error || "Сталася помилка!";
            Swal.fire({
                title: 'Помилка',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
});


var createNewDocBtn = document.getElementById("createNewDocBtn");

if (createNewDocBtn) {
    var createDocDiv = document.getElementById('create-doc');
    createNewDocBtn.addEventListener("click", function () {
        if (createDocDiv.style.display === 'none' || createDocDiv.style.display === '') {
            createDocDiv.style.display = 'flex';
        } else {
            createDocDiv.style.display = 'none';
        }

        hasUnsavedChanges = true;
        document.body.style.overflow = "hidden";
        initial_scroll = window.scrollY;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById("close").addEventListener("click", function () {
        if (createDocDiv.style.display === 'flex' || createDocDiv.style.display === '') {
            createDocDiv.style.display = 'none';
        } else {
            createDocDiv.style.display = 'flex';
        }

        hasUnsavedChanges = false;
        document.body.style.overflow = "";

        window.scrollTo({ top: initial_scroll, behavior: 'smooth' });
    });
}

const checkbox = document.getElementById("isPrivate");

checkbox.addEventListener("change", function () {
    const allowedUsers = document.getElementById("allowedUsers");
    if (checkbox.checked) {
        allowedUsers.style.display = "flex";
    } else {
        allowedUsers.style.display = "none";
    }
});

// ------------------------------------ WEB SOCKET ------------------------------------//
document.addEventListener('DOMContentLoaded', function () {
    var documentInput = document.getElementById('docEditor');
    var documentNameInput = document.getElementById('documentNameInput');
    var documentId = document.getElementById('DocumentId');

    if (documentId && documentId.innerText) {
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const chatSocket = new WebSocket(
            protocol + window.location.host + '/ws/document/' + documentId.innerText + '/'
        );

        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            documentInput.value = data.text;
            if (data.document_name) {
                documentNameInput.value = data.document_name;
            }
        };

        chatSocket.onerror = function (error) {
            console.error('WebSocket Error: ', error);
        };

        let timeoutId;
        const delay = 0 * 1000;

        documentInput.addEventListener('input', () => {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                var text = documentInput.innerHTML;
                console.log(text);
                chatSocket.send(JSON.stringify({
                    'text': text,
                }));
            }, delay);
        });

        documentNameInput.addEventListener('input', () => {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                var title = documentNameInput.value;
                chatSocket.send(JSON.stringify({
                    'title': title,
                }));
            }, delay);
        });

        window.addEventListener('beforeunload', () => {
            chatSocket.close();
        });
    } else {
        console.warn("Document ID not found or empty. Skipping WebSocket connection.");
    }
});
