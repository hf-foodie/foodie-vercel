'use client'
import { clientFetch } from '@/lib/clientFetch'

import FormPage from '@/components/krds/FormPage'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { Field, Label } from '@/shared/fieldset'
import Input from '@/shared/Input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'

const Page = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      // baseUrl은 환경변수에서 가져오거나 기본값을 사용합니다.
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await clientFetch(`${baseUrl}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/login')
      } else {
        const result = await response.json()
        setError(result.message || '회원가입에 실패했습니다. 다시 시도해주세요.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => {
          errorRef.current?.focus()
        }, 100)
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => {
        errorRef.current?.focus()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormPage title="회원가입" description="계정 정보와 비밀번호 복구에 사용할 질문을 입력해 주세요." wide>
      <div className="space-y-6">
        {/* FORM */}
        <form className="kr-signup-grid" onSubmit={handleSubmit}>
          {error && (
            <div ref={errorRef} tabIndex={-1} role="alert" className="kr-message kr-message-error">
              {error}
            </div>
          )}
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-id">
              아이디
            </Label>
            <Input
              id="signup-id"
              name="id"
              autoComplete="username"
              type="text"
              placeholder="ID를 입력해주세요"
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-password">
              비밀번호
            </Label>
            <Input
              id="signup-password"
              name="password"
              autoComplete="new-password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-email">
              이메일
            </Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="example@email.com"
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-nickname">
              닉네임
            </Label>
            <Input
              id="signup-nickname"
              name="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-birthYear">
              출생연도
            </Label>
            <Input
              id="signup-birthYear"
              name="birthYear"
              type="number"
              placeholder="YYYY"
              className="mt-1"
              required
              min="1900"
              max={new Date().getFullYear()}
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-hintQuestion">
              비밀번호 찾기 질문
            </Label>
            <Input
              id="signup-hintQuestion"
              name="hintQuestion"
              type="text"
              placeholder="질문을 입력해주세요"
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="signup-hintAnswer">
              비밀번호 찾기 답변
            </Label>
            <Input
              id="signup-hintAnswer"
              name="hintAnswer"
              type="text"
              placeholder="답변을 입력해주세요"
              className="mt-1"
              required
            />
          </Field>
          <ButtonPrimary type="submit" disabled={isLoading} className="w-full">
            {isLoading ? '가입 중...' : '회원가입'}
          </ButtonPrimary>
        </form>

        {/* ==== */}
        <div className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          이미 계정이 있으신가요? {` `}
          <Link href="/login" className="font-medium underline">
            로그인
          </Link>
        </div>
      </div>
    </FormPage>
  )
}

export default Page
