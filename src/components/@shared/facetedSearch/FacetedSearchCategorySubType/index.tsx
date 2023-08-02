import React, { ReactElement } from 'react'
import FacetedSearchCheckBox from '@shared/facetedSearch/FacetedSearchCheckBox'
import styles from './index.module.css'

export default function FacetedSearchCategorySubType({
  searchType,
  hits = 0,
  isSelected = false,
  onValueChange
}: {
  searchType: string
  onValueChange: (isChecked: boolean) => Promise<void>
  hits?: number
  isSelected?: boolean
}): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.checkboxContainer}>
        <FacetedSearchCheckBox
          value={isSelected}
          onValueChange={onValueChange}
        />
      </div>
      <div className={styles.label}>{`${searchType} (${hits})`}</div>
    </div>
  )
}
