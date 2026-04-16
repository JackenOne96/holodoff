"use client"

interface NutritionCounterProps {
  protein: number
  fat: number
  carbs: number
}

const format = (value: number) => value.toFixed(1)

export function NutritionCounter({ protein, fat, carbs }: NutritionCounterProps) {
  return (
    <div className="w-[132px] rounded-xl bg-white/95 p-2 shadow-md ring-1 ring-blue-100">
      <p className="text-[10px] font-semibold text-gray-500">Б/Ж/У (100 г)</p>
      <div className="mt-1 grid grid-cols-3 gap-1 text-center">
        <div className="rounded-md bg-blue-50 px-1 py-1">
          <p className="text-[9px] text-blue-600">Б</p>
          <p className="text-xs font-semibold text-blue-700">{format(protein)}</p>
        </div>
        <div className="rounded-md bg-orange-50 px-1 py-1">
          <p className="text-[9px] text-orange-600">Ж</p>
          <p className="text-xs font-semibold text-orange-700">{format(fat)}</p>
        </div>
        <div className="rounded-md bg-green-50 px-1 py-1">
          <p className="text-[9px] text-green-600">У</p>
          <p className="text-xs font-semibold text-green-700">{format(carbs)}</p>
        </div>
      </div>
    </div>
  )
}
