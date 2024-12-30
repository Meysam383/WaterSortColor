const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'magenta', 'lime', 'brown', 'grey'];
const container = document.getElementById('container');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const timerElement = document.getElementById('timer');
const messageContainer = document.createElement('div');
messageContainer.className = 'congrats-message';
gameContainer.appendChild(messageContainer);

let tubes = [];
let currentLevelIndex = 0;
let timer;
let timeLeft;

const levels = {
    easy: 3,
    medium: 5,
    hard: 7,
    extreme: 9,
    professional: 11
};

const difficulties = Object.keys(levels);

startButton.addEventListener('click', startGame);

function startGame() {
    startButton.style.display = 'none';
    gameContainer.style.display = 'block';
    clearMessage();
    startTimer();
    loadLevel(currentLevelIndex);
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 30 + currentLevelIndex * 30;
    updateTimerDisplay();
    timerElement.className = 'timer';
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 10) {
        timerElement.className = 'timer warning';
    }
    if (timeLeft <= 0) {
        clearInterval(timer);
        alert('Time is up! The game will refresh.');
        startGame();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createRandomTubes(numberOfFilledTubes) {
    const totalColors = numberOfFilledTubes * 4;
    let selectedColors = colors.slice(0, numberOfFilledTubes).flatMap(color => Array(4).fill(color));
    selectedColors = shuffle(selectedColors);
    const tubes = [];

    for (let i = 0; i < numberOfFilledTubes; i++) {
        tubes.push(selectedColors.splice(0, 4)); // Fill tubes with colors
    }

    for (let i = 0; i < 2; i++) {
        tubes.push([]);
    }

    return tubes;
}

function createTubes() {
    container.innerHTML = ""; // Clear the container
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';

    tubes.forEach((tubeColors, index) => {
        const tube = document.createElement('div');
        tube.className = 'tube';
        tube.dataset.index = index;

        tubeColors.forEach((color, colorIndex) => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color';
            colorDiv.style.backgroundColor = color;
            colorDiv.draggable = colorIndex === tubeColors.length - 1;
            colorDiv.dataset.colorIndex = colorIndex;
            colorDiv.addEventListener('dragstart', drag);
            tube.appendChild(colorDiv);
        });

        tube.addEventListener('drop', drop);
        tube.addEventListener('dragover', allowDrop);
        container.appendChild(tube);
    });
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    const colorDiv = event.target;
    const tubeIndex = colorDiv.parentElement.dataset.index;
    event.dataTransfer.setData('text/plain', JSON.stringify({ color: colorDiv.style.backgroundColor, tubeIndex, colorIndex: colorDiv.dataset.colorIndex }));
}

function drop(event) {
    event.preventDefault();
    const { color, tubeIndex: sourceTubeIndex, colorIndex } = JSON.parse(event.dataTransfer.getData('text/plain'));
    const targetTube = event.target.closest('.tube');

    if (targetTube) {
        const targetTubeIndex = targetTube.dataset.index;
        const sourceTubeColors = tubes[sourceTubeIndex];
        const targetTubeColors = tubes[targetTubeIndex];

        if (sourceTubeIndex !== targetTubeIndex && targetTubeColors.length < 4) {
            if (targetTubeColors.length === 0 || targetTubeColors[targetTubeColors.length - 1] === color) {
                sourceTubeColors.pop();
                targetTubeColors.push(color);
                updateTubes();
                if (checkWinCondition()) {
                    clearInterval(timer);
                    showMessage("🎉 Congratulations, you win! 🎉");
                }
            } else {
                alert('You can only place the same color on top of each other!');
            }
        }
    }
}

function updateTubes() {
    container.innerHTML = "";
    tubes.forEach((tubeColors, index) => {
        const tube = document.createElement('div');
        tube.className = 'tube';
        tube.dataset.index = index;

        tubeColors.forEach((color, colorIndex) => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color';
            colorDiv.style.backgroundColor = color;
            colorDiv.draggable = colorIndex === tubeColors.length - 1;
            colorDiv.dataset.colorIndex = colorIndex;
            colorDiv.addEventListener('dragstart', drag);
            tube.appendChild(colorDiv);
        });

        tube.addEventListener('drop', drop);
        tube.addEventListener('dragover', allowDrop);
        container.appendChild(tube);
    });
}

function checkWinCondition() {
    return tubes.every(tube => {
        return tube.length === 0 || (new Set(tube).size === 1 && tube.length === 4);
    });
}

function showMessage(message) {
    messageContainer.innerHTML = message;
    messageContainer.style.display = 'block';
    messageContainer.style.animation = 'bounce 2s ease-in-out infinite';
    const stickers = ['🎉', '🎊', '🏆', '✨'];
    stickers.forEach(sticker => {
        const stickerElement = document.createElement('span');
        stickerElement.innerText = sticker;
        stickerElement.className = 'sticker';
        messageContainer.appendChild(stickerElement);
    });

    setTimeout(showEndLevelOptions, 1000);
}

function clearMessage() {
    messageContainer.innerHTML = "";
    messageContainer.style.display = 'none';
}

function showEndLevelOptions() {
    let buttonContainer = document.querySelector('.end-level-buttons');
    if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.className = 'end-level-buttons';
        gameContainer.appendChild(buttonContainer);
    }

    buttonContainer.style.display = 'flex';

    let nextButton = document.querySelector('.next-level-button');
    if (!nextButton) {
        nextButton = document.createElement('button');
        nextButton.innerText = "Next";
        nextButton.className = 'end-level-button next-level-button';
        nextButton.addEventListener('click', startNextLevel);
        buttonContainer.appendChild(nextButton);
    }

    let closeButton = document.querySelector('.close-level-button');
    if (!closeButton) {
        closeButton = document.createElement('button');
        closeButton.innerText = "Close";
        closeButton.className = 'end-level-button close-level-button';
        closeButton.addEventListener('click', closeGame);
        buttonContainer.appendChild(closeButton);
    }

    nextButton.disabled = !checkWinCondition();
}

function startNextLevel() {
    clearMessage();
    currentLevelIndex++;
    if (currentLevelIndex < difficulties.length) {
        loadLevel(currentLevelIndex);
    } else {
        showMessage("🎉 You've completed all levels! 🎉");
    }
    startTimer(); // Restart the timer for the new level
}

function closeGame() {
    location.reload();
}

function loadLevel(levelIndex) {
    const buttonContainer = document.querySelector('.end-level-buttons');
    if (buttonContainer) {
        buttonContainer.style.display = 'none';
    }

    const selectedDifficulty = difficulties[levelIndex];
    const numberOfFilledTubes = levels[selectedDifficulty];
    tubes = createRandomTubes(numberOfFilledTubes);
    createTubes();
}
