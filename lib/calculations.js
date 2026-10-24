// 3D Printing Cost, Pricing and Trendyol Financial Calculation Engine

export function calculateHourlyBaseCost(params = {}) {
  const filament = params.filament || { kgPrice: 900, hourlyDivider: 75 };
  const machine = params.machine || {
    price: 30000,
    amortiMonths: 28,
    monthlyWorkHours: 250,
    powerWatts: 300,
    electricityKwhPrice: 4.5,
    monthlyMaintenance: 652
  };
  const rates = params.rates || { fireRate: 0.10, profitRate: 0.20, riskRate: 0.05 };

  // 1. Filament hourly cost
  const filamentHourly = (filament.kgPrice || 900) / (filament.hourlyDivider || 75);

  // 2. Machine amortization per hour
  const amortizationHourly = ((machine.price || 30000) / (machine.amortiMonths || 28)) / (machine.monthlyWorkHours || 250);

  // 3. Electricity per hour: (watts * pricePerKwh) / 1000
  const electricityHourly = ((machine.powerWatts || 300) * (machine.electricityKwhPrice || 4.5)) / 1000;

  // 4. Maintenance per hour
  const maintenanceHourly = (machine.monthlyMaintenance || 652) / (machine.monthlyWorkHours || 250);

  // Subtotal
  const subtotal = filamentHourly + amortizationHourly + electricityHourly + maintenanceHourly;

  // Margins
  const fireCost = subtotal * (rates.fireRate ?? 0.10);
  const profitCost = subtotal * (rates.profitRate ?? 0.20);
  const riskCost = subtotal * (rates.riskRate ?? 0.05);

  // Grand hourly cost rounded
  const totalHourly = Math.round(subtotal + fireCost + profitCost + riskCost);

  return {
    filamentHourly: Number(filamentHourly.toFixed(2)),
    amortizationHourly: Number(amortizationHourly.toFixed(2)),
    electricityHourly: Number(electricityHourly.toFixed(2)),
    maintenanceHourly: Number(maintenanceHourly.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    fireCost: Number(fireCost.toFixed(2)),
    profitCost: Number(profitCost.toFixed(2)),
    riskCost: Number(riskCost.toFixed(2)),
    totalHourly: totalHourly || 27
  };
}

export function calculatePrintCost(hours, minutes, settings = {}) {
  const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
  const hourlyDetails = calculateHourlyBaseCost(settings);
  const hourlyCost = hourlyDetails.totalHourly;

  // Raw cost
  const rawCost = Math.round((hourlyCost / 60) * totalMinutes);

  // Multiplier tiers from Google Sheet
  const tiers = settings.pricingTiers || [
    { maxCost: 11, multiplier: 6.0 },
    { maxCost: 25, multiplier: 5.0 },
    { maxCost: 55, multiplier: 4.0 },
    { maxCost: 100, multiplier: 3.8 },
    { maxCost: 999999, multiplier: 3.6 }
  ];

  let localMultiplier = 3.6;
  for (const tier of tiers) {
    if (rawCost <= tier.maxCost) {
      localMultiplier = tier.multiplier;
      break;
    }
  }

  const localPrice = Number((rawCost * localMultiplier).toFixed(2));

  // Marketplace / Trendyol Formula:
  // ((localPrice + extraExpense) / ((1 - comm) * (1 - risk) * (1 - vat))) + shipping
  const mp = settings.marketplace || {};
  const comm = mp.commissionRate ?? 0.04;
  const risk = mp.riskRefundRate ?? 0.05;
  const vat = mp.vatRate ?? 0.20;
  const extraExp = mp.extraExpense ?? 10.0;
  const shipping = mp.shippingCost ?? 130.0;

  const denominator = (1 - comm) * (1 - risk) * (1 - vat);
  const trendyolPrice = Number((((localPrice + extraExp) / (denominator || 1)) + shipping).toFixed(2));

  return {
    totalMinutes,
    hourlyCost,
    hourlyDetails,
    rawCost,
    localMultiplier,
    localPrice,
    trendyolPrice,
    breakdown: {
      extraExpense: extraExp,
      shippingCost: shipping,
      commissionRate: comm,
      riskRefundRate: risk,
      vatRate: vat
    }
  };
}

export function calculateTrendyolItem(row) {
  const salePrice = Number(row.salePrice) || 0;
  const vatRate = Number(row.vatRate ?? 0.20);
  const commRate = Number(row.commissionRate ?? 0.04);
  const realCost = Number(row.realCost ?? 55.0);
  const cargoBase = Number(row.cargoBase ?? 89.70);
  const cargoVatRate = Number(row.cargoVatRate ?? 0.20);
  const extraExpense = Number(row.extraExpense ?? 0);
  const partnerFixed = Number(row.partnerFixed ?? 0);
  const deduction = Number(row.deduction ?? 0);

  // 1. Deduction row (like TS-006, TS-008 for refund / penalty / cargo return deductions)
  if (deduction !== 0) {
    const finalDeduction = deduction < 0 ? deduction : -Math.abs(deduction);
    return {
      ...row,
      isExpenseRow: false,
      salePrice: 0,
      vatRate,
      commissionRate: commRate,
      realCost: 0,
      cargoBase: 0,
      cargoVatRate,
      extraExpense: 0,
      partnerFixed: 0,
      hakedis: 0,
      netVat: 0,
      incomeTax: 0,
      partnerTotalShare: 0,
      myReceivable: 0,
      myNetProfit: 0,
      deduction: finalDeduction
    };
  }

  // 2. Expense / Partnership reimbursement row (like TS-010 sarı taksi, TS-014 domain)
  if (row.isExpenseRow) {
    const hakedis = salePrice;
    const netVat = 0;
    const incomeTax = Number((salePrice * 0.20).toFixed(2));
    const partnerTotalShare = incomeTax;
    const myReceivable = Number((salePrice - partnerTotalShare).toFixed(2));
    const myNetProfit = myReceivable;

    return {
      ...row,
      salePrice,
      vatRate,
      commissionRate: commRate,
      realCost: 0,
      cargoBase: 0,
      cargoVatRate,
      extraExpense: 0,
      partnerFixed: 0,
      hakedis,
      netVat,
      incomeTax,
      partnerTotalShare,
      myReceivable,
      myNetProfit,
      deduction: 0
    };
  }

  // 3. Normal Sales Calculation:
  // 1. Hakediş
  const commissionAmount = salePrice * commRate;
  const cargoTotal = cargoBase * (1 + cargoVatRate);
  const hakedis = Number((salePrice - commissionAmount - cargoTotal - extraExpense).toFixed(4));

  // 2. Net KDV Borcu
  const saleVat = salePrice - (salePrice / (1 + vatRate));
  const commVat = commissionAmount - (commissionAmount / 1.20);
  const cargoVat = cargoBase * cargoVatRate;
  const netVatRaw = saleVat - (commVat + cargoVat);
  const netVat = Number(Math.max(0, netVatRaw).toFixed(4));

  // 3. Gelir Vergisi
  const incomeTaxBase = (salePrice / (1 + vatRate)) - ((commissionAmount / 1.20) + cargoBase);
  const incomeTax = Number((incomeTaxBase > 0 ? incomeTaxBase * 0.20 : 0).toFixed(4));

  // 4. İş Ortağı Toplam Payı
  const partnerTotalShare = Number((netVat + incomeTax + partnerFixed).toFixed(4));

  // 5. Sizin Alacağınız
  const myReceivable = Number((hakedis - partnerTotalShare).toFixed(4));

  // 6. Kendi Net Kârınız
  const myNetProfit = Number((myReceivable - realCost).toFixed(4));

  return {
    ...row,
    salePrice,
    vatRate,
    commissionRate: commRate,
    realCost,
    cargoBase,
    cargoVatRate,
    extraExpense,
    partnerFixed,
    hakedis,
    netVat,
    incomeTax,
    partnerTotalShare,
    myReceivable,
    myNetProfit,
    deduction
  };
}
