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
  AggregationResultUI,
  Keyword,
  StaticOption
} from '@components/Search/utils'

export default function FacetedSearch({
  searchCategories,
  onClearFilter,
  onSetTagsFilter,
  onSetStaticFilter
}: {
  searchCategories: AggregationResultUI
  onClearFilter: () => Promise<void>
  onSetTagsFilter: (tags: Array<Keyword>) => Promise<void>
  onSetStaticFilter: (options: Array<StaticOption>) => Promise<void>
}): ReactElement {
  const [filterTags, setFilterTags] = useState<MultiValue<AutoCompleteOption>>(
    []
  )
  const [selectedOptions, setSelectedOptions] = useState<Array<StaticOption>>(
    []
  )

  const getSearchElements = (): Array<ReactElement> => {
    return searchCategories.static.map((searchCategory: AggregationResult) => {
      const searchTypes: StaticOption[] = searchCategory.keywords.map(
        (item: Keyword) => ({
          ...item,
          category: searchCategory.category,
          isSelected: selectedOptions.some(
            (obj: StaticOption) =>
              obj.category === searchCategory.category &&
              obj.label === item.label
          )
        })
      )

      const onValueChange = async (option: StaticOption): Promise<void> => {
        if (option.isSelected) {
          const options: Array<StaticOption> = [...selectedOptions, option]
          setSelectedOptions(options)
          await onSetStaticFilter(options)
        } else {
          const options: Array<StaticOption> = selectedOptions.filter(
            (item: StaticOption) =>
              !(
                item.category === searchCategory.category &&
                item.label === option.label
              )
          )
          setSelectedOptions(options)
          await onSetStaticFilter(options)
        }
      }

      return (
        <FacetedSearchCategory
          key={searchCategory.category}
          searchCategory={searchCategory.category}
          searchTypes={searchTypes}
          onValueChange={onValueChange}
        />
      )
    })
  }

  const clearFilters = async (): Promise<void> => {
    setFilterTags([])
    setSelectedOptions([])
    await onClearFilter()
  }

  const autoCompleteOnValueChange = async (
    value: AutoCompleteOption[]
  ): Promise<void> => {
    setFilterTags(value)

    const tagList: Array<string> = value.map(
      (option: AutoCompleteOption) => option.label
    )
    const tags: Array<Keyword> = searchCategories?.tags?.filter(
      (result: Keyword) => tagList.includes(result.label)
    )

    await onSetTagsFilter(tags)
  }

  return (
    <div className={styles.container}>
      <p className={styles.header}>Filter your results</p>
      <div className={styles.tagsContainer}>
        <FacetedSearchClearFilterButton onClick={clearFilters} />
        <FacetedSearchFilterAutoComplete
          onValueChange={autoCompleteOnValueChange}
          value={filterTags}
          name={'facetedSearch'}
          placeholder={'Filter on tags'}
          tags={searchCategories?.tags || []}
        />
      </div>
      <div className={styles.searchCategoryContainer}>
        {getSearchElements()}
      </div>
    </div>
  )
}
