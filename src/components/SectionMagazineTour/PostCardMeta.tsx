import { Link } from '@/shared/link'
import { UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { FC } from 'react'
import LocalDate from '../LocalDate'
import {TTouristAttraction} from "@/data/tourist-attraction";

interface Props {
  className?: string
  date?: string
  author: TTouristAttraction['author']
}

const PostCardMeta: FC<Props> = ({ className, author, date }) => {
  const { name } = author
  return (
    <div className={clsx('post-card-meta-3 relative flex items-center text-xs/5', className)}>
      <Link href={`javascript:void(0)`} className="absolute inset-0" />

      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        <HugeiconsIcon icon={UserIcon} size={24} />
      </div>
      <div className="ms-3">
        <p className="font-semibold text-neutral-900 dark:text-neutral-200">{name}</p>
        <p className="flex items-center text-neutral-500 dark:text-neutral-400">
          <span>
            <LocalDate date={date ?? ''} options={{ year: 'numeric', month: 'long', day: 'numeric' }} />
          </span>
        </p>
      </div>
    </div>
  )
}

export default PostCardMeta
