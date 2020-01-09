document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = firebase.app();
        const features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        // document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
        const database = app.database();
        logar_votar(database);
        logout(database);
        authListener(database);
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});

function authListener(database) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            display_inline_block('#voteMenino');
            display_inline_block('#voteMenina');
            display_block('#bar');
            display_block('#logout');
            display_none('#votar');
            vote(database, user, 'menino', '#voteMenino');
            vote(database, user, 'menina', '#voteMenina');
        } else {
            // No user is signed in.
            display_none('#logout');
            display_none('#voteMenino');
            display_none('#voteMenina');
            display_none('#bar');
            display_block('#votar');

        }
    });

}

function logar_votar(database) {
    let element = document.querySelector('#votar');
    element.onclick = (e) => {
        e.preventDefault();
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('openid');
        firebase.auth().languageCode = 'pt';
        firebase.auth().signInWithPopup(provider).then(function(result) {
            vote(database, result.user, 'menino', '#voteMenino');
            vote(database, result.user, 'menina', '#voteMenina');
        }).catch(function(error) {
            var errorCode = error.code;
            console.log(errorCode);
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    };
}

function logout(database) {
    let element = document.querySelector('#logout');
    element.onclick = (e) => {
        e.preventDefault();
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            console.log('Sign-out successful');
            authListener(database);

        }).catch(function(error) {
            // An error happened.
            console.log(error);
        });
    };
}

function getContent(database) {
    return new Promise((result) => {
        votesArr = [];
        var voteCount = database.ref('votes_public');
        voteCount.on('value', function(snapshot) {
            var itemsProcessed = 0;
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.numChildren();

                votesArr[childKey] = childData;
                itemsProcessed++;
                if (itemsProcessed === snapshot.numChildren()) {
                    result(votesArr);
                }
            });
        });
    });
}

function display_inline_block(selector) {
    let element = document.querySelector(selector);
    element.setAttribute("style", "display:inline-block;");
}

function display_block(selector) {
    let element = document.querySelector(selector);
    element.setAttribute("style", "display:block;");
}

function display_none(selector) {
    let element = document.querySelector(selector);
    element.setAttribute("style", "display:none;");
}

function vote(database, user, gender, selector) {
    let element = document.querySelector(selector);
    element.onclick = (e) => {
        e.preventDefault();
        var voteData = {
            time_voted: firebase.database.ServerValue.TIMESTAMP
          };
          var userData = {
            user_mail: user.email,
            user_displayName: user.displayName,
            time_created: firebase.database.ServerValue.TIMESTAMP
          };
        var newVoteKey = firebase.database().ref().child('votes_public/' + gender).push().key;
        var updates = {};
        updates['/votes/' + newVoteKey] = voteData;
        updates['/user/' + user.uid] = userData;
        updates['/user-votes/' + user.uid] = newVoteKey;
        firebase.database().ref().update(updates);
        update_quiz(database);
        let bar = document.querySelector('#bar');
        bar.setAttribute("style", "display:block;");
    };
}

function update_quiz(database) {
    let new_order = new Promise((result) => {
        getContent(database).then((votes) => {
            let total_votes = votes.menina + votes.menino;
            let folga = 0;
            let percent_votes_menino = (votes.menino / (total_votes / 100)) - folga;
            let percent_votes_menina = (votes.menina / (total_votes / 100)) - folga;
            document.getElementById("bar-menino").style.width = percent_votes_menino + '%';
            document.getElementById("bar-menina").style.width = percent_votes_menina + '%';

            document.querySelector("#bar-menino .votos").textContent = votes.menino;
            document.querySelector("#bar-menino .porcento").textContent = parseInt(percent_votes_menino);
            document.querySelector("#bar-menina .votos").textContent = votes.menina;
            document.querySelector("#bar-menina .porcento").textContent = parseInt(percent_votes_menina);

        });
    });
    new_order.then((user) => {
        console.log(user);
    });
}