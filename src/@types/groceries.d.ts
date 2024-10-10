interface GroceryItem {
  id: string
  name: string
  price: number
  quantity: number
  caught: boolean
  listId: string
  createdAt: Date
  updatedAt: Date
}

type Groceries = GroceryItem[]
