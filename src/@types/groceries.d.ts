interface GroceryItem {
  id: string
  name: string
  price: number
  quantity: number
  caught: boolean
  createdAt: Date
  updatedAt: Date
}

type Groceries = GroceryItem[]
