export function displayStock_1(
  currentStock: number,
  purchaseUnit: string,
  consumptionUnit: string,
  conversionFactor: number
) {
  // console.log(
  //   "consumptionUnit ----------------",
  //   consumptionUnit,
  //   conversionFactor
  // );

  // console.log(
  //   "qty ----------------",
  //   currentStock,
  //   purchaseUnit
  // );

  // Same unit
  if (purchaseUnit === consumptionUnit) {
    return `${currentStock} ${consumptionUnit}`;
  }

  let remainGmAfterConvertToPurchaseUnit = 0;
  let gmToConvertToPurchaseUnit = 0;

  let valueInPurchaseUnit = 0;
  let valueInKg = 0;
  let valueInGm = 0;

  let totalGmToConvert = currentStock;

  // =====================================================
  // GM CONSUMPTION UNIT
  // =====================================================

  if (consumptionUnit === "gm") {

    // Only convert GM -> purchase unit
    // when purchase unit is NOT KG.
    if (
      currentStock >= conversionFactor &&
      purchaseUnit !== "kg"
    ) {
      remainGmAfterConvertToPurchaseUnit =
        currentStock % conversionFactor;

      gmToConvertToPurchaseUnit =
        currentStock -
        remainGmAfterConvertToPurchaseUnit;

      valueInPurchaseUnit =
        gmToConvertToPurchaseUnit /
        conversionFactor;

      totalGmToConvert =
        remainGmAfterConvertToPurchaseUnit;
    }

    // =================================================
    // Remaining GM -> KG
    // =================================================

    if (totalGmToConvert >= 1000) {
      const gmRemainder =
        totalGmToConvert % 1000;

      valueInKg =
        (totalGmToConvert - gmRemainder) /
        1000;

      totalGmToConvert = gmRemainder;
    }

    // =================================================
    // Remaining GM
    // =================================================

    if (totalGmToConvert > 0) {
      valueInGm = totalGmToConvert;
    }
  }

  // =====================================================
  // RESULT
  // =====================================================

  let result = "";

  if (valueInPurchaseUnit > 0) {
    result += `${valueInPurchaseUnit} ${purchaseUnit}`;
  }

  if (valueInKg > 0) {
    result += `${result ? " " : ""}${valueInKg} Kg`;
  }

  if (valueInGm > 0) {
    result += `${result ? " " : ""}${valueInGm} Gm`;
  }

  return result;
}


// export function displayStock_1(
//   currentStock: number,
//   purchaseUnit: string,
//   consumptionUnit: string,
//   conversionFactor: number
// ) {

//   console.log("consumptionUnit ----------------", consumptionUnit, conversionFactor)
//   console.log("qty ----------------", currentStock, purchaseUnit)
//   // Same unit
//   if (purchaseUnit === consumptionUnit) {
//     return `${currentStock} ${consumptionUnit}`;
//   }

//   let remainGmAfterConvertToPurchaseUint = 0;
//   let gmToConvertToPurchaseUint = 0;
//   let gmRminderAfterConveringToKg = 0;

//   let valueInPurchaseUnit = 0;
//   let valueInKg = 0;
//   let valueInGm = 0;
// let totalGmToConvert = currentStock;
//   if (consumptionUnit === "gm") {
  
//     if (currentStock >= conversionFactor && purchaseUnit !=="kg") {
//       remainGmAfterConvertToPurchaseUint = currentStock % conversionFactor;
//       gmToConvertToPurchaseUint = currentStock - remainGmAfterConvertToPurchaseUint;
//       valueInPurchaseUnit = gmToConvertToPurchaseUint / conversionFactor
//       totalGmToConvert = remainGmAfterConvertToPurchaseUint;
//     }

    
//     if (totalGmToConvert >= 1000) {
//       gmRminderAfterConveringToKg = totalGmToConvert % 1000
//       valueInKg = (totalGmToConvert - gmRminderAfterConveringToKg) / 1000

//       totalGmToConvert = gmRminderAfterConveringToKg
//     }

//     if(totalGmToConvert>0){
//       valueInGm = totalGmToConvert
//     }
//   }

// let result ="";

// if (valueInPurchaseUnit > 0) {
//   result = `${valueInPurchaseUnit} ${purchaseUnit}`;
// }

// if (valueInKg > 0) {
//   result += ` ${valueInKg} Kg`;
// }

// if (valueInGm > 0) {
//   result += ` ${valueInGm} Gm`;
// }

//   if(valueInKg>0 && valueInPurchaseUnit<=0){

//   result += ` ${valueInKg} Kg`;
//   if(valueInGm>0){
//      result += ` ${valueInGm} Gm`;
//   }
// }

//  if(valueInGm>0 && valueInPurchaseUnit<=0 && valueInKg <= 0){

 
 
//      result += `${valueInGm} Gm`;
  
// }


//   return result;
// }

