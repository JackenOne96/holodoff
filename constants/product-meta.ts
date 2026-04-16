export const PRODUCT_EMOJI_DICTIONARY: Record<string, string> = {
  молоко: "🥛",
  хлеб: "🍞",
  яйца: "🥚",
  яйцо: "🥚",
  сыр: "🧀",
  курица: "🍗",
  говядина: "🥩",
  свинина: "🥩",
  рыба: "🐟",
  лосось: "🐟",
  тунец: "🐟",
  творог: "🍶",
  сметана: "🥛",
  йогурт: "🥛",
  масло: "🧈",
  рис: "🍚",
  гречка: "🌾",
  макароны: "🍝",
  картофель: "🥔",
  помидоры: "🍅",
  огурцы: "🥒",
  яблоки: "🍎",
  бананы: "🍌",
  колбаса: "🌭",
  сосиски: "🌭",
  сок: "🧃",
  вода: "💧",
  сахар: "🍬",
  соль: "🧂",
}

export const getProductEmoji = (productName: string): string => {
  const normalized = productName.trim().toLowerCase()
  if (!normalized) return "🛒"

  const direct = PRODUCT_EMOJI_DICTIONARY[normalized]
  if (direct) return direct

  for (const [key, value] of Object.entries(PRODUCT_EMOJI_DICTIONARY)) {
    if (normalized.includes(key)) return value
  }

  return "🛒"
}
