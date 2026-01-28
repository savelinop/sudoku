export type SudokuBoard = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

// Crea un tablero vacío
function createEmptyBoard(): SudokuBoard {
  return Array(9).fill(null).map(() => Array(9).fill(null));
}

// Verifica si es seguro colocar un número en una posición
function isSafe(board: SudokuBoard, row: number, col: number, num: number): boolean {
  // Verifica la fila
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false;
    }
  }

  // Verifica la columna
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false;
    }
  }

  // Verifica el cuadro 3x3
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

// Encuentra una celda vacía
function findEmptyCell(board: SudokuBoard): [number, number] | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) {
        return [i, j];
      }
    }
  }
  return null;
}

// Resuelve el Sudoku usando backtracking
function solveSudoku(board: SudokuBoard): boolean {
  const emptyCell = findEmptyCell(board);
  
  if (!emptyCell) {
    return true; // Puzzle resuelto
  }

  const [row, col] = emptyCell;

  // Prueba números del 1 al 9 en orden aleatorio
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

  for (const num of numbers) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;

      if (solveSudoku(board)) {
        return true;
      }

      board[row][col] = null;
    }
  }

  return false;
}

// Genera un tablero de Sudoku completo
function generateCompleteBoard(): SudokuBoard {
  const board = createEmptyBoard();
  solveSudoku(board);
  return board;
}

// Remueve números del tablero según la dificultad
function removeCells(board: SudokuBoard, difficulty: Difficulty): SudokuBoard {
  const puzzle = board.map(row => [...row]);
  
  const cellsToRemove = {
    easy: 40,
    medium: 50,
    hard: 60
  }[difficulty];

  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      removed++;
    }
  }

  return puzzle;
}

// Genera un nuevo puzzle de Sudoku
export function generateSudoku(difficulty: Difficulty = 'medium'): {
  puzzle: SudokuBoard;
  solution: SudokuBoard;
} {
  const solution = generateCompleteBoard();
  const puzzle = removeCells(solution, difficulty);

  return { puzzle, solution };
}

// Valida si el tablero actual es correcto
export function validateBoard(
  board: SudokuBoard,
  initialBoard: SudokuBoard
): { isValid: boolean; invalidCells: Set<string> } {
  const invalidCells = new Set<string>();

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num === null) continue;

      // Temporalmente quita el número para verificar
      const temp = board[row][col];
      board[row][col] = null;

      if (!isSafe(board, row, col, num)) {
        invalidCells.add(`${row}-${col}`);
      }

      board[row][col] = temp;
    }
  }

  return {
    isValid: invalidCells.size === 0,
    invalidCells
  };
}

// Verifica si el puzzle está completo y correcto
export function isPuzzleComplete(board: SudokuBoard, solution: SudokuBoard): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] !== solution[i][j]) {
        return false;
      }
    }
  }
  return true;
}

// Copia profunda de un tablero
export function copyBoard(board: SudokuBoard): SudokuBoard {
  return board.map(row => [...row]);
}
