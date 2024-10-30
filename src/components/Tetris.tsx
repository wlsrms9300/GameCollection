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
  const [gameStarted, setGameStarted] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [playMoveSound] = useSound('/sounds/move.mp3', { volume: 0.5 })

  /**
   * 새로운 테트리스 피스를 생성하는 함수
   * @returns {Object} 새로운 테트리스 피스 객체 (모양, 색상, 위치 정보 포함)
   */
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

  /**
   * 피스와 보드의 충돌을 검사하는 함수
   * @param {Object} piece - 검사할 테트리스 피스
   * @param {Array} board - 현재 게임 보드 상태
   * @returns {boolean} 충돌 여부
   */
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

  /**
   * 피스를 게임 보드에 병합하는 함수
   * @param {Object} piece - 병합할 테트리스 피스
   * @param {Array} board - 현재 게임 보드
   * @returns {Array} 병합된 새로운 게임 보드
   */
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

  /**
   * 완성된 라인을 제거하고 점수를 업데이트하는 함수
   * @param {Array} board - 현재 게임 보드
   * @returns {Array} 라인이 제거된 새로운 게임 보드
   */
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
    
    // 점수 업데이트: 깨진 라인의 수 x 100
    const newScore = score + linesCleared.length * 100
    setScore(newScore)
    
    // 레벨 업 로직
    if (Math.floor(newScore / 3000) > level - 1) {
      setLevel(Math.floor(newScore / 3000) + 1)
    }
    
    setClearedLines(linesCleared)
    return newBoard
  }, [score, level])

  /**
   * 피스를 아래로 이동시키는 함수
   * 바닥에 닿으면 새로운 피스를 생성하고 게임 오버를 체크
   */
  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver) return
    const newPiece = { ...currentPiece, y: currentPiece.y + 1 }
    if (isCollision(newPiece, board)) {
      let newBoard = mergePieceToBoard(currentPiece, board)
      newBoard = clearLines(newBoard)
      setBoard(newBoard)
      
      // 게임 오버 체크
      if (currentPiece.y <= 0) {
        setGameOver(true)
        setShowModal(true)
        setGameStarted(false)
        return
      }
      
      // 다음 피스로 현재 피스 설정
      setCurrentPiece({
        ...nextPieces[0],
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2),
        y: 0
      })
      
      // 다음 피스 배열 업데이트
      setNextPieces(prev => {
        const newNextPieces = [...prev.slice(1)]
        while (newNextPieces.length < 3) {
          newNextPieces.push(createNewPiece())
        }
        return newNextPieces
      })
    } else {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, nextPieces, board, isCollision, mergePieceToBoard, clearLines, createNewPiece, gameOver])

  /**
   * 피스를 좌우로 이동시키는 함수
   * @param {number} direction - 이동 방향 (-1: 왼쪽, 1: 오른쪽)
   */
  const moveHorizontally = useCallback((direction: number) => {
    if (!currentPiece || gameOver) return
    const newPiece = { ...currentPiece, x: currentPiece.x + direction }
    if (!isCollision(newPiece, board)) {
      setCurrentPiece(newPiece)
      playMoveSound()
    }
  }, [currentPiece, board, isCollision, gameOver, playMoveSound])

  /**
   * 피스를 회전시키는 함수
   */
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

  /**
   * 피스를 즉시 바닥으로 떨어뜨리는 함수
   */
  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver) return
    let newPiece = { ...currentPiece }
    while (!isCollision({ ...newPiece, y: newPiece.y + 1 }, board)) {
      newPiece.y += 1
    }
    let newBoard = mergePieceToBoard(newPiece, board)
    newBoard = clearLines(newBoard)
    setBoard(newBoard)
    
    // 다음 피스로 현재 피스 설정
    setCurrentPiece({
      ...nextPieces[0],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2),
      y: 0
    })
    
    // 다음 피스 배열 업데이트
    setNextPieces(prev => {
      const newNextPieces = [...prev.slice(1)]
      while (newNextPieces.length < 3) {
        newNextPieces.push(createNewPiece())
      }
      return newNextPieces
    })
  }, [currentPiece, board, nextPieces, isCollision, mergePieceToBoard, clearLines, createNewPiece, gameOver])

  /**
   * 빈 게임 보드를 생성하는 함수
   * @returns {Array} 초기화된 게임 보드
   */
  const createEmptyBoard = (): TetrisBoard => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  }

  /**
   * 게임을 초기 상태로 리셋하는 함수
   */
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

  /**
   * 게임을 시작하는 함수
   * 초기 피스와 다음 피스들을 설정
   */
  const startGame = () => {
    setGameStarted(true)
    resetGame()
    const initialNextPieces = [
      createNewPiece(),
      createNewPiece(),
      createNewPiece()
    ]
    setNextPieces(initialNextPieces)
    setCurrentPiece({
      ...createNewPiece(),
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0
    })
  }

  /**
   * 게임을 종료하고 메인 화면으로 이동하는 함수
   */
  const exitGame = () => {
    window.location.href = '/' // 메인 화면의 경로로 설정
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
    if (!currentPiece && !gameOver && gameStarted) {
      if (nextPieces.length === 0) {
        // 초기 상태일 경우 새로운 피스들 생성
        const initialNextPieces = [
          createNewPiece(),
          createNewPiece(),
          createNewPiece()
        ]
        setNextPieces(initialNextPieces)
        setCurrentPiece({
          ...createNewPiece(),
          x: Math.floor(BOARD_WIDTH / 2) - 1,
          y: 0
        })
      } else {
        // 다음 피스로 현재 피스 설정
        setCurrentPiece({
          ...nextPieces[0],
          x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPieces[0].shape[0].length / 2),
          y: 0
        })
        // 다음 피스 배열 업데이트
        setNextPieces(prev => {
          const newNextPieces = [...prev.slice(1)]
          while (newNextPieces.length < 3) {
            newNextPieces.push(createNewPiece())
          }
          return newNextPieces
        })
      }
    }
  }, [currentPiece, createNewPiece, isCollision, board, gameOver, gameStarted, nextPieces])

  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    const speed = Math.max(100, 1000 - (level - 1) * 100) // 최고 속도는 100ms
    intervalRef.current = setInterval(moveDown, speed)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [moveDown, level, gameStarted, gameOver])

  // useEffect 추가
  useEffect(() => {
    const handleStartGameKeyPress = (event: KeyboardEvent) => {
      if (!gameStarted && event.key === 'Enter') {
        startGame();
      }
    };

    window.addEventListener('keydown', handleStartGameKeyPress);
    return () => {
      window.removeEventListener('keydown', handleStartGameKeyPress);
    };
  }, [gameStarted]);

  /**
   * 게임 보드를 렌더링하는 함수
   * @returns {JSX.Element} 렌더링된 게임 보드
   */
  const renderBoard = () => {
    if (!gameStarted) {
      return Array(BOARD_HEIGHT).fill(null).map((_, i) => (
        <div key={i} className="flex">
          {Array(BOARD_WIDTH).fill(null).map((_, j) => (
            <div
              key={`${i}-${j}`}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-900 border border-gray-700"
            />
          ))}
        </div>
      ))
    }

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

  /**
   * 다음 피스 미리보기를 렌더링하는 함수
   * @returns {JSX.Element[]} 렌더링된 미리보기 블록들
   */
  const renderNextPieces = () => {
    // 게임이 시작되지 않았을 때 빈 미리보기 블록 생성
    if (!gameStarted) {
      return Array(3).fill(null).map((_, index) => {
        const previewSize = 4;
        return (
          <div key={index} className="mb-2 sm:mb-3 md:mb-4 border-2 border-gray-300 p-1 sm:p-2 bg-gray-900">
            {Array.from({ length: previewSize }).map((_, row) => (
              <div key={row} className="flex">
                {Array.from({ length: previewSize }).map((_, col) => (
                  <div
                    key={`next-${index}-${row}-${col}`}
                    className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border border-gray-700 bg-gray-900"
                  />
                ))}
              </div>
            ))}
          </div>
        );
      });
    }

    // 게임 중일 때의 미리보기 블록
    return nextPieces.map((piece, index) => {
      const pieceHeight = piece.shape.length;
      const pieceWidth = piece.shape[0].length;
      const previewSize = 4;
      const offsetY = Math.floor((previewSize - pieceHeight) / 2);
      const offsetX = Math.floor((previewSize - pieceWidth) / 2);

      return (
        <div key={index} className="mb-2 sm:mb-3 md:mb-4 border-2 border-gray-300 p-1 sm:p-2 bg-gray-900">
          {Array.from({ length: previewSize }).map((_, row) => (
            <div key={row} className="flex">
              {Array.from({ length: previewSize }).map((_, col) => {
                const pieceRow = row - offsetY;
                const pieceCol = col - offsetX;
                const isActive = 
                  pieceRow >= 0 && 
                  pieceRow < pieceHeight && 
                  pieceCol >= 0 && 
                  pieceCol < pieceWidth && 
                  piece.shape[pieceRow][pieceCol];
                
                return (
                  <div
                    key={`next-${index}-${row}-${col}`}
                    className={`
                      w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 
                      border border-gray-700 
                      ${isActive ? piece.color : 'bg-gray-900'}
                    `}
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
          <div className="border-4 border-gray-700 relative">
            {renderBoard()}
            {!gameStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button
                  onClick={startGame}
                  className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105"
                >
                  게임 시작 (Enter)
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-700 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg">
          {renderNextPieces()}
        </div>
      </div>
      <div className="flex justify-center p-4 space-x-4">
        <button
          onClick={exitGame}
          className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          나가기
        </button>
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
