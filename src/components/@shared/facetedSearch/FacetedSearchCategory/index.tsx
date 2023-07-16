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
  searchTypes: Array<{ key: string; value: string; isSelected: boolean }> // Map<string, string>
  isCollapsable?: boolean
}): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = async (): Promise<void> => {
    setIsCollapsed(!isCollapsed)
  }

  const getSearchElements = (): Array<ReactElement> => {
    return searchTypes.map(
      (
        searchType: { key: string; value: string; isSelected?: boolean } // TODO interface to top
      ) => (
        <FacetedSearchCategorySubType
          key={searchType.key}
          searchType={searchType.value}
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
