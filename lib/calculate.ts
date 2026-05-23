export type Mode1Result = {
  additionalLots: number;
  moneyNeeded: number;
  actualNewAvg: number;
  totalLots: number;
};

export type FloatingLossComparison = {
  // Sebelum avg down
  totalCostBefore: number;
  marketValueBefore: number;
  floatingLossBefore: number;
  floatingLossPercentBefore: number;
  // Setelah avg down
  totalCostAfter: number;
  marketValueAfter: number;
  floatingLossAfter: number;
  floatingLossPercentAfter: number;
  // Improvement
  lossDifference: number;
  breakEvenPrice: number;
};

export type Mode2Result = {
  affordableLots: number;
  moneyUsed: number;
  moneyLeft: number;
  newAvgPrice: number;
  totalLots: number;
  avgDropPercent: number;
};

/** Format a number as Rupiah with comma thousand separators: Rp 1,234,567 */
export function formatRupiah(amount: number): string {
  return "Rp " + new Intl.NumberFormat("en-US").format(Math.round(amount));
}

/** Strip non-digits from raw input, then re-format with comma separators */
export function formatNumberInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("en-US").format(Number(digits));
}

/** Strip comma separators and parse to number */
export function parseNumber(formatted: string): number {
  const stripped = formatted.replace(/,/g, "");
  const num = Number(stripped);
  return isNaN(num) ? 0 : num;
}

/**
 * Mode 1: Given a target average price, calculate how many lots to buy
 * and how much money is needed.
 */
export function calculateMode1(
  currentLots: number,
  avgPrice: number,
  currentPrice: number,
  targetAvgPrice: number,
): Mode1Result {
  const totalSharesNow = currentLots * 100;
  const totalCostNow = totalSharesNow * avgPrice;

  // Solve: (totalCostNow + x * currentPrice) / (totalSharesNow + x) = targetAvgPrice
  const additionalShares =
    (totalCostNow - targetAvgPrice * totalSharesNow) /
    (targetAvgPrice - currentPrice);

  // Round up to nearest lot
  const additionalLots = Math.ceil(additionalShares / 100);
  const moneyNeeded = additionalLots * 100 * currentPrice;
  const actualNewAvg =
    (totalCostNow + additionalLots * 100 * currentPrice) /
    (totalSharesNow + additionalLots * 100);

  return {
    additionalLots,
    moneyNeeded,
    actualNewAvg,
    totalLots: currentLots + additionalLots,
  };
}

/**
 * Mode 2: Given available money, calculate how many lots can be bought
 * and what the new average price will be.
 */
export function calculateMode2(
  currentLots: number,
  avgPrice: number,
  currentPrice: number,
  availableMoney: number,
): Mode2Result {
  const totalSharesNow = currentLots * 100;
  const totalCostNow = totalSharesNow * avgPrice;

  // Round down to affordable whole lots
  const affordableLots = Math.floor(availableMoney / (currentPrice * 100));
  const additionalShares = affordableLots * 100;
  const moneyUsed = affordableLots * 100 * currentPrice;
  const moneyLeft = availableMoney - moneyUsed;

  const newAvgPrice =
    (totalCostNow + moneyUsed) / (totalSharesNow + additionalShares);
  const avgDropPercent = ((avgPrice - newAvgPrice) / avgPrice) * 100;

  return {
    affordableLots,
    moneyUsed,
    moneyLeft,
    newAvgPrice,
    totalLots: currentLots + affordableLots,
    avgDropPercent,
  };
}

/**
 * Calculate floating loss comparison before and after averaging down.
 * marketPrice: latest market price fetched from API
 * buyPrice:    price used to buy additional lots (currentPrice from form)
 */
export function calculateFloatingLoss(
  currentLots: number,
  avgPrice: number,
  marketPrice: number,
  additionalLots: number,
  buyPrice: number,
): FloatingLossComparison {
  const sharesBefore = currentLots * 100;
  const totalCostBefore = sharesBefore * avgPrice;
  const marketValueBefore = sharesBefore * marketPrice;
  const floatingLossBefore = marketValueBefore - totalCostBefore;
  const floatingLossPercentBefore =
    (floatingLossBefore / totalCostBefore) * 100;

  const sharesAfter = (currentLots + additionalLots) * 100;
  const totalCostAfter = totalCostBefore + additionalLots * 100 * buyPrice;
  const marketValueAfter = sharesAfter * marketPrice;
  const floatingLossAfter = marketValueAfter - totalCostAfter;
  const floatingLossPercentAfter = (floatingLossAfter / totalCostAfter) * 100;

  const lossDifference = floatingLossAfter - floatingLossBefore;
  const breakEvenPrice = totalCostAfter / sharesAfter;

  return {
    totalCostBefore,
    marketValueBefore,
    floatingLossBefore,
    floatingLossPercentBefore,
    totalCostAfter,
    marketValueAfter,
    floatingLossAfter,
    floatingLossPercentAfter,
    lossDifference,
    breakEvenPrice,
  };
}
