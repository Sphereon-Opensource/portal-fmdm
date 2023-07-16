import React, { ReactElement, useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import { MultiValue, OnChangeValue } from 'react-select'
import { useField } from 'formik'
// import { InputProps } from '../..'
import { getTagsList } from '@utils/aquarius'
// import { chainIds } from '../../../../../../app.config'
import { useCancelToken } from '@hooks/useCancelToken'
import styles from './index.module.css'
import { matchSorter } from 'match-sorter'
import { InputProps } from '../../FormInput'
import { chainIds } from 'app.config'

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
}): ReactElement {
  // console.log(`TagsAutoComplete: ${JSON.stringify(props)}`)
  const { name, placeholder, value, onValueChange } = props
  const [tagsList, setTagsList] = useState<AutoCompleteOption[]>()
  const [matchedTagsList, setMatchedTagsList] = useState<AutoCompleteOption[]>(
    []
  )
  // const [field, meta, helpers] = useField(name)
  const [input, setInput] = useState<string>()
  const [selected, setSelected] = useState<MultiValue<AutoCompleteOption>>([])

  const newCancelToken = useCancelToken()

  const generateAutocompleteOptions = (
    options: string[]
  ): AutoCompleteOption[] => {
    return options?.map((tag) => ({
      value: tag,
      label: tag
    }))
  }

  const defaultTags = [{ label: 'sphereon', value: 'also_sphereon' }]

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

  const handleChange = (userInput: OnChangeValue<AutoCompleteOption, true>) => {
    setSelected(userInput)
    const normalizedInput = userInput.map((input) => input.value)
    console.log(`normalizedInput ${normalizedInput}`)
    // helpers.setValue(normalizedInput)
    // helpers.setTouched(true)
  }

  const handleOptionsFilter = (
    options: AutoCompleteOption[],
    input: string
  ): void => {
    setInput(input)
    const matchedTagsList = matchSorter(options, input, { keys: ['value'] })
    setMatchedTagsList(matchedTagsList)
  }

  return (
    <CreatableSelect
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
      className={styles.select}
      // defaultValue={defaultTags}
      hideSelectedOptions
      isMulti
      isClearable={true}
      onChange={onValueChange} // (value: AutoCompleteOption[]) => handleChange(value)}
      onInputChange={(value) => handleOptionsFilter(tagsList, value)}
      openMenuOnClick
      options={!input || input?.length < 1 ? [] : matchedTagsList}
      placeholder={placeholder}
      value={value} // TODO selected}
      theme={(theme) => ({
        ...theme,
        colors: { ...theme.colors, primary25: 'var(--border-color)' }
      })}
    />
  )
}
