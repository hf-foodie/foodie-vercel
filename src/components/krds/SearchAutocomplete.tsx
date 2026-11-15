'use client'

import { useId, useState } from 'react'

export default function SearchAutocomplete({ label, value, options, onChange, placeholder, className = '' }: {
  placeholder?: string
  className?: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const normalize = (text: string) => text.replace(/\s/g, '').toLocaleLowerCase()
  const query = normalize(value)
  const matches = options.filter((option) => query && normalize(option).includes(query)).slice(0, 8)
  const expanded = open && matches.length > 0
  const choose = (option: string) => {
    onChange(option)
    setOpen(false)
    setActive(-1)
  }

  return (
    <div className={`kr-search-autocomplete ${className}`} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <label htmlFor={id}>{label}</label>
      <input id={id} className="kr-input" value={value} placeholder={placeholder} autoComplete="off"
        role="combobox" aria-autocomplete="list" aria-expanded={expanded}
        aria-controls={`${id}-options`} aria-activedescendant={expanded && active >= 0 ? `${id}-option-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onChange={(event) => { onChange(event.target.value); setActive(-1); setOpen(true) }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === 'Escape') { setOpen(false); setActive(-1); return }
          if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
            event.preventDefault()
            setOpen(true)
            setActive(event.key === 'ArrowDown' ? (active + 1) % matches.length : (active <= 0 ? matches.length - 1 : active - 1))
          }
          if (event.key === 'Enter' && expanded && active >= 0) {
            event.preventDefault()
            choose(matches[active])
          }
        }}
      />
      <ul id={`${id}-options`} role="listbox" aria-label={`${label} 추천`} hidden={!expanded}>
        {matches.map((option, index) => (
          <li key={option} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
            onPointerDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option}</li>
        ))}
      </ul>
    </div>
  )
}
