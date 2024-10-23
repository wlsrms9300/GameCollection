'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import WarmAlert from '@/components/modal/WarmAlert'
import useSound from 'use-sound'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

type TetrisBoard = (string | null)[][]

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
}

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<TetrisBoard>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  )
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
  const [nextPieces, setNextPieces] = useState<Array<{
    shape: number[][];
    color: string;
  }>>([])
  const [showModal, setShowModal] = useState(false)
  const [clearedLines, setClearedLines] = useState<number[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [playMoveSound] = useSound('/sounds/move.mp3', { volume: 0.5 })

  const createNewPiece = useCallback(() => {
    const tetrominos = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[]
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)]
    const newPiece = TETROMINOS[randTetromino]
    return {
      shape: newPiece.shape,
      color: newPiece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2),
      y: 0
    }
  }, [])

  const isCollision = useCallback((piece: typeof currentPiece, board: TetrisBoard) => {
    if (!piece) return false
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          if (
            piece.y + y >= BOARD_HEIGHT ||
            piece.x + x < 0 ||
            piece.x + x >= BOARD_WIDTH ||
            (board[piece.y + y] && board[piece.y + y][piece.x + x] !== null)
          ) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  const mergePieceToBoard = useCallback((piece: typeof currentPiece, board: TetrisBoard) => {
    if (!piece) return board
    const newBoard = board.map(row => [...row])
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          newBoard[y + piece.y][x + piece.x] = piece.color
        }
      })
    })
    return newBoard
  }, [])

  const clearLines = useCallback((board: TetrisBoard) => {
    let linesCleared: number[] = []
    const newBoard = board.filter((row, index) => {
      if (row.every(cell => cell !== null)) {
        linesCleared.push(index)
        return false
      }
      return true
    })
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }
    
    const newScore = score + linesCleared.length * 100
    setScore(newScore)
    
    // 레벨 업 로직
    if (Math.floor(newScore / 3000) > level - 1) {
      setLevel(Math.floor(newScore / 3000) + 1)
    }
    
    setClearedLines(linesCleared)
    return newBoard
  }, [score, level])

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver) return
    const newPiece = { ...currentPiece, y: currentPiece.y + 1 }
    if (isCollision(newPiece, board)) {
      let newBoard = mergePieceToBoard(currentPiece, board)
      newBoard = clearLines(newBoard)
      setBoard(newBoard)
      
      // 게임 오버 체크 추가
      if (currentPiece.y <= 0) {
        setGameOver(true)
        setShowModal(true)
        return
      }
      
      setCurrentPiece({
        ...nextPieces[0],
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2),
        y: 0
      })
      setNextPieces(prev => {
        const newNextPieces = [...prev.slice(1), createNewPiece()]
        return newNextPieces
      })
    } else {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, nextPieces, board, isCollision, mergePieceToBoard, clearLines, createNewPiece, gameOver])

  const moveHorizontally = useCallback((direction: number) => {
    if (!currentPiece || gameOver) return
    const newPiece = { ...currentPiece, x: currentPiece.x + direction }
    if (!isCollision(newPiece, board)) {
      setCurrentPiece(newPiece)
      playMoveSound()
    }
  }, [currentPiece, board, isCollision, gameOver, playMoveSound])

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver) return
    const rotatedShape = currentPiece.shape[0].map((_, index) =>
      currentPiece.shape.map(row => row[index]).reverse()
    )
    const newPiece = { ...currentPiece, shape: rotatedShape }
    if (!isCollision(newPiece, board)) {
      setCurrentPiece(newPiece)
      playMoveSound()
    }
  }, [currentPiece, board, isCollision, gameOver, playMoveSound])

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver) return
    let newPiece = { ...currentPiece }
    while (!isCollision({ ...newPiece, y: newPiece.y + 1 }, board)) {
      newPiece.y += 1
    }
    let newBoard = mergePieceToBoard(newPiece, board)
    newBoard = clearLines(newBoard)
    setBoard(newBoard)
    setCurrentPiece(createNewPiece())
  }, [currentPiece, board, isCollision, mergePieceToBoard, clearLines, createNewPiece, gameOver])

  const createEmptyBoard = (): TetrisBoard => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPiece(null)
    setNextPieces([])
    setScore(0)
    setLevel(1)
    setGameOver(false)
    setShowModal(false)
    // 게임 시작 로직을 여기에 추가
  }

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          moveHorizontally(-1)
          break
        case 'ArrowRight':
          moveHorizontally(1)
          break
        case 'ArrowDown':
          moveDown()
          break
        case 'ArrowUp':
          rotate()
          break
        case ' ': // 스페이스바
          dropPiece()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [moveHorizontally, moveDown, rotate, dropPiece])

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      const newPiece = createNewPiece()
      const newNextPieces = [createNewPiece(), createNewPiece(), createNewPiece()]
      if (isCollision({...newPiece, y: 0}, board)) {
        setGameOver(true)
        setShowModal(true)
      } else {
        setCurrentPiece(newPiece)
        setNextPieces(newNextPieces)
      }
    }
  }, [currentPiece, createNewPiece, isCollision, board, gameOver])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    const speed = Math.max(100, 1000 - (level - 1) * 100) // 최소 속도는 100ms
    intervalRef.current = setInterval(moveDown, speed)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [moveDown, level])

  const renderBoard = () => {
    const boardWithPiece = currentPiece
      ? mergePieceToBoard(currentPiece, board)
      : board

    return boardWithPiece.map((row, i) => (
      <div key={i} className="flex">
        {row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`
              w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10
              border border-gray-700 relative
              ${cell ? '' : 'bg-gray-900'}
              ${clearedLines.includes(i) ? 'animate-disappear' : ''}
            `}
          >
            {cell && (
              <div className={`
                absolute inset-0.5 rounded-sm
                ${cell}
                shadow-inner
              `}>
                <div className="absolute inset-0 bg-white opacity-30 rounded-sm"></div>
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-black opacity-20 rounded-sm"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    ))
  }

  const renderNextPieces = () => {
    const previewWidth = 4; // 미리보기 너비를 4로 고정
    const previewHeight = 2; // 미리보기 높이를 2로 고정

    return nextPieces.map((piece, index) => {
      const pieceHeight = piece.shape.length;
      const pieceWidth = Math.max(...piece.shape.map(row => row.length));
      const horizontalPadding = Math.max(0, previewWidth - pieceWidth);
      const verticalPadding = Math.max(0, previewHeight - pieceHeight);

      return (
        <div key={index} className="mb-2 sm:mb-3 md:mb-4 border-2 border-gray-300 p-1 sm:p-2 bg-white">
          {Array.from({ length: previewHeight }).map((_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: previewWidth }).map((_, col) => {
                const pieceRow = row - Math.floor(verticalPadding / 2);
                const pieceCol = col - Math.floor(horizontalPadding / 2);
                const isActive = 
                  pieceRow >= 0 && pieceRow < pieceHeight &&
                  pieceCol >= 0 && pieceCol < pieceWidth &&
                  piece.shape[pieceRow][pieceCol];
                return (
                  <div
                    key={`next-${index}-${row}-${col}`}
                    className={`w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 border border-gray-300 ${
                      isActive ? piece.color : 'bg-white'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800">
      <div className="flex flex-col md:flex-row items-start p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 flex-grow">
        <div className="mb-6 md:mb-0 md:mr-6 lg:mr-8 xl:mr-12">
          <div className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-4 md:mb-6 text-white">Score: {score}</div>
          <div className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-4 md:mb-6 text-white">Level: {level}</div>
          <div className="border-4 border-gray-700">
            {renderBoard()}
          </div>
          {gameOver && (
            <div className="text-xl sm:text-2xl md:text-3xl mt-2 sm:mt-4 md:mt-6 text-white">Game Over!</div>
          )}
        </div>
        <div className="bg-gray-700 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg">
          {renderNextPieces()}
        </div>
      </div>
      {showModal && (
        <WarmAlert
          message={`최종 점수: ${score}점`}
          onClose={() => {
            setShowModal(false)
            resetGame()
          }}
          actionText="다시 시작"
        />
      )}
    </div>
  )
}

export default Tetris
