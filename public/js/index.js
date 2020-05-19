const socket = io();

// Elements
const messageForm = document.querySelector("#message-form");
const messageFormInput = document.querySelector("#message-form-input");
const messageFormButton = document.querySelector("#message-form-button");
const chatMessages = document.querySelector("#chat-messages");
const chatSidebar = document.querySelector("#chat-sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const {
    displayName,
    room
} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    const newMessage = chatMessages.lastElementChild;
    const visibleHeight = chatMessages.offsetHeight;
    const containerHeight = chatMessages.scrollHeight;
    const scrollOffset = chatMessages.scrollTop + visibleHeight;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageHeight = newMessage.offsetHeight + parseInt(newMessageStyles.marginBottom);

    if (containerHeight - newMessageHeight <= scrollOffset) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

messageForm.addEventListener("submit", e => {
    e.preventDefault();
    messageFormButton.setAttribute("disabled", "disabled");

    socket.emit("sendMessage", messageFormInput.value, error => {
        messageFormButton.removeAttribute("disabled");
        messageFormInput.value = "";
        messageFormInput.focus();

        if (error) {
            return console.log("Message not sent", error);
        }

        console.log("Message sent");
    });
});

socket.on("message", msg => {
    const html = Mustache.render(messageTemplate, {
        displayName: msg.displayName,
        message: msg.message,
        createdAt: moment(msg.createdAt).format("h:mm a")
    });
    chatMessages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    chatSidebar.innerHTML = html;
});

socket.emit("join", displayName, room, error => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
