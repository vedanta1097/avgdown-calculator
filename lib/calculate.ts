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

/** Format a price input that allows decimals, e.g. 419.16 → "419.16", 4190.16 → "4,190.16" */
export function formatDecimalInput(raw: string): string {
  // Strip everything except digits and decimal point
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  // Only keep first decimal point
  const firstDot = cleaned.indexOf(".");
  const sanitized =
    firstDot === -1
      ? cleaned
      : cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
  const hasDecimal = sanitized.includes(".");
  const integerPart = hasDecimal ? sanitized.split(".")[0] : sanitized;
  const decimalPart = hasDecimal
    ? sanitized.slice(sanitized.indexOf(".") + 1)
    : undefined;
  const formattedInt = integerPart
    ? new Intl.NumberFormat("en-US").format(Number(integerPart))
    : "";
  if (decimalPart !== undefined) return formattedInt + "." + decimalPart;
  if (hasDecimal) return formattedInt + ".";
  return formattedInt;
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

export type Mode3Result = {
  additionalLots: number;
  moneyNeeded: number;
  newAvgPrice: number;
  totalLots: number;
  actualFloatingLossPercent: number;
};

/**
 * Mode 3: Given a target floating loss % after avg down, calculate how many
 * lots to buy and how much money is needed.
 */
export function calculateMode3(
  currentLots: number,
  avgPrice: number,
  currentPrice: number,
  marketPrice: number,
  targetFloatingLossPercent: number, // e.g. -5 for -5%
): Mode3Result {
  const S = currentLots * 100;
  const C = S * avgPrice;
  const P = currentPrice;
  const M = marketPrice;
  const T = targetFloatingLossPercent;

  // Solve: T/100 = ((S+n)*M - (C+n*P)) / (C+n*P)
  const numerator = C * (1 + T / 100) - S * M;
  const denominator = M - P * (1 + T / 100);

  const n = numerator / denominator;
  const additionalLots = Math.ceil(n / 100);
  const additionalShares = additionalLots * 100;

  const totalCostAfter = C + additionalShares * P;
  const totalSharesAfter = S + additionalShares;
  const newAvgPrice = totalCostAfter / totalSharesAfter;
  const marketValueAfter = totalSharesAfter * M;
  const actualFloatingLossPercent =
    ((marketValueAfter - totalCostAfter) / totalCostAfter) * 100;

  return {
    additionalLots,
    moneyNeeded: additionalShares * P,
    newAvgPrice,
    totalLots: currentLots + additionalLots,
    actualFloatingLossPercent,
  };
}
