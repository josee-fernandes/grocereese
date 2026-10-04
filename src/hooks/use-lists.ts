import { useCallback, useEffect } from 'react'

import { useListsStore } from '@/stores/lists'

export function useLists() {
	const lists = useListsStore((state) => state.lists)
	const hydrated = useListsStore((state) => state.hydrated)
	const hydrate = useListsStore((state) => state.hydrate)
	const addList = useListsStore((state) => state.addList)
	const createList = useListsStore((state) => state.createList)
	const updateList = useListsStore((state) => state.updateList)
	const removeList = useListsStore((state) => state.removeList)

	useEffect(() => {
		if (!hydrated) {
			void hydrate()
		}
	}, [hydrate, hydrated])

	const getListById = useCallback((id: string) => lists.find((list) => list.id === id) ?? null, [lists])

	return {
		lists,
		hydrated,
		hydrate,
		addList,
		createList,
		updateList,
		removeList,
		getListById,
	}
}
