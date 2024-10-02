import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Portal } from '../portal'
import { useCallback } from 'react'
import { destroy } from '@/utils/local'

interface DeleteGroceryItemDialogProps {
  isOpen: boolean
  groceryItemId: string
  setGroceries: React.Dispatch<React.SetStateAction<Groceries>>
  onOpenChange: (isOpen: boolean) => void
}

export const DeleteGroceryItemDialog: React.FC<
  DeleteGroceryItemDialogProps
> = ({ isOpen, groceryItemId, setGroceries, onOpenChange }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const onInteract = () => {
    onOpenChange(false)
  }

  const handleDeleteGroceryItem = useCallback(async () => {
    try {
      await destroy<GroceryItem>('groceries', groceryItemId)

      setGroceries((oldGroceries) =>
        oldGroceries.filter((item) => item.id !== groceryItemId),
      )
    } catch (error) {
      console.error(error)
    }
  }, [groceryItemId, setGroceries])

  if (isDesktop) {
    return (
      <Portal>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remover item</DialogTitle>
              <DialogDescription className="sr-only">
                Você realmente quer deletar este item das compras? Esta ação não
                pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <p>
              Você realmente quer deletar este item das compras? Esta ação não
              pode ser desfeita.
            </p>
            <DialogFooter>
              <Button onClick={onInteract} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={handleDeleteGroceryItem} variant="destructive">
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Portal>
    )
  }

  return (
    <Portal>
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Remover item</DrawerTitle>
          </DrawerHeader>
          <p className="p-4">
            Você realmente quer remover este item das compras? Esta ação não
            pode ser desfeita.
          </p>
          <DrawerFooter className="pt-2">
            <Button onClick={onInteract} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteGroceryItem} variant="destructive">
              Confirmar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Portal>
  )
}

DeleteGroceryItemDialog.displayName = 'DeleteGroceryItemDialog'
