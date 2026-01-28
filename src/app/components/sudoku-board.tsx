interface SudokuBoardProps {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  invalidCells: Set<string>;
  isDarkMode?: boolean;
}

export function SudokuBoard({ 
  board, 
  initialBoard, 
  selectedCell, 
  onCellClick,
  invalidCells,
  isDarkMode
}: SudokuBoardProps) {
  const isCellSelected = (row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  const isCellInSameRow = (row: number) => {
    return selectedCell?.row === row;
  };

  const isCellInSameCol = (col: number) => {
    return selectedCell?.col === col;
  };

  const isCellInSameBox = (row: number, col: number) => {
    if (!selectedCell) return false;
    const boxRow = Math.floor(selectedCell.row / 3);
    const boxCol = Math.floor(selectedCell.col / 3);
    const cellBoxRow = Math.floor(row / 3);
    const cellBoxCol = Math.floor(col / 3);
    return boxRow === cellBoxRow && boxCol === cellBoxCol;
  };

  const isInitialCell = (row: number, col: number) => {
    return initialBoard[row][col] !== null;
  };

  const isCellInvalid = (row: number, col: number) => {
    return invalidCells.has(`${row}-${col}`);
  };

  return (
    <div className={`inline-block p-1 rounded-lg shadow-xl ${
      isDarkMode ? 'bg-gray-700' : 'bg-gray-900'
    }`}>
      <div className="grid grid-cols-9 gap-0">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const selected = isCellSelected(rowIndex, colIndex);
            const sameRow = isCellInSameRow(rowIndex);
            const sameCol = isCellInSameCol(colIndex);
            const sameBox = isCellInSameBox(rowIndex, colIndex);
            const isInitial = isInitialCell(rowIndex, colIndex);
            const isInvalid = isCellInvalid(rowIndex, colIndex);
            const highlighted = !selected && (sameRow || sameCol || sameBox);

            const borderClasses = [
              colIndex % 3 === 2 && colIndex !== 8 ? `border-r-2 ${isDarkMode ? 'border-r-white' : 'border-r-gray-900'}` : '',
              rowIndex % 3 === 2 && rowIndex !== 8 ? `border-b-2 ${isDarkMode ? 'border-b-white' : 'border-b-gray-900'}` : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                className={`
                  w-9 h-9 flex items-center justify-center
                  text-base font-medium cursor-pointer
                  transition-colors duration-150
                  active:scale-95 transition-transform
                  ${borderClasses}
                  ${isDarkMode ? 'border border-gray-600' : 'border border-gray-300'}
                  ${selected ? (isDarkMode ? 'bg-blue-600' : 'bg-blue-300') : ''}
                  ${highlighted ? (isDarkMode ? 'bg-blue-900' : 'bg-blue-100') : ''}
                  ${!selected && !highlighted ? (isDarkMode ? 'bg-gray-800 active:bg-gray-700' : 'bg-white active:bg-gray-100') : ''}
                  ${isInitial ? (isDarkMode ? 'text-gray-100 font-semibold' : 'text-black font-semibold') : (isDarkMode ? 'text-blue-300' : 'text-blue-600')}
                  ${isInvalid ? (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600') : ''}
                `}
                disabled={isInitial}
              >
                {cell !== null ? cell : ''}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}