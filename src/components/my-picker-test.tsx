import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface PickerOption {
  label: string
  value: string
}

interface CustomPickerProps {
  onValueChange?: (value: { reais: string; centavos: string }) => void
  initialValue?: { reais: string; centavos: string }
}

const reaisOptions: PickerOption[] = Array.from({ length: 100 }, (_, i) => ({
  label: i.toString(),
  value: i.toString(),
}))

const centavosOptions: PickerOption[] = Array.from({ length: 100 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: i.toString().padStart(2, '0'),
}))

export const MyPicker: React.FC<CustomPickerProps> = ({
  onValueChange,
  initialValue = { reais: '0', centavos: '00' },
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedValue, setSelectedValue] = useState(initialValue)
  const [tempValue, setTempValue] = useState(initialValue)

  // Update internal state when initialValue changes
  useEffect(() => {
    setSelectedValue(initialValue)
    setTempValue(initialValue)
  }, [initialValue.reais, initialValue.centavos, initialValue])

  const handleConfirm = () => {
    setSelectedValue(tempValue)
    onValueChange?.(tempValue)
    setIsVisible(false)
  }

  const handleCancel = () => {
    setTempValue(selectedValue)
    setIsVisible(false)
  }

  const handleReaisChange = (value: string) => {
    setTempValue((prev) => ({ ...prev, reais: value }))
  }

  const handleCentavosChange = (value: string) => {
    setTempValue((prev) => ({ ...prev, centavos: value }))
  }

  return (
    <>
      <button
        type="button"
        className="border border-gray-300 rounded-md px-3 py-2 text-xs min-w-20 text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsVisible(true)}
      >
        {selectedValue.reais},{selectedValue.centavos}
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 max-h-96 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Selecionar Preço
              </h3>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Reais
                </label>
                <select
                  value={tempValue.reais}
                  onChange={(e) => handleReaisChange(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
                  size={6}
                >
                  {reaisOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      R$ {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-px bg-gray-300 self-stretch" />

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Centavos
                </label>
                <select
                  value={tempValue.centavos}
                  onChange={(e) => handleCentavosChange(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
                  size={6}
                >
                  {centavosOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      ,{option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
