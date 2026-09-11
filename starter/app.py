from flask import Flask, jsonify, render_template, request # type: ignore

import sudoku_logic
from game_state import CURRENT # type: ignore


app = Flask(__name__)


DIFFICULTY_LEVELS = {
    "easy": 40,
    "medium": 32,
    "hard": 25,
}


@app.route("/")
def index():
    """Render the Sudoku game page."""
    return render_template("index.html")


@app.route("/new")
def new_game():
    """Generate and store a new Sudoku puzzle."""
    difficulty = request.args.get("difficulty", "medium").lower()

    clues = DIFFICULTY_LEVELS.get(difficulty)

    if clues is None:
        return jsonify({"error": "Invalid difficulty level"}), 400

    try:
        puzzle, solution = sudoku_logic.generate_puzzle(clues)
    except ValueError as error:
        return jsonify({"error": str(error)}), 500

    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution

    return jsonify(
        {
            "puzzle": puzzle,
            "solution": solution,
            "difficulty": difficulty,
        }
    )


@app.route("/check", methods=["POST"])
def check_solution():
    """Compare the submitted board with the current solution."""
    if CURRENT["solution"] is None:
        return jsonify({"error": "No game in progress"}), 400

    data = request.get_json(silent=True) or {}
    board = data.get("board")

    if not isinstance(board, list) or len(board) != sudoku_logic.SIZE:
        return jsonify({"error": "Invalid board"}), 400

    if any(
        not isinstance(row, list) or len(row) != sudoku_logic.SIZE
        for row in board
    ):
        return jsonify({"error": "Invalid board"}), 400

    solution = CURRENT["solution"]
    incorrect = []

    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if board[row][col] != solution[row][col]:
                incorrect.append([row, col])

    return jsonify(
        {
            "correct": len(incorrect) == 0,
            "incorrect": incorrect,
        }
    )


@app.route("/hint")
def hint():
    """Reveal one currently empty cell from the solution."""
    puzzle = CURRENT["puzzle"]
    solution = CURRENT["solution"]

    if puzzle is None or solution is None:
        return jsonify({"error": "No active game"}), 400

    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if puzzle[row][col] == sudoku_logic.EMPTY:
                value = solution[row][col]
                puzzle[row][col] = value

                return jsonify(
                    {
                        "row": row,
                        "col": col,
                        "value": value,
                    }
                )

    return jsonify({"message": "Puzzle already complete"})


if __name__ == "__main__":
    app.run(debug=True)