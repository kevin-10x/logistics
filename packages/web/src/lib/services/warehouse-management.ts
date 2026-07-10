import { Warehouse, WarehouseBin, InventoryItem, WarehouseZone } from "@afrilogistics/shared";
import { generateId } from "@afrilogistics/shared";

interface WarehouseStats {
  totalBins: number;
  occupiedBins: number;
  utilizationRate: number;
  itemsByZone: Record<WarehouseZone, number>;
  lowStockBins: WarehouseBin[];
  expiringItems: InventoryItem[];
  receivingToday: number;
  dispatchingToday: number;
}

interface InventoryMovement {
  id: string;
  itemId: string;
  fromZone: WarehouseZone | null;
  toZone: WarehouseZone;
  quantity: number;
  timestamp: string;
  performedBy: string;
  notes?: string;
}

export class WarehouseManagementService {
  private warehouses: Map<string, Warehouse> = new Map();
  private bins: Map<string, WarehouseBin[]> = new Map();
  private inventory: Map<string, InventoryItem[]> = new Map();
  private movements: InventoryMovement[] = [];

  createWarehouse(data: Omit<Warehouse, "id" | "createdAt" | "currentOccupancy">): Warehouse {
    const warehouse: Warehouse = {
      ...data,
      id: generateId(),
      currentOccupancy: 0,
      createdAt: new Date().toISOString(),
    };
    this.warehouses.set(warehouse.id, warehouse);
    this.initializeBins(warehouse.id);
    return warehouse;
  }

  private initializeBins(warehouseId: string): WarehouseBin[] {
    const zones: WarehouseZone[] = ["receiving", "storage", "picking", "packing", "dispatch", "returns"];
    const bins: WarehouseBin[] = [];

    for (const zone of zones) {
      const zoneCount = zone === "storage" ? 20 : zone === "picking" ? 15 : 10;
      for (let i = 0; i < zoneCount; i++) {
        const aisle = String.fromCharCode(65 + Math.floor(i / 5));
        const rack = String(Math.floor(i % 5) + 1);
        const level = zone === "storage" ? String(Math.floor(Math.random() * 4) + 1) : "1";
        bins.push({
          id: generateId(),
          warehouseId,
          zone,
          code: `${zone.substring(0, 2).toUpperCase()}-${aisle}${rack}-${level}`,
          aisle,
          rack,
          level,
          position: `${i + 1}`,
          capacity: zone === "storage" ? 100 : 50,
          currentOccupancy: 0,
          maxWeight: zone === "storage" ? 500 : 250,
          currentWeight: 0,
          isActive: true,
        });
      }
    }
    this.bins.set(warehouseId, bins);
    return bins;
  }

  receiveItem(
    warehouseId: string,
    orderId: string,
    itemData: Omit<InventoryItem, "id" | "warehouseId" | "status" | "receivedAt" | "quantity"> & { quantity: number },
    performedBy: string
  ): InventoryItem {
    const receivingBin = this.findAvailableBin(warehouseId, "receiving");
    const item: InventoryItem = {
      ...itemData,
      id: generateId(),
      warehouseId,
      binId: receivingBin?.id,
      status: "received",
      receivedAt: new Date().toISOString(),
    };

    const items = this.inventory.get(warehouseId) || [];
    items.push(item);
    this.inventory.set(warehouseId, items);

    if (receivingBin) {
      this.updateBinOccupancy(receivingBin.id, warehouseId, itemData.quantity, itemData.weight);
    }

    this.movements.push({
      id: generateId(),
      itemId: item.id,
      fromZone: null,
      toZone: "receiving",
      quantity: itemData.quantity,
      timestamp: new Date().toISOString(),
      performedBy,
    });

    return item;
  }

  moveItem(
    warehouseId: string,
    itemId: string,
    toZone: WarehouseZone,
    performedBy: string
  ): InventoryItem | null {
    const items = this.inventory.get(warehouseId) || [];
    const item = items.find((i) => i.id === itemId);
    if (!item) return null;

    const fromZone: WarehouseZone =
      item.status === "received" ? "receiving"
      : item.status === "stored" ? "storage"
      : item.status === "picking" ? "picking"
      : item.status === "packed" ? "packing"
      : "dispatch";

    const targetBin = this.findAvailableBin(warehouseId, toZone);
    if (item.binId) {
      this.releaseBin(item.binId, warehouseId, item.quantity, item.weight);
    }

    item.binId = targetBin?.id;
    item.status = toZone === "storage" ? "stored" : toZone === "picking" ? "picking" : toZone === "packing" ? "packed" : "dispatched";

    if (toZone === "storage") item.storedAt = new Date().toISOString();
    if (toZone === "dispatch") item.dispatchedAt = new Date().toISOString();

    if (targetBin) {
      this.updateBinOccupancy(targetBin.id, warehouseId, item.quantity, item.weight);
    }

    this.movements.push({
      id: generateId(),
      itemId: item.id,
      fromZone,
      toZone,
      quantity: item.quantity,
      timestamp: new Date().toISOString(),
      performedBy,
    });

    return item;
  }

  dispatchItem(warehouseId: string, itemId: string, performedBy: string): InventoryItem | null {
    return this.moveItem(warehouseId, itemId, "dispatch", performedBy);
  }

  private findAvailableBin(warehouseId: string, zone: WarehouseZone): WarehouseBin | null {
    const bins = this.bins.get(warehouseId) || [];
    return bins.find((b) => b.zone === zone && b.isActive && b.currentOccupancy < b.capacity) || null;
  }

  private updateBinOccupancy(binId: string, warehouseId: string, quantity: number, weight: number): void {
    const bins = this.bins.get(warehouseId) || [];
    const bin = bins.find((b) => b.id === binId);
    if (bin) {
      bin.currentOccupancy += quantity;
      bin.currentWeight += weight;
    }
  }

  private releaseBin(binId: string, warehouseId: string, quantity: number, weight: number): void {
    const bins = this.bins.get(warehouseId) || [];
    const bin = bins.find((b) => b.id === binId);
    if (bin) {
      bin.currentOccupancy = Math.max(0, bin.currentOccupancy - quantity);
      bin.currentWeight = Math.max(0, bin.currentWeight - weight);
    }
  }

  getWarehouseStats(warehouseId: string): WarehouseStats {
    const bins = this.bins.get(warehouseId) || [];
    const items = this.inventory.get(warehouseId) || [];
    const today = new Date().toISOString().split("T")[0];

    const itemsByZone: Record<WarehouseZone, number> = {
      receiving: 0, storage: 0, picking: 0, packing: 0, dispatch: 0, returns: 0,
    };
    items.forEach((item) => {
      const zone: WarehouseZone =
        item.status === "received" ? "receiving"
        : item.status === "stored" ? "storage"
        : item.status === "picking" ? "picking"
        : item.status === "packed" ? "packing"
        : "dispatch";
      itemsByZone[zone] += item.quantity;
    });

    return {
      totalBins: bins.length,
      occupiedBins: bins.filter((b) => b.currentOccupancy > 0).length,
      utilizationRate: bins.length > 0
        ? bins.filter((b) => b.currentOccupancy > 0).length / bins.length
        : 0,
      itemsByZone,
      lowStockBins: bins.filter((b) => b.currentOccupancy > 0 && b.currentOccupancy < b.capacity * 0.1),
      expiringItems: items.filter((i) => {
        if (!i.expiryDate) return false;
        const daysUntil = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 30 && daysUntil > 0;
      }),
      receivingToday: this.movements.filter(
        (m) => m.toZone === "receiving" && m.timestamp.startsWith(today)
      ).length,
      dispatchingToday: this.movements.filter(
        (m) => m.toZone === "dispatch" && m.timestamp.startsWith(today)
      ).length,
    };
  }

  searchInventory(warehouseId: string, query: string): InventoryItem[] {
    const items = this.inventory.get(warehouseId) || [];
    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.batchNumber?.toLowerCase().includes(q)
    );
  }

  getMovements(warehouseId: string, limit: number = 50): InventoryMovement[] {
    return this.movements
      .filter((m) => {
        const item = this.findItemGlobal(m.itemId);
        return item?.warehouseId === warehouseId;
      })
      .slice(-limit)
      .reverse();
  }

  private findItemGlobal(itemId: string): InventoryItem | undefined {
    for (const items of this.inventory.values()) {
      const found = items.find((i) => i.id === itemId);
      if (found) return found;
    }
    return undefined;
  }

  getLowStockBins(warehouseId: string): WarehouseBin[] {
    const bins = this.bins.get(warehouseId) || [];
    return bins.filter((b) => b.currentOccupancy > 0 && b.currentOccupancy < b.capacity * 0.2);
  }

  getExpiringItems(warehouseId: string, withinDays: number = 30): InventoryItem[] {
    const items = this.inventory.get(warehouseId) || [];
    const now = Date.now();
    const threshold = withinDays * 24 * 60 * 60 * 1000;
    return items.filter((i) => {
      if (!i.expiryDate) return false;
      const timeLeft = new Date(i.expiryDate).getTime() - now;
      return timeLeft > 0 && timeLeft <= threshold;
    });
  }
}
