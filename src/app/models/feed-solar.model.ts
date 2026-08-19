export interface FeedStock {
  id?: number;
  name: string;
  category: 'FORAGE_GREEN' | 'FORAGE_DRY' | 'CONCENTRATE' | 'MINERALS_VITAMINS' | string;
  currentStockKg: number;
  alertThresholdKg: number;
  unitPricePerKgFcfa?: number;
  supplierName?: string;
  storageLocation?: string;
  notes?: string;
  isLowStock?: boolean;
}

export interface FeedRation {
  id?: number;
  rationName: string;
  targetCategory: string;
  dailyDryMatterKg: number;
  compositionDescription: string;
  dailyCostFcfa: number;
  energyUfl?: number;
  proteinPdiGrams?: number;
}

export interface SolarTelemetry {
  id?: number;
  timestamp?: string;
  currentSolarPowerKw: number;
  batterySocPercent: number;
  dailySolarYieldKwh: number;
  totalSolarYieldMwh: number;
  gridStatus: 'SOLAR_OPTIMAL' | 'BATTERY_BACKUP' | 'GENERATOR_STANDBY' | string;
  coldRoomTempCelsius: number;
  secondColdRoomTempCelsius: number;
  waterPumpFlowM3h: number;
  waterTankLevelPercent: number;
  co2SavedKg: number;
}
