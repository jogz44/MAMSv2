export function useCategoryBalances(categories) {
  const toNumber = (value) => {
    const parsed = Number(String(value ?? 0).replace(/,/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }

  const applyCategoryData = (index, data = {}) => {
    const merged = { ...categories.value[index], ...data }
    const totalBudget = toNumber(merged.totalBudget)
    const totalReleased = toNumber(merged.totalReleased)
    const invoiceAmount = toNumber(merged.invoiceAmount)
    const returnedToBalance = toNumber(merged.returnedToBalance)
    const remainingFromApi = toNumber(data.remaining)
    const hasRemainingFromApi = Object.prototype.hasOwnProperty.call(data, 'remaining')

    categories.value[index] = {
      ...merged,
      totalBudget,
      totalReleased,
      invoiceAmount,
      returnedToBalance,
      remaining: hasRemainingFromApi
        ? remainingFromApi
        : totalBudget - totalReleased - invoiceAmount + returnedToBalance
    }
  }

  return {
    applyCategoryData
  }
}
