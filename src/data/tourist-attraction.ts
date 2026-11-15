
export type TTouristAttraction = Awaited<ReturnType<typeof getTouristAttraction>>[number] & {
  galleryImgs?: string[]
}

export async function getTouristAttraction() {
  return [
    {
      id: 'N00001',
      title: '대한민국 1세대 기업인, 포스코의 아버지 故 박태준 회장 생가',
      name: '박태준기념관',
      excerpt: '\'제철보국(製鐵報國)\'의 신념 하나로 대한민국 산업화의 기적을 쏘아 올린, 청암 박태준의 시작점이 서린 곳',
      date: '2025-06-10',
      author: {
        id: '2007',
        name: '문성욱',
      },
      categories: [
        {
          name: '박태준기념관',
          color: 'yellow',
        },
      ],
      galleryImgs: [
        '/images/tourist-attraction/first/01.png',
        '/images/tourist-attraction/first/02.png',
        '/images/tourist-attraction/first/03.png',
        '/images/tourist-attraction/first/04.png',
      ],
    },
    {
      id: 'N00002',
      title: '부산의 데이트 성지, 연인도 만족하고 부모님도 좋아하는 관광열차',
      name: '해운대블루라인파크',
      excerpt: '마치 바다 위를 유영하는 듯한 스카이캡슐의 차창 밖으로, 아름다운 해안 비경을 파노라마로 담아냅니다',
      date: '2025-06-10',
      author: {
        id: '2007',
        name: '문성욱',
      },
      categories: [
        {
          name: '블루라인파크',
          color: 'blue',
        },
      ],
      galleryImgs: [
        '/images/tourist-attraction/second/01.png',
        '/images/tourist-attraction/second/02.png',
        '/images/tourist-attraction/second/03.png',
        '/images/tourist-attraction/second/04.png',
      ],
    },
    {
      id: 'N00003',
      title: '도심속의 힐링, 콧솟에서 느껴지는 피톤치드의 향기 ~',
      name: '아홉산숲',
      excerpt: '400년 9대, 남평 문씨 일가가 자본의 유혹을 막아서고 바보처럼 우직하게 지켜낸 위대한 초록의 유산',
      date: '2025-06-10',
      author: {
        id: '2007',
        name: '문성욱',
      },
      categories: [
        {
          name: '아홉산숲',
          color: 'green',
        },
      ],
      galleryImgs: [
        '/images/tourist-attraction/third/01.png',
        '/images/tourist-attraction/third/02.png',
        '/images/tourist-attraction/third/03.png',
        '/images/tourist-attraction/third/04.png',
      ],
    },
    {
      id: 'N00004',
      title: '부산 하면 광안리, 광안리하면 드론쇼 아이가',
      name: '광안리M드론라이트쇼',
      excerpt: '광안리 밤바다를 캔버스 삼아 수백 개의 별빛이 춤추는, 환상적이고 압도적인 빛의 예술',
      date: '2025-06-10',
      author: {
        id: 'author-1',
        name: '문성욱',
      },
      categories: [
        {
          name: '광안리 드론쇼',
          color: 'dark',
        },
      ],
      galleryImgs: [
        '/images/tourist-attraction/forth/01.png',
        '/images/tourist-attraction/forth/02.png',
        '/images/tourist-attraction/forth/03.png',
        '/images/tourist-attraction/forth/04.png',
      ],
    },
  ]
}