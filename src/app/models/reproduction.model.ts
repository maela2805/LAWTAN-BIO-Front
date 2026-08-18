export type ReproEventType =
  | 'HEAT_DETECTION'
  | 'ARTIFICIAL_INSEMINATION'
  | 'NATURAL_MATING'
  | 'PREGNANCY_DIAGNOSIS'
  | 'CALVING'
  | 'DRY_OFF';

export interface ReproductionEvent {
  id?: number;
  animalId?: number;
  animalInternalId: string;
  animalName?: string;
  eventType: ReproEventType;
  eventTypeLabel?: string;
  eventDate: string;
  bullOrSemenUsed?: string;
  operatorName?: string;
  expectedDryOffDate?: string;
  expectedCalvingDate?: string;
  observations?: string;
  isConfirmed?: boolean;
}

export interface ReproductionAlert {
  alertType: 'CALVING_IMMINENT' | 'DRY_OFF_DUE' | 'HEAT_ACTIVE' | string;
  animalInternalId: string;
  animalName: string;
  targetDate: string;
  daysRemaining: number;
  message: string;
  severity: 'DANGER' | 'WARNING' | 'INFO';
}
