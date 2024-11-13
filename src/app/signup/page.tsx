'use client'

import { useState } from 'react'
import Link from 'next/link'
import WarmAlert from '@/components/modal/WarmAlert'
import Text from '@/components/form/Text'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 회원가입 로직 구현
    console.log('회원가입 시도:', { username, email, password })
  }

  const purpleDogGradient = 'bg-gradient-to-r from-purple-600 to-indigo-600'
  const purpleShadow = 'shadow-lg shadow-purple-500/50'
  const purpleButton =
    'bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full w-full transition duration-300 ease-in-out transform hover:scale-105'
  const purpleInputStyle =
    'w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500'
  const purpleLink = 'text-purple-600 hover:text-purple-800 text-sm'

  return (
    <div className={`flex min-h-screen items-center justify-center ${purpleDogGradient}`}>
      {/* 알림 모달 */}
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <WarmAlert message={alertMessage} onClose={() => setShowAlert(false)} actionText="확인" />
        </div>
      )}

      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className={`mb-4 rounded-lg bg-white px-8 pb-8 pt-6 ${purpleShadow}`}
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">회원가입</h2>

          <Text id="username">
            <Text.Label>사용자 이름</Text.Label>
            <Text.Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={purpleInputStyle}
            />
          </Text>

          <Text id="email">
            <Text.Label>이메일 주소</Text.Label>
            <Text.Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={purpleInputStyle}
            />
          </Text>

          <Text id="password">
            <Text.Label>비밀번호</Text.Label>
            <Text.Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={purpleInputStyle}
            />
          </Text>

          <Text id="confirmPassword">
            <Text.Label>비밀번호 확인</Text.Label>
            <Text.Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={purpleInputStyle}
            />
          </Text>

          <div className="flex flex-col items-center gap-4 mt-6">
            <button className={`${purpleButton} w-full`} type="submit">
              가입하기
            </button>

            <div className="flex justify-center items-center space-x-2 text-sm">
              <Link href="/signin" className={purpleLink}>
                로그인 화면으로 돌아가기
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
