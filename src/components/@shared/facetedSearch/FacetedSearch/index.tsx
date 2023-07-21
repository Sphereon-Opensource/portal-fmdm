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
  searchCategories,
  chainIds,
  setPageAssets
}: {
  searchCategories: Array<AggregationResult>
  chainIds: Array<number>
  setPageAssets: (queryString: any) => Promise<void>
}): ReactElement {
  const [filterTags, setFilterTags] = useState<MultiValue<AutoCompleteOption>>(
    []
  ) // TODO this needs to contain the other values as well
  const [selectedOptions, setSelectedOptions] = useState<
    Array<{
      category: string
      label: string
      isSelected: boolean
    }>
  >([])

  // useEffect(() => {
  //
  // }, [searchCategories])

  const getTags = (): Array<{ label: string; value: string }> => {
    // TODO tags should be seperate
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
    const assets: PagedAssets = await getResults(
      {
        dynamicFilters: [
          {
            location: 'metadata.tags.keyword',
            value: 'netherlands'
          }
        ]
      },
      chainIds
    )

    console.log(JSON.stringify(assets))

    await setPageAssets(assets)
  }

  // TODO remove
  // useEffect(() => {
  //   console.log(JSON.stringify(selectedOptions))
  // }, [selectedOptions])

  // TODO any
  const getSearchElements = (): Array<ReactElement> => {
    return searchCategories.map((searchCategory: AggregationResult) => {
      // Skipping Tags as these are available in the tag filter input
      if (searchCategory.category === 'Tags') {
        return null
      }

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
                { category: searchCategory.category, label, isSelected }
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
            }

            await executeSearch()
          }}
        />
      )
    })
  }

  const clearFilters = async (): Promise<void> => {
    setFilterTags([])
    setSelectedOptions([])
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
