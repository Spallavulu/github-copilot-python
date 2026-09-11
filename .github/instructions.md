# GitHub Copilot Project-Specific Guidance for Flask Sudoku Refactoring

## General Guidelines
- Write clean, modular, and maintainable code. Use functions and classes to organize logic.
- Preserve existing functionality during refactoring. Ensure no regressions in behavior.

## Python and Flask
- Refactor the Sudoku logic to ensure exactly one valid solution for generated puzzles.
- Implement Easy, Medium, and Hard difficulty levels by adjusting the number of prefilled cells.
- Ensure prefilled cells are locked and cannot be edited by the user.
- Add validation and error handling for user inputs and API requests.
- Use pytest to test Sudoku logic, Flask routes, and edge cases.

## HTML, CSS, and JavaScript
- Create a responsive UI that works on both desktop and mobile devices.
- Implement light and dark modes with a toggle button.
- Ensure the UI is accessible and readable, following WCAG guidelines.
- Use event delegation for efficient DOM manipulation.
- Add a timer to track puzzle-solving time.
- Implement a hint feature that fills one valid empty cell.
- Add a Check Puzzle button to validate the current board state.
- Save the Top 10 leaderboard in localStorage with user name, time, hints used, and difficulty.

## Testing and Validation
- Write pytest tests for:
  - Sudoku puzzle generation and validation.
  - Flask routes.
  - Edge cases and error handling.

## Additional Features
- Use localStorage to persist the leaderboard and user preferences such as dark mode.
- Ensure the Sudoku board is interactive, with immediate feedback for invalid entries.
- Display a congratulatory message for completed puzzles, including time and hints used.

## Best Practices
- Keep Sudoku logic separate from Flask routes for maintainability.
- Use CSS variables for theming light and dark modes.
- Follow PEP 8 for Python code and semantic HTML for templates.
