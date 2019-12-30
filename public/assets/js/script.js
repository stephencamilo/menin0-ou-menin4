document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = firebase.app();

        const features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');

        // document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;

        const database = app.database();
        tapa(database);
        reset(database);
        update_list(database);
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});

function getContentKeys(database) {
    return new Promise((result) => {
        usersKeyArr = [];
        var userCount = database.ref('users');
        userCount.on('value', function(snapshot) {
            var itemsProcessed = 0;
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                usersKeyArr.push(childKey);
                itemsProcessed++;
                if (itemsProcessed === snapshot.numChildren()) {
                    result(usersKeyArr);
                }
            });
        });
    });
}

function getContent(database) {
    return new Promise((result) => {
        usersArr = [];
        var userCount = database.ref('users');
        userCount.on('value', function(snapshot) {
            var itemsProcessed = 0;
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                usersArr.push(childData);
                itemsProcessed++;
                if (itemsProcessed === snapshot.numChildren()) {
                    result(usersArr);
                }
            });
        });
    });
}

function tapa(database) {
    let tapa = document.querySelector("#tapa");
    tapa.onclick = (e) => {
        e.preventDefault();
        let name = document.querySelector("#name");
        if (name.value) {
            database.ref('users').push({
                username: name.value,
                time: firebase.database.ServerValue.TIMESTAMP
            });
        }
        update_list(database);
    };

}

function reset(database) {
    let reset = document.querySelector("#reset");
    reset.onclick = (e) => {
        e.preventDefault();
        getContentKeys(database).then((users) => {
            var list = document.querySelector(".list");
            list.innerHTML = '';
            users.forEach((userKey) => {
                database.ref('users/' + userKey).remove();
            });
        });
    };

}

function update_list(database) {
    let new_order = new Promise((result) => {
        var user_order = [];
        getContent(database).then((users) => {
            let itemsGone = 0;
            var list = document.querySelector(".list");
            list.innerHTML = '';
            users.forEach((user) => {
                user_order.push(user.username);
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(user.username));
                list.appendChild(li);
                itemsGone++;
                if (itemsGone === users.length) {
                    result(user_order);
                }
            });
        });
    });
    new_order.then((user) => {
        console.log(user);
    });
}