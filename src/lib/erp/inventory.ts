export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: "amenities" | "limpieza" | "mantenimiento" | "alimentos";
  unit: string;
  stock: number;
  minStock: number;
  unitCost: number;
  updatedAt: string;
};

export const INVENTORY_SEED: InventoryItem[] = [
  {
    id: "INV-TOA",
    sku: "AM-TOALLA",
    name: "Toallas 2 plazas",
    category: "amenities",
    unit: "und",
    stock: 120,
    minStock: 40,
    unitCost: 18,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "INV-SAB",
    sku: "AM-SABANA",
    name: "Sábanas juego completo",
    category: "amenities",
    unit: "juego",
    stock: 80,
    minStock: 30,
    unitCost: 45,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "INV-DET",
    sku: "LM-DETERG",
    name: "Detergente industrial",
    category: "limpieza",
    unit: "L",
    stock: 48,
    minStock: 20,
    unitCost: 12,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "INV-FIL",
    sku: "MT-FILTRO",
    name: "Filtros calentador",
    category: "mantenimiento",
    unit: "und",
    stock: 14,
    minStock: 6,
    unitCost: 35,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "INV-AGUA",
    sku: "AL-AGUA",
    name: "Agua embotellada 600ml",
    category: "alimentos",
    unit: "und",
    stock: 200,
    minStock: 60,
    unitCost: 1.5,
    updatedAt: new Date().toISOString(),
  },
];

export function inventoryAlerts(items: InventoryItem[]) {
  return items.filter((i) => i.stock <= i.minStock);
}

export function inventoryValuation(items: InventoryItem[]) {
  return Math.round(items.reduce((acc, i) => acc + i.stock * i.unitCost, 0) * 100) / 100;
}
