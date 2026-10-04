import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'

import { destroy, getAll, save } from '@/utils/local'

type ListsStoreState = {
	lists: Lists
	hydrated: boolean
	hydrate: () => Promise<void>
	addList: (list: List) => Promise<void>
	createList: (name: string) => Promise<List>
	updateList: (list: List) => Promise<void>
	removeList: (id: string) => Promise<void>
}

export const useListsStore = create<ListsStoreState>((set, get) => ({
	lists: [],
	hydrated: false,

	hydrate: async () => {
		const response = await getAll<Lists>('lists')
		set({ lists: response, hydrated: true })
	},

	addList: async (list) => {
		await save<List>('lists', list)
		set((state) => ({
			lists: state.lists.some((item) => item.id === list.id)
				? state.lists.map((item) => (item.id === list.id ? list : item))
				: [...state.lists, list],
		}))
	},

	createList: async (name) => {
		const list: List = {
			id: uuidv4(),
			name,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		await get().addList(list)

		return list
	},

	updateList: async (list) => {
		await save<List>('lists', list)
		set((state) => ({
			lists: state.lists.map((item) => (item.id === list.id ? list : item)),
		}))
	},

	removeList: async (id) => {
		await destroy<List>('lists', id)
		set((state) => ({
			lists: state.lists.filter((list) => list.id !== id),
		}))
	},
}))
