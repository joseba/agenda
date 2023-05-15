// Crear la lista de tiempos
var tiempos = [];
for (var i = 8; i <= 23; i++) {
    for (var j = 0; j < 60; j += 15) {
        var horas = i.toString().padStart(2, '0');
        var minutos = j.toString().padStart(2, '0');
        tiempos.push(horas + ':' + minutos);
    }
}

// Generar los botones
var buttonContainer = document.getElementById('button-container');
var row = document.createElement('div');
row.className = 'row';
row.style.marginBottom = '5px';

for (var i = 0; i < tiempos.length; i++) {
    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'col-3 btn-container';
    buttonDiv.style.padding = '0 5px 0 5px';
    var button = document.createElement('button');
    button.className = 'btn btn-primary btn-block';
    button.innerText = tiempos[i];
    button.addEventListener('click', function() {
        addRow(this.innerText);
    });
    buttonDiv.appendChild(button);
    row.appendChild(buttonDiv);

    if ((i + 1) % 4 == 0) {
        buttonContainer.appendChild(row);
        row = document.createElement('div');
        row.className = 'row';
        row.style.marginBottom = '5px';
    }
}

if (row.hasChildNodes()) {
    buttonContainer.appendChild(row);
}

/// Función para añadir una nueva fila a la tabla
function addRow(time) {
    var tableBody = document.getElementById('table-body');

    var row = document.createElement('tr');
    var cell1 = document.createElement('td');
    var cell2 = document.createElement('td');
    var cell3 = document.createElement('td');

    cell1.innerText = time;
    cell2.className = 'diff';
    cell3.className = 'description'
    cell3.innerText = 'Haz clic para grabar la descripción';
    cell3.addEventListener('click', recordDescription);

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);

    tableBody.appendChild(row);

    // updateDiff();
}

// Función para grabar la descripción con la voz del usuario
function recordDescription() {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    recognition.interimResults = true; // Permitir resultados intermedios
    recognition.continuous = false; // Detener el reconocimiento después del primer resultado

    recognition.onstart = function() {
        console.log('Voice recording started...');
        // Detener la grabación después de 5 segundos
        setTimeout(function() {
            recognition.stop();
            console.log('Voice recording stopped...');
        }, 3000);
    };

    recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        console.log('Voice recording finished, transcript: ' + transcript);
        this.innerText = transcript; // Aquí usamos 'this' en lugar de 'event.target'
    }.bind(this); // Y usamos 'bind(this)' para asegurar que 'this' apunta al elemento correcto en el manejador de eventos

    recognition.start();
}

// Función para actualizar la diferencia de tiempo en tiempo real
function updateDiff() {
    var diffCells = document.getElementsByClassName('diff');
    for (var i = 0; i < diffCells.length; i++) {
        var targetTime = diffCells[i].parentNode.firstChild.innerText;
        var targetDate = new Date();
        targetDate.setHours(targetTime.split(':')[0]);
        targetDate.setMinutes(targetTime.split(':')[1]);
        targetDate.setSeconds(0);

        var now = new Date();

        var diffMs = targetDate - now;
        if (diffMs < 0) {
            // Elimina la fila si la diferencia de tiempo es '00:00'
            diffCells[i].parentNode.remove();
            continue;
        }

        var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
        var diffMin = Math.round(((diffMs % 86400000) % 3600000) / 60000);

        diffCells[i].innerText = diffHrs.toString().padStart(2, '0') + ':' + diffMin.toString().padStart(2, '0');

        if (diffHrs < 1) {
            diffCells[i].parentNode.classList.add('highlighted');
        } else {
            diffCells[i].parentNode.classList.remove('highlighted');
        }
    }
}

// Función para verificar la tabla y leer la descripción y los minutos restantes si la diferencia de tiempo es inferior a una hora
function checkTableAndNotify() {
    // Obtiene todas las celdas de la columna DIFF
    var diffCells = document.getElementsByClassName('diff');
    var descCells = document.getElementsByClassName('description');

    for (var i = 0; i < diffCells.length; i++) {
        // Obtiene el valor de la celda como una cadena
        var diffString = diffCells[i].innerText;
        var descString = descCells[i].innerText;

        // Separa las horas y los minutos
        var [hours, minutes] = diffString.split(':').map(Number);

        // Si la diferencia de tiempo es inferior a una hora...
        //if (hours < 1 && minutes < 21) {
        if (hours < 1 && [20, 15, 10, 5].includes(minutes)) {
            // Crea un nuevo objeto SpeechSynthesisUtterance
            var utterance = new SpeechSynthesisUtterance();

            if (descString === 'Haz clic para grabar la descripción') {
                utterance.text = `Faltan ${minutes} minutos para evento.`;
            } else {
                utterance.text = `Faltan ${minutes} minutos para ${descString}.`;
            }

            // Usa el API SpeechSynthesis para leer el texto en voz alta
            window.speechSynthesis.speak(utterance);
        }
    }
}

function getWeather() {
    var API_KEY = 'be9ea721723f6cbe5072a144845ed82a';
    var url = `http://api.openweathermap.org/data/2.5/weather?q=Madrid,es&units=metric&appid=${API_KEY}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            var temp = data.main.temp.toFixed(0);
            return `${temp}°C`;
        })
        .catch(error => console.error('Error:', error));
}

function getBitcoinPrice() {
    var url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            var price = (data.bitcoin.eur/1000).toFixed(0);
            return `₿=${price}K€`;
        })
        .catch(error => console.error('Error:', error));
}

function getElMundoHeadline() {
    var url = `https://api.rss2json.com/v1/api.json?rss_url=https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            var headline = data.items[0].title;
            return `${headline}`;
        })
        .catch(error => console.error('Error:', error));
}

function getCNNHeadline() {
    var url = `https://api.rss2json.com/v1/api.json?rss_url=http://rss.cnn.com/rss/edition.rss`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            var headline = data.items[0].title;
            return `${headline}`;
        })
        .catch(error => console.error('Error:', error));
}




async function updateBottomPanel() {
    let panel = "";
    panel += await getWeather();
    panel += " | ";
    panel += await getBitcoinPrice();
    panel += " | ";
    panel += await getElMundoHeadline();

    //console.log(panel);
    document.getElementById('marquee').textContent = panel;
}

function start() {
    updateBottomPanel();
}

function runBy1Sec() {
    setInterval(function() {
        updateDiff();
    }, 1000);
}

function runBy1Min() {
    setInterval(function() {
        checkTableAndNotify();
    }, 1 * 60 * 1000);
}

function runBy5Min() {
    setInterval(function() {
        updateBottomPanel();
    }, 5 * 60 * 1000);
}

function onLoad() {
    start();
    runBy1Sec();
    runBy1Min();
    runBy5Min();
}
window.onload = onLoad;
