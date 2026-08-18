import { Animal } from './animal.model';

export type MilkSessionType = 'MORNING' | 'EVENING';

export interface MilkProduction {
  id?: number;
  animalId?: number;
  animalInternalId: string;
  animalName?: string;
  animalBreed?: string;
  productionDate: string;
  session: MilkSessionType;
  sessionLabel?: string;
  volumeLiters: number;
  milkTemperature?: number;
  fatPercentage?: number;
  destinationTank?: string;
  isOrganicCompliant?: boolean;
}

export interface TankStatus {
  tankName: string;
  currentVolume: number;
  maxCapacity: number;
  fillPercentage: number;
  temperature: number;
  phLevel: number;
  qualityStatus: string;
  targetBatch: string;
  morningVolume: number;
  eveningVolume: number;
  collectionDate: string;
}

export interface MilkHistory {
  date: string;
  morningVolume: number;
  eveningVolume: number;
  totalVolume: number;
  avgTemperature: number;
  cowsMilkedCount: number;
}

export interface DashboardStats {
  dailyMilkTotal: number;
  morningMilkTotal: number;
  eveningMilkTotal: number;
  milkingCowsCount: number;
  totalFemalesCount: number;
  totalBullsCount: number;
  totalHerdCount: number;
  averageMilkPerCow: number;
  healthAlertsCount: number;
  monthlyRevenueFcfa: number;
  feedConversionRatio: number;
  solarAutonomyPercentage: number;
  milkingCowsToday: Animal[];
  weeklyProductionChart: Array<{ day: string; morning: number; evening: number; total: number }>;
  revenueDistributionChart: Array<{ name: string; percent: number; color: string }>;
}
