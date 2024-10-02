import { ThemeToggler } from '@/components/theme-toggler'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pen, ShoppingCart } from 'lucide-react'
import { NextPage } from 'next'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

interface Grocery {
  id: string
  name: string
  price: number
  quantity: number
  caught: boolean
  createdAt: Date
  updatedAt: Date
}

type Groceries = Grocery[]

const data: Groceries = [
  {
    id: uuidv4(),
    name: 'Item 1',
    price: 0.0,
    quantity: 0,
    caught: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Item 2',
    price: 10.0,
    quantity: 2,
    caught: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Item 3',
    price: 5.25,
    quantity: 4,
    caught: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const createItemFormSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().min(0),
  caught: z.boolean(),
})

type CreateItemFormData = z.infer<typeof createItemFormSchema>

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

  const caughtItems = useMemo(
    () => groceries.filter((item) => item.caught) ?? [],
    [groceries],
  )
  const total = useMemo(
    () =>
      caughtItems
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2) ?? 0,
    [caughtItems],
  )

  const loadGroceries = useCallback(async () => {
    try {
      setGroceries(data)
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

  const createItem = (data: CreateItemFormData) => {
    try {
      const item = {
        id: uuidv4(),
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        caught: data.caught,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      console.log(item)

      setGroceries((oldGroceries) => [...oldGroceries, item])

      handleCancelCreateItem()
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateItem = (id: string) => {
    try {
      setGroceries((oldGroceries) =>
        oldGroceries.map((grocery) =>
          grocery.id === id ? { ...grocery, caught: !grocery.caught } : grocery,
        ),
      )
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
          <span className="text-lg font-bold leading-none">Grocereease</span>
        </div>
        <ThemeToggler />
      </nav>
      <main className="mx-auto max-w-[1200px] w-full px-4 mt-10">
        <div className="flex justify-between items-center gap-4 flex-col md:flex-row">
          <h2 className="text-xl font-bold text-center">Lista de compras</h2>
          <div>
            <p className="text-center">
              {caughtItems.length} de {groceries.length} itens pegos, total de
              R$
              {total}
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
          {groceries.map((item) => (
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
                      item.price === 0 &&
                      'data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500',
                  )}
                  defaultChecked={item.caught}
                  onClick={() => handleUpdateItem(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className={cn('font-semibold', item.caught && 'line-through')}
                >
                  {item.name}
                </label>
              </div>
              <div className="flex items-center gap-8 justify-between max-w-[300px] w-full">
                <div className="flex items-center gap-4 flex-1 flex-wrap text-center md:text-left">
                  <span className="text-xs flex-1">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <span className="text-xs flex-1">
                    {item.quantity} unidades
                  </span>
                </div>
                <Button variant="outline" size="icon">
                  <Pen className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

Home.displayName = 'Home'

export default Home
