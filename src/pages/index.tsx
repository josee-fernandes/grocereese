import { ThemeToggler } from '@/components/theme-toggler'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import { NextPage } from 'next'
import { v4 as uuidv4 } from 'uuid'

const groceries = [
  {
    id: uuidv4(),
    name: 'Item 1',
    price: 0.0,
    quantity: 0,
    caught: false,
  },
  {
    id: uuidv4(),
    name: 'Item 2',
    price: 10.0,
    quantity: 2,
    caught: true,
  },
  {
    id: uuidv4(),
    name: 'Item 2',
    price: 5.25,
    quantity: 4,
    caught: true,
  },
]

const Home: NextPage = () => {
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
          <Button variant="outline" className="border-dashed !p-4 h-max">
            Add item
          </Button>
          {groceries.map((grocery) => (
            <div
              key={grocery.id}
              className={cn(
                'flex items-center justify-between gap-2 p-4 border rounded',
                grocery.caught && 'text-emerald-500',
              )}
            >
              <p className={cn(grocery.caught && 'line-through')}>Item abc</p>
              <div></div>
              <Checkbox
                className={cn(
                  grocery.caught &&
                    'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500',
                )}
                defaultChecked={grocery.caught}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

Home.displayName = 'Home'

export default Home
