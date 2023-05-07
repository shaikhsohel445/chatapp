const chatForm = document.getElementById("chat-form");
const msg = document.getElementById("msg");
const section = document.getElementById("putHere");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const side = document.querySelector(".side");
const cross = document.querySelector(".cross");
const aside = document.getElementById("aside");

side.addEventListener("click",()=>{
    aside.style.display="block"
});

cross.addEventListener("click",()=>{
    aside.style.display="none"
});



const socket = io();

let time = moment().format("hh:mm a");//*from moment.js library


//* get username and room from URL : Query string module

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.emit("join-chat-room", { username, room });

//* User and room info

socket.on("room-users", ({ room, users }) => {
    outputRoom(room);
    roomUsers(users);
});

//*bot
socket.on("bot", (data) => {
    outputMsg(data.msg, data.position);
    scrollDown();
});
socket.on("message", (data) => {
    outputUserMsg(data.msg, data.position, data.username);
    scrollDown();
});
socket.on("receive", (data) => {
    outputUserMsg(data.msg, data.position, data.username);
    scrollDown();
});

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("chat-msg", msg.value);
    msg.value = "";

})

function scrollDown() {
    section.scrollTop = section.scrollHeight;
}

//* User msg
function outputUserMsg(msg, position, username) {
    const div = document.createElement("div");
    div.classList.add("chat-msg");
    div.classList.add(position);
    div.innerHTML = `

    <div class="chat-heading">${username}<span>${time}</span></div>
    <div class="chat-text">
        ${msg}
    </div>

    `;
    section.appendChild(div);

}

//* Bot msg
function outputMsg(msg, position) {
    const div = document.createElement("div");
    div.classList.add("chat-msg");
    div.classList.add(position);
    div.innerHTML = `

    <div class="chat-heading">Bot<span>${time}</span></div>
    <div class="chat-text">
        ${msg}
    </div>

    `;
    document.getElementById("putHere").appendChild(div);

}

//* Room names

function outputRoom(room) {
    roomName.innerText = room;
}

//* Users name

function roomUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}