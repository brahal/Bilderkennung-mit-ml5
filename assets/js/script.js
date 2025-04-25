let classifier;

window.onload = () => {
    classifier = ml5.imageClassifier('MobileNet', () => {
        console.log('Modell geladen!');
        classifyExampleImages();
    });

    const dropArea = document.querySelector('.upload-section');
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
};

document.getElementById('imageInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) handleImage(file);
});

function handleImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const image = document.getElementById('userImage');
        image.crossOrigin = "anonymous";
        image.src = e.target.result;
        image.onload = () => {
            document.getElementById('classifyBtn').disabled = false;
        };
    };
    reader.readAsDataURL(file);
}

document.getElementById('classifyBtn').addEventListener('click', () => {
    const container = document.getElementById('dynamicResults');
    container.innerHTML = ''; // Ergebnis immer zurücksetzen!

    const img = document.getElementById('userImage');
    classifyAndDisplay(img, container);
});


function classifyAndDisplay(img, container) {
    classifier.classify(img)
        .then(results => {
            const card = document.createElement('div');
            card.className = 'result-card';

            const topResult = results[0];
            const correct = topResult.confidence > 0.7;

            card.innerHTML = `
        <img src="${img.src}" alt="Klassifiziertes Bild">
        <h3>${topResult.label}</h3>
        ${results.map(res => `
          <div class="confidence-bar"><span style="width: ${(res.confidence * 100).toFixed(2)}%"></span></div>
          <div class="confidence-value">${res.label} – ${(res.confidence * 100).toFixed(1)}%</div>
        `).join('')}
        <div class="status ${correct ? 'success' : 'error'}">${correct ? '✔ korrekt' : '✘ falsch'}</div>
      `;

            container.appendChild(card);
        })
        .catch(err => {
            console.error("Fehler bei classify():", err);
            alert("Fehler bei der Klassifikation");
        });
    console.log('Klassifikation abgeschlossen für Bild:', img.src);

}

function classifyExampleImages() {
    const paths = [
        "assets/img/correct1.jpg",
        "assets/img/correct2.jpg",
        "assets/img/correct3.jpg",
        "assets/img/wrong1.jpg",
        "assets/img/wrong2.jpg",
        "assets/img/wrong3.jpg"
    ];
    const container = document.getElementById('exampleResults');

    paths.forEach(path => {
        const img = new Image();
        img.src = path;
        img.crossOrigin = "anonymous";
        img.onload = () => classifyAndDisplay(img, container);
    });
}
