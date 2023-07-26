import React, { ReactElement } from 'react'
import styles from './index.module.css'

export default function FacetedSearchClearFilterButton({
  onClick
}: {
  onClick: () => Promise<void>
}): ReactElement {
  return (
    <div className={styles.container} onClick={onClick}>
      Clear all filters
    </div>
  )
}
