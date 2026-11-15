'use client'
import { clientFetch } from '@/lib/clientFetch'

import FormPage from '@/components/krds/FormPage'
import { StatusMessage } from '@/components/krds/PageHeading'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { Field, Label } from '@/shared/fieldset'
import Input from '@/shared/Input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface UserData {
  id: string
  email: string
  nickname: string
  birthYear: string
  role: string
  status: string
}

const Page = () => {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await clientFetch(`${baseUrl}/me`, {
          headers: {},
        })

        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          if (response.status === 401) router.push('/login')
          else {
            setFailed(true)
            setMessage('계정 정보를 불러오지 못했습니다. 다시 시도해 주세요.')
          }
        }
      } catch (error) {
        setFailed(true)
        setMessage('계정 정보를 불러오지 못했습니다. 다시 시도해 주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nickname = formData.get('nickname') as string
    const email = formData.get('email') as string
    const birthYear = formData.get('birthYear') as string

    setMessage('')
    setFailed(false)
    setIsUpdating(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await clientFetch(`${baseUrl}/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname,
          email,
          birthYear,
        }),
      })

      if (response.ok) {
        setMessage('정보를 수정했습니다.')
        const updatedData = await response.json()
        setUserData(updatedData)
      } else {
        const errorData = await response.json()
        setFailed(true)
        setMessage(errorData.message || '정보 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to update user data:', error)
      setFailed(true)
      setMessage('오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading)
    return (
      <FormPage title="내 계정" description="내 정보를 확인하고 변경할 수 있습니다.">
        <StatusMessage>계정 정보를 불러오고 있습니다.</StatusMessage>
      </FormPage>
    )
  if (!userData)
    return (
      <FormPage title="내 계정" description="내 정보를 확인하고 변경할 수 있습니다.">
        <StatusMessage error>{message || '로그인이 필요합니다.'}</StatusMessage>
        <button className="kr-button" onClick={() => window.location.reload()}>
          다시 시도
        </button>
        <Link href="/login" className="kr-link ml-4">
          로그인
        </Link>
      </FormPage>
    )

  return (
    <FormPage title="내 계정" description="내 정보를 확인하고 변경할 수 있습니다.">
      <div className="space-y-6">
        <Link href="/bookmarks" className="kr-button">저장한 맛집 보기</Link>
        <StatusMessage error={failed}>{message}</StatusMessage>
        <form className="grid grid-cols-1 gap-6" onSubmit={handleUpdate}>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="myaccount-id">
              아이디
            </Label>
            <Input
              id="myaccount-id"
              name="id"
              type="text"
              defaultValue={userData.id}
              className="mt-1 bg-neutral-100 dark:bg-neutral-700"
              readOnly
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="myaccount-email">
              이메일
            </Label>
            <Input
              id="myaccount-email"
              name="email"
              type="email"
              defaultValue={userData.email}
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="myaccount-nickname">
              닉네임
            </Label>
            <Input
              id="myaccount-nickname"
              name="nickname"
              type="text"
              defaultValue={userData.nickname}
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="myaccount-birthYear">
              출생연도
            </Label>
            <Input
              id="myaccount-birthYear"
              name="birthYear"
              type="text"
              defaultValue={userData.birthYear}
              className="mt-1"
              required
            />
          </Field>
          <Field className="block">
            <Label className="text-neutral-800 dark:text-neutral-200" htmlFor="myaccount-role">
              역할
            </Label>
            <Input
              id="myaccount-role"
              name="role"
              type="text"
              defaultValue={
                ({ USER: '회원', MANAGER: '매니저', ADMIN: '관리자' } as Record<string, string>)[userData.role] ||
                userData.role
              }
              className="mt-1 bg-neutral-100 dark:bg-neutral-700"
              readOnly
            />
          </Field>
          <ButtonPrimary type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? '수정 중...' : '정보 수정'}
          </ButtonPrimary>
        </form>

        <div className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          <Link href="/" className="font-medium underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </FormPage>
  )
}

export default Page
