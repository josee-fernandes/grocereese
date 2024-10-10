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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Portal } from '../portal'
import { useCallback } from 'react'
import { destroy } from '@/utils/local'
import { toast } from 'sonner'

interface DeleteListDialogProps {
  isOpen: boolean
  listId: string
  setLists: React.Dispatch<React.SetStateAction<Lists>>
  onOpenChange: (isOpen: boolean) => void
}

export const DeleteListDialog: React.FC<DeleteListDialogProps> = ({
  isOpen,
  listId,
  setLists,
  onOpenChange,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const onInteract = () => {
    onOpenChange(false)
  }

  const handleDeleteList = useCallback(async () => {
    try {
      await destroy<List>('lists', listId)

      setLists((oldLists) => oldLists.filter((list) => list.id !== listId))

      toast.success('Sucesso!', {
        description: `Lista removida com sucesso!`,
      })
    } catch (error) {
      console.error(error)
    }
  }, [listId, setLists])

  if (isDesktop) {
    return (
      <Portal>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Remover lista</DialogTitle>
              <DialogDescription className="sr-only">
                Você realmente quer deletar esta lista? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <p>
              Você realmente quer deletar esta lista? Esta ação não pode ser
              desfeita.
            </p>
            <DialogFooter>
              <Button onClick={onInteract} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={handleDeleteList} variant="destructive">
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
            <DrawerTitle>Remover lista</DrawerTitle>
            <DrawerDescription className="sr-only">
              Você realmente quer deletar esta lista? Esta ação não pode ser
              desfeita.
            </DrawerDescription>
          </DrawerHeader>
          <p className="p-4">
            Você realmente quer remover esta lista? Esta ação não pode ser
            desfeita.
          </p>
          <DrawerFooter className="pt-2">
            <Button onClick={onInteract} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteList} variant="destructive">
              Confirmar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Portal>
  )
}

DeleteListDialog.displayName = 'DeleteListDialog'
