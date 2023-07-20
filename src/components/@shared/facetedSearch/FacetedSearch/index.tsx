import React, { ReactElement, useState } from 'react'
import FacetedSearchFilterAutoComplete, {
  AutoCompleteOption
} from '@shared/facetedSearch/FacetedSearchFilterAutoComplete'
import FacetedSearchCategory from '@shared/facetedSearch/FacetedSearchCategory'
import FacetedSearchClearFilterButton from '@shared/facetedSearch/FacetedSearchClearFilterButton'
import { MultiValue } from 'react-select'
import styles from './index.module.css'
import {
  AggregationResult,
  getResults,
  KeywordResult
} from '@components/Search/utils'

export default function FacetedSearch({
  searchCategories
}: {
  searchCategories: Array<AggregationResult>
}): ReactElement {
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

  const getTags = (): Array<{ label: string; value: string }> => {
    const tagsCategory: AggregationResult = searchCategories.find(
      (item: AggregationResult) => item.category === 'Tags'
    )

    if (!tagsCategory?.keywords) {
      return []
    }

    return tagsCategory.keywords.map((item: KeywordResult) => {
      return {
        label: item.label,
        // FIXME setting value twice as using the location for for the value which is shared by multiple tags breaks the input
        value: item.label
      }
    })
  }

  const executeSearch = async (): Promise<void> => {
    await getResults({}, [])
  }

  // TODO any
  const getSearchElements = (): Array<ReactElement> => {
    return searchCategories.map(
      (
        searchCategory: AggregationResult // Array.from(searchTags).map(([category, tagMap]) => (
      ) => {
        // Skipping Tags as these are available in the tag filter input
        if (searchCategory.category === 'Tags') {
          return null
        }

        return (
          <FacetedSearchCategory
            key={searchCategory.category}
            searchCategory={searchCategory.category}
            searchTypes={searchCategory.keywords} // Array.from(tagMap.values())
          />
        )
      }
    )
    // return Array.from(searchTags).map(([category, tagMap]) => (
    //   <FacetedSearchCategory
    //     key={category}
    //     searchCategory={category}
    //     searchTypes={[]} //Array.from(tagMap.values())
    //   />
    // ))
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
          tags={getTags()}
        />
      </div>
      <div className={styles.searchCategoryContainer}>
        {getSearchElements()}
      </div>
    </div>
  )
}
