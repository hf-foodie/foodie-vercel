export async function getNavigation(role?: string | null): Promise<TNavigationItem[]> {
  const items: TNavigationItem[] = [
    {
      id: '1',
      href: '/search',
      name: '맛집탐방',
      type: 'dropdown',
      children: [
        { id: 'explore-search', href: '/search', name: '맛집 검색' },
        { id: 'explore-roulette', href: '/game/roulette', name: '오늘의메뉴' },
        { id: 'explore-worldcup', href: '/game/worldcup', name: '맛집월드컵' },
      ],
    },
    { id: 'blogs', href: '/blogs', name: '맛집블로그' },
    {
      id: '2',
      href: '/',
      name: '맛집통합',
      type: 'mega-menu',
      children: [
        {
          id: '1',
          href: '#',
          name: '맛집모음',
          children: [
            {
              id: '1-0',
              href: '/restaurant/hf',
              name: '주금공 맛집',
            },
            {
              id: '1-1',
              href: '/blackwhite',
              name: '흑백요리사',
            },
            {
              id: '1-2',
              href: '/restaurant/dubai',
              name: '두쫀쿠',
            }
          ],
        },
        {
          id: '2',
          href: '#',
          name: '맛잘알 모음집',
          children: [
            {
              id: '2-0',
              href: '/influencer/ceo',
              name: '사장님의 선택',
            },
            {
              id: '2-1',
              href: '/influencer/vpresident',
              name: '부사장님의 선택',
            },
            {
              id: '2-2',
              href: '/influencer/cc',
              name: '사내커플 추천',
            },
            {
              id: '2-3',
              href: '/influencer/intern',
              name: '인턴\'s Pick',
            }
          ],
        },
      ],
    },
    {
      id: '3',
      href: '/',
      name: '맛집관리',
      type: 'dropdown',
      children: [
        {
          id: 'management-home',
          href: '/management',
          name: '관리 홈',
        },
        {
          id: 'admin-analytics',
          href: '/admin/analytics',
          name: '관리자 통계',
        },
        {
          id: '1',
          href: '/post/new',
          name: '맛집등록',
        },
        {
          id: 'recommendations',
          href: '/recommendations',
          name: '추천 콘텐츠 관리',
        },
        {
          id: 'curated-links',
          href: '/curated-links',
          name: '추천 식당 연결 관리',
        },
        {
          id: 'restaurant-changes',
          href: '/restaurant-changes',
          name: '식당 정보 수정',
        }
      ],
    },
    {
      id: '5',
      href: '/',
      name: '소통공간',
      type: 'dropdown',
      children: [
        {
          id: '5-help',
          href: '/help',
          name: '시작하기',
        },
        {
          id: '5-technology',
          href: '/technology',
          name: '기술과 운영',
        },
        {
          id: '5-1',
          href: '/communication',
          name: '맛집신문고',
        },
        {
          id: '5-2',
          href: '/about',
          name: '오늘뭐먹지?',
        }
      ],
    },
  ]
  const normalized = role?.replace(/^ROLE_/, '')
  return items.filter(item => item.id !== '3' || normalized === 'ADMIN' || normalized === 'MANAGER').map(item => item.id === '3' ? {...item,children:item.children?.filter(child=>child.id !== 'admin-analytics' || normalized === 'ADMIN')} : item)
}

export async function getNavMegaMenu(): Promise<TNavigationItem> {
  const navigation = await getNavigation()

  // Find the mega menu item in the navigation array
  // for demo purposes, we assume the mega menu is the one with name 'Templates'
  return navigation.find((item) => item.type === 'mega-menu' && item.name === 'Templates') || {}
}

// ============ TYPE =============
export type TNavigationItem = Partial<{
  id: string
  href: string
  name: string
  type?: 'dropdown' | 'mega-menu'
  isNew?: boolean
  children?: TNavigationItem[]
}>
