import { ShoppingBasket } from 'lucide-react'
import { FC } from 'react'

export const NoGroceriesFallback: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 h-96 border rounded border-dashed">
      <ShoppingBasket className="size-12 md:size-20 text-muted-foreground stroke-2" />
      <p className="text-center text-sm md:text-base text-muted-foreground max-w-96">
        Não encontramos nenhum item na sua lista de compras. Comece adicionando
        acima.
      </p>
    </div>
  )
}
