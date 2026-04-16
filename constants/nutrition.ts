export interface NutritionValues {
  protein: number
  fat: number
  carbs: number
}

export const NUTRITION_DICTIONARY: Record<string, NutritionValues> = {
  молоко: { protein: 2.9, fat: 2.5, carbs: 4.8 },
  хлеб: { protein: 8.0, fat: 1.0, carbs: 49.0 },
  яйца: { protein: 12.7, fat: 11.5, carbs: 0.7 },
  яйцо: { protein: 12.7, fat: 11.5, carbs: 0.7 },
  сыр: { protein: 24.0, fat: 30.0, carbs: 0.0 },
  курица: { protein: 23.6, fat: 1.9, carbs: 0.4 },
  говядина: { protein: 18.9, fat: 12.4, carbs: 0.0 },
  свинина: { protein: 16.0, fat: 21.6, carbs: 0.0 },
  рис: { protein: 6.7, fat: 0.7, carbs: 78.9 },
  гречка: { protein: 12.6, fat: 3.3, carbs: 62.1 },
  макароны: { protein: 10.4, fat: 1.1, carbs: 69.7 },
  картофель: { protein: 2.0, fat: 0.4, carbs: 16.3 },
  помидоры: { protein: 1.1, fat: 0.2, carbs: 3.7 },
  огурцы: { protein: 0.8, fat: 0.1, carbs: 2.8 },
  яблоки: { protein: 0.4, fat: 0.4, carbs: 9.8 },
  бананы: { protein: 1.5, fat: 0.2, carbs: 21.8 },
  творог: { protein: 18.0, fat: 5.0, carbs: 3.3 },
  сметана: { protein: 2.8, fat: 20.0, carbs: 3.2 },
  йогурт: { protein: 4.3, fat: 2.0, carbs: 6.2 },
  масло: { protein: 0.5, fat: 82.5, carbs: 0.8 },
  рыба: { protein: 18.5, fat: 4.9, carbs: 0.0 },
  лосось: { protein: 20.0, fat: 13.0, carbs: 0.0 },
  тунец: { protein: 22.0, fat: 1.0, carbs: 0.0 },
  сахар: { protein: 0.0, fat: 0.0, carbs: 99.8 },
  соль: { protein: 0.0, fat: 0.0, carbs: 0.0 },
  сок: { protein: 0.5, fat: 0.1, carbs: 10.0 },
  вода: { protein: 0.0, fat: 0.0, carbs: 0.0 },
  колбаса: { protein: 13.0, fat: 22.0, carbs: 1.5 },
  сосиски: { protein: 12.3, fat: 25.3, carbs: 0.0 },
}

export const getNutritionByName = (productName: string): NutritionValues | null => {
  const normalized = productName.trim().toLowerCase()
  if (!normalized) return null

  const entries = Object.entries(NUTRITION_DICTIONARY)
  const direct = NUTRITION_DICTIONARY[normalized]
  if (direct) return direct

  for (const [key, value] of entries) {
    if (normalized.includes(key)) {
      return value
    }
  }

  return null
}
