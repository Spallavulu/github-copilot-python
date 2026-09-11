// Client-side rendering and interaction for the Flask-backed Sudoku
const boardElement = document.getElementById("sudoku-board");
const messageElement = document.getElementById("message");
const difficultySelect = document.getElementById("difficulty");
const timerElement = document.getElementById("timer");

const newGameButton = document.getElementById("new-game");
const checkButton = document.getElementById("check-solution");
const hintButton = document.getElementById("hint-button");
const darkModeButton = document.getElementById("dark-mode-toggle");

let puzzle = [];
let solution = [];
let elapsedSeconds = 0;
let timerId = null;
let hintsUsed = 0;


function startTimer() {
    stopTimer();

    elapsedSeconds = 0;
    updateTimerDisplay();

    timerId = setInterval(() => {
        elapsedSeconds += 1;
        updateTimerDisplay();
    }, 1000);
}


function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}


function updateTimerDisplay() {
    const minutes = String(
        Math.floor(elapsedSeconds / 60)
    ).padStart(2, "0");

    const seconds = String(
        elapsedSeconds % 60
    ).padStart(2, "0");

    timerElement.textContent = `Time: ${minutes}:${seconds}`;
}


async function startNewGame() {
    const difficulty = difficultySelect.value;

    try {
        const response = await fetch(
            `/new?difficulty=${encodeURIComponent(difficulty)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to start game.");
        }

        puzzle = data.puzzle;
        solution = data.solution;
        hintsUsed = 0;

        renderBoard();

        messageElement.textContent = "";
        messageElement.className = "";

        startTimer();
    } catch (error) {
        messageElement.textContent = error.message;
        messageElement.className = "error-message";
    }
}


function renderBoard() {
    boardElement.innerHTML = "";

    for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
        const rowElement = document.createElement("div");
        rowElement.className = "sudoku-row";

        for (let colIndex = 0; colIndex < 9; colIndex += 1) {
            const cell = document.createElement("input");

            cell.type = "text";
            cell.inputMode = "numeric";
            cell.maxLength = 1;
            cell.className = "sudoku-cell";

            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;

            const blockIndex =
                Math.floor(rowIndex / 3) +
                Math.floor(colIndex / 3);

            cell.classList.add(
                blockIndex % 2 === 0
                    ? "block-light"
                    : "block-dark"
            );

            if (puzzle[rowIndex][colIndex] !== 0) {
                cell.value = puzzle[rowIndex][colIndex];
                cell.disabled = true;
                cell.classList.add("prefilled");
            } else {
                cell.addEventListener(
                    "input",
                    handleCellInput
                );
            }

            rowElement.appendChild(cell);
        }

        boardElement.appendChild(rowElement);
    }
}


function handleCellInput(event) {
    const cell = event.target;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    cell.value = cell.value.replace(/[^1-9]/g, "");

    cell.classList.remove("correct", "incorrect");

    if (cell.value === "") {
        return;
    }

    const value = Number(cell.value);

    if (value === solution[row][col]) {
        cell.classList.add("correct");
    } else {
        cell.classList.add("incorrect");
    }

    checkCompletion();
}


function collectBoard() {
    const board = [];

    document.querySelectorAll(".sudoku-row").forEach(
        (rowElement) => {
            const row = [];

            rowElement
                .querySelectorAll(".sudoku-cell")
                .forEach((cell) => {
                    row.push(Number(cell.value) || 0);
                });

            board.push(row);
        }
    );

    return board;
}


async function checkPuzzle() {
    try {
        const response = await fetch("/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                board: collectBoard(),
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Unable to check puzzle."
            );
        }

        clearFeedback();

        if (result.correct) {
            finishGame();
            return;
        }

        result.incorrect.forEach(([row, col]) => {
            const cell = getCell(row, col);

            if (cell && !cell.disabled) {
                cell.classList.add("incorrect");
            }
        });

        messageElement.textContent =
            "Some entries are incorrect.";
        messageElement.className = "error-message";
    } catch (error) {
        messageElement.textContent = error.message;
        messageElement.className = "error-message";
    }
}


async function giveHint() {
    try {
        const response = await fetch("/hint");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to provide a hint."
            );
        }

        if (data.row === undefined) {
            return;
        }

        const cell = getCell(data.row, data.col);

        if (!cell) {
            return;
        }

        cell.value = data.value;
        cell.disabled = true;

        cell.classList.remove(
            "incorrect",
            "correct"
        );

        cell.classList.add("hint");

        hintsUsed += 1;

        checkCompletion();
    } catch (error) {
        messageElement.textContent = error.message;
        messageElement.className = "error-message";
    }
}


function getCell(row, col) {
    return document.querySelector(
        `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
    );
}


function clearFeedback() {
    document
        .querySelectorAll(".sudoku-cell")
        .forEach((cell) => {
            cell.classList.remove(
                "incorrect",
                "correct"
            );
        });
}


function checkCompletion() {
    const cells = document.querySelectorAll(".sudoku-cell");

    for (const cell of cells) {
        if (!cell.disabled && cell.value === "") {
            return;
        }

        if (cell.classList.contains("incorrect")) {
            return;
        }
    }

    finishGame();
}


function finishGame() {
    stopTimer();

    messageElement.textContent =
        "🎉 Congratulations! Puzzle Solved!";

    messageElement.className = "success-message";

    saveScore();
}


function saveScore() {
    const scores = JSON.parse(
        localStorage.getItem("sudokuLeaderboard") || "[]"
    );

    const minutes = String(
        Math.floor(elapsedSeconds / 60)
    ).padStart(2, "0");

    const seconds = String(
        elapsedSeconds % 60
    ).padStart(2, "0");

    const name =
        prompt(
            "Enter your name for the leaderboard:",
            "Player"
        ) || "Player";

    scores.push({
        name,
        time: `${minutes}:${seconds}`,
        seconds: elapsedSeconds,
        difficulty: difficultySelect.value,
        hints: hintsUsed,
    });

    scores.sort(
        (first, second) =>
            first.seconds - second.seconds
    );

    localStorage.setItem(
        "sudokuLeaderboard",
        JSON.stringify(scores.slice(0, 10))
    );

    loadLeaderboard();
}


function loadLeaderboard() {
    const tbody = document.querySelector(
        "#leaderboard tbody"
    );

    tbody.innerHTML = "";

    const scores = JSON.parse(
        localStorage.getItem("sudokuLeaderboard") || "[]"
    );

    scores.forEach((score, index) => {
        const row = document.createElement("tr");

        const values = [
            index + 1,
            score.name,
            score.time,
            score.difficulty,
            score.hints || 0,
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}


function toggleDarkMode() {
    const enabled =
        document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "darkMode",
        String(enabled)
    );
}


newGameButton.addEventListener(
    "click",
    startNewGame
);

difficultySelect.addEventListener(
    "change",
    startNewGame
);

checkButton.addEventListener(
    "click",
    checkPuzzle
);

hintButton.addEventListener(
    "click",
    giveHint
);

darkModeButton.addEventListener(
    "click",
    toggleDarkMode
);


window.addEventListener("load", () => {
    if (
        localStorage.getItem("darkMode") === "true"
    ) {
        document.body.classList.add("dark-mode");
    }

    loadLeaderboard();
    startNewGame();
});