import { getProductKeyMatch, normalizeProductName } from "@/constants/productsDatabase"

export type Unit = string

export interface ParsedProduct {
  displayName: string
  canonicalName: string
  emoji: string
  quantity: number
  unit: Unit
}

const UNIT_ALIASES: Array<{ unit: string; re: RegExp }> = [
  { unit: "кг", re: /^(кг|килограмм(?:а|ов)?)$/i },
  { unit: "г", re: /^(г|гр|грамм(?:а|ов)?)$/i },
  { unit: "л", re: /^(л|литр(?:а|ов)?)$/i },
  { unit: "мл", re: /^(мл|миллилитр(?:а|ов)?)$/i },
  { unit: "шт", re: /^(шт|штук|штуки)$/i },
  { unit: "пачка", re: /^(пачка|пачки|пачек)$/i },
  { unit: "упаковка", re: /^(упаковка|упаковки|упаковок|уп|упак)$/i },
]

const normalizeUnit = (raw: string): string | null => {
  const token = raw.trim()
  for (const { unit, re } of UNIT_ALIASES) {
    if (re.test(token)) return unit
  }
  return null
}

const toTitle = (value: string) =>
  value.trim().length === 0 ? value : value.trim().charAt(0).toUpperCase() + value.trim().slice(1)

export function parseProductInput(input: string): ParsedProduct | null {
  const raw = normalizeProductName(input)
  if (!raw) return null

  let quantity: number | null = null
  let unit: string | null = null

  const parseNumber = (v: string) => {
    const num = Number(v.replace(",", "."))
    return Number.isFinite(num) && num > 0 ? num : null
  }

  // Find first occurrence of: [number] [unit?] anywhere in the string.
  // We intentionally keep the detected unit token as-written (e.g. "упаковок", "литра") for display and equality checks.
  // Supported units stay the same as `UNIT_ALIASES`.
  const UNIT_TOKEN_PATTERN =
    "(?:кг|килограмм(?:а|ов)?|г|гр|грамм(?:а|ов)?|л|литр(?:а|ов)?|мл|миллилитр(?:а|ов)?|шт|штук|штуки|пачка|пачки|пачек|упаковка|упаковки|упаковок|уп|упак)"
  const QUANTITY_WITH_UNIT_RE = new RegExp(
    String.raw`(?:(?<=^)|(?<=\s))\d+(?:[.,]\d+)?(?:\s*(?:${UNIT_TOKEN_PATTERN}))?(?=\s|$)`,
    "giu"
  )

  const firstMatch = raw.match(QUANTITY_WITH_UNIT_RE)?.[0] ?? null
  if (firstMatch) {
    const matchTrimmed = firstMatch.trim()
    const numberPart = matchTrimmed.match(/^\d+(?:[.,]\d+)?/u)?.[0] ?? null
    const unitPart = numberPart ? matchTrimmed.slice(numberPart.length).trim() : ""

    const q = numberPart ? parseNumber(numberPart) : null
    if (q !== null) quantity = q

    if (unitPart) {
      // Extra guard: only treat it as unit if it's one of our supported aliases.
      // (In practice unitPart already matches the pattern above.)
      if (normalizeUnit(unitPart)) unit = unitPart
    }
  }

  if (quantity === null) quantity = 1
  if (unit === null) unit = "шт"

  // Name is what's left after removing the first found number+unit fragment (if any).
  // For simplicity we remove the whole matched fragment; additional numbers are left intact.
  const nameCandidate = (firstMatch ? raw.replace(firstMatch, " ") : raw).replace(/\s+/g, " ").trim() || raw

  const match = getProductKeyMatch(nameCandidate)
  const canonicalName = match ? match.key : nameCandidate
  const emoji = match ? match.item.icon : "📦"
  const displayName = toTitle(canonicalName)

  return {
    displayName,
    canonicalName,
    emoji,
    quantity,
    unit,
  }
}

