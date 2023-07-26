import React, { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import styles from './sort.module.css'
import classNames from 'classnames/bind'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'

const cx = classNames.bind(styles)

const sortItems = [
  { display: 'Relevance', value: SortTermOptions.Relevance },
  { display: 'Published', value: SortTermOptions.Created },
  { display: 'Sales', value: SortTermOptions.Orders },
  { display: 'Price', value: SortTermOptions.Price }
]

export default function Sort({
  sortType,
  setSortType,
  sortDirection = SortDirectionOptions.Descending,
  setSortDirection
}: {
  sortType: string
  setSortType: React.Dispatch<React.SetStateAction<string>>
  sortDirection: string
  setSortDirection: React.Dispatch<React.SetStateAction<string>>
}): ReactElement {
  const directionArrow = String.fromCharCode(
    sortDirection === SortDirectionOptions.Ascending ? 9650 : 9660
  )
  async function sortResults(
    sortBy?: string,
    direction?: string
  ): Promise<void> {
    if (sortBy) {
      setSortType(sortBy)
    } else if (direction) {
      setSortDirection(direction)
    }
  }

  async function handleSortButtonClick(value: string) {
    if (value === sortType) {
      if (sortDirection === SortDirectionOptions.Descending) {
        await sortResults(null, SortDirectionOptions.Ascending)
      } else {
        await sortResults(null, SortDirectionOptions.Descending)
      }
    } else {
      await sortResults(value, null)
    }
  }

  return (
    <div className={styles.sortList}>
      <label className={styles.sortLabel}>Sort</label>
      {sortItems.map((e, index) => {
        const sorted = cx({
          [styles.selected]: e.value === sortType,
          [styles.sorted]: true
        })
        return (
          <Button
            key={index}
            className={sorted}
            size="small"
            onClick={async (): Promise<void> => {
              await handleSortButtonClick(e.value)
            }}
          >
            {e.display}
            {e.value === sortType && (
              <span className={styles.direction}>{directionArrow}</span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
