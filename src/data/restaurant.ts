
export async function getRestaurantListFilterOptions() {
    return [
        {
            label: '점심/저녁',
            name: 'time-zone',
            tabUIType: 'checkbox',
            options: [
                {
                    name: '점심',
                    value: 'lunch',
                    description: '점심 식사에 주로 가는 맛집',
                    defaultChecked: true,
                },
                {
                    name: '저녁',
                    value: 'dinner',
                    description: '저녁 식사에 주로 가는 맛집',
                    defaultChecked: true,
                }
            ],
        },
        {
            label: '카테고리',
            name: 'food-style',
            tabUIType: 'checkbox',
            options: [
                {
                    name: '한식',
                    value: 'korean-food',
                    description: '밥과 찌개, 국 등 다양한 반찬을 곁들여 먹는 한국의 전통 음식',
                    defaultChecked: true,
                },
                {
                    name: '중식',
                    value: 'chinese-food',
                    description: '중화요리, 중국과 대만의 요리들을 의미',
                    defaultChecked: true,
                },
                {
                    name: '일식',
                    value: 'japanese-food',
                    description: '일본의 스타일은 기본으로한 요리',
                    defaultChecked: true,
                },
                {
                    name: '양식',
                    value: 'western-food',
                    description: '육류와 유제품 중심의 재료, 건열 조리법',
                    defaultChecked: true,
                },
                {
                    name: '아시안식',
                    value: 'asian-food',
                    description: '쌀과 다양한 발효 소스, 풍부한 향신료 사용이 특징',
                    defaultChecked: true,
                },
                {
                    name: '카페',
                    value: 'cafe',
                    description: '커피와 디저트',
                    defaultChecked: true,
                }
            ],
        },
    ]
}