import { DeleteGroceryItemDialog } from '@/components/groceries/delete-grocery-item-dialog'
import { NoGroceriesFallback } from '@/components/groceries/no-groceries-fallback'
import { ThemeToggler } from '@/components/theme-toggler'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getAll, save } from '@/utils/local'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Pencil, PencilOff, ShoppingCart, Trash } from 'lucide-react'
import { NextPage } from 'next'
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

const Home: NextPage = () => {
  const { register, handleSubmit, reset } = useForm<CreateItemFormData>({
    defaultValues: {
      name: '',
      price: 0,
      quantity: 0,
      caught: false,
    },
    resolver: zodResolver(createItemFormSchema),
  })

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

  const loadGroceries = useCallback(async () => {
    try {
      const response = await getAll<Groceries>('groceries')

      setGroceries(response)
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
      const item: GroceryItem = {
        id: uuidv4(),
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        caught: data.caught,
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

      const updatedItem: GroceryItem = {
        id: editingItem.id,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        caught: editingItem.caught,
        createdAt: editingItem.createdAt,
        updatedAt: new Date(),
      }

      await save<GroceryItem>('groceries', updatedItem)

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

  useEffect(() => {
    loadGroceries()
  }, [loadGroceries])

  return (
    <div>
      <nav className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="font-bold flex items-center gap-2">
          <ShoppingCart className="size-4" />
          <span className="text-lg font-bold leading-none">Grocereese</span>
        </div>
        <ThemeToggler />
      </nav>
      <main className="mx-auto max-w-[1200px] w-full px-4 py-10">
        <div className="flex justify-between items-center gap-4 flex-col md:flex-row">
          <div className="flex items-center gap-2 flex-col md:flex-row">
            <h2 className="text-xl font-bold text-center">Lista de compras</h2>
            <Separator orientation="vertical" className="hidden h-6 md:block" />
            <span className="text-sm text-muted-foreground font-semibold">
              {new Intl.DateTimeFormat('pt-BR').format(new Date())}
            </span>
          </div>
          <div>
            <p className="text-center text-sm font-semibold md:text-right text-muted-foreground">
              {caughtItems.length} de {groceries.length} itens pegos, total de{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(total)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-6">
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
              <div className="flex items-center gap-2 flex-1">
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
                  'flex items-center justify-between gap-2 p-4 border rounded flex-col md:flex-row',
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
                <div className="flex items-center gap-4 justify-between max-w-96">
                  {isEditing ? (
                    <form
                      className="flex items-center gap-4"
                      onSubmit={handleSubmitUpdate(handleUpdateItem)}
                    >
                      <div className="flex items-center gap-4 flex-1 flex-wrap text-center md:text-left">
                        <div className="text-xs flex items-center gap-2">
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
                        <div className="text-xs flex items-center gap-2">
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
                      <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-4 mr-12">
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
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleOpenDeleteGroceryItemDialog(item.id)
                        }
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

Home.displayName = 'Home'

export default Home
