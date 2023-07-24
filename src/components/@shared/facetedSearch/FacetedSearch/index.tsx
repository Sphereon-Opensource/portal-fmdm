import React, { ReactElement, useEffect, useState } from 'react'
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
  // getResults,
  KeywordResult
} from '@components/Search/utils'

export default function FacetedSearch({
  searchCategories,
  // chainIds,
  // setPageAssets,
  onClearFilter,
  onSetTagsFilter,
  onSetSelectedOptions,
  onSearch
}: {
  searchCategories: AggregationResultUI
  // chainIds: Array<number>
  // setPageAssets: (assets: PagedAssets) => Promise<void>
  onClearFilter: () => Promise<void>
  onSetTagsFilter: (tags: MultiValue<AutoCompleteOption>) => void
  onSetSelectedOptions: (
    options: Array<{
      category: string
      label: string
      isSelected: boolean
      location: string
    }>
  ) => void
  onSearch: (
    // text: string,
    dynamicFilter: {
      location: string
      term: string
    }[]
  ) => Promise<void>
}): ReactElement {
  const [filterTags, setFilterTags] = useState<MultiValue<AutoCompleteOption>>(
    []
  ) // TODO this needs to contain the other values as well
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{
      category: string
      label: string
      isSelected: boolean
      location: string
    }>
  >([])

  const getTags = (): Array<{ label: string; value: string }> => {
    return (
      searchCategories?.tags.map((item: Keyword) => {
        return { label: item.label, value: item.label }
      }) || []
    )
    // if (!searchCategories?.tags) {
    //   return []
    // }
    //
    //
    // return searchCategories?.tags?.map((item: Keyword) => {
    //   return {
    //     // TODO should always be a string
    //     label: item.label as string,
    //     // FIXME setting value twice as using the location for for the value which is shared by multiple tags breaks the input
    //     value: item.label as string
    //   }
    // })
  }

  const executeSearch = async (): Promise<void> => {
    const labelList: string[] = filterTags.map((option) => option.label)
    const filteredResults = searchCategories?.tags?.filter((result: Keyword) =>
      labelList.includes(result.label as string)
    )
    // console.log(`TAGS ${JSON.stringify(filteredResults)}`)

    const tagFilter = filteredResults.map((item: Keyword) => {
      return {
        location: item.location,
        term: item.label
      }
    })

    // TODO any
    const staticFilter = selectedOptions.map((item: any) => {
      // console.log(`STATIC: ${JSON.stringify(item)}`)
      return {
        location: item.location,
        term: item.label
      }
    })

    // console.log(`FILTER: ${JSON.stringify([...tagFilter, ...staticFilter])}`)

    await onSearch([...tagFilter, ...staticFilter])

    // TODO old
    // const assets: PagedAssets = await getResults(
    //   {
    //     dynamicFilters: [...tagFilter, ...staticFilter]
    //   },
    //   chainIds
    // )

    // console.log(`ASSETS: ${JSON.stringify(assets)}`)

    // await setPageAssets(assets)
  }

  useEffect(() => {
    async function executeAsyncSearch() {
      await executeSearch()
    }
    executeAsyncSearch()
  }, [filterTags, selectedOptions])

  const getSearchElements = (): Array<ReactElement> => {
    return searchCategories.static.map((searchCategory: AggregationResult) => {
      return (
        <FacetedSearchCategory
          key={searchCategory.category}
          searchCategory={searchCategory.category}
          searchTypes={searchCategory.keywords.map((item: KeywordResult) => {
            return {
              ...item,
              isSelected: selectedOptions.some(
                (obj) =>
                  obj.category === searchCategory.category &&
                  obj.label === item.label
              )
            }
          })}
          onValueChange={async (
            label: string,
            isSelected: boolean
          ): Promise<void> => {
            if (isSelected) {
              setSelectedOptions([
                ...selectedOptions,
                // TODO look up location
                {
                  category: searchCategory.category,
                  label,
                  isSelected,
                  location: searchCategory.keywords.find(
                    (item: KeywordResult) => item.label === label
                  ).location
                }
              ])
              onSetSelectedOptions([
                ...selectedOptions,
                // TODO look up location
                {
                  category: searchCategory.category,
                  label,
                  isSelected,
                  location: searchCategory.keywords.find(
                    (item: KeywordResult) => item.label === label
                  ).location
                }
              ])
            } else {
              setSelectedOptions(
                selectedOptions.filter(
                  (item) =>
                    !(
                      item.category === searchCategory.category &&
                      item.label === label
                    )
                )
              )
              onSetSelectedOptions(
                selectedOptions.filter(
                  (item) =>
                    !(
                      item.category === searchCategory.category &&
                      item.label === label
                    )
                )
              )
            }
          }}
        />
      )
    })
  }

  const clearFilters = async (): Promise<void> => {
    setFilterTags([])
    setSelectedOptions([])
    await onClearFilter()
  }

  const autoCompleteOnValueChange = (value: AutoCompleteOption[]): void => {
    setFilterTags(value)
    onSetTagsFilter(value)
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
