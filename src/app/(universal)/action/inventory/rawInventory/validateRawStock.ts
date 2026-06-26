export function validateRawStock(updates: any[]) {
  for (const u of updates) {
    if (u.prev < u.required) {
      throw new Error(`Not enough raw material: ${u.itemName}`);
    }
  }
}