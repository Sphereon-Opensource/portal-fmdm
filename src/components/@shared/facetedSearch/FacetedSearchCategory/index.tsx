import React, { ReactElement, useState } from 'react'
import FacetedSearchCollapseButton from '@shared/facetedSearch/FacetedSearchCollapseButton'
import FacetedSearchCategorySubType from '@shared/facetedSearch/FacetedSearchCategorySubType'
import styles from './index.module.css'

export default function FacetedSearchCategory({
  searchCategory,
  searchTypes,
  isCollapsable = true
}: {
  searchCategory: string
  searchTypes: Array<{ label: string; count: number; isSelected: boolean }> // Map<string, string> { key: string; value: string; isSelected: boolean }
  isCollapsable?: boolean
}): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = async (): Promise<void> => {
    setIsCollapsed(!isCollapsed)
  }

  const getSearchElements = (): Array<ReactElement> => {
    return searchTypes.map(
      (
        searchType: { label: string; count: number; isSelected?: boolean } // TODO interface to top { key: string; value: string; isSelected?: boolean }
      ) => (
        <FacetedSearchCategorySubType
          key={searchType.label}
          searchType={searchType.label} //searchType.label
          hits={searchType.count}
          isSelected={searchType.isSelected}
        />
      )
    )
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.headerContainer}
        style={{
          ...(!isCollapsed && { marginBottom: 15 })
        }}
      >
        <div className={styles.headerLabel}>{searchCategory}</div>
        {isCollapsable && (
          <div className={styles.headerCollapseContainer}>
            <FacetedSearchCollapseButton
              isCollapsed={isCollapsed}
              onClick={toggleCollapse}
            />
          </div>
        )}
      </div>
      <div
        className={styles.searchContainer}
        style={{ ...(isCollapsed && { display: 'none' }) }}
      >
        {getSearchElements()}
      </div>
    </div>
  )
}
