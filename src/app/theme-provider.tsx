'use client'

import { createContext, useCallback, useEffect, useState } from 'react'
import { TRestaurant } from '@/data/types'

interface ThemeContextValue {
  isDarkMode: boolean
  themeDir: 'rtl' | 'ltr'
  setThemeDir: (value: 'rtl' | 'ltr') => void
  restaurants: TRestaurant[]
  setRestaurants: (restaurants: TRestaurant[]) => void
}

const SESSION_CHECK_KEY = 'isLoggedIn'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export default function ThemeProvider({
  children,
  initialRestaurants = []
}: {
  children: React.ReactNode,
  initialRestaurants?: TRestaurant[]
}) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [themeDir, setThemeDir] = useState<'rtl' | 'ltr'>('ltr')
  const [restaurants, setRestaurants] = useState<TRestaurant[]>(initialRestaurants)

  return (
    <ThemeContext.Provider
        value={{
          isDarkMode,
          themeDir,
          setThemeDir,
          restaurants,
          setRestaurants,
        }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
