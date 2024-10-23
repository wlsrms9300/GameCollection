'use client'

import { useState } from 'react'
import Link from 'next/link'
import WarmAlert from '@/components/modal/WarmAlert'
import Text from '@/components/form/Text'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAlertMessage(`로그인 시도: 아이디 - ${username}, 비밀번호 - ${password}`)
    setShowAlert(true)
  }
  const purpleDogGradient = 'bg-gradient-to-r from-purple-600 to-indigo-600'
  const purpleShadow = 'shadow-lg shadow-purple-500/50'
  const purpleButton = 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full w-full transition duration-300 ease-in-out transform hover:scale-105'
  const purpleInputStyle = 'w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500'
  const purpleLink = 'text-purple-600 hover:text-purple-800 text-sm'

  return (
    <div className={`flex min-h-screen items-center justify-center ${purpleDogGradient}`}>
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <WarmAlert 
            message={alertMessage} 
            onClose={() => setShowAlert(false)} 
            actionText="확인"
          />
        </div>
      )}
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSubmit} 
          className={`mb-4 rounded-lg bg-white px-8 pb-8 pt-6 ${purpleShadow}`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">로그인</h2>

          <Text id="username">
            <Text.Input
              type="text"
              placeholder="아이디를 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={purpleInputStyle}
            />
            {usernameError && <Text.Error>{usernameError}</Text.Error>}
          </Text>
          
          <Text id="password">
            <Text.Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={purpleInputStyle}
            />
            {passwordError && <Text.Error>{passwordError}</Text.Error>}
          </Text>

          <div className="flex flex-col items-center gap-4 mt-6">
            <button
              className={`${purpleButton} w-full`}
              type="submit"
            >
              로그인
            </button>

            <div className="flex justify-center items-center space-x-2 text-sm">
              <a href="#" className={purpleLink}>아이디 찾기</a>
              <span className="text-gray-300">|</span>
              <a href="#" className={purpleLink}>비밀번호 찾기</a>
              <span className="text-gray-300">|</span>
              <Link href="/signup" className={purpleLink}>회원가입</Link>
            </div>
          </div>

          {/* <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">소셜 로그인</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button type="button" className="focus:outline-none">
                <img src="/path/to/kakao-login.png" alt="카카오 로그인" className="w-12 h-12" />
              </button>
              <button type="button" className="focus:outline-none">
                <img src="/path/to/naver-login.png" alt="네이버 로그인" className="w-12 h-12" />
              </button>
            </div>
          </div> */}
        </form>
      </div>
    </div>
  )
}
