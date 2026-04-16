import { describe, expect, it } from "vitest"
import { parseProductInput } from "@/lib/parseProductInput"

describe("parseProductInput", () => {
  it("parses quantity+unit in the middle/end/beginning", () => {
    const a = parseProductInput("сок 5 упаковок")
    expect(a).not.toBeNull()
    expect(a?.quantity).toBe(5)
    expect(a?.unit).toBe("упаковок")
    expect(a?.displayName.toLowerCase()).toContain("сок")

    const b = parseProductInput("5 упаковок сока")
    expect(b).not.toBeNull()
    expect(b?.quantity).toBe(5)
    expect(b?.unit).toBe("упаковок")
    expect(b?.displayName.toLowerCase()).toContain("сок")

    const c = parseProductInput("молоко 2 литра")
    expect(c).not.toBeNull()
    expect(c?.quantity).toBe(2)
    expect(c?.unit).toBe("литра")
    expect(c?.displayName.toLowerCase()).toContain("молоко")

    const d = parseProductInput("10 кг огурцов")
    expect(d).not.toBeNull()
    expect(d?.quantity).toBe(10)
    expect(d?.unit).toBe("кг")
    expect(d?.displayName.toLowerCase()).toContain("огур")
  })

  it("defaults to 1 шт when no quantity/unit provided", () => {
    const parsed = parseProductInput("хлеб")
    expect(parsed).not.toBeNull()
    expect(parsed?.quantity).toBe(1)
    expect(parsed?.unit).toBe("шт")
    expect(parsed?.displayName.toLowerCase()).toContain("хлеб")
  })

  it('defaults unit to "шт" when quantity provided without unit', () => {
    const parsed = parseProductInput("бананы 3")
    expect(parsed).not.toBeNull()
    expect(parsed?.quantity).toBe(3)
    expect(parsed?.unit).toBe("шт")
  })
})

