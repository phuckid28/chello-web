import { useCallback } from 'react'
import { debounce } from 'lodash'

export const useDebounceFn = (fnToDebounce, delay = 500) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(fnToDebounce, delay), [fnToDebounce, delay])
}
