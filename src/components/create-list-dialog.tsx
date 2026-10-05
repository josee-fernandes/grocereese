import { zodResolver } from '@hookform/resolvers/zod'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { ListPlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLists } from '@/hooks/use-lists'

const createListFormSchema = z.object({
	name: z
		.string()
		.max(128, { message: 'Nome deve conter no máximo 128 caracteres' })
		.min(1, { message: 'Nome é obrigatório' }),
})

type TCreateListFormSchemaValues = z.infer<typeof createListFormSchema>

export function CreateListDialog() {
	const router = useRouter()
	const { createList } = useLists()

	const { register, handleSubmit } = useForm<TCreateListFormSchemaValues>({
		resolver: zodResolver(createListFormSchema),
		values: {
			name: '',
		},
	})

	const [open, setOpen] = useState(false)

	async function handleCreateList(data: TCreateListFormSchemaValues) {
		try {
			const list = await createList(data.name)

			router.push(`/lists/${list.id}`)

			// setOpen(false)
		} catch (error) {
			toast.error('Erro ao criar lista de compra')
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="border-dashed p-4! h-max gap-2">
					<ListPlusIcon className="size-4" />
					Criar nova lista
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Criar nova lista de compras</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleCreateList)}>
					<div className="my-4">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name">Nome da lista</FieldLabel>
								<Input id="name" autoComplete="off" {...register('name')} />
							</Field>
						</FieldGroup>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancelar</Button>
						</DialogClose>
						<Button>Confirmar</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
