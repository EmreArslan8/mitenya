const getConsolidatedWeight = (totalChargeableWeight: number) => {
  if (totalChargeableWeight > 15) return totalChargeableWeight - 3;
  else if (totalChargeableWeight > 7) return totalChargeableWeight - 1.5;
  else if (totalChargeableWeight > 5) return totalChargeableWeight - 1;
  else if (totalChargeableWeight > 3) return totalChargeableWeight - 0.5;
  return totalChargeableWeight;
};

export default getConsolidatedWeight;
