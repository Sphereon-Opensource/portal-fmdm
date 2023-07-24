import React, { ReactElement, useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import { components, MultiValue, OnChangeValue } from 'react-select'
import { useField } from 'formik'
// import { InputProps } from '../..'
import { getTagsList } from '@utils/aquarius'
// import { chainIds } from '../../../../../../app.config'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { matchSorter } from 'match-sorter'
import { InputProps } from '../../FormInput'
import { chainIds } from 'app.config'
import { Keyword } from '@components/Search/utils'

export interface AutoCompleteOption {
  readonly value: string
  readonly label: string
}

// TODO supply value and onChange and manage it from outside to be able to clear it

export default function FacetedSearchFilterAutoComplete({
  ...props
}: InputProps & {
  value: MultiValue<AutoCompleteOption>
  onValueChange: (value: AutoCompleteOption[]) => void
  tags: Array<{ label: string; value: string }>
}): ReactElement {
  // console.log(`TagsAutoComplete: ${JSON.stringify(props)}`)
  const {
    // name,
    placeholder,
    value,
    onValueChange,
    tags
  } = props
  const [tagsList, setTagsList] = useState<AutoCompleteOption[]>()
  // const [matchedTagsList, setMatchedTagsList] = useState<AutoCompleteOption[]>(
  //     []
  // )
  // const [field, meta, helpers] = useField(name)
  // const [input, setInput] = useState<string>()
  // const [selected, setSelected] = useState<MultiValue<AutoCompleteOption>>([])

  const newCancelToken = useCancelToken()

  const generateAutocompleteOptions = (
    options: string[]
  ): AutoCompleteOption[] => {
    return options?.map((tag: string) => ({
      value: tag,
      label: tag
    }))
  }

  // const defaultTags = !field.value
  //   ? undefined
  //   : generateAutocompleteOptions(field.value)

  useEffect(() => {
    const generateTagsList = async () => {
      const tags = ['Sphereon'] // await getTagsList(chainIds, newCancelToken())
      const autocompleteOptions = generateAutocompleteOptions(tags)
      setTagsList(autocompleteOptions)
    }
    generateTagsList()
  }, [newCancelToken])

  // const handleChange = (userInput: OnChangeValue<AutoCompleteOption, true>) => {
  //   // setSelected(userInput)
  //   const normalizedInput = userInput.map((input) => input.value)
  //   // helpers.setValue(normalizedInput)
  //   // helpers.setTouched(true)
  // }

  // const handleOptionsFilter = (
  //   options: AutoCompleteOption[],
  //   input: string
  // ): void => {
  //   // setInput(input)
  //   const matchedTagsList = matchSorter(options, input, { keys: ['value'] })
  //   // setMatchedTagsList(matchedTagsList)
  // }

  return (
    <CreatableSelect
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
      className={styles.select}
      hideSelectedOptions
      isMulti
      isClearable={true}
      onChange={onValueChange} // (value: AutoCompleteOption[]) => handleChange(value)}
      // onInputChange={(value) => handleOptionsFilter(tagsList, value)}
      openMenuOnClick
      options={tags
        .slice()
        .sort((a: Keyword, b: Keyword) => a.label.localeCompare(b.label))}
      placeholder={placeholder}
      value={value}
      theme={(theme) => ({
        ...theme,
        colors: { ...theme.colors, primary25: 'var(--border-color)' }
      })}
      noOptionsMessage={() => null}
      isValidNewOption={() => false}
    />
  )
}
