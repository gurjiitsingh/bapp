export function validateRawStock(updates: any[]) {
  for (const u of updates) {
console.log(u.inventoryItemName, u.prev,u.required,  u.quantity,  u.next);
    
    if (u.prev < u.quantity) {
      throw new Error(
        `${u.itemName}: Available ${u.prev} ${u.transactionUnit}, Required ${u.quantity} ${u.transactionUnit}`
      );
    }
  }
}