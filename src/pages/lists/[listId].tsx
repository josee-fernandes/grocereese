import { DeleteGroceryItemDialog } from '@/components/groceries/delete-grocery-item-dialog'
import { NoGroceriesFallback } from '@/components/groceries/no-groceries-fallback'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getAll, getById, save } from '@/utils/local'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Pencil, PencilOff, Trash } from 'lucide-react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useRouter as useNavigation } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const createItemFormSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(0),
  caught: z.boolean(),
})

type CreateItemFormData = z.infer<typeof createItemFormSchema>

const updateItemFormSchema = z.object({
  name: z.string().min(1),
  price: z
    .string()
    .min(0)
    .transform((value) => Number(value)),
  quantity: z
    .string()
    .min(0)
    .transform((value) => Number(value)),
})

type UpdateItemFormData = z.infer<typeof updateItemFormSchema>

const ListPage: NextPage = () => {
  const router = useRouter()
  const { listId } = router.query
  const navigationRouter = useNavigation()

  console.log({ listId })

  const { register, handleSubmit, reset } = useForm<CreateItemFormData>({
    defaultValues: {
      name: '',
      price: 0,
      quantity: 0,
      caught: false,
    },
    resolver: zodResolver(createItemFormSchema),
  })

  const [list, setList] = useState<List | null>(null)
  const [groceries, setGroceries] = useState<Groceries>([])
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState('')
  const [deletingItemId, setDeletingItemId] = useState('')
  const [isDeleteGroceryItemDialogOpen, setIsDeleteGroceryItemDialogOpen] =
    useState(false)

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

  const caughtItems = useMemo(
    () => groceries.filter((item) => item.caught) ?? [],
    [groceries],
  )
  const total = useMemo(
    () =>
      caughtItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ) ?? 0,
    [caughtItems],
  )

  const loadList = useCallback(async (id: string) => {
    try {
      const response = await getById<List>('lists', id)

      setList(response)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const loadGroceries = useCallback(async (listId: string) => {
    try {
      if (!listId) throw new Error('List id not found')

      const response = await getAll<Groceries>('groceries')

      const filtered = response.filter((item) => item.listId === listId)

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

      setGroceries((oldGroceries) =>
        oldGroceries.map((grocery) =>
          grocery.id === id ? updatedItem : grocery,
        ),
      )
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
      await save<List>('lists', updatedList)

      setGroceries((oldGroceries) =>
        oldGroceries.map((item) =>
          item.id === editingItemId ? updatedItem : item,
        ),
      )

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

  const handleOpenDeleteGroceryItemDialog = (id: string) => {
    try {
      setIsDeleteGroceryItemDialogOpen(true)
      setDeletingItemId(id)
    } catch (error) {
      console.error(error)
    }
  }

  const handleBackToLists = useCallback(() => {
    navigationRouter.push('/lists')
  }, [navigationRouter])

  useEffect(() => {
    if (listId) {
      loadList(listId.toString())
      loadGroceries(listId.toString())
    }
  }, [loadList, loadGroceries, listId])

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-[1200px] w-full px-4 md:px-6 py-10">
        <div className="flex justify-between items-center gap-4 flex-col md:flex-row flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-2 flex-col md:flex-row w-full flex-wrap">
            <Button
              variant="outline"
              size="icon"
              className="self-start"
              onClick={handleBackToLists}
            >
              <span className="sr-only">Voltar</span>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 flex-col md:flex-row flex-wrap">
              <h2 className="text-xl font-bold text-center">
                {list?.name ?? 'Lista de compras'}
              </h2>
              <Separator
                orientation="vertical"
                className="hidden h-6 md:block"
              />
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 leading-none flex-wrap flex-col md:flex-row">
                <span className="text-[0.625rem]">ÚLTIMA ATUALIZAÇÃO:</span>
                {list &&
                  new Intl.DateTimeFormat('pt-BR').format(
                    new Date(list?.updatedAt),
                  )}
              </p>
            </div>
          </div>
          <div>
            <p className="text-center text-sm font-semibold md:text-right text-muted-foreground md:w-max">
              {caughtItems.length} de {groceries.length} itens pegos, total de{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(total)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-6 flex-wrap">
          {!isCreatingItem && (
            <Button
              variant="outline"
              className="border-dashed !p-4 h-max"
              onClick={handleShowCreateItemForm}
            >
              Adicionar item
            </Button>
          )}
          {isCreatingItem && (
            <form
              className="flex items-center justify-between gap-2 p-2 border rounded border-dashed flex-wrap md:flex-nowrap"
              onSubmit={handleSubmit(createItem)}
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
                  onClick={handleCancelCreateItem}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
          {groceries.map((item) => {
            const isEditing = item.id === editingItemId

            return (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center justify-between gap-2 p-4 border rounded flex-col md:flex-row flex-wrap transition-all',
                  item.caught &&
                    item.price > 0 &&
                    item.quantity > 0 &&
                    'text-emerald-500',
                  item.caught &&
                    (item.price === 0 || item.quantity === 0) &&
                    'text-amber-500',
                  isEditing && 'border-sky-500',
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Checkbox
                    id={item.id}
                    className={cn(
                      item.caught &&
                        item.price > 0 &&
                        item.quantity > 0 &&
                        'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500',
                      item.caught &&
                        (item.price === 0 || item.quantity === 0) &&
                        'data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500',
                    )}
                    defaultChecked={item.caught}
                    onClick={() => handleToggleCaughtItem(item.id)}
                  />
                  {isEditing ? (
                    <Input
                      placeholder="Nome do item da compra"
                      {...registerUpdate('name')}
                    />
                  ) : (
                    <label
                      htmlFor={item.id}
                      className={cn(
                        'font-semibold',
                        item.caught && 'line-through',
                      )}
                    >
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
                            {...registerUpdate('price')}
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
                            {...registerUpdate('quantity')}
                          />
                          unidades
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button type="submit" variant="outline" size="icon">
                          <Check className="size-4" />
                        </Button>
                        <Button
                          type="reset"
                          variant="outline"
                          size="icon"
                          onClick={handleCancelEditItem}
                        >
                          <PencilOff className="size-4" />
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 flex-1 flex-wrap text-center md:text-left">
                        <div className="flex items-center gap-4 mr-12 flex-wrap">
                          <span className="text-xs">
                            R$ {item.price.toFixed(2)}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-xs">
                            {item.quantity} unidades
                          </span>
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
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleOpenDeleteGroceryItemDialog(item.id)
                        }
                        className="group-hover:opacity-100 md:opacity-0 transition-all"
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
          {groceries.length === 0 && <NoGroceriesFallback />}
        </div>
      </main>
    </div>
  )
}

ListPage.displayName = 'ListPage'

export default ListPage
