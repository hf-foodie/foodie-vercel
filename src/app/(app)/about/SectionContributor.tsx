import { customFetch } from '@/lib/fetch'
import Heading from '@/shared/Heading'
import Image from 'next/image'
import { apiBase } from '@/lib/server-session'

const SectionContributor = async () => {
  let nickname = '맛집 제보 기여자'
  try {
    const response = await customFetch(`${apiBase()}/contributors/featured`, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (response.ok) {
      const data = await response.json()
      if (typeof data.nickname === 'string' && data.nickname.trim()) nickname = data.nickname
    }
  } catch { /* Do not fall back to a real name or account identifier. */ }
  const founders = [
  {
    id: '1',
    name: nickname,
    job: '주택연금처',
    avatar: '/images/about/contributor/avatar-1690.png',
  },
]

  return (
    <div className="relative">
      <Heading
      >
        ⛱ 오늘뭐먹지? 맛집 제보 기여자
      </Heading>
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {founders.map((item) => (
          <div key={item.id} className="w-32">
            <div className="aspect-w-1 relative h-0 overflow-hidden rounded-xl aspect-h-1">
              <Image
                fill
                className="object-cover"
                src={item.avatar}
                alt=""
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 30vw"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-neutral-900 md:text-xl dark:text-neutral-200">
              {item.name}
            </h3>
            <span className="block text-sm text-neutral-500 sm:text-base dark:text-neutral-400">{item.job}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionContributor
