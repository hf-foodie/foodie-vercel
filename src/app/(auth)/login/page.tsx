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
    const id = formData.get('id')
    const password = formData.get('password')

    try {
      let deviceId = localStorage.getItem('deviceId')
      if (!deviceId) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          deviceId = crypto.randomUUID()
        } else {
          // Fallback for non-secure contexts or older browsers
          deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })
        }
        localStorage.setItem('deviceId', deviceId)
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await clientFetch(`${baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ id, password }),
      })

      if (response.ok) {
        const target = new URLSearchParams(window.location.search).get('next')
        router.push(target && target.startsWith('/') && !target.startsWith('//') && !target.includes('\\') ? target : '/')
        router.refresh()
      } else {
        const result = await response.json()
        setError(result.message || '로그인에 실패했습니다. 다시 시도해주세요.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => {
          errorRef.current?.focus()
        }, 100)
      }
    } catch (error) {
      console.error('Login error:', error)
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
    <FormPage title="로그인" description="로그인하고 동료들의 맛집 경험을 함께 나눠보세요.">
      <div className="space-y-6">
        {/* FORM */}
        <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
          {error && (
            <div ref={errorRef} tabIndex={-1} role="alert" className="kr-message kr-message-error">
              {error}
            </div>
          )}
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="login-id">
              아이디
            </Label>
            <Input
              id="login-id"
              name="id"
              autoComplete="username"
              type="text"
              placeholder="ID를 입력해주세요"
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <div className="flex items-center justify-between text-neutral-800 dark:text-neutral-200">
              <Label htmlFor="login-password">비밀번호</Label>
              <Link href="/forgot-password" className="text-sm font-medium underline">
                비밀번호찾기
              </Link>
            </div>
            <Input
              id="login-password"
              name="password"
              autoComplete="current-password"
              type="password"
              className="mt-1"
              required
            />
          </Field>
          <ButtonPrimary type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </ButtonPrimary>
        </form>

        {/* ==== */}
        <div className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          아직 계정이 없으신가요? {` `}
          <Link href="/signup" className="font-medium underline">
            회원가입
          </Link>
        </div>
      </div>
    </FormPage>
  )
}

export default Page
