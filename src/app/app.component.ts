import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Animal, Pedigree } from './models/animal.model';
import { HealthRecord, VaccineSchedule } from './models/health.model';
import { DashboardStats, MilkProduction } from './models/milk.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);

  // Active navigation page
  activePage = signal<string>('dashboard');

  // Sidebar mobile toggle
  isSidebarOpen = signal<boolean>(false);

  // Notifications dropdown
  isNotifOpen = signal<boolean>(false);

  // Offline simulation
  isOffline = signal<boolean>(false);

  // Current user role
  currentRole = signal<string>('manager');

  // Toast message
  toastMessage = signal<string | null>(null);

  // Active animal modal
  isAnimalModalOpen = signal<boolean>(false);
  activeModalTab = signal<string>('infos');
  selectedAnimal = signal<Animal | null>(null);

  // Pagination Troupeau
  herdCurrentPage = signal<number>(1);
  herdPageSize = signal<number>(4);

  // Modals state
  isMilkModalOpen = signal<boolean>(false);
  isHealthModalOpen = signal<boolean>(false);
  isEditHealthModalOpen = signal<boolean>(false);
  isOrderModalOpen = signal<boolean>(false);
  isQrModalOpen = signal<boolean>(false);
  isNewAnimalModalOpen = signal<boolean>(false);
  isEditAnimalModalOpen = signal<boolean>(false);
  isVaccineModalOpen = signal<boolean>(false);
  isRationModalOpen = signal<boolean>(false);
  isReproModalOpen = signal<boolean>(false);
  isExportModalOpen = signal<boolean>(false);

  // QR Modal Data
  qrData = signal<{ lot: string; product: string; date: string; volume: string }>({
    lot: 'LOT-082',
    product: 'Lait Frais Bio Pasteurisé',
    date: '13/08/2026 à 06:00',
    volume: '68 Litres'
  });

  // Filter & Search
  herdFilter = signal<string>('all');
  searchQuery = signal<string>('');

  // Forms
  milkForm = {
    cowId: 'FL-001',
    session: 'Matin (06h00)',
    litres: 11.5,
    temp: 34.2,
    tank: 'Cuve Réfrigérée N°1 (Bio)'
  };

  healthForm = {
    cowId: 'FL-003',
    actType: 'Traitement Pathologie',
    cost: 12500,
    prescription: ''
  };

  editingHealthRecord: HealthRecord = {
    id: 1,
    animalInternalId: 'FL-003',
    actType: 'Traitement Pathologie',
    costFcfa: 12500,
    diagnosis: '',
    practitionerName: 'Dr. Fall',
    status: 'En cours',
    recordDate: '13/08/2026'
  };

  orderForm = {
    client: 'Restaurant Teranga Dakar',
    product: 'Lait Frais Bio',
    qty: 25,
    unitPrice: 800,
    total: 20000
  };

  newAnimalForm: Animal = {
    internalId: 'FL-014',
    name: 'BINTOU',
    earTagNumber: 'SN-DK-1436',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: '2024-05-10',
    weight: 460,
    imageUrl: ''
  };
  newAnimalFather = 'KADER';
  newAnimalFatherEarTag = 'SN-DK-1010';
  newAnimalMother = 'NDIRA';
  newAnimalMotherEarTag = 'SN-DK-1001';

  editAnimalForm: Animal = {
    internalId: '',
    name: '',
    earTagNumber: '',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: '',
    weight: 0,
    imageUrl: ''
  };
  editAnimalFather = '';
  editAnimalFatherEarTag = '';
  editAnimalMother = '';
  editAnimalMotherEarTag = '';

  vaccineForm = {
    type: 'Rappel Fièvre Aphteuse',
    target: 'Tout le troupeau (13 têtes)',
    date: '2026-08-20',
    vet: 'Dr. Fall (Vétérinaire Ferme)',
    cost: 20000,
    notes: ''
  };

  rationForm = {
    group: '7 Vaches en production',
    fourrage: 85,
    mais: 60,
    concentre: 22,
    cmv: 1400,
    time: 'Matin (07h30)',
    operator: 'Bouvier Responsable'
  };

  reproForm = {
    cow: 'FATOU (FL-005)',
    type: 'Insémination Artificielle (IA)',
    bull: 'KADER (FL-010) — Semence A+',
    date: '2026-08-14',
    obs: ''
  };

  // Data Collections
  animals = signal<Animal[]>([]);
  healthRecords = signal<HealthRecord[]>([]);
  vaccineSchedules = signal<VaccineSchedule[]>([]);
  dashboardStats = signal<DashboardStats | null>(null);

  // Charts
  private milkChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;
  private monthlyChartInstance: Chart | null = null;
  private financeChartInstance: Chart | null = null;
  private perfChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initDashboardCharts();
    }, 200);
  }

  loadInitialData(): void {
    // 1. Fetch Animals from API
    this.apiService.getAllAnimals().subscribe(data => {
      if (data && data.length > 0) {
        this.animals.set(data);
      } else {
        this.loadFallbackAnimals();
      }
    });

    // 2. Fetch Health Records
    this.apiService.getAllHealthRecords().subscribe(data => {
      if (data && data.length > 0) {
        this.healthRecords.set(data);
      } else {
        this.loadFallbackHealth();
      }
    });

    // 3. Fetch Vaccines
    this.apiService.getAllVaccines().subscribe(data => {
      if (data && data.length > 0) {
        this.vaccineSchedules.set(data);
      } else {
        this.loadFallbackVaccines();
      }
    });

    // 4. Fetch Dashboard Stats
    this.apiService.getDashboardStats().subscribe(stats => {
      if (stats) {
        this.dashboardStats.set(stats);
      }
    });
  }

  loadFallbackAnimals(): void {
    const fallback: Animal[] = [
      {
        id: 1, internalId: 'FL-001', name: 'NDIRA', earTagNumber: 'SN-DK-1423', rfidCode: 'RFID-9820-001',
        breed: 'Holstein x N\'Dama', birthDate: '2022-03-14', category: 'MILKING_COW', status: 'EXCELLENT',
        weight: 520, temperature: 38.6, dailyMilkYield: 21.5, lactationNumber: 3, daysInMilk: 154,
        totalLactationMilk: 1840, reproStatus: 'Gestation à confirmer (IA Mai 2026)', avatarEmoji: '🐄',
        origin: 'Ferme LAWTAN', notes: 'Vache laitière d\'exception.',
        pedigree: {
          subjectNote: 'Holstein Pure — Ferme LAWTAN', fatherName: 'SULTAN (USA-42891)',
          fatherBreed: 'Holstein Champion USA', fatherNote: 'Semence Importée A+',
          motherName: 'NAFI (SN-0129)', motherBreed: 'Montbéliarde x Gobra', motherNote: 'Record : 24 L/j',
          grandFatherPaternal: 'KING (CAN-8821)', grandMotherPaternal: 'BELLA (USA-3341)',
          grandFatherMaternal: 'MOUSSA (SN-0045)', grandMotherMaternal: 'DIOUMA (SN-0048)'
        }
      },
      {
        id: 2, internalId: 'FL-002', name: 'MARIAMA', earTagNumber: 'SN-DK-1424', rfidCode: 'RFID-9820-002',
        breed: 'Montbéliarde', birthDate: '2021-11-20', category: 'MILKING_COW', status: 'EXCELLENT',
        weight: 490, temperature: 38.5, dailyMilkYield: 19.0, lactationNumber: 4, daysInMilk: 190,
        totalLactationMilk: 2340, reproStatus: 'Cycle régulier', avatarEmoji: '🐄',
        origin: 'France (Import)', notes: 'Excellente aptitude fromagère.',
        pedigree: {
          subjectNote: 'Montbéliarde Pure Lignée France', fatherName: 'VALENTIN (FR-88910)',
          fatherBreed: 'Montbéliard France', fatherNote: 'Index fromager élevé',
          motherName: 'CERISE (FR-1120)', motherBreed: 'Montbéliarde', motherNote: '18 L/j',
          grandFatherPaternal: 'JURA (FR-3301)', grandMotherPaternal: 'ALPES (FR-2290)',
          grandFatherMaternal: 'RHONE (FR-7711)', grandMotherMaternal: 'DOUBS (FR-8822)'
        }
      },
      {
        id: 3, internalId: 'FL-003', name: 'DIOUMA', earTagNumber: 'SN-DK-1425', rfidCode: 'RFID-9820-003',
        breed: 'Holstein', birthDate: '2022-06-10', category: 'MILKING_COW', status: 'FEVER_TREATMENT',
        weight: 510, temperature: 39.8, dailyMilkYield: 12.0, lactationNumber: 2, daysInMilk: 95,
        totalLactationMilk: 1120, reproStatus: 'En traitement - Repos saillie', avatarEmoji: '🚨',
        origin: 'Ferme LAWTAN', notes: 'Sous traitement antibiotique Dr. Fall.',
        pedigree: {
          subjectNote: 'Holstein Lignée Dakar', fatherName: 'KADER (FL-010)', fatherBreed: 'Holstein USA',
          motherName: 'AMIE (SN-0098)', motherBreed: 'Holstein Métisse',
          grandFatherPaternal: 'SULTAN (USA-42891)', grandMotherPaternal: 'NAFI (SN-0129)',
          grandFatherMaternal: 'IBOU (SN-0021)', grandMotherMaternal: 'FAMA (SN-0033)'
        }
      },
      {
        id: 4, internalId: 'FL-004', name: 'COUMBA', earTagNumber: 'SN-DK-1426', rfidCode: 'RFID-9820-004',
        breed: 'Gir Laitier', birthDate: '2022-01-05', category: 'MILKING_COW', status: 'PREGNANT',
        weight: 455, temperature: 38.4, dailyMilkYield: 18.0, lactationNumber: 2, daysInMilk: 120,
        totalLactationMilk: 1450, reproStatus: 'Gestante (4 mois) - Vêlage Décembre 2026', avatarEmoji: '🐄',
        origin: 'Brésil (Gir)', notes: 'Gestation confirmée par échographie.',
        pedigree: {
          subjectNote: 'Gir Laitier Brésil Adapté', fatherName: 'BRAHMA (IND-7712)', fatherBreed: 'Gir Pur',
          motherName: 'SAMBA (BR-9901)', motherBreed: 'Gir Laitière',
          grandFatherPaternal: 'KRISHNA (IND-1120)', grandMotherPaternal: 'GANGA (IND-9912)',
          grandFatherMaternal: 'RIO (BR-5512)', grandMotherMaternal: 'BAHIA (BR-4411)'
        }
      },
      {
        id: 5, internalId: 'FL-005', name: 'FATOU', earTagNumber: 'SN-DK-1427', rfidCode: 'RFID-9820-005',
        breed: 'Montbéliarde', birthDate: '2023-02-18', category: 'MILKING_COW', status: 'IN_HEAT',
        weight: 430, temperature: 38.7, dailyMilkYield: 17.0, lactationNumber: 1, daysInMilk: 60,
        totalLactationMilk: 780, reproStatus: 'Chaleurs dans 3j - IA programmée avec KADER', avatarEmoji: '🐄',
        origin: 'Ferme LAWTAN', notes: 'Fille de NDIRA.',
        pedigree: {
          subjectNote: 'Fille de NDIRA x Montbéliard', fatherName: 'VALENTIN (FR-88910)', fatherBreed: 'Montbéliard France',
          motherName: 'NDIRA (FL-001)', motherBreed: 'Holstein Pure',
          grandFatherPaternal: 'JURA (FR-3301)', grandMotherPaternal: 'ALPES (FR-2290)',
          grandFatherMaternal: 'SULTAN (USA-42891)', grandMotherMaternal: 'NAFI (SN-0129)'
        }
      },
      {
        id: 6, internalId: 'FL-006', name: 'SOKHNA', earTagNumber: 'SN-DK-1428', rfidCode: 'RFID-9820-006',
        breed: 'Gir Métisse', birthDate: '2022-08-22', category: 'MILKING_COW', status: 'HEALTHY',
        weight: 440, temperature: 38.5, dailyMilkYield: 16.5, lactationNumber: 2, daysInMilk: 110,
        totalLactationMilk: 1290, reproStatus: 'Vêlage Mars 2026', avatarEmoji: '🐄',
        origin: 'Ferme LAWTAN', notes: 'Excellente rusticité.',
        pedigree: {
          subjectNote: 'Métisse Gir Rustique', fatherName: 'BRAHMA (IND-7712)', fatherBreed: 'Gir Pur',
          motherName: 'BINETA (SN-0077)', motherBreed: 'Gobra Sélectionnée',
          grandFatherPaternal: 'KRISHNA (IND-1120)', grandMotherPaternal: 'GANGA (IND-9912)',
          grandFatherMaternal: 'ALPHA (SN-0010)', grandMotherMaternal: 'ASTOU (SN-0015)'
        }
      },
      {
        id: 7, internalId: 'FL-007', name: 'ROKHAYA', earTagNumber: 'SN-DK-1429', rfidCode: 'RFID-9820-007',
        breed: 'Holstein Pure', birthDate: '2021-09-12', category: 'MILKING_COW', status: 'EXCELLENT',
        weight: 530, temperature: 38.6, dailyMilkYield: 20.0, lactationNumber: 3, daysInMilk: 140,
        totalLactationMilk: 1980, reproStatus: 'Vêlage Avril 2026', avatarEmoji: '🐄',
        origin: 'Ferme LAWTAN', notes: 'Haute productrice.',
        pedigree: {
          subjectNote: 'Holstein Championne', fatherName: 'SULTAN (USA-42891)', fatherBreed: 'Holstein USA',
          motherName: 'MAREME (SN-0055)', motherBreed: 'Holstein Pure',
          grandFatherPaternal: 'KING (CAN-8821)', grandMotherPaternal: 'BELLA (USA-3341)',
          grandFatherMaternal: 'PAPA (SN-0008)', grandMotherMaternal: 'MAMA (SN-0009)'
        }
      },
      {
        id: 8, internalId: 'FL-008', name: 'AWA', earTagNumber: 'SN-DK-1430', rfidCode: 'RFID-9820-008',
        breed: 'Montbéliarde', birthDate: '2025-09-15', category: 'HEIFER_YOUNG', status: 'GROWTH',
        weight: 180, temperature: 38.5, dailyMilkYield: 0.0, lactationNumber: 0, daysInMilk: 0,
        totalLactationMilk: 0, reproStatus: 'Génisse en croissance (11 mois)', avatarEmoji: '🐮',
        origin: 'Ferme LAWTAN', notes: 'Fille de Mariama.',
        pedigree: {
          subjectNote: 'Génisse Montbéliarde', fatherName: 'SAMBA (FL-011)', fatherBreed: 'Montbéliard',
          motherName: 'MARIAMA (FL-002)', motherBreed: 'Montbéliarde',
          grandFatherPaternal: 'VALENTIN (FR-88910)', grandMotherPaternal: 'CERISE (FR-1120)',
          grandFatherMaternal: 'VALENTIN (FR-88910)', grandMotherMaternal: 'CERISE (FR-1120)'
        }
      },
      {
        id: 9, internalId: 'FL-009', name: 'AMINATA', earTagNumber: 'SN-DK-1431', rfidCode: 'RFID-9820-009',
        breed: 'Holstein Pure', birthDate: '2025-06-01', category: 'HEIFER_YOUNG', status: 'GROWTH',
        weight: 215, temperature: 38.6, dailyMilkYield: 0.0, lactationNumber: 0, daysInMilk: 0,
        totalLactationMilk: 0, reproStatus: 'Génisse (14 mois) - Prête pour 1ère IA', avatarEmoji: '🐮',
        origin: 'Ferme LAWTAN', notes: 'Fille de NDIRA x KADER.',
        pedigree: {
          subjectNote: 'Future Génitrice Laitière', fatherName: 'KADER (FL-010)', fatherBreed: 'Holstein Pure',
          motherName: 'NDIRA (FL-001)', motherBreed: 'Holstein Pure',
          grandFatherPaternal: 'SULTAN (USA-42891)', grandMotherPaternal: 'NAFI (SN-0129)',
          grandFatherMaternal: 'SULTAN (USA-42891)', grandMotherMaternal: 'NAFI (SN-0129)'
        }
      },
      {
        id: 10, internalId: 'FL-010', name: 'KADER', earTagNumber: 'SN-DK-1432', rfidCode: 'RFID-9820-010',
        breed: 'Holstein Pure', birthDate: '2022-02-10', category: 'MALE_BULL', status: 'BREEDER_BULL',
        weight: 780, temperature: 38.4, dailyMilkYield: 0.0, lactationNumber: 0, daysInMilk: 0,
        totalLactationMilk: 0, reproStatus: 'Taureau Reproducteur Principal - Semence A+', avatarEmoji: '🐂',
        origin: 'USA (Lignée Championne)', notes: 'Taureau d\'élite.',
        pedigree: {
          subjectNote: 'Taureau Reproducteur Lignée Championne', fatherName: 'TITAN (USA-99881)', fatherBreed: 'Holstein USA',
          motherName: 'QUEEN (USA-11442)', motherBreed: 'Holstein USA',
          grandFatherPaternal: 'APOLLO (USA-5511)', grandMotherPaternal: 'VENUS (USA-3399)',
          grandFatherMaternal: 'MAX (USA-7722)', grandMotherMaternal: 'DIAMOND (USA-8811)',
          semenMobilityPercentage: 85, semenConcentration: 1.2, semenMorphologyOkPercentage: 90, semenDosesAvailable: 12
        }
      },
      {
        id: 11, internalId: 'FL-011', name: 'SAMBA', earTagNumber: 'SN-DK-1433', rfidCode: 'RFID-9820-011',
        breed: 'Montbéliard', birthDate: '2023-04-15', category: 'MALE_BULL', status: 'BREEDER_BULL',
        weight: 720, temperature: 38.5, dailyMilkYield: 0.0, lactationNumber: 0, daysInMilk: 0,
        totalLactationMilk: 0, reproStatus: 'Taureau Montbéliard - 8 Doses', avatarEmoji: '🐂',
        origin: 'France', notes: 'Amélioration fromagère.',
        pedigree: {
          subjectNote: 'Montbéliard Race Pure', fatherName: 'VALENTIN (FR-88910)', fatherBreed: 'Montbéliard',
          motherName: 'DOUCE (FR-4412)', motherBreed: 'Montbéliarde',
          grandFatherPaternal: 'JURA (FR-3301)', grandMotherPaternal: 'ALPES (FR-2290)',
          grandFatherMaternal: 'LION (FR-9901)', grandMotherMaternal: 'BELLA (FR-3388)',
          semenMobilityPercentage: 80, semenConcentration: 1.1, semenMorphologyOkPercentage: 88, semenDosesAvailable: 8
        }
      },
      {
        id: 12, internalId: 'FL-012', name: 'BADOU', earTagNumber: 'SN-DK-1434', rfidCode: 'RFID-9820-012',
        breed: 'Gir Pur', birthDate: '2025-02-10', category: 'MALE_BULL', status: 'GROWTH',
        weight: 380, temperature: 38.5, dailyMilkYield: 0.0, lactationNumber: 0, daysInMilk: 0,
        totalLactationMilk: 0, reproStatus: 'Jeune Mâle (18 mois) - Futur Reproducteur', avatarEmoji: '🐂',
        origin: 'Ferme LAWTAN', notes: 'Excellente musculature.',
        pedigree: {
          subjectNote: 'Jeune Taureau Gir', fatherName: 'BRAHMA (IND-7712)', fatherBreed: 'Gir',
          motherName: 'COUMBA (FL-004)', motherBreed: 'Gir Laitier',
          grandFatherPaternal: 'KRISHNA (IND-1120)', grandMotherPaternal: 'GANGA (IND-9912)',
          grandFatherMaternal: 'RIO (BR-5512)', grandMotherMaternal: 'BAHIA (BR-4411)'
        }
      },
      {
        id: 13, internalId: 'FL-013', name: 'MODOU', earTagNumber: 'SN-DK-1435', rfidCode: 'RFID-9820-013',
        breed: 'Métis Gobra x Holstein', birthDate: '2025-03-20', category: 'MALE_BULL', status: 'GROWTH',
        weight: 350, temperature: 38.6, dailyMilkYield: 0.0, lactationNumber: 0, daysInMilk: 0,
        totalLactationMilk: 0, reproStatus: 'Jeune Mâle (17 mois)', avatarEmoji: '🐂',
        origin: 'Ferme LAWTAN', notes: 'Phase d\'engraissement.',
        pedigree: {
          subjectNote: 'Croisement Rustique', fatherName: 'KADER (FL-010)', fatherBreed: 'Holstein Pure',
          motherName: 'SOKHNA (FL-006)', motherBreed: 'Gir Métisse',
          grandFatherPaternal: 'TITAN (USA-99881)', grandMotherPaternal: 'QUEEN (USA-11442)',
          grandFatherMaternal: 'BRAHMA (IND-7712)', grandMotherMaternal: 'BINETA (SN-0077)'
        }
      }
    ];
    this.animals.set(fallback);
  }

  loadFallbackHealth(): void {
    const records: HealthRecord[] = [
      {
        id: 1, animalInternalId: 'FL-003', animalName: 'DIOUMA', recordDate: '13/08/2026',
        actType: 'Traitement Pathologie', diagnosis: 'Fièvre 39.8°C / Traitement antibiotique + anti-inflammatoire',
        practitionerName: 'Dr. Fall', costFcfa: 12500, status: 'En cours', milkWithdrawalDays: 3
      },
      {
        id: 2, animalInternalId: 'FL-002', animalName: 'MARIAMA', recordDate: '10/08/2026',
        actType: 'Vaccination', diagnosis: 'Vaccination IBR & BVD',
        practitionerName: 'Dr. Fall', costFcfa: 8000, status: 'Terminé'
      },
      {
        id: 3, animalInternalId: 'FL-005', animalName: 'FATOU', recordDate: '05/08/2026',
        actType: 'Bilan pré-insémination', diagnosis: 'Bilan pré-insémination & pesée (430 kg)',
        practitionerName: 'Technicien', costFcfa: 0, status: 'Apte IA'
      },
      {
        id: 4, animalInternalId: 'FL-010', animalName: 'KADER', recordDate: '01/08/2026',
        actType: 'Analyse Spermatique', diagnosis: 'Spermogramme & contrôle fertilité semence',
        practitionerName: 'Dr. Fall', costFcfa: 25000, status: 'Qualité A+'
      }
    ];
    this.healthRecords.set(records);
  }

  loadFallbackVaccines(): void {
    const schedules: VaccineSchedule[] = [
      {
        id: 1, vaccineType: 'Rappel Fièvre Aphteuse', targetHerd: 'Tout le troupeau — 13 animaux • Prévu à 08h00',
        scheduledDate: '15/08', practitioner: 'Dr. Fall (Vétérinaire Ferme)', estimatedCost: 20000, status: 'Dans 2 jours'
      },
      {
        id: 2, vaccineType: 'Péripneumonie Contagieuse Bovine (PPCB)', targetHerd: 'Vaches en lactation + 2 jeunes génisses',
        scheduledDate: '01/09', practitioner: 'Dr. Fall', estimatedCost: 15000, status: 'Planifié'
      },
      {
        id: 3, vaccineType: 'Déparasitage Interne & Externe', targetHerd: 'Administration ivermectine tout le troupeau',
        scheduledDate: '15/09', practitioner: 'Technicien Élevage', estimatedCost: 10000, status: 'Planifié'
      }
    ];
    this.vaccineSchedules.set(schedules);
  }

  // Navigation
  showPage(pageId: string): void {
    this.activePage.set(pageId);
    this.isSidebarOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'dashboard') {
      setTimeout(() => this.initDashboardCharts(), 150);
    } else if (pageId === 'lait') {
      setTimeout(() => this.initMilkChart(), 150);
    } else if (pageId === 'finance') {
      setTimeout(() => this.initFinanceChart(), 150);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleNotif(): void {
    this.isNotifOpen.update(v => !v);
  }

  toggleOffline(): void {
    this.isOffline.update(v => !v);
    this.showToast(this.isOffline() ? 'Mode Hors-ligne activé (Saisie locale 4G)' : 'Connexion 4G rétablie');
  }

  switchRole(role: string): void {
    this.currentRole.set(role);
    this.showToast(`Vue basculée : ${role}`);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  // Filtering & Pagination Herd
  filterHerd(category: string): void {
    this.herdFilter.set(category);
    this.herdCurrentPage.set(1);
  }

  get filteredAnimals(): Animal[] {
    const filter = this.herdFilter();
    const q = this.searchQuery().toLowerCase().trim();

    return this.animals().filter(a => {
      let matchesCat = true;
      if (filter === 'prod') matchesCat = a.category === 'MILKING_COW';
      else if (filter === 'jeune') matchesCat = a.category === 'HEIFER_YOUNG';
      else if (filter === 'male') matchesCat = a.category === 'MALE_BULL';

      let matchesSearch = true;
      if (q) {
        matchesSearch = a.name.toLowerCase().includes(q) ||
          a.internalId.toLowerCase().includes(q) ||
          a.earTagNumber.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }

  get paginatedAnimals(): Animal[] {
    const start = (this.herdCurrentPage() - 1) * this.herdPageSize();
    return this.filteredAnimals.slice(start, start + this.herdPageSize());
  }

  get totalHerdPages(): number {
    return Math.ceil(this.filteredAnimals.length / this.herdPageSize()) || 1;
  }

  get herdPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalHerdPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setHerdPage(page: number): void {
    if (page >= 1 && page <= this.totalHerdPages) {
      this.herdCurrentPage.set(page);
    }
  }

  nextHerdPage(): void {
    if (this.herdCurrentPage() < this.totalHerdPages) {
      this.herdCurrentPage.update(p => p + 1);
    }
  }

  prevHerdPage(): void {
    if (this.herdCurrentPage() > 1) {
      this.herdCurrentPage.update(p => p - 1);
    }
  }

  get milkingCows(): Animal[] {
    return this.animals().filter(a => a.category === 'MILKING_COW');
  }

  // Animal Modal
  openAnimalModal(internalId: string): void {
    const animal = this.animals().find(a => a.internalId === internalId);
    if (animal) {
      this.selectedAnimal.set(animal);
      this.activeModalTab.set('infos');
      this.isAnimalModalOpen.set(true);
      setTimeout(() => this.initPerfModalChart(animal), 200);
    }
  }

  closeAnimalModal(): void {
    this.isAnimalModalOpen.set(false);
  }

  switchModalTab(tab: string): void {
    this.activeModalTab.set(tab);
    if (tab === 'lactation' && this.selectedAnimal()) {
      setTimeout(() => this.initPerfModalChart(this.selectedAnimal()!), 150);
    }
  }

  // Forms Submissions
  submitMilkEntry(): void {
    const prod: MilkProduction = {
      animalInternalId: this.milkForm.cowId,
      session: this.milkForm.session.includes('Matin') ? 'MORNING' : 'EVENING',
      volumeLiters: this.milkForm.litres,
      milkTemperature: this.milkForm.temp,
      destinationTank: this.milkForm.tank,
      productionDate: new Date().toISOString().split('T')[0]
    };

    this.apiService.recordMilk(prod).subscribe({
      next: () => {
        this.showToast(`Collecte de ${this.milkForm.litres}L enregistrée pour ${this.milkForm.cowId} !`);
        this.isMilkModalOpen.set(false);
        this.loadInitialData();
      },
      error: () => {
        this.showToast(`Collecte de ${this.milkForm.litres}L enregistrée en local !`);
        this.isMilkModalOpen.set(false);
      }
    });
  }

  submitHealthEntry(): void {
    const record: HealthRecord = {
      animalInternalId: this.healthForm.cowId.split(' ')[0],
      actType: this.healthForm.actType,
      diagnosis: this.healthForm.prescription || 'Intervention de routine',
      practitionerName: 'Dr. Fall',
      costFcfa: this.healthForm.cost,
      status: 'En cours',
      recordDate: new Date().toLocaleDateString('fr-FR')
    };

    this.apiService.createHealthRecord(record).subscribe({
      next: () => {
        this.showToast('Intervention vétérinaire enregistrée au dossier !');
        this.isHealthModalOpen.set(false);
        this.loadInitialData();
      },
      error: () => {
        this.healthRecords.update(records => [record, ...records]);
        this.showToast('Intervention enregistrée en local !');
        this.isHealthModalOpen.set(false);
      }
    });
  }

  submitOrderEntry(): void {
    this.showToast(`Commande ${this.orderForm.client} (${this.orderForm.qty} ${this.orderForm.product}) validée !`);
    this.isOrderModalOpen.set(false);
  }

  submitNewAnimal(): void {
    const isMale = this.newAnimalForm.category === 'MALE_BULL';
    const animal: Animal = {
      ...this.newAnimalForm,
      avatarEmoji: isMale ? '🐂' : (this.newAnimalForm.category === 'HEIFER_YOUNG' ? '🐮' : '🐄'),
      gender: isMale ? 'MALE' : 'FEMALE',
      genderLabel: isMale ? 'Mâle' : 'Femelle',
      pedigree: {
        fatherName: this.newAnimalFather,
        fatherEarTag: this.newAnimalFatherEarTag,
        motherName: this.newAnimalMother,
        motherEarTag: this.newAnimalMotherEarTag
      }
    };

    this.apiService.createAnimal(animal).subscribe({
      next: (created) => {
        this.animals.update(list => [...list, created]);
        this.showToast(`Animal ${animal.name} (${animal.internalId}) ajouté au registre !`);
        this.isNewAnimalModalOpen.set(false);
      },
      error: () => {
        this.animals.update(list => [...list, animal]);
        this.showToast(`Animal ${animal.name} (${animal.internalId}) ajouté en local !`);
        this.isNewAnimalModalOpen.set(false);
      }
    });
  }

  // Photo upload handling (Instant preview + Canvas compression + Base64)
  handlePhotoUpload(event: Event, target: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            if (target === 'new') {
              this.newAnimalForm.imageUrl = compressed;
            } else {
              this.editAnimalForm.imageUrl = compressed;
            }
            this.showToast('Photo optimisée & chargée avec succès !');
          } else {
            if (target === 'new') {
              this.newAnimalForm.imageUrl = rawData;
            } else {
              this.editAnimalForm.imageUrl = rawData;
            }
          }
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(target: 'new' | 'edit'): void {
    if (target === 'new') {
      this.newAnimalForm.imageUrl = '';
    } else {
      this.editAnimalForm.imageUrl = '';
    }
  }

  // Edit Animal Handlers
  openEditAnimalModal(animal: Animal): void {
    this.editAnimalForm = { ...animal };
    this.editAnimalFather = animal.pedigree?.fatherName || '';
    this.editAnimalFatherEarTag = animal.pedigree?.fatherEarTag || '';
    this.editAnimalMother = animal.pedigree?.motherName || '';
    this.editAnimalMotherEarTag = animal.pedigree?.motherEarTag || '';
    this.isEditAnimalModalOpen.set(true);
  }

  submitEditAnimal(): void {
    const isMale = this.editAnimalForm.category === 'MALE_BULL';
    const updated: Animal = {
      ...this.editAnimalForm,
      avatarEmoji: isMale ? '🐂' : (this.editAnimalForm.category === 'HEIFER_YOUNG' ? '🐮' : '🐄'),
      gender: isMale ? 'MALE' : 'FEMALE',
      genderLabel: isMale ? 'Mâle' : 'Femelle',
      pedigree: {
        ...(this.editAnimalForm.pedigree || {}),
        fatherName: this.editAnimalFather,
        fatherEarTag: this.editAnimalFatherEarTag,
        motherName: this.editAnimalMother,
        motherEarTag: this.editAnimalMotherEarTag
      }
    };

    this.apiService.updateAnimal(updated.internalId, updated).subscribe({
      next: (res) => {
        this.animals.update(list => list.map(a => a.internalId === updated.internalId ? res : a));
        if (this.selectedAnimal()?.internalId === updated.internalId) {
          this.selectedAnimal.set(res);
        }
        this.showToast(`Fiche de ${updated.name} mise à jour avec succès !`);
        this.isEditAnimalModalOpen.set(false);
      },
      error: () => {
        this.animals.update(list => list.map(a => a.internalId === updated.internalId ? updated : a));
        if (this.selectedAnimal()?.internalId === updated.internalId) {
          this.selectedAnimal.set(updated);
        }
        this.showToast(`Fiche de ${updated.name} mise à jour en local !`);
        this.isEditAnimalModalOpen.set(false);
      }
    });
  }

  // Edit Health Record Handlers
  openEditHealthModal(record: HealthRecord): void {
    this.editingHealthRecord = { ...record };
    this.isEditHealthModalOpen.set(true);
  }

  submitEditHealthEntry(): void {
    const rec = this.editingHealthRecord;
    if (!rec.id) return;

    this.apiService.updateHealthRecord(rec.id, rec).subscribe({
      next: (res) => {
        this.healthRecords.update(list => list.map(r => r.id === rec.id ? res : r));
        this.showToast('Acte médical mis à jour avec succès !');
        this.isEditHealthModalOpen.set(false);
      },
      error: () => {
        this.healthRecords.update(list => list.map(r => r.id === rec.id ? rec : r));
        this.showToast('Acte médical mis à jour en local !');
        this.isEditHealthModalOpen.set(false);
      }
    });
  }

  submitVaccinePlan(): void {
    const v: VaccineSchedule = {
      vaccineType: this.vaccineForm.type,
      targetHerd: this.vaccineForm.target,
      scheduledDate: this.vaccineForm.date,
      practitioner: this.vaccineForm.vet,
      estimatedCost: this.vaccineForm.cost,
      status: 'Planifié',
      notes: this.vaccineForm.notes
    };

    this.apiService.createVaccine(v).subscribe({
      next: () => {
        this.vaccineSchedules.update(list => [...list, v]);
        this.showToast('Planification vaccinale enregistrée !');
        this.isVaccineModalOpen.set(false);
      },
      error: () => {
        this.vaccineSchedules.update(list => [...list, v]);
        this.showToast('Planification enregistrée en local !');
        this.isVaccineModalOpen.set(false);
      }
    });
  }

  submitRationDistribution(): void {
    this.showToast('Distribution de ration enregistrée & stocks mis à jour !');
    this.isRationModalOpen.set(false);
  }

  submitReproEntry(): void {
    this.showToast(`Événement de reproduction enregistré pour ${this.reproForm.cow} !`);
    this.isReproModalOpen.set(false);
  }

  submitFinanceExport(): void {
    this.showToast('Exportation du bilan financier en cours de téléchargement...');
    this.isExportModalOpen.set(false);
  }

  openTraceabilityCertificate(lot: string, prod: string, date: string, vol: string): void {
    this.qrData.set({ lot, product: prod, date, volume: vol });
    this.isQrModalOpen.set(true);
  }

  // --- Charts Initializations ---
  private initDashboardCharts(): void {
    const milkCanvas = document.getElementById('dashMilkChart') as HTMLCanvasElement;
    if (milkCanvas) {
      if (this.milkChartInstance) this.milkChartInstance.destroy();
      this.milkChartInstance = new Chart(milkCanvas, {
        type: 'bar',
        data: {
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Aujourd\'hui'],
          datasets: [
            {
              label: 'Traite Matin (06h00)',
              data: [65.0, 66.5, 68.0, 67.0, 69.5, 68.0, 68.0],
              backgroundColor: '#16a34a',
              borderRadius: 6
            },
            {
              label: 'Traite Soir (17h00)',
              data: [52.0, 54.0, 55.0, 56.0, 56.5, 55.0, 56.0],
              backgroundColor: '#38bdf8',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    const donutCanvas = document.getElementById('dashRevDonut') as HTMLCanvasElement;
    if (donutCanvas) {
      if (this.donutChartInstance) this.donutChartInstance.destroy();
      this.donutChartInstance = new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Lait Frais Bio', 'Lait Caillé (Sow)', 'Fromage Bio', 'Yaourts Bio'],
          datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: ['#16a34a', '#38bdf8', '#f59e0b', '#9333ea'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  private initMilkChart(): void {
    const canvas = document.getElementById('monthlyMilkChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.monthlyChartInstance) this.monthlyChartInstance.destroy();

    this.monthlyChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['1 Août', '3 Août', '5 Août', '7 Août', '9 Août', '11 Août', '13 Août (Auj.)'],
        datasets: [{
          label: 'Collecte Journalière (Litres)',
          data: [112, 115, 118, 122, 120, 126, 124],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private initFinanceChart(): void {
    const canvas = document.getElementById('financeChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.financeChartInstance) this.financeChartInstance.destroy();

    this.financeChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août (En cours)'],
        datasets: [
          {
            label: 'Recettes Ventes (k FCFA)',
            data: [850, 920, 1050, 1100, 1180, 1240],
            backgroundColor: '#16a34a',
            borderRadius: 6
          },
          {
            label: 'Charges Exploitation (k FCFA)',
            data: [680, 710, 790, 820, 850, 890],
            backgroundColor: '#ef4444',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private initPerfModalChart(animal: Animal): void {
    const canvas = document.getElementById('perfModalChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.perfChartInstance) this.perfChartInstance.destroy();

    const baseYield = animal.dailyMilkYield || 18.0;
    this.perfChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['J30', 'J60', 'J90', 'J120', 'J150 (Auj.)', 'J180 (Prévu)', 'J210 (Prévu)'],
        datasets: [{
          label: `Courbe de Lactation — ${animal.name} (${animal.internalId})`,
          data: [baseYield - 3, baseYield + 1, baseYield + 3, baseYield + 1, baseYield, baseYield - 2, baseYield - 4],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
