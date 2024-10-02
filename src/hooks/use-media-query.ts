import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string) => {
  const [value, setValue] = useState(false)

  const onChange = (event: MediaQueryListEvent) => {
    setValue(event.matches)
  }

  useEffect(() => {
    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}
