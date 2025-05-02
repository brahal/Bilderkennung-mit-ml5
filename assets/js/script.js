// Modell-Variable
let classifier;

// Alles starten, wenn Seite geladen ist
window.onload = () => {
    classifier = ml5.imageClassifier('MobileNet', onModelReady);

    const dropArea = document.querySelector('.upload-section');
    const uploadButton = document.getElementById('uploadButton');
    const imageInput = document.getElementById('imageInput');
    const classifyBtn = document.getElementById('classifyBtn');

    if (dropArea) {
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragover');
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) handleImage(file);
        });
    }

    if (uploadButton && imageInput) {
        uploadButton.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) handleImage(file);
        });
    }

    if (classifyBtn) {
        classifyBtn.addEventListener('click', () => {
            const container = document.getElementById('dynamicResults');
            container.innerHTML = '';
            const img = document.getElementById('userImage');
            classifyUserImage(img, container);
        });
    }
};


// Wenn Modell geladen ist
function onModelReady() {
    console.log('Modell geladen!');
    setTimeout(() => classifyExampleImages(), 500);
}

// Bild vorbereiten (anzeigen)
function handleImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.getElementById('userImage');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('classifyBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

async function translateLabel(label) {
    try {
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(label)}&langpair=en|de`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.responseData.translatedText || label;
    } catch (error) {
        console.error("Übersetzungsfehler:", error);
        return label;
    }
}

// Diagramm für die Klassifikationsergebnisse erstellen
function generateChart(results, container) {
    results.forEach(result => {
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';

        const label = document.createElement('div');
        label.className = 'bar-label';
        label.innerText = result.label;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = (result.confidence * 100).toFixed(1) + '%';

        const percentage = document.createElement('div');
        percentage.className = 'bar-percentage';
        percentage.innerText = (result.confidence * 100).toFixed(1) + '%';

        barContainer.appendChild(bar);
        barWrapper.appendChild(label);
        barWrapper.appendChild(barContainer);
        barWrapper.appendChild(percentage);

        container.appendChild(barWrapper);
    });
}



// Neue Visualisierung für Klassifikationsergebnisse
function generateSimpleResults(results, container) {
    container.innerHTML = '';

    results.forEach(result => {
        const row = document.createElement('div');
        row.className = 'confidence-entry';

        const label = document.createElement('span');
        label.className = 'label';
        label.innerText = result.label;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = (result.confidence * 100).toFixed(1) + '%';

        const percentage = document.createElement('span');
        percentage.className = 'percentage';
        percentage.innerText = (result.confidence * 100).toFixed(1) + '%';

        barContainer.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barContainer);
        row.appendChild(percentage);

        container.appendChild(row);
    });
}

// Eine Karte (Card) mit Bild, Ergebnis und Diagramm erstellen
async function createCard(imgSrc, label, results, correct) {
    const translatedLabel = await translateLabel(label);

    const card = document.createElement('div');
    card.className = 'result-card horizontal';

    const imageElem = document.createElement('img');
    imageElem.src = imgSrc;
    imageElem.alt = "Klassifiziertes Bild";
    imageElem.className = 'result-image';

    const content = document.createElement('div');
    content.className = 'result-content';

    const title = document.createElement('h3');
    title.innerText = translatedLabel;
    content.appendChild(title);


    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    content.appendChild(chartContainer);

    const status = document.createElement('div');
    status.className = 'status';
    status.classList.add(correct ? 'success' : 'error');
    status.innerText = correct ? '✔ korrekt' : '✘ falsch';

    card.appendChild(imageElem);
    card.appendChild(content);

    setTimeout(() => generateChart(results, chartContainer), 100);
    content.appendChild(status);
    return card;

}

// Einzelnes hochgeladenes Bild klassifizieren
function classifyUserImage(img, container) {
    classifier.classify(img).then(async results => {
        const topResult = results[0];
        const correct = topResult.confidence > 0.7;

        const card = await createCard(img.src, topResult.label, results, correct);
        container.appendChild(card);
    }).catch(err => {
        console.log('Fehler bei diesem Bild:', img);
        console.error("Fehler bei classifyUserImage():", err);
        alert("Fehler bei der Klassifikation");
    });
}


function classifyExampleImages() {
    const correctPaths = [
        "assets/img/correct1.jpg",
        "assets/img/correct2.jpg",
        "assets/img/correct3.jpg"
    ];
    const wrongPaths = [
        "assets/img/wrong1.jpg",
        "assets/img/wrong2.jpg",
        "assets/img/wrong3.jpg"
    ];

    const container = document.getElementById('exampleResults');
    container.innerHTML = '';

    const correctLabel = document.createElement('h2');
    correctLabel.textContent = '✔ Korrekte Klassifikationen';
    const correctContainer = document.createElement('div');
    correctContainer.className = 'card-grid';

    const wrongLabel = document.createElement('h2');
    wrongLabel.textContent = '✘ Falsche Klassifikationen';
    const wrongContainer = document.createElement('div');
    wrongContainer.className = 'card-grid';

    container.appendChild(correctLabel);
    container.appendChild(correctContainer);

    // Richtige Bilder klassifizieren
    correctPaths.forEach(path => {
        const img = new Image();
        img.src = path;
        img.crossOrigin = "anonymous";
        img.onload = () => classifyAndDisplay(img, correctContainer);
    });

    container.appendChild(wrongLabel);
    container.appendChild(wrongContainer);

    wrongPaths.forEach(path => {
        const img = new Image();
        img.src = path;
        img.crossOrigin = "anonymous";
        img.onload = () => classifyAndDisplay(img, wrongContainer);
    });

    // Helferfunktion: Bild klassifizieren und anzeigen
    function classifyAndDisplay(img, container) {
        classifier.classify(img).then(async results => {
            const topResult = results[0];
            const correct = topResult.confidence > 0.7;

            const card = await createCard(img.src, topResult.label, results, correct);
            container.appendChild(card);
        }).catch(err => {
            console.error("Fehler bei classifyAndDisplay():", err);
            alert("Fehler bei der Klassifikation");
        });
    }
}
