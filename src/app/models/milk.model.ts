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
