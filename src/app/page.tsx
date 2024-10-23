'use client'

import Link from 'next/link'
import { useState } from 'react'
import Tetris from '../components/Tetris'

export default function MainPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const purpleDogGradient = 'bg-gradient-to-r from-purple-600 to-indigo-600'
  const purpleShadow = 'shadow-lg shadow-purple-500/50'
  const purpleButton = 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105'

  if (gameStarted) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${purpleDogGradient}`}>
        <Tetris />
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen items-center justify-center ${purpleDogGradient}`}>
      <div className={`text-center ${purpleShadow} bg-white p-4 rounded-lg max-w-xs w-full mx-2`}>
        <div className="space-y-2">
          <button 
            className={`${purpleButton} w-full text-sm`}
            onClick={() => setGameStarted(true)}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
