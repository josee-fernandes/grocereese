import { ThemeToggler } from '@/components/theme-toggler'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingCart } from 'lucide-react'
import { NextPage } from 'next'
import { useCallback, useEffect, useState } from 'react'
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
    name: 'Item 2',
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
        <h2 className="text-xl font-bold">Grocery list</h2>
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
              className="flex items-center justify-between gap-2 p-2 border rounded border-dashed"
              onSubmit={handleSubmit(createItem)}
            >
              <Input
                placeholder="Digite aqui o nome do item ..."
                className="border-none"
                {...register('name')}
              />
              <Button type="submit" className="">
                Adicionar
              </Button>
              <Button
                type="reset"
                variant="secondary"
                className=""
                onClick={handleCancelCreateItem}
              >
                Cancelar
              </Button>
            </form>
          )}
          {groceries.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between gap-2 p-4 border rounded',
                item.caught && 'text-emerald-500',
              )}
            >
              <p className={cn(item.caught && 'line-through')}>{item.name}</p>
              <div className="flex items-center gap-8 justify-between max-w-[300px] w-full">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-xs flex-1">
                    R$ {item.price.toFixed(2)}
                  </span>
                  <span className="text-xs flex-1 text-muted-foreground">
                    {item.quantity} unidades
                  </span>
                </div>
                <Checkbox
                  className={cn(
                    item.caught &&
                      'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500',
                  )}
                  defaultChecked={item.caught}
                  onClick={() => handleUpdateItem(item.id)}
                />
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
