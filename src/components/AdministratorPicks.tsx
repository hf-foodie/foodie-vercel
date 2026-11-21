import Link from 'next/link'
import { restaurantPhotos } from '@/data/restaurantPhotos'
import styles from './AdministratorPicks.module.css'

const selections = [
  ['옛날장터', '0518969004'],
  ['가원밥상', ''],
  ['밤중에', '050714280408'],
  ['탁사발 두부공방 서면점', '050713172174'],
] as const

type Restaurant = { restaurantId: number; name: string; address: string; phoneNumber?: string | null }

export default function AdministratorPicks({ restaurants }: { restaurants: Restaurant[] }) {
  const picks = selections.flatMap(([name, phone]) => {
    const match = restaurants.find(r => r.name === name && (phone ? r.phoneNumber?.replace(/\D/g, '') === phone : r.address.includes('문현금융로 18-9')))
    return match ? [match] : []
  })
  if (!picks.length) return null
  return <section className="kr-home-section" aria-labelledby="administrator-picks">
    <div className="kr-section-heading"><h2 id="administrator-picks">문성욱(2007)의 선택</h2></div>
    <ul className={styles.grid}>{picks.map(({restaurantId, name}) =>
      <li key={restaurantId}><Link href={'/records?restaurantId=' + restaurantId} className={styles.card}>
        <img src={restaurantPhotos[restaurantId]?.src || '/images/restaurant/thumbnail/' + restaurantId + '.jpg'} alt="" />
        <span>{name}</span>
      </Link></li>
    )}</ul>
  </section>
}
