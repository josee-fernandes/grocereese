import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
	ArrowDown10Icon,
	ArrowDownAzIcon,
	ArrowLeftIcon,
	ArrowUp10Icon,
	Check,
	CopyIcon,
	ExternalLinkIcon,
	Pencil,
	PencilOff,
	PlusIcon,
	SearchIcon,
	Trash,
} from 'lucide-react'
import { NextPage } from 'next'
import { useRouter as useNavigation } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { DeleteGroceryItemDialog } from '@/components/groceries/delete-grocery-item-dialog'
import { NoGroceriesFallback } from '@/components/groceries/no-groceries-fallback'
import { Navbar } from '@/components/navbar'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ShineBorder } from '@/components/ui/shine-border'
import { useLists } from '@/hooks/use-lists'
import { cn } from '@/lib/utils'
import { destroy, getAll, save } from '@/utils/local'

const createItemFormSchema = z.object({
	name: z.string().min(1, { error: 'Nome do item é obrigatório' }),
	price: z.number().min(0),
	quantity: z.number().min(0),
	caught: z.boolean(),
})

type CreateItemFormData = z.infer<typeof createItemFormSchema>

const updateItemFormSchema = z.object({
	name: z.string().min(1),
	price: z.number().min(0),
	quantity: z.number().min(0),
})

type UpdateItemFormData = z.infer<typeof updateItemFormSchema>

const filterFormSchema = z.object({
	name: z.string().max(128, { error: 'Nome pode ter no máximo 128 caracteres' }),
	sort: z.enum(['alphabetical', 'asc', 'desc']),
})

type TFilterFormSchema = z.infer<typeof filterFormSchema>

// Save groceries without a list to the first created list
const checkForGroceriesWithoutAList = async (listId: string) => {
	const groceries = await getAll<Groceries>('groceries')

	for (const item of groceries) {
		if (!item.listId) {
			await save<GroceryItem>('groceries', {
				...item,
				listId,
			})
		}
	}
}

const ListPage: NextPage = () => {
	const router = useRouter()
	const { listId } = router.query
	const navigationRouter = useNavigation()

	const {
		register,
		handleSubmit,
		reset,
		setFocus,
		formState: { errors },
	} = useForm<CreateItemFormData>({
		defaultValues: {
			name: '',
			price: 0,
			quantity: 0,
			caught: false,
		},
		resolver: zodResolver(createItemFormSchema),
	})

	const {
		register: registerFilter,
		handleSubmit: handleSubmitFilter,
		watch: watchFilter,
		setValue: setValueFilter,
	} = useForm<TFilterFormSchema>({
		resolver: zodResolver(filterFormSchema),
		values: {
			name: '',
			sort: 'alphabetical',
		},
	})

	const nameFilter = watchFilter('name')
	const sortFilter = watchFilter('sort')

	const { getListById, updateList, hydrate } = useLists()
	const [groceries, setGroceries] = useState<Groceries>([])
	const [filteredGroceries, setFilteredGroceries] = useState<Groceries>([])
	const [isCreatingItem, setIsCreatingItem] = useState(false)
	const [editingItemId, setEditingItemId] = useState('')
	const [deletingItemId, setDeletingItemId] = useState('')
	const [isDeleteGroceryItemDialogOpen, setIsDeleteGroceryItemDialogOpen] = useState(false)
	const [isShiftPressed, setIsShiftPressed] = useState(false)

	const editingItem = useMemo(
		() => groceries.find((item) => item.id === editingItemId) ?? null,
		[groceries, editingItemId],
	)

	const {
		register: registerUpdate,
		handleSubmit: handleSubmitUpdate,
		reset: resetUpdate,
	} = useForm<UpdateItemFormData>({
		values: {
			name: editingItem?.name ?? '',
			price: editingItem?.price ?? 0,
			quantity: editingItem?.quantity ?? 0,
		},
		resolver: zodResolver(updateItemFormSchema),
	})

	const list = useMemo(() => (listId ? getListById(listId.toString()) : null), [listId, getListById])

	const caughtItems = useMemo(() => groceries.filter((item) => item.caught) ?? [], [groceries])
	const total = useMemo(
		() => caughtItems.reduce((total, item) => total + item.price * item.quantity, 0) ?? 0,
		[caughtItems],
	)

	const progress = useMemo(() => {
		if (groceries.length && caughtItems.length) {
			return Math.ceil((100 * caughtItems.length) / groceries.length)
		}

		return 0
	}, [groceries, caughtItems])

	const loadGroceries = useCallback(async (listId: string) => {
		try {
			if (!listId) throw new Error('List id not found')

			const response = await getAll<Groceries>('groceries')

			const filtered = response.filter((item) => item.listId === listId)

			filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

			setGroceries(filtered)
		} catch (error) {
			console.error(error)
		}
	}, [])

	const handleShowCreateItemForm = useCallback(() => {
		setIsCreatingItem(true)
	}, [])

	const handleCancelCreateItem = useCallback(() => {
		setIsCreatingItem(false)
		reset()
	}, [reset])

	const createItem = async (data: CreateItemFormData) => {
		try {
			if (!listId) throw new Error('List id not found')

			const item: GroceryItem = {
				id: uuidv4(),
				name: data.name,
				price: data.price,
				quantity: data.quantity,
				caught: data.caught,
				listId: listId.toString(),
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			await save<GroceryItem>('groceries', item)

			setGroceries((oldGroceries) => [...oldGroceries, item])

			handleCancelCreateItem()
			setFocus('name')
		} catch (error) {
			console.error(error)
		}
	}

	const handleToggleCaughtItem = async (id: string) => {
		try {
			const groceryItem = groceries.find((item) => item.id === id)

			if (!groceryItem) throw new Error('Grocery item not found')

			const updatedItem: GroceryItem = {
				...groceryItem,
				caught: !groceryItem.caught,
				updatedAt: new Date(),
			}

			await save<GroceryItem>('groceries', updatedItem)

			setGroceries((oldGroceries) => oldGroceries.map((grocery) => (grocery.id === id ? updatedItem : grocery)))
		} catch (error) {
			console.error(error)
		}
	}

	const handleEditItem = (id: string) => {
		setEditingItemId(id)
	}

	const handleCancelEditItem = () => {
		setEditingItemId('')
	}

	const handleUpdateItem = async (data: UpdateItemFormData) => {
		try {
			if (!editingItem) throw new Error('Editing item not found')

			if (!list) throw new Error('List for current item not found')

			const updatedItem: GroceryItem = {
				id: editingItem.id,
				name: data.name,
				price: data.price,
				quantity: data.quantity,
				caught: editingItem.caught,
				listId: editingItem.listId,
				createdAt: editingItem.createdAt,
				updatedAt: new Date(),
			}

			const updatedList: List = {
				id: list.id,
				name: list.name,
				createdAt: list.createdAt,
				updatedAt: new Date(),
			}

			await save<GroceryItem>('groceries', updatedItem)
			await updateList(updatedList)

			setGroceries((oldGroceries) => oldGroceries.map((item) => (item.id === editingItemId ? updatedItem : item)))

			handleCancelEditItem()
			resetUpdate()

			toast.success('Sucesso!', {
				description: `Item atualizado com sucesso!`,
			})
		} catch (error) {
			console.error(error)
		}
	}

	const updateDeleteGroceryItemDialogOpen = (isOpen: boolean) => {
		setIsDeleteGroceryItemDialogOpen(isOpen)
	}

	const handleDeleteGroceryItem = useCallback(async (id: string) => {
		try {
			await destroy<GroceryItem>('groceries', id)

			setGroceries((oldGroceries) => oldGroceries.filter((item) => item.id !== id))

			toast.success('Sucesso!', {
				description: 'Item removido da lista com sucesso!',
			})
		} catch (error) {
			console.error(error)
		}
	}, [])

	const handleDeleteGroceryItemClick = useCallback(
		(id: string, shiftKey: boolean) => {
			if (shiftKey) {
				void handleDeleteGroceryItem(id)
				return
			}

			setIsDeleteGroceryItemDialogOpen(true)
			setDeletingItemId(id)
		},
		[handleDeleteGroceryItem],
	)

	const handleBackToLists = useCallback(() => {
		navigationRouter.push('/lists')
	}, [navigationRouter])

	const handleCopyList = useCallback(() => {
		const data = {
			...list,
			groceries,
		}

		navigator.clipboard.writeText(JSON.stringify(data))

		toast.success('Lista copiada com sucesso!')
	}, [list, groceries])

	useEffect(() => {
		if (listId) {
			checkForGroceriesWithoutAList(listId.toString()).then(() => {
				hydrate()
				loadGroceries(listId.toString())
			})
		}
	}, [hydrate, loadGroceries, listId])

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Shift') setIsShiftPressed(true)
		}
		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'Shift') setIsShiftPressed(false)
		}
		const resetShift = () => setIsShiftPressed(false)

		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('blur', resetShift)

		return () => {
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
			window.removeEventListener('blur', resetShift)
		}
	}, [])

	// TODO: remove temporary auto sort by time
	useEffect(() => {
		const copy = [...groceries]
		const nameFiltered = copy.filter((grocery) =>
			grocery.name.toLocaleLowerCase().includes(nameFilter.toLocaleLowerCase()),
		)
		switch (sortFilter) {
			case 'alphabetical':
				nameFiltered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
				break
			case 'asc':
				nameFiltered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
				break
			case 'desc':
				nameFiltered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				break
		}
		setFilteredGroceries(nameFiltered)
	}, [groceries, nameFilter, sortFilter])

	return (
		<div>
			<Navbar />
			<main className="mx-auto max-w-300 w-full px-4 md:px-6 py-10">
				<div className="flex items-center justify-between gap-2 w-full">
					<div>
						<Button variant="outline" onClick={handleBackToLists}>
							<ArrowLeftIcon className="size-4" />
							Voltar
						</Button>
					</div>
					<div>
						<Button variant="outline" onClick={handleCopyList}>
							<CopyIcon className="size-4" />
							Copiar lista
						</Button>
					</div>
				</div>
				<div className="mt-10 flex justify-between md:items-center gap-4 flex-col md:flex-row flex-wrap md:flex-nowrap">
					<div className="flex md:items-center flex-col md:flex-row w-full flex-wrap">
						<div>
							<h2 className="font-bold">{list?.name ?? 'Lista de compras'}</h2>
							{list?.updatedAt && (
								<p className="text-sm text-muted-foreground">
									Última atualização em {format(list?.updatedAt, 'dd/MM/yyyy HH:mm')}
								</p>
							)}
						</div>
					</div>
					<div className="md:min-w-70">
						<Progress
							value={progress}
							className={cn({
								'*:bg-emerald-500 dark:*:bg-emerald-300': progress === 100,
							})}
						/>
						<div className="flex justify-between">
							<p className="mt-2 text-center text-sm md:text-right md:w-max">
								{caughtItems.length} de {groceries.length} itens pegos
							</p>
							<p className="mt-2 text-center text-sm md:text-right md:w-max">
								Total de{' '}
								{new Intl.NumberFormat('pt-BR', {
									style: 'currency',
									currency: 'BRL',
								}).format(total)}
							</p>
						</div>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="flex flex-col gap-2 mt-6 flex-wrap">
					<form onSubmit={handleSubmit(createItem)}>
						<Field>
							<FieldLabel htmlFor="name">Adicionar item</FieldLabel>
							<InputGroup>
								<InputGroupInput id="name" placeholder="Digite o nome do item" {...register('name')} />
								<InputGroupAddon align="inline-end">
									<InputGroupButton type="submit" variant="default">
										<PlusIcon className="size-4" />
										Adicionar
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
							<FieldError>{errors?.name?.message}</FieldError>
						</Field>
					</form>
					<Separator className="my-4" />
					<div className="flex items-center justify-between gap-2">
						<div>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<SearchIcon className="size-4" />
								</InputGroupAddon>
								<InputGroupInput id="filter-name" placeholder="Pesquisar" {...registerFilter('name')} />
							</InputGroup>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={sortFilter === 'alphabetical' ? 'default' : 'outline'}
								size="icon"
								onClick={() => setValueFilter('sort', 'alphabetical')}
							>
								<ArrowDownAzIcon className="size-4" />
							</Button>
							<Button
								variant={sortFilter === 'asc' ? 'default' : 'outline'}
								size="icon"
								onClick={() => setValueFilter('sort', 'asc')}
							>
								<ArrowUp10Icon className="size-4" />
							</Button>
							<Button
								variant={sortFilter === 'desc' ? 'default' : 'outline'}
								size="icon"
								onClick={() => setValueFilter('sort', 'desc')}
							>
								<ArrowDown10Icon className="size-4" />
							</Button>
						</div>
					</div>
					<div className="mt-4 flex flex-col gap-2">
						{filteredGroceries.map((item) => {
							const isEditing = item.id === editingItemId

							return (
								<div
									key={item.id}
									className={cn(
										'relative overflow-hidden group flex md:items-center justify-between gap-2 p-4 bg-muted border rounded-xl flex-col md:flex-row flex-wrap transition-all',
										{
											'text-emerald-500 opacity-50!': item.caught && item.price > 0 && item.quantity > 0,
											'text-amber-500 border-amber-500!': item.caught && (item.price === 0 || item.quantity === 0),
											'border-sky-500': isEditing,
										},
									)}
								>
									{!item.caught && (
										<>
											<ShineBorder shineColor={['var(--primary)', 'var(--accent)', 'var(--secondary)']} />
										</>
									)}
									<div className="flex items-center gap-4 flex-1">
										<Checkbox
											id={item.id}
											defaultChecked={item.caught}
											onClick={() => handleToggleCaughtItem(item.id)}
										/>
										{isEditing ? (
											<Input placeholder="Nome do item da compra" {...registerUpdate('name')} />
										) : (
											<label htmlFor={item.id} className={cn('font-semibold', item.caught && 'line-through')}>
												{item.name}
											</label>
										)}
									</div>
									<div className="flex items-center gap-4 justify-between max-w-96 flex-wrap">
										{isEditing ? (
											<form
												className="flex items-center gap-4 flex-wrap"
												onSubmit={handleSubmitUpdate(handleUpdateItem)}
											>
												<div className="flex items-center gap-4 flex-1 flex-wrap text-center md:text-left">
													<div className="text-xs flex items-center gap-2 flex-wrap">
														R$
														<Input
															placeholder="Preço"
															type="number"
															min={0}
															max={99}
															step={0.01}
															className="w-14"
															{...registerUpdate('price', { valueAsNumber: true })}
														/>
													</div>
													<Separator orientation="vertical" className="h-4" />
													<div className="text-xs flex items-center gap-2 flex-wrap">
														<Input
															placeholder="Preço"
															type="number"
															min={0}
															max={99}
															className="w-14"
															{...registerUpdate('quantity', { valueAsNumber: true })}
														/>
														unidades
													</div>
												</div>
												<div className="flex items-center gap-2 flex-wrap">
													<Button type="submit" variant="outline" size="icon">
														<Check className="size-4" />
													</Button>
													<Button type="reset" variant="outline" size="icon" onClick={handleCancelEditItem}>
														<PencilOff className="size-4" />
													</Button>
												</div>
											</form>
										) : (
											<>
												<div className="flex items-center gap-4 flex-1 flex-wrap text-center md:text-left">
													<div className="flex items-center gap-4 mr-12 flex-wrap">
														<span className="text-xs">R$ {item.price.toFixed(2)}</span>
														<Separator orientation="vertical" className="h-4" />
														<span className="text-xs">{item.quantity} unidades</span>
													</div>
												</div>
												<Button
													variant="outline"
													size="icon"
													onClick={() => handleEditItem(item.id)}
													className="group-hover:opacity-100 md:opacity-0 transition-all"
												>
													<Pencil className="size-4" />
												</Button>
												<Button
													variant={isShiftPressed ? 'destructive' : 'outline'}
													size="icon"
													onClick={(event) => handleDeleteGroceryItemClick(item.id, event.shiftKey)}
													className={cn(
														'group-hover:opacity-100 md:opacity-0 transition-all',
														isShiftPressed && 'md:opacity-100',
													)}
													title={isShiftPressed ? 'Remover sem confirmação' : 'Remover item'}
												>
													<Trash className="size-4" />
												</Button>
												{deletingItemId === item.id && (
													<DeleteGroceryItemDialog
														isOpen={isDeleteGroceryItemDialogOpen}
														groceryItemId={item.id}
														setGroceries={setGroceries}
														onOpenChange={updateDeleteGroceryItemDialogOpen}
													/>
												)}
											</>
										)}
									</div>
								</div>
							)
						})}
					</div>
					{filteredGroceries.length === 0 && <NoGroceriesFallback />}
				</div>
			</main>
		</div>
	)
}

export default ListPage
