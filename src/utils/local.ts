export const getAll = async <T = any[]>(key: string) => {
  const data = localStorage.getItem(key)

  if (!data) {
    return [] as T
  }

  return JSON.parse(data) as T
}

export const getById = async <T = any>(key: string, id: string) => {
  const data = localStorage.getItem(key)

  if (!data) {
    return null
  }

  const items = JSON.parse(data) as T[]

  // @ts-expect-error will return null if not found
  const item = items.find((item) => item!.id === id) ?? null

  return item
}

export const save = async <T = any>(key: string, data: T) => {
  const items = await getAll<T>(key)

  if (Array.isArray(items)) {
    // @ts-expect-error will return null if not found
    const existing = items.find((item) => item.id === data.id)

    if (existing) {
      const updatedItems = items.map((item) =>
        // @ts-expect-error will return null if not found
        item.id === data.id ? data : item,
      )

      localStorage.setItem(key, JSON.stringify(updatedItems))
    } else {
      localStorage.setItem(key, JSON.stringify([...items, data]))
    }
  }

  return data
}

export const destroy = async <T = any>(key: string, id: string) => {
  const items = await getAll<T>(key)

  if (Array.isArray(items)) {
    const updatedItems = items.filter((item) => item.id !== id)

    localStorage.setItem(key, JSON.stringify(updatedItems))
  }
}
