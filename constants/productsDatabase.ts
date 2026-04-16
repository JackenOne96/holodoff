export interface ProductDatabaseItem {
  icon: string
  proteins: number | null
  fats: number | null
  carbs: number | null
  isFood: boolean
}

export const PRODUCTS_DATABASE: Record<string, ProductDatabaseItem> = {
  "молоко": { icon: "🥛", proteins: 2.9, fats: 2.5, carbs: 4.8, isFood: true },
  "кефир": { icon: "🥛", proteins: 3.0, fats: 2.5, carbs: 4.0, isFood: true },
  "йогурт": { icon: "🥛", proteins: 4.3, fats: 2.0, carbs: 6.2, isFood: true },
  "сметана": { icon: "🥛", proteins: 2.8, fats: 20.0, carbs: 3.2, isFood: true },
  "творог": { icon: "🍶", proteins: 18.0, fats: 5.0, carbs: 3.3, isFood: true },
  "сыр": { icon: "🧀", proteins: 24.0, fats: 30.0, carbs: 0.0, isFood: true },
  "масло сливочное": { icon: "🧈", proteins: 0.5, fats: 82.5, carbs: 0.8, isFood: true },
  "масло подсолнечное": { icon: "🫗", proteins: 0.0, fats: 99.9, carbs: 0.0, isFood: true },
  "яйца": { icon: "🥚", proteins: 12.7, fats: 11.5, carbs: 0.7, isFood: true },
  "яйцо": { icon: "🥚", proteins: 12.7, fats: 11.5, carbs: 0.7, isFood: true },
  "хлеб": { icon: "🍞", proteins: 8.0, fats: 1.0, carbs: 49.0, isFood: true },
  "батон": { icon: "🥖", proteins: 8.7, fats: 3.3, carbs: 50.0, isFood: true },
  "лаваш": { icon: "🫓", proteins: 9.1, fats: 1.2, carbs: 56.2, isFood: true },
  "рис": { icon: "🍚", proteins: 6.7, fats: 0.7, carbs: 78.9, isFood: true },
  "гречка": { icon: "🌾", proteins: 12.6, fats: 3.3, carbs: 62.1, isFood: true },
  "овсянка": { icon: "🥣", proteins: 11.9, fats: 5.8, carbs: 65.4, isFood: true },
  "овсяная каша": { icon: "🥣", proteins: 3.0, fats: 1.7, carbs: 15.0, isFood: true },
  "макароны": { icon: "🍝", proteins: 10.4, fats: 1.1, carbs: 69.7, isFood: true },
  "мука": { icon: "🌾", proteins: 10.3, fats: 1.1, carbs: 70.6, isFood: true },
  "сахар": { icon: "🍬", proteins: 0.0, fats: 0.0, carbs: 99.8, isFood: true },
  "соль": { icon: "🧂", proteins: 0.0, fats: 0.0, carbs: 0.0, isFood: true },
  "картофель": { icon: "🥔", proteins: 2.0, fats: 0.4, carbs: 16.3, isFood: true },
  "лук": { icon: "🧅", proteins: 1.4, fats: 0.0, carbs: 10.4, isFood: true },
  "морковь": { icon: "🥕", proteins: 1.3, fats: 0.1, carbs: 6.9, isFood: true },
  "помидоры": { icon: "🍅", proteins: 1.1, fats: 0.2, carbs: 3.7, isFood: true },
  "огурцы": { icon: "🥒", proteins: 0.8, fats: 0.1, carbs: 2.8, isFood: true },
  "капуста": { icon: "🥬", proteins: 1.8, fats: 0.1, carbs: 4.7, isFood: true },
  "перец": { icon: "🫑", proteins: 1.3, fats: 0.0, carbs: 5.3, isFood: true },
  "яблоки": { icon: "🍎", proteins: 0.4, fats: 0.4, carbs: 9.8, isFood: true },
  "бананы": { icon: "🍌", proteins: 1.5, fats: 0.2, carbs: 21.8, isFood: true },
  "груши": { icon: "🍐", proteins: 0.4, fats: 0.3, carbs: 10.9, isFood: true },
  "апельсины": { icon: "🍊", proteins: 0.9, fats: 0.2, carbs: 8.1, isFood: true },
  "лимон": { icon: "🍋", proteins: 0.9, fats: 0.1, carbs: 3.0, isFood: true },
  "виноград": { icon: "🍇", proteins: 0.6, fats: 0.2, carbs: 16.8, isFood: true },
  "клубника": { icon: "🍓", proteins: 0.8, fats: 0.4, carbs: 7.5, isFood: true },
  "малина": { icon: "🫐", proteins: 0.8, fats: 0.5, carbs: 8.3, isFood: true },
  "курица": { icon: "🍗", proteins: 23.6, fats: 1.9, carbs: 0.4, isFood: true },
  "индейка": { icon: "🍗", proteins: 21.6, fats: 12.0, carbs: 0.8, isFood: true },
  "говядина": { icon: "🥩", proteins: 18.9, fats: 12.4, carbs: 0.0, isFood: true },
  "свинина": { icon: "🥩", proteins: 16.0, fats: 21.6, carbs: 0.0, isFood: true },
  "фарш": { icon: "🥩", proteins: 17.0, fats: 20.0, carbs: 0.0, isFood: true },
  "колбаса": { icon: "🌭", proteins: 13.0, fats: 22.0, carbs: 1.5, isFood: true },
  "сосиски": { icon: "🌭", proteins: 12.3, fats: 25.3, carbs: 0.0, isFood: true },
  "ветчина": { icon: "🥓", proteins: 14.0, fats: 24.0, carbs: 0.0, isFood: true },
  "рыба": { icon: "🐟", proteins: 18.5, fats: 4.9, carbs: 0.0, isFood: true },
  "лосось": { icon: "🐟", proteins: 20.0, fats: 13.0, carbs: 0.0, isFood: true },
  "тунец": { icon: "🐟", proteins: 22.0, fats: 1.0, carbs: 0.0, isFood: true },
  "сельдь": { icon: "🐟", proteins: 17.7, fats: 19.5, carbs: 0.0, isFood: true },
  "креветки": { icon: "🦐", proteins: 20.5, fats: 1.0, carbs: 0.3, isFood: true },
  "кальмар": { icon: "🦑", proteins: 18.0, fats: 2.2, carbs: 2.0, isFood: true },
  "пельмени": { icon: "🥟", proteins: 11.9, fats: 12.4, carbs: 29.0, isFood: true },
  "пицца": { icon: "🍕", proteins: 10.0, fats: 11.0, carbs: 26.0, isFood: true },
  "суп": { icon: "🍲", proteins: 2.5, fats: 3.0, carbs: 4.5, isFood: true },
  "борщ": { icon: "🍲", proteins: 2.0, fats: 4.4, carbs: 5.5, isFood: true },
  "каша": { icon: "🥣", proteins: 3.0, fats: 1.0, carbs: 16.0, isFood: true },
  "кофе": { icon: "☕", proteins: 0.2, fats: 0.0, carbs: 0.3, isFood: true },
  "чай": { icon: "🍵", proteins: 0.0, fats: 0.0, carbs: 0.0, isFood: true },
  "вода": { icon: "💧", proteins: 0.0, fats: 0.0, carbs: 0.0, isFood: true },
  "сок": { icon: "🧃", proteins: 0.5, fats: 0.1, carbs: 10.0, isFood: true },
  "газировка": { icon: "🥤", proteins: 0.0, fats: 0.0, carbs: 10.6, isFood: true },
  "шоколад": { icon: "🍫", proteins: 5.4, fats: 35.3, carbs: 52.6, isFood: true },
  "печенье": { icon: "🍪", proteins: 7.5, fats: 11.8, carbs: 74.0, isFood: true },
  "конфеты": { icon: "🍬", proteins: 2.7, fats: 9.0, carbs: 81.0, isFood: true },
  "мороженое": { icon: "🍨", proteins: 3.7, fats: 6.9, carbs: 22.1, isFood: true },
  "мёд": { icon: "🍯", proteins: 0.8, fats: 0.0, carbs: 81.5, isFood: true },
  "орехи": { icon: "🥜", proteins: 16.2, fats: 60.8, carbs: 11.1, isFood: true },
  "грецкие орехи": { icon: "🥜", proteins: 15.2, fats: 65.2, carbs: 7.0, isFood: true },
  "арахис": { icon: "🥜", proteins: 26.3, fats: 45.2, carbs: 9.9, isFood: true },
  "семечки": { icon: "🌻", proteins: 20.7, fats: 52.9, carbs: 10.5, isFood: true },
  "майонез": { icon: "🥫", proteins: 3.1, fats: 67.0, carbs: 2.6, isFood: true },
  "кетчуп": { icon: "🍅", proteins: 1.8, fats: 1.0, carbs: 22.2, isFood: true },
  "соус": { icon: "🥫", proteins: null, fats: null, carbs: null, isFood: true },
  "перчатки": { icon: "🧤", proteins: null, fats: null, carbs: null, isFood: false },
  "пакеты": { icon: "🛍️", proteins: null, fats: null, carbs: null, isFood: false },
  "мусорные пакеты": { icon: "🗑️", proteins: null, fats: null, carbs: null, isFood: false },
  "бумажные полотенца": { icon: "🧻", proteins: null, fats: null, carbs: null, isFood: false },
  "туалетная бумага": { icon: "🧻", proteins: null, fats: null, carbs: null, isFood: false },
  "салфетки": { icon: "🧻", proteins: null, fats: null, carbs: null, isFood: false },
  "губка": { icon: "🧽", proteins: null, fats: null, carbs: null, isFood: false },
  "тряпка": { icon: "🧼", proteins: null, fats: null, carbs: null, isFood: false },
  "моющее средство": { icon: "🧴", proteins: null, fats: null, carbs: null, isFood: false },
  "средство для посуды": { icon: "🧴", proteins: null, fats: null, carbs: null, isFood: false },
  "стиральный порошок": { icon: "🧺", proteins: null, fats: null, carbs: null, isFood: false },
  "кондиционер для белья": { icon: "🧺", proteins: null, fats: null, carbs: null, isFood: false },
  "отбеливатель": { icon: "🧴", proteins: null, fats: null, carbs: null, isFood: false },
  "шампунь": { icon: "🧴", proteins: null, fats: null, carbs: null, isFood: false },
  "мыло": { icon: "🧼", proteins: null, fats: null, carbs: null, isFood: false },
  "зубная паста": { icon: "🪥", proteins: null, fats: null, carbs: null, isFood: false },
  "зубная щётка": { icon: "🪥", proteins: null, fats: null, carbs: null, isFood: false },
  "ватные диски": { icon: "📦", proteins: null, fats: null, carbs: null, isFood: false },
  "лекарства": { icon: "💊", proteins: null, fats: null, carbs: null, isFood: false },
  "бинт": { icon: "🩹", proteins: null, fats: null, carbs: null, isFood: false },
  "батарейки": { icon: "🔋", proteins: null, fats: null, carbs: null, isFood: false },
  "лампочки": { icon: "💡", proteins: null, fats: null, carbs: null, isFood: false },
  "фольга": { icon: "📦", proteins: null, fats: null, carbs: null, isFood: false },
  "плёнка": { icon: "📦", proteins: null, fats: null, carbs: null, isFood: false },
  "контейнеры": { icon: "📦", proteins: null, fats: null, carbs: null, isFood: false },
  "посуда": { icon: "🍽️", proteins: null, fats: null, carbs: null, isFood: false },
  "сковорода": { icon: "🍳", proteins: null, fats: null, carbs: null, isFood: false },
  "кастрюля": { icon: "🍲", proteins: null, fats: null, carbs: null, isFood: false },
  "чайник": { icon: "🫖", proteins: null, fats: null, carbs: null, isFood: false },
  "фильтр для воды": { icon: "💧", proteins: null, fats: null, carbs: null, isFood: false },
  "кошачий корм": { icon: "🐈", proteins: 28.0, fats: 9.0, carbs: 35.0, isFood: true },
  "собачий корм": { icon: "🐕", proteins: 24.0, fats: 10.0, carbs: 36.0, isFood: true },
  "наполнитель": { icon: "📦", proteins: null, fats: null, carbs: null, isFood: false },
}

export const normalizeProductName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ")

const hasKey = (value: string) => Object.prototype.hasOwnProperty.call(PRODUCTS_DATABASE, value)

export const getProductFromDatabase = (productName: string): ProductDatabaseItem | null => {
  const normalized = normalizeProductName(productName)
  if (!normalized) return null
  if (hasKey(normalized)) return PRODUCTS_DATABASE[normalized]

  for (const [key, item] of Object.entries(PRODUCTS_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) return item
  }
  return null
}

export const getProductIcon = (productName: string) => getProductFromDatabase(productName)?.icon || "📦"

export const getProductKeyMatch = (productName: string): { key: string; item: ProductDatabaseItem } | null => {
  const normalized = normalizeProductName(productName)
  if (!normalized) return null
  if (hasKey(normalized)) return { key: normalized, item: PRODUCTS_DATABASE[normalized] }

  for (const [key, item] of Object.entries(PRODUCTS_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) return { key, item }
  }

  // simple keyword overlap fallback
  const words = normalized.split(" ").filter(Boolean)
  if (words.length === 0) return null
  let best: { key: string; item: ProductDatabaseItem; score: number } | null = null
  for (const [key, item] of Object.entries(PRODUCTS_DATABASE)) {
    const kWords = key.split(" ")
    const score = words.reduce((acc, w) => (kWords.some((kw) => kw.startsWith(w) || w.startsWith(kw)) ? acc + 1 : acc), 0)
    if (score > 0 && (!best || score > best.score)) best = { key, item, score }
  }
  return best ? { key: best.key, item: best.item } : null
}

export const canShowNutritionButton = (productName: string) => {
  const entry = getProductFromDatabase(productName)
  if (!entry || !entry.isFood) return false
  return entry.proteins !== null && entry.fats !== null && entry.carbs !== null
}

export const getNutritionForProduct = (productName: string) => {
  const entry = getProductFromDatabase(productName)
  if (!entry || !entry.isFood || entry.proteins === null || entry.fats === null || entry.carbs === null) {
    return null
  }
  return { protein: entry.proteins, fat: entry.fats, carbs: entry.carbs }
}

const splitByKnownPhrases = (segment: string): string[] => {
  const words = segment.split(" ").filter(Boolean)
  const result: string[] = []
  let index = 0

  while (index < words.length) {
    let matched: string | null = null
    for (let end = words.length; end > index; end -= 1) {
      const candidate = words.slice(index, end).join(" ")
      if (hasKey(candidate)) {
        matched = candidate
        index = end
        break
      }
    }

    if (matched) {
      result.push(matched)
    } else {
      result.push(words[index])
      index += 1
    }
  }

  return result
}

export const resolveProductsFromInput = (rawInput: string): string[] => {
  const normalized = normalizeProductName(rawInput)
  if (!normalized) return []
  if (hasKey(normalized)) return [normalized]

  const segments = normalized.split(/[;,]+/).map((part) => normalizeProductName(part)).filter(Boolean)
  if (segments.length > 1) {
    return segments.flatMap((segment) => (hasKey(segment) ? [segment] : splitByKnownPhrases(segment)))
  }

  return splitByKnownPhrases(normalized)
}
