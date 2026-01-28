import { useState, useEffect } from 'react';
import { SudokuBoard } from '@/app/components/sudoku-board';
import { NumberPad } from '@/app/components/number-pad';
import { 
  generateSudoku, 
  validateBoard, 
  isPuzzleComplete, 
  copyBoard,
  type SudokuBoard as SudokuBoardType,
  type Difficulty 
} from '@/app/utils/sudoku-generator';
import { CheckCircle, RotateCw, Lightbulb, Eye, Moon, Sun, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<SudokuBoardType>([]);
  const [solution, setSolution] = useState<SudokuBoardType>([]);
  const [board, setBoard] = useState<SudokuBoardType>([]);
  const [initialBoard, setInitialBoard] = useState<SudokuBoardType>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);

  // Genera un nuevo juego al iniciar o cuando cambia la dificultad
  const startNewGame = (newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(diff);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setBoard(copyBoard(newPuzzle));
    setInitialBoard(copyBoard(newPuzzle));
    setSelectedCell(null);
    setInvalidCells(new Set());
    setIsComplete(false);
    setElapsedTime(0);
    setIsTimerRunning(true);
    if (newDifficulty) {
      setDifficulty(newDifficulty);
    }
    toast.success(`Nuevo juego (${diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Medio' : 'Difícil'})`);
  };

  // Inicializa el juego
  useEffect(() => {
    startNewGame();
  }, []);

  // Maneja el clic en una celda
  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row]?.[col] !== null) {
      return; // No permite seleccionar celdas iniciales
    }
    setSelectedCell({ row, col });
  };

  // Maneja el ingreso de un número
  const handleNumberClick = (num: number | null) => {
    if (!selectedCell || isComplete) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const newBoard = copyBoard(board);
    newBoard[row][col] = num;
    setBoard(newBoard);

    // Valida el tablero
    const { invalidCells: newInvalidCells } = validateBoard(newBoard, initialBoard);
    setInvalidCells(newInvalidCells);

    // Verifica si está completo
    if (isPuzzleComplete(newBoard, solution)) {
      setIsComplete(true);
      setIsTimerRunning(false);
      setCompletionTime(elapsedTime);
      setShowVictoryModal(true);
      toast.success('¡Felicidades! ¡Has completado el Sudoku!', {
        duration: 5000,
      });
    }
  };

  // Maneja el teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || isComplete) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberClick(null);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        let newRow = selectedCell.row;
        let newCol = selectedCell.col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, newRow - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, newRow + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, newCol - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, newCol + 1);
            break;
        }

        setSelectedCell({ row: newRow, col: newCol });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isComplete]);

  // Verifica la solución
  const handleCheckSolution = () => {
    const { isValid, invalidCells: newInvalidCells } = validateBoard(board, initialBoard);
    setInvalidCells(newInvalidCells);

    if (isValid) {
      const complete = isPuzzleComplete(board, solution);
      if (complete) {
        setIsComplete(true);
        toast.success('¡Perfecto! ¡Has resuelto el Sudoku correctamente!');
      } else {
        toast.info('¡Vas bien! Sigue así, aún faltan algunas celdas.');
      }
    } else {
      toast.error('Hay errores en el tablero. Revisa las celdas marcadas en rojo.');
    }
  };

  // Muestra una pista
  const handleShowHint = () => {
    if (isComplete) return;

    // Encuentra una celda vacía
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null && initialBoard[row][col] === null) {
          const newBoard = copyBoard(board);
          newBoard[row][col] = solution[row][col];
          setBoard(newBoard);
          setSelectedCell({ row, col });
          toast.info('¡Pista agregada!');
          
          // Verifica si está completo después de la pista
          if (isPuzzleComplete(newBoard, solution)) {
            setIsComplete(true);
            toast.success('¡Felicidades! ¡Has completado el Sudoku!');
          }
          return;
        }
      }
    }
  };

  // Muestra la solución completa
  const handleShowSolution = () => {
    if (isComplete) return;
    
    setBoard(copyBoard(solution));
    setInvalidCells(new Set());
    setIsComplete(true);
    setSelectedCell(null);
    toast.info('Solución mostrada. ¡No te rindas la próxima vez!');
  };

  // Inicia o detiene el temporizador
  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Actualiza el tiempo transcurrido
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isTimerRunning && elapsedTime !== 0) {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isTimerRunning]);

  return (
    <div className={`min-h-screen w-full flex flex-col overflow-x-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-blue-50 to-indigo-100'
    }`}>
      <Toaster position="bottom-center" />
      
      {/* Botón de modo oscuro */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-3 right-3 p-2 bg-gradient-to-b from-[#ffd54f] to-[#ffc107]
                   border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                   active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                   transition-all z-50"
        style={{
          imageRendering: 'pixelated',
        }}
        title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-[#4a1e4a]" />
        ) : (
          <Moon className="w-5 h-5 text-[#4a1e4a]" />
        )}
      </button>
      
      <div className="flex flex-col items-center gap-3 max-w-[390px] mx-auto w-full p-3">
        {/* Título */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1" style={{ height: '80px' }}>
            <span className="inline-block text-5xl font-black relative"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: isDarkMode ? '#ffffff' : '#ffffff',
                WebkitTextStroke: '6px #000000',
                paintOrder: 'stroke fill',
                transform: 'rotate(-8deg)',
                margin: '0 -2px',
              }}
            >
              S
            </span>
            <span className="inline-block text-5xl font-black relative"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: isDarkMode ? '#ffffff' : '#ffffff',
                WebkitTextStroke: '6px #000000',
                paintOrder: 'stroke fill',
                transform: 'rotate(5deg)',
                margin: '0 -2px',
              }}
            >
              u
            </span>
            <span className="inline-block text-5xl font-black relative"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: isDarkMode ? '#ffffff' : '#ffffff',
                WebkitTextStroke: '6px #000000',
                paintOrder: 'stroke fill',
                transform: 'rotate(-12deg)',
                margin: '0 -2px',
              }}
            >
              D
            </span>
            <span className="inline-block text-5xl font-black relative"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: isDarkMode ? '#ffffff' : '#ffffff',
                WebkitTextStroke: '6px #000000',
                paintOrder: 'stroke fill',
                transform: 'rotate(8deg)',
                margin: '0 -2px',
              }}
            >
              o
            </span>
            <span className="inline-block text-5xl font-black relative"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: isDarkMode ? '#ffffff' : '#ffffff',
                WebkitTextStroke: '6px #000000',
                paintOrder: 'stroke fill',
                transform: 'rotate(-5deg)',
                margin: '0 -2px',
              }}
            >
              K
            </span>
            <span className="inline-block text-5xl font-black relative"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: isDarkMode ? '#ffffff' : '#ffffff',
                WebkitTextStroke: '6px #000000',
                paintOrder: 'stroke fill',
                transform: 'rotate(10deg)',
                margin: '0 -2px',
              }}
            >
              u
            </span>
          </div>
          <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.3em',
            }}
          >
            PON A PRUEBA TU MENTE
          </p>
        </div>

        {/* Controles de dificultad */}
        <div className="flex gap-2 w-full justify-center">
          <button
            onClick={() => startNewGame('easy')}
            className={`px-4 py-2 text-sm font-bold transition-all relative
              border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
              active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
              ${
              difficulty === 'easy'
                ? 'bg-gradient-to-b from-[#5cd65c] to-[#3ba83b] text-white'
                : 'bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] text-[#4a1e4a]'
            }`}
            style={{
              imageRendering: 'pixelated',
            }}
          >
            FÁCIL
          </button>
          <button
            onClick={() => startNewGame('medium')}
            className={`px-4 py-2 text-sm font-bold transition-all relative
              border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
              active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
              ${
              difficulty === 'medium'
                ? 'bg-gradient-to-b from-[#ffd54f] to-[#ffc107] text-white'
                : 'bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] text-[#4a1e4a]'
            }`}
            style={{
              imageRendering: 'pixelated',
            }}
          >
            MEDIO
          </button>
          <button
            onClick={() => startNewGame('hard')}
            className={`px-4 py-2 text-sm font-bold transition-all relative
              border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
              active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
              ${
              difficulty === 'hard'
                ? 'bg-gradient-to-b from-[#ef5350] to-[#e53935] text-white'
                : 'bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] text-[#4a1e4a]'
            }`}
            style={{
              imageRendering: 'pixelated',
            }}
          >
            DIFÍCIL
          </button>
        </div>

        {/* Espacio flexible para centrar el tablero */}
        <div className="flex-1 flex items-center justify-center py-4">
          <SudokuBoard
            board={board}
            initialBoard={initialBoard}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            invalidCells={invalidCells}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Teclado numérico */}
        <NumberPad
          onNumberClick={handleNumberClick}
          disabled={!selectedCell || isComplete}
        />

        {/* Controles de acción */}
        <div className="flex gap-2 w-full pb-2">
          <button
            onClick={() => startNewGame()}
            className="flex-1 px-2 py-2.5 text-xs font-bold transition-all
                     bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] text-[#4a1e4a]
                     border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                     active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                     flex items-center justify-center gap-1.5"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            <RotateCw className="w-4 h-4" />
            NUEVO
          </button>
          <button
            onClick={handleCheckSolution}
            disabled={isComplete}
            className="flex-1 px-2 py-2.5 text-xs font-bold transition-all
                     bg-gradient-to-b from-[#5cd65c] to-[#3ba83b] text-white
                     border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                     active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
                     flex items-center justify-center gap-1.5"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            <CheckCircle className="w-4 h-4" />
            CHECK
          </button>
          <button
            onClick={handleShowHint}
            disabled={isComplete}
            className="flex-1 px-2 py-2.5 text-xs font-bold transition-all
                     bg-gradient-to-b from-[#ba68c8] to-[#9c27b0] text-white
                     border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                     active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
                     flex items-center justify-center gap-1.5"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            <Lightbulb className="w-4 h-4" />
            PISTA
          </button>
          <button
            onClick={handleShowSolution}
            disabled={isComplete}
            className="flex-1 px-2 py-2.5 text-xs font-bold transition-all
                     bg-gradient-to-b from-[#ef5350] to-[#e53935] text-white
                     border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                     active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
                     flex items-center justify-center gap-1.5"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            <Eye className="w-4 h-4" />
            SOL
          </button>
        </div>
        
        {/* Contador de tiempo */}
        <div className="w-full px-4 py-3 bg-gradient-to-b from-[#ffd54f] to-[#ffc107]
                      border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                      flex items-center justify-center gap-2"
          style={{
            imageRendering: 'pixelated',
          }}
        >
          <Timer className="w-5 h-5 text-[#4a1e4a]" />
          <span className="text-lg font-bold text-[#4a1e4a]">
            {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
          </span>
        </div>
      </div>
      
      {/* Modal de Victoria */}
      {showVictoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-[#ffd54f] to-[#ffc107] border-8 border-[#4a1e4a] 
                        shadow-[0_8px_0_0_#4a1e4a] max-w-sm w-full mx-auto
                        animate-in zoom-in duration-500"
            style={{
              imageRendering: 'pixelated',
            }}
          >
            {/* Encabezado */}
            <div className="bg-gradient-to-b from-[#5cd65c] to-[#3ba83b] border-b-8 border-[#4a1e4a] p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-12 h-12 text-white animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center"
                style={{
                  textShadow: '3px 3px 0 #4a1e4a',
                }}
              >
                ¡FELICIDADES!
              </h2>
            </div>
            
            {/* Contenido */}
            <div className="p-6 text-center space-y-4">
              <p className="text-lg font-bold text-[#4a1e4a]">
                Has completado el Sudoku
              </p>
              
              {/* Estadísticas */}
              <div className="bg-white/50 border-4 border-[#4a1e4a] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4a1e4a]">Dificultad:</span>
                  <span className="font-bold text-[#4a1e4a]">
                    {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4a1e4a]">Tiempo:</span>
                  <span className="font-bold text-[#4a1e4a] text-xl">
                    {Math.floor(completionTime / 60)}:{String(completionTime % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              
              {/* Mensaje motivacional */}
              <p className="text-sm text-[#4a1e4a] font-semibold italic">
                "¡Excelente trabajo! Sigue así."
              </p>
              
              {/* Botón */}
              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  startNewGame();
                }}
                className="w-full px-6 py-4 text-lg font-bold transition-all
                         bg-gradient-to-b from-[#4fc3f7] to-[#29b6f6] text-[#4a1e4a]
                         border-4 border-[#4a1e4a] shadow-[0_4px_0_0_#4a1e4a]
                         active:translate-y-1 active:shadow-[0_2px_0_0_#4a1e4a]
                         hover:scale-105"
                style={{
                  imageRendering: 'pixelated',
                }}
              >
                JUGAR DE NUEVO
              </button>
              
              <button
                onClick={() => setShowVictoryModal(false)}
                className="text-[#4a1e4a] underline text-sm font-bold hover:text-[#6d2d6d] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}