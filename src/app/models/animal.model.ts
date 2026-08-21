export interface Pedigree {
  id?: number;
  animalId?: number;
  animalInternalId?: string;
  animalName?: string;
  subjectNote?: string;
  fatherName?: string;
  fatherEarTag?: string;
  fatherBreed?: string;
  fatherNote?: string;
  motherName?: string;
  motherEarTag?: string;
  motherBreed?: string;
  motherNote?: string;
  grandFatherPaternal?: string;
  grandMotherPaternal?: string;
  grandFatherMaternal?: string;
  grandMotherMaternal?: string;
  semenMobilityPercentage?: number;
  semenConcentration?: number;
  semenMorphologyOkPercentage?: number;
  semenDosesAvailable?: number;
}

export type AnimalCategory = 'MILKING_COW' | 'HEIFER_YOUNG' | 'MALE_BULL';
export type AnimalStatus = 'EXCELLENT' | 'HEALTHY' | 'FEVER_TREATMENT' | 'PREGNANT' | 'IN_HEAT' | 'DRY_OFF' | 'GROWTH' | 'BREEDER_BULL';

export interface Animal {
  id?: number;
  internalId: string;
  name: string;
  earTagNumber?: string;
  rfidCode?: string;
  breed: string;
  birthDate: string;
  gender?: 'FEMALE' | 'MALE' | string;
  genderLabel?: string;
  category: AnimalCategory;
  categoryLabel?: string;
  status: AnimalStatus;
  statusLabel?: string;
  weight?: number;
  temperature?: number;
  dailyMilkYield?: number;
  lactationNumber?: number;
  daysInMilk?: number;
  totalLactationMilk?: number;
  reproStatus?: string;
  avatarEmoji?: string;
  imageUrl?: string;
  origin?: string;
  notes?: string;
  pedigree?: Pedigree;
}
