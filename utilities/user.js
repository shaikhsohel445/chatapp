const users = [];

//* Joining users

function joinUser(id, username, room) {

    const user = { id, username, room };
    users.push(user);
    return user;
}

//* Current user

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

//* user leaves the chat

function userLeave(id){
    const index = users.findIndex(user => user.id==id);

    if(index !==-1){
        return users.splice(index,1)[0];
    }
}

//* Get all room users

function roomUsers(room){
    return users.filter( user=> user.room ===room)
}


module.exports = {
    joinUser,
    getCurrentUser,
    userLeave,
    roomUsers
};