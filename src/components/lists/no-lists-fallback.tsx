import { NotepadText } from 'lucide-react'

export const NoListsFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 h-96 border rounded border-dashed">
      <NotepadText className="size-12 md:size-20 text-muted-foreground stroke-2" />
      <p className="text-center text-sm md:text-base text-muted-foreground max-w-96">
        Não encontramos nenhuma lista de compras. Comece criando uma lista
        acima.
      </p>
    </div>
  )
}

NoListsFallback.displayName = 'NoListsFallback'
