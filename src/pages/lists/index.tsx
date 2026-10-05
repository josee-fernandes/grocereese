import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, ImportIcon, PencilIcon, PencilOffIcon, TrashIcon } from 'lucide-react'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { CreateListDialog } from '@/components/create-list-dialog'
import { DeleteListDialog } from '@/components/lists/delete-list-dialog'
import { NoListsFallback } from '@/components/lists/no-lists-fallback'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLists } from '@/hooks/use-lists'
import { cn } from '@/lib/utils'
import { save } from '@/utils/local'

const updateListFormSchema = z.object({
	name: z.string().min(1),
})

type UpdateListFormData = z.infer<typeof updateListFormSchema>

const ListsPage: NextPage = () => {
	const router = useRouter()
	const { lists, addList, updateList } = useLists()
	const [editingListId, setEditingListId] = useState('')
	const [deletingListId, setDeletingListId] = useState('')
	const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false)
	const [hasActionHovering, setHasActionHovering] = useState(false)

	const editingList = useMemo(() => lists.find((list) => list.id === editingListId) ?? null, [lists, editingListId])

	const {
		register: registerUpdate,
		handleSubmit: handleSubmitUpdate,
		reset: resetUpdate,
	} = useForm<UpdateListFormData>({
		values: {
			name: editingList?.name ?? '',
		},
		resolver: zodResolver(updateListFormSchema),
	})

	const handleEditList = (id: string) => {
		setEditingListId(id)
	}

	const handleCancelEditList = () => {
		setEditingListId('')
	}

	const handleUpdateList = async (data: UpdateListFormData) => {
		try {
			if (!editingList) throw new Error('Editing list not found')

			const updatedList: List = {
				id: editingList.id,
				name: data.name,
				createdAt: editingList.createdAt,
				updatedAt: new Date(),
			}

			await updateList(updatedList)

			handleCancelEditList()
			resetUpdate()

			toast.success('Sucesso!', {
				description: 'Lista atualizada com sucesso!',
			})
		} catch (error) {
			console.error(error)
		}
	}

	const updateDeleteListDialogOpen = (isOpen: boolean) => {
		setIsDeleteListDialogOpen(isOpen)
	}

	const handleOpenDeleteListDialog = (id: string) => {
		try {
			setIsDeleteListDialogOpen(true)
			setDeletingListId(id)
		} catch (error) {
			console.error(error)
		}
	}

	const handleActionMouseEnter = useCallback(() => {
		setHasActionHovering(true)
	}, [])

	const handleActionMouseLeave = useCallback(() => {
		setHasActionHovering(false)
	}, [])

	const handleRedirectToList = useCallback(
		(id: string) => {
			if (!hasActionHovering) {
				router.push(`/lists/${id}`)
			}
		},
		[hasActionHovering, router],
	)

	const handleImportList = useCallback(async () => {
		try {
			const data = await navigator.clipboard.readText()

			const parsedData = JSON.parse(data) as List & { groceries: GroceryItem[] }

			const { groceries, ...list } = parsedData

			await addList(list)

			for (const grocery of groceries) {
				await save<GroceryItem>('groceries', grocery)
			}

			toast.success('Sucesso!', {
				description: 'Lista importada com sucesso!',
			})
		} catch {
			toast.info('Nenhuma lista válida copiada para importação.')
		}
	}, [addList])

	return (
		<div>
			<Navbar />
			<main className="mx-auto max-w-300 w-full px-4 md:px-6 py-10">
				<div className="flex justify-between items-center gap-4 flex-col md:flex-row flex-wrap">
					<div className="flex justify-between items-center gap-2 flex-wrap w-full">
						<h2 className="text-lg font-bold">Listas de compras</h2>
						<Button className="gap-2" onClick={handleImportList}>
							<ImportIcon className="size-4" />
							Importar lista copiada
						</Button>
					</div>
				</div>
				<div className="flex flex-col gap-2 mt-6 flex-wrap" onMouseEnter={handleActionMouseLeave}>
					<CreateListDialog />
					{lists.map((list) => {
						const isEditing = list.id === editingListId

						return (
							<div
								key={list.id}
								className={cn(
									'group flex items-center justify-between gap-2 px-4 py-2 bg-muted border rounded-xl hover:bg-accent cursor-pointer transition-all flex-wrap',
									{ 'border-accent animate-pulse': isEditing },
								)}
								onClick={() => handleRedirectToList(list.id)}
							>
								<div className="flex items-center gap-4 flex-1">
									{isEditing ? (
										<Input
											placeholder="Nome do item da compra"
											onClick={(event) => event.stopPropagation()}
											onMouseEnter={handleActionMouseEnter}
											onMouseLeave={handleActionMouseLeave}
											{...registerUpdate('name')}
										/>
									) : (
										<label htmlFor={list.id}>{list.name}</label>
									)}
								</div>
								<div className="flex items-center gap-2 justify-between max-w-96 flex-wrap">
									{isEditing ? (
										<form className="flex items-center gap-2 flex-wrap" onSubmit={handleSubmitUpdate(handleUpdateList)}>
											<Button
												type="submit"
												variant="outline"
												size="icon"
												onMouseEnter={handleActionMouseEnter}
												onMouseLeave={handleActionMouseLeave}
												onClick={(event) => {
													event.stopPropagation()

													handleActionMouseLeave()
												}}
											>
												<CheckIcon className="size-4" />
											</Button>
											<Button
												type="reset"
												variant="outline"
												size="icon"
												onClick={(event) => {
													event.stopPropagation()
													handleCancelEditList()
													handleActionMouseLeave()
												}}
												onMouseEnter={handleActionMouseEnter}
												onMouseLeave={handleActionMouseLeave}
											>
												<PencilOffIcon className="size-4" />
											</Button>
										</form>
									) : (
										<>
											<Button
												variant="outline"
												size="icon"
												onClick={(event) => {
													event.stopPropagation()

													handleEditList(list.id)
												}}
												onMouseEnter={handleActionMouseEnter}
												onMouseLeave={handleActionMouseLeave}
												className="group-hover:opacity-100 md:opacity-0"
											>
												<PencilIcon className="size-4" />
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={(event) => {
													event.stopPropagation()

													handleOpenDeleteListDialog(list.id)
												}}
												onMouseEnter={handleActionMouseEnter}
												// onMouseLeave={handleActionMouseLeave}
												className="group-hover:opacity-100 md:opacity-0"
											>
												<TrashIcon className="size-4" />
											</Button>
											{deletingListId === list.id && (
												<DeleteListDialog
													isOpen={isDeleteListDialogOpen}
													listId={list.id}
													onOpenChange={updateDeleteListDialogOpen}
												/>
											)}
										</>
									)}
								</div>
							</div>
						)
					})}
					{lists.length === 0 && <NoListsFallback />}
				</div>
			</main>
		</div>
	)
}

export default ListsPage
