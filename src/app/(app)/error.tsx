'use client'
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="container space-y-4 py-16">
      <h1 className="text-xl font-semibold">요청을 처리하지 못했습니다.</h1>
      <p>연결 상태 또는 접근 권한을 확인해주세요. 잠시 후 다시 시도할 수 있습니다.</p>
      <button onClick={reset} className="rounded border px-4 py-2">
        다시 시도
      </button>
      <a href="/login" className="ml-4 underline">
        로그인
      </a>
    </section>
  )
}
