export interface CustomLink {
    label: string
    href: string
    targetBlank?: boolean
}

export type TPost = {
    postId: string;
    restaurantId: TRestaurant['restaurantId'];
    restaurantName: TRestaurant['name'];
    authorId: TUserData['id'];
    authorNickname: TUserData['nickname'];
    title: string;
    summary: string;
    rating: number;
    updatedAt: string;
    viewCount: number;
    likeCount: number;
    liked: boolean;
    bookmarked: boolean;
    address: string;
    phoneNumber: string;
    tags: TTag[];
    badges: string[];
    oneLineReviews: string[];
    imageFileNames: string[];
    comments: TComment[];
    commentCount?: number;
}

export type TComment = {
    commentId: string;
    authorNickname: TUserData['nickname'];
    parentCommentId: string | null;
    authorId: TUserData['id'];
    content: string;
    createdAt: string;
}

export type TMagazine = {
    magazineId: string;
    postId: string;
    title: string;
    excerpt: string;
    authorId: string;
    nickname: string;
    restaurantName: TRestaurant['name'];
    updated_at: string;
    viewCount: TPost['viewCount'];
    likeCount: TPost['likeCount'];
    liked: TPost['liked'];
    bookmarked: TPost['bookmarked'];
    commentCount: number
}

export type TRestaurant = {
    restaurantId: number;
    name: string;
    address: string;
    phoneNumber: string;
    category: string;
    isLunch: boolean;
    isDinner: boolean;
    isSolo: boolean;
    isGroup4: boolean;
    isGroup8: boolean;
    representativeMenuNames: string[];
    nearOfficeNames: string[];
    createdAt: string;
    updatedAt: string;
}

export type TBranch = {
    id: string,
    name: string,
    handle: string,
    count: number,
    thumbnail: {
        src: string,
        alt: string,
        width: number,
        height: number
    }
}

export type TBlackWhite = {
  linkedRestaurant?: { name: string; address: string }
    restaurantId?: number | null;
    bwId: number;
    restaurantName: string;
    nickname: string;
    chefName: string;
    season: number;
    spoonClass: string;
    address: string;
    contactInfo: string;
    signatureMenus: string[];
}

export type ForumCategory = '공지사항' | '자율소통' | '맛집제보' | '기능요청' | '버그제보'

export interface ForumPost {
    communicationId: number
    title: string
    content: string | null
    category: string
    writerId: string
    writerNickname: string
    viewCount: number
    replyCount: number
    isPinned: boolean
    createdAt: string
    updatedAt: string
}

export interface TReply {
    replyId: number
    content: string
    writerId: string
    writerNickname: string
    createdAt: string
}

export interface TUserData {
    id: string
    email: string
    nickname: string
    birthYear: number
    role: string
    status: string
}

export type TCheckboxFilter = {
    label: string
    name: string
    tabUIType: 'checkbox'
    options: {
        value: string;
        name: string
        description?: string
        defaultChecked?: boolean
    }[]
}

export type TPriceRangeFilter = {
    name: string
    label: string
    tabUIType: 'price-range'
    min: number
    max: number
}

export type TSelectNumberFilter = {
    name: string
    label: string
    tabUIType: 'select-number'
    options: {
        name: string
        max: number
    }[]
}

export type TListFilterOption = {
    label: string;
    name: string;
    // 현재는 'checkbox'만 사용하지만, 확장을 고려해 union으로 정의
    tabUIType: TCheckboxFilter | TPriceRangeFilter | TSelectNumberFilter | string;
    options: {
        name: string;
        value: string;
        description?: string;
        defaultChecked?: boolean;
    }[];
};

export type TListFilterOptions = TListFilterOption[];

export type TFootprintsCEO = {
    originalName?: string | null;
    restaurantId: number;
    ceoName: string;
    name: string;
    address: string;
    phoneNumber: string;
    category: string;
    isLunch: boolean;
    isDinner: boolean;
    isSolo: boolean;
    isGroup4: boolean;
    isGroup8: boolean;
    representativeMenuNames: string[];
    officeName: string;
    createdAt: string;
    updatedAt: string;
}

export type TFootprintsCC = {
    originalName?: string | null;
    restaurantId: number;
    name: string;
    address: string;
    phoneNumber: string;
    category: string;
    isLunch: boolean;
    isDinner: boolean;
    isSolo: boolean;
    isGroup4: boolean;
    isGroup8: boolean;
    representativeMenuNames: string[];
    createdAt: string;
    updatedAt: string;
}

export type TInfluencerRecommendation = {
    originalName?: string | null;
    influencerEpno: string;
    restaurantId: number;
    influencerName: string;
    name: string;
    address: string;
    phoneNumber: string;
    category: string;
    isLunch: boolean;
    isDinner: boolean;
    isSolo: boolean;
    isGroup4: boolean;
    isGroup8: boolean;
    representativeMenuNames: string[];
    createdAt: string;
    updatedAt: string;
}

export type TTag = string
// Intern을 위한 임시 데이터 타입
export type TInfluencerRestaurant = {
  linkedRestaurant?: { name: string; address: string }
    restaurantId?: number | null;
    description?: string;
    id: string;
    title: string;
    handle: string;
    listingCategory: string;
    featuredImage: string;
    address: string;
    reviewStart: number;
    representative_menu: string;
    branch: string[];
    timeZoneCategory: string[];
    foodStyleCategory: string[];
};
export type TPostSummary = Omit<TPost, 'comments' | 'badges'> & { commentCount: number }
