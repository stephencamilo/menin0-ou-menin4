document.addEventListener('DOMContentLoaded', function() {
    try {
        const app = firebase.app();

        const features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');

        // document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;

        const database = app.database();
        voteMenino(database);
        voteMenina(database);
        update_quiz(database);
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});

function getContent(database) {
    return new Promise((result) => {
        votesArr = [];
        var voteCount = database.ref('votes');
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

function voteMenino(database) {
    let voteMenino = document.querySelector("#voteMenino");
    voteMenino.onclick = (e) => {
        e.preventDefault();
        database.ref('votes/menino').push({
            time: firebase.database.ServerValue.TIMESTAMP
        });
        update_quiz(database);
    };

}

function voteMenina(database) {
    let voteMenina = document.querySelector("#voteMenina");
    voteMenina.onclick = (e) => {
        e.preventDefault();
        database.ref('votes/menina').push({
            time: firebase.database.ServerValue.TIMESTAMP
        });
        update_quiz(database);
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
            let bar_menino_votos = document.querySelector("#bar-menino .votos");
            var bar_menino_votos_text = document.createTextNode(votes.menino);
            bar_menino_votos.appendChild(bar_menino_votos_text);

            let bar_menino_porcento = document.querySelector("#bar-menino .porcento");
            let bar_menino_porcento_text = document.createTextNode(parseInt(percent_votes_menino));
            bar_menino_porcento.appendChild(bar_menino_porcento_text);

            let bar_menina_votos = document.querySelector("#bar-menina .votos");
            var bar_menina_votos_text = document.createTextNode(votes.menina);
            bar_menina_votos.appendChild(bar_menina_votos_text);

            let bar_menina_porcento = document.querySelector("#bar-menina .porcento");
            let bar_menina_porcento_text = document.createTextNode(parseInt(percent_votes_menina));
            bar_menina_porcento.appendChild(bar_menina_porcento_text);


        });
    });
    new_order.then((user) => {
        console.log(user);
    });
}

function var_dump(val) {
    console.log(val);
}