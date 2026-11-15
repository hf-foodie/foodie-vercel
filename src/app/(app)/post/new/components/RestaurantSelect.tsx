'use client'

import { TRestaurant } from '@/data/types'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import React from 'react'

interface Props {
  selectedRestaurant: TRestaurant | null
  setSelectedRestaurant: (restaurant: TRestaurant | null) => void
  query: string
  setQuery: (query: string) => void
  filteredRestaurants: TRestaurant[]
}

const RestaurantSelect: React.FC<Props> = ({
  selectedRestaurant,
  setSelectedRestaurant,
  query,
  setQuery,
  filteredRestaurants,
}) => {
  return (
    <div className="block">
      <label htmlFor="restaurant-select" className="font-medium">
        식당 선택 (필수)
      </label>
      <div className="relative mt-1">
        <Combobox value={selectedRestaurant} onChange={setSelectedRestaurant}>
          <div className="relative w-full">
            <ComboboxInput
              id="restaurant-select"
              className={clsx(
                'focus:ring-opacity-50 dark:focus:ring-primary-6000 dark:focus:ring-opacity-25 h-11 w-full rounded-md border-neutral-200 bg-white px-4 py-3 text-base font-normal focus:border-primary-300 focus:ring focus:ring-primary-200 dark:border-neutral-700 dark:bg-neutral-900',
                'text-left'
              )}
              displayValue={(restaurant: TRestaurant) => restaurant?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="식당 이름을 검색해보세요"
            />
            <ComboboxButton aria-label="식당 목록 열기" className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm dark:bg-neutral-800">
              {filteredRestaurants.length === 0 && query !== '' ? (
                <div className="relative cursor-default px-4 py-2 text-gray-700 select-none dark:text-gray-300">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <ComboboxOption
                    key={restaurant.restaurantId}
                    className={({ active }) =>
                      `relative cursor-default py-2 pr-4 pl-10 select-none ${
                        active ? 'bg-primary-600 text-white' : 'text-gray-900 dark:text-gray-100'
                      }`
                    }
                    value={restaurant}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {restaurant.name}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-primary-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </Combobox>
      </div>
    </div>
  )
}

export default RestaurantSelect
