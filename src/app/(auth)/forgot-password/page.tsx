'use client'
import { clientFetch } from '@/lib/clientFetch'

import FormPage from '@/components/krds/FormPage'
import { StatusMessage } from '@/components/krds/PageHeading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { Field, Label } from '@/shared/fieldset'
import Input from '@/shared/Input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Page = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [id, setId] = useState('')
  const [nickname, setNickname] = useState('')
  const [hintQuestion, setHintQuestion] = useState('')
  const [hintAnswer, setHintAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFindHint = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await clientFetch(
        `${baseUrl}/password-recovery/challenges`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({id,nickname}) }
      )

      if (response.ok) {
        const data = await response.json()
        setHintQuestion(data.hintQuestion)
        setStep(2)
      } else {
        const result = await response.json()
        setError(result.message || '정보를 찾을 수 없습니다.')
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''

      // Step 1: Verify hint answer
      const verifyResponse = await clientFetch(`${baseUrl}/password-recovery/verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          nickname,
          hintAnswer,
        }),
      })

      if (!verifyResponse.ok) {
        const result = await verifyResponse.json()
        setError(result.message || '힌트 답변이 일치하지 않거나 검증에 실패했습니다.')
        setIsLoading(false)
        return
      }

      const verifyData = await verifyResponse.json()

      if (!verifyData.verified) {
        setError('검증에 실패했습니다.')
        setIsLoading(false)
        return
      }

      const resetToken = verifyData.resetToken

      // Step 2: Reset password using token
      const resetResponse = await clientFetch(`${baseUrl}/password-resets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      })

      if (resetResponse.ok) {
        setStep(3)
      } else {
        const result = await resetResponse.json()
        setError(result.message || '비밀번호 재설정에 실패했습니다.')
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormPage title="비밀번호 복구" description="가입할 때 등록한 정보로 비밀번호를 다시 설정합니다.">
      <div className="space-y-6">
        <ol className="kr-steps" aria-label="비밀번호 복구 단계">
          {['계정 확인', '답변 확인·재설정', '완료'].map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? 'step' : undefined}>
              <span>{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        {step === 3 && (
          <div className="space-y-5">
            <StatusMessage>비밀번호를 변경했습니다. 새 비밀번호로 로그인해 주세요.</StatusMessage>
            <Link className="kr-button kr-button-primary" href="/login">
              로그인으로 이동
            </Link>
          </div>
        )}
        {error && (
          <div role="alert" className="kr-message kr-message-error">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="grid grid-cols-1 gap-6" onSubmit={handleFindHint}>
            <Field className="block">
              <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="recovery-id">
                아이디
              </Label>
              <Input
                type="text"
                placeholder="아이디를 입력해주세요"
                className="mt-1"
                id="recovery-id"
                autoComplete="username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </Field>
            <Field className="block">
              <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="recovery-nickname">
                닉네임
              </Label>
              <Input
                type="text"
                placeholder="닉네임을 입력해주세요"
                className="mt-1"
                id="recovery-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </Field>
            <ButtonPrimary type="submit" disabled={isLoading} className="w-full">
              {isLoading ? '조회 중...' : '비밀번호찾기'}
            </ButtonPrimary>
          </form>
        )}

        {step === 2 && (
          <form className="grid grid-cols-1 gap-6" onSubmit={handleResetPassword}>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">비밀번호 힌트 질문</p>
              <p className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">{hintQuestion}</p>
            </div>
            <Field className="block">
              <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="recovery-answer">
                힌트 답변
              </Label>
              <Input
                type="text"
                placeholder="답변을 입력해주세요"
                className="mt-1"
                id="recovery-answer"
                value={hintAnswer}
                onChange={(e) => setHintAnswer(e.target.value)}
                required
              />
            </Field>
            <Field className="block">
              <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="recovery-password">
                새 비밀번호
              </Label>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="새로운 비밀번호를 입력해주세요"
                className="mt-1"
                id="recovery-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Field>
            <ButtonPrimary type="submit" disabled={isLoading} className="w-full">
              {isLoading ? '처리 중...' : '비밀번호 재설정'}
            </ButtonPrimary>
            <button
              type="button"
              className="kr-button"
              disabled={isLoading}
              onClick={() => {
                setStep(1)
                setError(null)
                setHintAnswer('')
                setNewPassword('')
              }}
            >
              이전으로
            </button>
          </form>
        )}

        <div className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          ID가 없으시다면? {` `}
          <Link href="/signup" className="font-medium underline">
            회원가입을 진행해주세요
          </Link>
          {`  또는  `}
          <Link href="/login" className="font-medium underline">
            로그인
          </Link>
        </div>
      </div>
    </FormPage>
  )
}

export default Page
