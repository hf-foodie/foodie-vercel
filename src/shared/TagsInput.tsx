'use client'
import { useId, useState } from 'react'
interface Tag {
  id: string
  name: string
  color?: string
}
interface Props {
  value: Tag[]
  onChange: (tags: Tag[]) => void
  label?: string
  suggestions?: Tag[]
  placeholder?: string
  maxTags?: number
  allowCreate?: boolean
  className?: string
  vertical?: boolean
}
export function TagsInput({
  value = [],
  onChange,
  label = '태그',
  suggestions = [],
  placeholder = '항목을 입력해주세요',
  maxTags = 10,
  allowCreate = true,
  className = '',
  vertical = false,
}: Props) {
  const helpId = useId()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const full = value.length >= maxTags
  function add(tag?: Tag) {
    const name = (tag?.name || query).trim()
    if (!name) return
    if (full) {
      setMessage('최대 ' + maxTags + '개까지 입력할 수 있습니다.')
      return
    }
    if (name.length > 30) {
      setMessage('항목당 30자까지 입력해 주세요.')
      return
    }
    if (value.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setMessage('이미 입력한 항목입니다.')
      return
    }
    if (!tag && !allowCreate) return
    onChange([...value, tag || { id: helpId + '-' + name, name }])
    setQuery('')
    setMessage('')
  }
  return (
    <div className={'kr-tags-input ' + className}>
      <div className={'kr-tags-list ' + (vertical ? 'vertical' : '')}>
        {value.map((tag) => (
          <span className="kr-badge" key={tag.id}>
            <span>{tag.name}</span>
            <button
              type="button"
              aria-label={tag.name + ' 삭제'}
              onClick={() => onChange(value.filter((t) => t.id !== tag.id))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="kr-tag-entry">
        <input
          aria-label={label}
          aria-describedby={helpId}
          maxLength={30}
          value={query}
          placeholder={full ? '최대 ' + maxTags + '개 입력 완료' : placeholder}
          disabled={full}
          onChange={(e) => {
            setQuery(e.target.value)
            setMessage('')
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && !query && value.length) onChange(value.slice(0, -1))
          }}
        />
        <button
          type="button"
          className="kr-button"
          aria-label={label + ' 추가'}
          disabled={full || !query.trim() || !allowCreate}
          onClick={() => add()}
        >
          추가
        </button>
      </div>
      {query &&
        suggestions
          .filter((t) => t.name.includes(query) && !value.some((v) => v.id === t.id))
          .map((tag) => (
            <button type="button" className="kr-button" key={tag.id} onClick={() => add(tag)}>
              {tag.name}
            </button>
          ))}
      <p id={helpId} className="kr-form-note">
        {value.length}/{maxTags}개 · 항목당 30자. Enter 또는 추가 버튼으로 입력합니다.
      </p>
      <p role="status" className="kr-form-note">
        {message}
      </p>
    </div>
  )
}
