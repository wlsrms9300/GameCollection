'use client'

import Link from 'next/link'

export default function MainPage() {
  const purpleDogGradient = 'bg-gradient-to-r from-purple-600 to-indigo-600'
  const purpleShadow = 'shadow-lg shadow-purple-500/50'
  const purpleButton =
    'bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-3xl transition duration-300 ease-in-out transform hover:scale-105'

  return (
    <div className={`flex min-h-screen items-center justify-center ${purpleDogGradient}`}>
      <div className={`text-center ${purpleShadow} bg-white p-4 rounded-3xl max-w-xs w-full mx-2`}>
        <div className="space-y-2">
          <Link href="/tetris">
            <button className={`${purpleButton} w-full text-sm`}>게임시작</button>
          </Link>
          {/* <Link href="/signin">
            <button className={`${purpleButton} w-full text-sm mt-2`}>로그인</button>
          </Link> */}
        </div>
      </div>
    </div>
  )
}
