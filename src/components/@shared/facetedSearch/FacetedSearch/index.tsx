import React, { ReactElement, useState } from 'react'
import FacetedSearchFilterAutoComplete, {
  AutoCompleteOption
} from '@shared/facetedSearch/FacetedSearchFilterAutoComplete'
import FacetedSearchCategory from '@shared/facetedSearch/FacetedSearchCategory'
import FacetedSearchClearFilterButton from '@shared/facetedSearch/FacetedSearchClearFilterButton'
import { MultiValue } from 'react-select'
import styles from './index.module.css'

export default function FacetedSearch(): ReactElement {
  const [filterTags, setFilterTags] = useState<MultiValue<AutoCompleteOption>>(
    []
  )
  const [searchTags, setSearchTags] = useState<
    Map<
      string,
      Map<string, { key: string; value: string; isSelected: boolean }>
    >
  >(
    new Map([
      [
        'Data type',
        new Map<string, { key: string; value: string; isSelected: boolean }>([
          ['11', { key: '11', value: 'Data sets', isSelected: false }],
          ['22', { key: '22', value: 'Algorithms', isSelected: false }],
          ['33', { key: '33', value: 'Download', isSelected: false }]
        ])
      ],
      [
        'Data access',
        new Map<string, { key: string; value: string; isSelected: boolean }>([
          ['44', { key: '44', value: 'Data sets', isSelected: false }],
          ['55', { key: '55', value: 'Algorithms', isSelected: false }],
          ['66', { key: '66', value: 'Download', isSelected: false }]
        ])
      ]
    ])
  ) // TODO better name?

  const getSearchElements = (): Array<ReactElement> => {
    return Array.from(searchTags).map(([category, tagMap]) => (
      <FacetedSearchCategory
        key={category}
        searchCategory={category}
        searchTypes={Array.from(tagMap.values())}
      />
    ))
  }

  const clearFilters = async (): Promise<void> => {
    setFilterTags([])
    // TODO reset checkboxes
  }

  const autoCompleteOnValueChange = (value: AutoCompleteOption[]): void => {
    setFilterTags(value)
  }

  return (
    <div className={styles.container}>
      <p className={styles.header}>Filter your results</p>
      <div className={styles.tagsContainer}>
        <FacetedSearchClearFilterButton onClick={clearFilters} />
        <FacetedSearchFilterAutoComplete
          onValueChange={autoCompleteOnValueChange}
          value={filterTags} // TODO
          name={'facetedSearch'}
          placeholder={'Filter on tags'}
        />
      </div>
      <div className={styles.searchCategoryContainer}>
        {getSearchElements()}
      </div>
    </div>
  )
}
