import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    """Return a deep copy of a Sudoku board."""
    return copy.deepcopy(board)


def create_empty_board():
    """Create an empty 9x9 Sudoku board."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    """Check whether a number can be placed in a cell."""
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3

    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False

    return True


def fill_board(board):
    """Fill the board with a valid complete Sudoku solution."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                numbers = list(range(1, SIZE + 1))
                random.shuffle(numbers)

                for num in numbers:
                    if is_safe(board, row, col, num):
                        board[row][col] = num

                        if fill_board(board):
                            return True

                        board[row][col] = EMPTY

                return False

    return True


def count_solutions(board):
    """
    Count valid solutions for a Sudoku board.

    Stops as soon as more than one solution is found because
    the application only needs to determine whether the puzzle
    has exactly one solution.
    """
    solution_count = 0

    def solve():
        nonlocal solution_count

        if solution_count > 1:
            return

        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(board, row, col, num):
                            board[row][col] = num
                            solve()
                            board[row][col] = EMPTY

                            if solution_count > 1:
                                return

                    return

        solution_count += 1

    solve()
    return solution_count


def remove_cells(board, clues):
    """
    Remove cells while preserving exactly one valid solution.

    The requested clue count determines the difficulty level.
    """
    filled_positions = [
        (row, col)
        for row in range(SIZE)
        for col in range(SIZE)
        if board[row][col] != EMPTY
    ]

    random.shuffle(filled_positions)

    cells_to_remove = SIZE * SIZE - clues

    for row, col in filled_positions:
        if cells_to_remove <= 0:
            break

        original_value = board[row][col]
        board[row][col] = EMPTY

        if count_solutions(deep_copy(board)) != 1:
            board[row][col] = original_value
        else:
            cells_to_remove -= 1

    if cells_to_remove > 0:
        raise ValueError(
            "Unable to generate a puzzle with the requested number of clues."
        )


def generate_puzzle(clues=35):
    """Generate a Sudoku puzzle with the requested number of clues."""
    board = create_empty_board()

    fill_board(board)

    solution = deep_copy(board)

    remove_cells(board, clues)

    puzzle = deep_copy(board)

    return puzzle, solution