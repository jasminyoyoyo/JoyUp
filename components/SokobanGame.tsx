import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, ChevronRight, AlertTriangle, RotateCcw } from 'lucide-react';

// Tile types
type Tile = ' ' | '#' | '$' | '.' | '@' | '*' | '+';

const SokobanGame: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  
  // Re-ordering levels for difficulty curve
  const SORTED_LEVELS = [
    // Level 1: Super Easy
    [
        "#####",
        "#@$.#",
        "#####"
    ],
    // Level 2: Classic Easy
    [
        "  ##### ",
        "###   # ",
        "#.@$  # ",
        "###  .# ",
        "#.##$ # ",
        "# # . ##",
        "#$  $$.#",
        "#   .  #",
        "########"
    ],
    // Level 3: Moderate
    [
        "########",
        "#      #",
        "# .  $ #",
        "# .$@$.#",
        "# $  . #",
        "#      #",
        "########"
    ]
  ];

  const [board, setBoard] = useState<Tile[][]>([]);
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [deadlocked, setDeadlocked] = useState(false);

  // Initialize level
  const loadLevel = useCallback((index: number) => {
    // Ensure index is positive
    const safeIndex = Math.abs(index) % SORTED_LEVELS.length;
    const rawLevel = SORTED_LEVELS[safeIndex];
    const newBoard: Tile[][] = rawLevel.map(row => row.split('') as Tile[]);
    
    let pRow = 0;
    let pCol = 0;

    // Find player
    newBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === '@' || cell === '+') {
          pRow = r;
          pCol = c;
        }
      });
    });

    setBoard(newBoard);
    setPlayerPos({ r: pRow, c: pCol });
    setMoves(0);
    setWon(false);
    setDeadlocked(false);
  }, []);

  useEffect(() => {
    loadLevel(levelIndex);
  }, [levelIndex, loadLevel]);

  // Check if a specific cell is a solid blocking wall
  const isWall = (b: Tile[][], r: number, c: number) => {
    if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return true; // Edge is wall
    return b[r][c] === '#';
  };

  // Logic to detect if any box is permanently stuck in a corner
  const checkDeadlock = (currentBoard: Tile[][]) => {
    let isStuck = false;

    for (let r = 0; r < currentBoard.length; r++) {
      for (let c = 0; c < currentBoard[r].length; c++) {
        const cell = currentBoard[r][c];
        
        // Only check boxes that are NOT on a target ($). 
        // Boxes on targets (*) are fine, unless we want to be strict about wrong targets, 
        // but for simple sokoban, usually being on any target is safe-ish. 
        // We only fail if a box is on the FLOOR and stuck.
        if (cell === '$') {
           // Check 4 corners formed by walls
           const up = isWall(currentBoard, r - 1, c);
           const down = isWall(currentBoard, r + 1, c);
           const left = isWall(currentBoard, r, c - 1);
           const right = isWall(currentBoard, r, c + 1);

           // Top-Left Corner
           if (up && left) isStuck = true;
           // Top-Right Corner
           if (up && right) isStuck = true;
           // Bottom-Left Corner
           if (down && left) isStuck = true;
           // Bottom-Right Corner
           if (down && right) isStuck = true;
           
           // Simple Deadlock: Trapped between two opposite walls vertically or horizontally? 
           // No, that's just a corridor. 
           // We are looking for "Corners" where you can't push it out.
        }
      }
    }

    if (isStuck) {
      setDeadlocked(true);
    }
  };

  const move = (dr: number, dc: number) => {
    if (won || deadlocked) return;

    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;
    
    // Safety check boundaries
    if (newR < 0 || newR >= board.length || newC < 0 || newC >= board[0].length) return;
    
    const targetCell = board[newR][newC];

    // Check Wall
    if (targetCell === '#') return;

    let success = false;
    const newBoard = board.map(row => [...row]);

    // Check Empty or Target (Walk)
    if (targetCell === ' ' || targetCell === '.') {
      success = true;
    } 
    // Check Box (Push)
    else if (targetCell === '$' || targetCell === '*') {
      const boxNextR = newR + dr;
      const boxNextC = newC + dc;
      
      // Safety check box boundaries
      if (boxNextR < 0 || boxNextR >= board.length || boxNextC < 0 || boxNextC >= board[0].length) return;

      const boxNextCell = board[boxNextR][boxNextC];

      // Can push box?
      if (boxNextCell === ' ' || boxNextCell === '.') {
        // Move box
        newBoard[boxNextR][boxNextC] = boxNextCell === '.' ? '*' : '$';
        // Clear box from current position (will be handled by player move below)
        success = true;
      }
    }

    if (success) {
      // Update Player Old Pos
      const oldCell = newBoard[playerPos.r][playerPos.c];
      newBoard[playerPos.r][playerPos.c] = oldCell === '+' ? '.' : ' ';

      // Update Player New Pos
      const cellAtNewPos = newBoard[newR][newC]; // This is the cell BEFORE player moves in (but after box moved out)
      const originalTargetCell = board[newR][newC];
      
      const isTargetUnderneath = originalTargetCell === '.' || originalTargetCell === '*' || originalTargetCell === '+';
      newBoard[newR][newC] = isTargetUnderneath ? '+' : '@';

      setBoard(newBoard);
      setPlayerPos({ r: newR, c: newC });
      setMoves(m => m + 1);
      
      // Check game states
      checkWin(newBoard);
      if (!won) {
         checkDeadlock(newBoard);
      }
    }
  };

  const checkWin = (currentBoard: Tile[][]) => {
    // Win if no '$' exist (all boxes are '*' i.e., on targets)
    let hasUnsolvedBox = false;
    currentBoard.forEach(row => {
      row.forEach(cell => {
        if (cell === '$') hasUnsolvedBox = true;
      });
    });

    if (!hasUnsolvedBox) {
      setWon(true);
      setDeadlocked(false);
    }
  };

  const nextLevel = () => {
    setLevelIndex(prev => prev + 1);
  };

  const renderCell = (cell: Tile, r: number, c: number) => {
    let content = null;
    let bgClass = "bg-amber-50/50"; // Floor

    switch (cell) {
      case '#':
        bgClass = "bg-stone-600 shadow-inner border-t-[1px] border-stone-500 rounded-sm"; // Wall
        break;
      case '.':
        content = <div className="w-[30%] h-[30%] bg-red-300 rounded-full opacity-50"></div>; // Target
        break;
      case '$':
        content = <div className="w-[85%] h-[85%] bg-amber-600 rounded-sm flex items-center justify-center text-white border-b-2 border-r-2 border-amber-800 shadow-md text-[min(4vmin,1.5rem)]">📦</div>; // Box
        break;
      case '*':
        bgClass = "bg-green-100/50";
        content = <div className="w-[85%] h-[85%] bg-green-500 rounded-sm flex items-center justify-center text-white border-b-2 border-r-2 border-green-700 shadow-md glow text-[min(4vmin,1.5rem)]">✨</div>; // Box on Target
        break;
      case '@':
        content = <div className="w-[90%] h-[90%] flex items-center justify-center text-[min(5vmin,1.8rem)] animate-bounce-slight leading-none">🐼</div>; // Player
        break;
      case '+':
        content = <div className="w-[90%] h-[90%] flex items-center justify-center text-[min(5vmin,1.8rem)] animate-bounce-slight relative z-10 leading-none">🐼</div>; // Player on Target
        bgClass = "bg-red-50";
        break;
    }

    return (
      <div key={`${r}-${c}`} className={`w-full h-full aspect-square flex items-center justify-center relative ${bgClass}`}>
        {content}
        {cell === '+' && <div className="absolute w-[30%] h-[30%] bg-red-400 rounded-full -z-0 opacity-50"></div>}
      </div>
    );
  };

  const cols = board[0]?.length || 1;
  const rows = board.length || 1;

  return (
    <div className="h-full flex flex-col items-center justify-between p-4 bg-orange-50/50 overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-2 shrink-0">
        <div>
            <h2 className="font-bold text-stone-700 flex items-center gap-2">
                推箱子 <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Lv.{levelIndex + 1}</span>
            </h2>
            <p className="text-xs text-gray-400">步数: {moves}</p>
        </div>
        <button onClick={() => loadLevel(levelIndex)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:rotate-180 transition-all" title="重新开始本关">
            <RefreshCw size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Game Board Container - Adaptive */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-2 relative">
        
        {/* Win Modal */}
        {won && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in rounded-xl">
                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-[80%] border-4 border-yellow-200">
                    <Trophy size={48} className="text-yellow-400 mb-4 animate-bounce" />
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">太棒了!</h3>
                    <p className="text-gray-500 mb-6">你完成了第 {levelIndex + 1} 关。</p>
                    <button 
                        onClick={nextLevel}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform"
                    >
                        下一关 <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Deadlock (Lose) Modal */}
        {deadlocked && !won && (
            <div className="absolute inset-0 z-20 bg-stone-800/60 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in rounded-xl">
                <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-[80%] border-4 border-stone-200">
                    <AlertTriangle size={48} className="text-orange-400 mb-3 animate-pulse" />
                    <h3 className="text-xl font-bold text-stone-800 mb-2">死胡同!</h3>
                    <p className="text-gray-500 text-sm mb-6">箱子被卡住了，已经无法移动。</p>
                    <button 
                        onClick={() => loadLevel(levelIndex)}
                        className="flex items-center gap-2 px-6 py-3 bg-stone-600 text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform hover:bg-stone-700"
                    >
                        <RotateCcw size={18} /> 重新开始
                    </button>
                </div>
            </div>
        )}
        
        {/* Aspect Ratio Box that fits within the flex container */}
        <div 
            className="bg-stone-700 p-2 rounded-lg shadow-2xl grid gap-0.5"
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                aspectRatio: `${cols}/${rows}`,
                maxHeight: '100%',
                maxWidth: '100%',
                // Use a heuristic to ensure it doesn't blow up on very wide screens or very tall screens
                width: rows > cols ? 'auto' : '100%',
                height: rows > cols ? '100%' : 'auto'
            }}
        >
            {board.map((row, r) => (
                row.map((cell, c) => renderCell(cell, r, c))
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-[240px] pb-2 shrink-0">
        <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button 
                className="h-14 sm:h-16 bg-white rounded-xl shadow-[0_4px_0_0_rgb(229,231,235)] active:shadow-none active:translate-y-[4px] border border-gray-100 flex items-center justify-center text-stone-600 transition-all hover:bg-stone-50"
                onClick={() => move(-1, 0)}
                disabled={won || deadlocked}
            >
                <ArrowUp size={28} />
            </button>
            <div></div>
            
            <button 
                className="h-14 sm:h-16 bg-white rounded-xl shadow-[0_4px_0_0_rgb(229,231,235)] active:shadow-none active:translate-y-[4px] border border-gray-100 flex items-center justify-center text-stone-600 transition-all hover:bg-stone-50"
                onClick={() => move(0, -1)}
                disabled={won || deadlocked}
            >
                <ArrowLeft size={28} />
            </button>
            <button 
                className="h-14 sm:h-16 bg-white rounded-xl shadow-[0_4px_0_0_rgb(229,231,235)] active:shadow-none active:translate-y-[4px] border border-gray-100 flex items-center justify-center text-stone-600 transition-all hover:bg-stone-50"
                onClick={() => move(1, 0)}
                disabled={won || deadlocked}
            >
                <ArrowDown size={28} />
            </button>
            <button 
                className="h-14 sm:h-16 bg-white rounded-xl shadow-[0_4px_0_0_rgb(229,231,235)] active:shadow-none active:translate-y-[4px] border border-gray-100 flex items-center justify-center text-stone-600 transition-all hover:bg-stone-50"
                onClick={() => move(0, 1)}
                disabled={won || deadlocked}
            >
                <ArrowRight size={28} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SokobanGame;