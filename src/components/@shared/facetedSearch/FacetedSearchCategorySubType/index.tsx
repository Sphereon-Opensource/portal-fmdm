import React, { ReactElement } from 'react'
import FacetedSearchCheckBox from '@shared/facetedSearch/FacetedSearchCheckBox'
import styles from './index.module.css'

export default function FacetedSearchCategorySubType({
  searchType,
  hits = 0,
  isSelected = false
}: {
  searchType: string
  hits?: number // TODO figure out how this works and if it is always present
  isSelected?: boolean
}): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.checkboxContainer}>
        <FacetedSearchCheckBox value={isSelected} />
      </div>
      <div className={styles.label}>{`${searchType} (${hits})`}</div>
    </div>
  )
}
