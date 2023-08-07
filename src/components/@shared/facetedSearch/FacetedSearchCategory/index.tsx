import React, { ReactElement, useState } from 'react'
import FacetedSearchCollapseButton from '@shared/facetedSearch/FacetedSearchCollapseButton'
import FacetedSearchCategorySubType from '@shared/facetedSearch/FacetedSearchCategorySubType'
import styles from './index.module.css'
import { StaticOption } from '@components/Search/utils'

export default function FacetedSearchCategory({
  searchCategory,
  searchTypes,
  isCollapsable = true,
  onValueChange
}: {
  searchCategory: string
  searchTypes: Array<StaticOption>
  onValueChange: (option: StaticOption) => Promise<void>
  isCollapsable?: boolean
}): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = async (): Promise<void> => {
    setIsCollapsed(!isCollapsed)
  }

  const getSearchElements = (): Array<ReactElement> => {
    return searchTypes.map((searchType: StaticOption) => (
      <FacetedSearchCategorySubType
        key={searchType.label}
        searchType={searchType.label}
        hits={searchType.count}
        onValueChange={(isSelected: boolean) =>
          onValueChange({ ...searchType, isSelected })
        }
        isSelected={searchType.isSelected}
      />
    ))
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
