import { NoListsFallback } from '@/components/lists/no-lists-fallback'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAll, save } from '@/utils/local'
import { zodResolver } from '@hookform/resolvers/zod'
import { NextPage } from 'next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Check, Pencil, PencilOff, Trash } from 'lucide-react'
import { DeleteListDialog } from '@/components/lists/delete-list-dialog'
import { useRouter } from 'next/navigation'

const createListFormSchema = z.object({
  name: z.string().min(1),
})

type CreateListFormData = z.infer<typeof createListFormSchema>

const updateListFormSchema = z.object({
  name: z.string().min(1),
})

type UpdateListFormData = z.infer<typeof updateListFormSchema>

const ListsPage: NextPage = () => {
  const router = useRouter()

  const { register, handleSubmit, reset } = useForm<CreateListFormData>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createListFormSchema),
  })

  const [lists, setLists] = useState<Lists>([])
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [editingListId, setEditingListId] = useState('')
  const [deletingListId, setDeletingListId] = useState('')
  const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false)
  const [hasActionHovering, setHasActionHovering] = useState(false)

  const editingList = useMemo(
    () => lists.find((list) => list.id === editingListId) ?? null,
    [lists, editingListId],
  )

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

  const loadLists = useCallback(async () => {
    try {
      const response = await getAll<Lists>('lists')

      setLists(response)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const handleShowCreateListForm = useCallback(() => {
    setIsCreatingList(true)
  }, [])

  const handleCancelCreateList = useCallback(() => {
    setIsCreatingList(false)
    reset()
  }, [reset])

  const createList = async (data: CreateListFormData) => {
    try {
      const item: List = {
        id: uuidv4(),
        name: data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await save<List>('lists', item)

      setLists((oldLists) => [...oldLists, item])

      handleCancelCreateList()
    } catch (error) {
      console.error(error)
    }
  }

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

      await save<List>('lists', updatedList)

      setLists((oldLists) =>
        oldLists.map((list) =>
          list.id === editingListId ? updatedList : list,
        ),
      )

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

  useEffect(() => {
    loadLists()
  }, [loadLists])

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-[1200px] w-full px-4 md:px-6 py-10">
        <div className="flex justify-between items-center gap-4 flex-col md:flex-row flex-wrap">
          <div className="flex items-center gap-2 flex-col md:flex-row flex-wrap">
            <h2 className="text-xl font-bold text-center">Listas de compras</h2>
          </div>
        </div>
        <div
          className="flex flex-col gap-2 mt-6 flex-wrap"
          onMouseEnter={handleActionMouseLeave}
        >
          {!isCreatingList && (
            <Button
              variant="outline"
              className="border-dashed !p-4 h-max"
              onClick={handleShowCreateListForm}
            >
              Criar lista
            </Button>
          )}
          {isCreatingList && (
            <form
              className="flex items-center justify-between gap-2 p-2 border rounded border-dashed flex-wrap md:flex-nowrap"
              onSubmit={handleSubmit(createList)}
            >
              <Input
                placeholder="Digite aqui o nome do item ..."
                className="border-none"
                {...register('name')}
              />
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <Button type="submit" className="flex-1">
                  Adicionar
                </Button>
                <Button
                  type="reset"
                  variant="secondary"
                  className="flex-1"
                  onClick={handleCancelCreateList}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
          {lists.map((list) => {
            const isEditing = list.id === editingListId

            return (
              <div
                key={list.id}
                className={cn(
                  'group flex items-center justify-between gap-2 p-4 border rounded flex-col md:flex-row hover:bg-accent cursor-pointer transition-all flex-wrap',
                  isEditing && 'border-sky-500',
                )}
                onClick={() => handleRedirectToList(list.id)}
                // onClick={(event) => {
                //   console.log('item clicado', event)
                // }}
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
                    <label htmlFor={list.id} className="font-semibold">
                      {list.name}
                    </label>
                  )}
                </div>
                <div className="flex items-center gap-4 justify-between max-w-96 flex-wrap">
                  {isEditing ? (
                    <form
                      className="flex items-center gap-2 flex-wrap"
                      onSubmit={handleSubmitUpdate(handleUpdateList)}
                    >
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
                        <Check className="size-4" />
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
                        <PencilOff className="size-4" />
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
                        <Pencil className="size-4" />
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
                        <Trash className="size-4" />
                      </Button>
                      {deletingListId === list.id && (
                        <DeleteListDialog
                          isOpen={isDeleteListDialogOpen}
                          listId={list.id}
                          setLists={setLists}
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

ListsPage.displayName = 'ListsPage'

export default ListsPage
