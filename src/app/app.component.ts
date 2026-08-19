import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Animal, Pedigree } from './models/animal.model';
import { HealthRecord, VaccineSchedule } from './models/health.model';
import { DashboardStats, MilkProduction, TankStatus, MilkHistory } from './models/milk.model';
import { ReproductionEvent, ReproductionAlert, ReproEventType } from './models/reproduction.model';
import { Recipe, TransformationBatch, ProductStock, TransformationSummary, ProductType, BatchStatus } from './models/transformation.model';
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
    session: 'Matin',
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

  // Sprint 2: Reproduction Form
  reproForm: {
    animalInternalId: string;
    eventType: ReproEventType;
    eventDate: string;
    bullOrSemenUsed: string;
    operatorName: string;
    expectedDryOffDate: string;
    expectedCalvingDate: string;
    observations: string;
    isConfirmed: boolean;
  } = {
    animalInternalId: 'FL-005',
    eventType: 'ARTIFICIAL_INSEMINATION',
    eventDate: new Date().toISOString().split('T')[0],
    bullOrSemenUsed: 'KADER (FL-010) — Semence A+',
    operatorName: 'Dr. Fall (Vétérinaire Ferme)',
    expectedDryOffDate: '',
    expectedCalvingDate: '',
    observations: '',
    isConfirmed: true
  };

  // Sprint 3: Transformation & Recipes Modals & State
  isNewBatchModalOpen = signal<boolean>(false);
  isCompleteBatchModalOpen = signal<boolean>(false);
  isRecipeModalOpen = signal<boolean>(false);
  selectedBatchForCompletion = signal<TransformationBatch | null>(null);
  selectedRecipe = signal<Recipe | null>(null);

  isTransformationMenuOpen = signal<boolean>(true); // Menu déroulant accordéon
  activeTransformationSubTab = signal<string>('batches'); // 'batches' | 'recipes' | 'stocks'
  transformationFilter = signal<string>('all'); // 'all' | 'in_progress' | 'completed'
  stockCategoryFilter = signal<string>('all'); // 'all' | 'CHEESE' | 'YOGURT' | 'CURDLED_MILK' | 'BUTTER' | 'PASTEURIZED_MILK'

  // Sprint 3: Forms
  newBatchForm: {
    recipeId: number;
    milkLitersConsumed: number;
    productionDate: string;
    operatorName: string;
    sourceTank: string;
    fatPercentage: number;
    phLevel: number;
    qualityNotes: string;
    isCustomProduct: boolean;
    customProductName: string;
    customProductType: ProductType;
    customTargetUnit: string;
    customMilkRatio: number;
    saveAsNewRecipe: boolean;
  } = {
    recipeId: 1,
    milkLitersConsumed: 30,
    productionDate: new Date().toISOString().split('T')[0],
    operatorName: 'Mamadou Diallo (Maître Fromager)',
    sourceTank: 'Cuve Réfrigérée N°1 (Bio)',
    fatPercentage: 4.2,
    phLevel: 5.2,
    qualityNotes: '',
    isCustomProduct: false,
    customProductName: '',
    customProductType: 'CHEESE',
    customTargetUnit: 'pièce 200g',
    customMilkRatio: 2.0,
    saveAsNewRecipe: true
  };

  completeBatchForm: {
    actualQuantityProduced: number;
    wasteLossQuantity: number;
    phLevel: number;
    qualityNotes: string;
  } = {
    actualQuantityProduced: 0,
    wasteLossQuantity: 0,
    phLevel: 4.8,
    qualityNotes: ''
  };

  recipeForm: Recipe = {
    code: '',
    name: '',
    productType: 'CHEESE',
    targetUnit: 'pièce 200g',
    milkLitersPerUnit: 2.0,
    ingredientsList: '',
    shelfLifeDays: 30,
    processInstructions: '',
    emoji: '🧀',
    standardSellingPriceFcfa: 2000
  };

  // Data Collections
  animals = signal<Animal[]>([]);
  healthRecords = signal<HealthRecord[]>([]);
  vaccineSchedules = signal<VaccineSchedule[]>([]);
  dashboardStats = signal<DashboardStats | null>(null);

  // Sprint 2: Data Collections
  reproductionEvents = signal<ReproductionEvent[]>([]);
  reproductionAlerts = signal<ReproductionAlert[]>([]);
  tankStatus = signal<TankStatus | null>(null);
  milkHistory = signal<MilkHistory[]>([]);
  reproFilter = signal<string>('all');
  reproCurrentPage = signal<number>(1);
  reproPageSize = signal<number>(5);

  // Sprint 3: Data Collections & Pagination
  recipes = signal<Recipe[]>([]);
  transformationBatches = signal<TransformationBatch[]>([]);
  productStocks = signal<ProductStock[]>([]);
  transformationSummary = signal<TransformationSummary | null>(null);

  batchesCurrentPage = signal<number>(1);
  batchesPageSize = signal<number>(5);

  recipesCurrentPage = signal<number>(1);
  recipesPageSize = signal<number>(6);

  stocksCurrentPage = signal<number>(1);
  stocksPageSize = signal<number>(5);

  // Charts
  private milkChartInstance: Chart | null = null;
  private donutChartInstance: Chart | null = null;
  private monthlyChartInstance: Chart | null = null;
  private financeChartInstance: Chart | null = null;
  private perfChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.updateReproCalculations();
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

    // 5. Sprint 2: Reproduction Data & Alerts
    this.loadReproductionData();

    // 6. Sprint 2: Tank Status & Milk History
    this.loadMilkData();

    // 7. Sprint 3: Transformation, Recipes & Stocks
    this.loadTransformationData();
  }

  loadReproductionData(): void {
    this.apiService.getAllReproEvents().subscribe(events => {
      if (events && events.length > 0) {
        this.reproductionEvents.set(events);
      } else {
        this.loadFallbackRepro();
      }
    });

    this.apiService.getReproAlerts().subscribe(alerts => {
      if (alerts && alerts.length > 0) {
        this.reproductionAlerts.set(alerts);
      } else {
        this.loadFallbackReproAlerts();
      }
    });
  }

  loadMilkData(): void {
    this.apiService.getTankStatus().subscribe(status => {
      if (status) {
        this.tankStatus.set(status);
      } else {
        this.tankStatus.set({
          tankName: 'Cuve Réfrigérée N°1 (Bio)',
          currentVolume: 124.0,
          maxCapacity: 500.0,
          fillPercentage: 24.8,
          temperature: 3.9,
          phLevel: 6.68,
          qualityStatus: 'CONFORME BIO & PASTEURISATION',
          targetBatch: 'LOT-TR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01',
          morningVolume: 68.0,
          eveningVolume: 56.0,
          collectionDate: new Date().toISOString().slice(0, 10)
        });
      }
    });

    this.apiService.getMilkHistory(7).subscribe(hist => {
      if (hist && hist.length > 0) {
        this.milkHistory.set(hist);
      }
    });
  }

  loadFallbackRepro(): void {
    const today = new Date();
    const dStr = (offsetDays: number) => {
      const d = new Date(today.getTime() + offsetDays * 86400000);
      return d.toISOString().slice(0, 10);
    };

    const fallback: ReproductionEvent[] = [
      {
        id: 1,
        animalInternalId: 'FL-005',
        animalName: 'FATOU',
        eventType: 'HEAT_DETECTION',
        eventTypeLabel: 'Détection de Chaleurs',
        eventDate: dStr(-3),
        operatorName: 'Bouvier Responsable',
        observations: 'Chaleurs franches, glaires transparentes.',
        isConfirmed: true
      },
      {
        id: 2,
        animalInternalId: 'FL-005',
        animalName: 'FATOU',
        eventType: 'ARTIFICIAL_INSEMINATION',
        eventTypeLabel: 'Insémination Artificielle (IA)',
        eventDate: dStr(-1),
        bullOrSemenUsed: 'KADER (FL-010) — Semence A+',
        operatorName: 'Dr. Fall (Vétérinaire Ferme)',
        expectedDryOffDate: dStr(221),
        expectedCalvingDate: dStr(281),
        observations: 'IA réalisée 14h après détection. Dépôt corps utérin.',
        isConfirmed: true
      },
      {
        id: 3,
        animalInternalId: 'FL-004',
        animalName: 'COUMBA',
        eventType: 'PREGNANCY_DIAGNOSIS',
        eventTypeLabel: 'Diagnostic Gestation (Échographie)',
        eventDate: dStr(-30),
        bullOrSemenUsed: 'BRAHMA (IND-7712)',
        operatorName: 'Dr. Fall',
        expectedDryOffDate: dStr(55),
        expectedCalvingDate: dStr(115),
        observations: 'Gestation 4 mois confirmée. Fœtus bien développé.',
        isConfirmed: true
      },
      {
        id: 4,
        animalInternalId: 'FL-007',
        animalName: 'ROKHAYA',
        eventType: 'PREGNANCY_DIAGNOSIS',
        eventTypeLabel: 'Diagnostic Gestation (Échographie)',
        eventDate: dStr(-240),
        bullOrSemenUsed: 'SULTAN (USA-42891)',
        operatorName: 'Dr. Fall',
        expectedDryOffDate: dStr(-48),
        expectedCalvingDate: dStr(12),
        observations: 'Vêlage imminent (J-12). Box de vêlage préparé.',
        isConfirmed: true
      },
      {
        id: 5,
        animalInternalId: 'FL-002',
        animalName: 'MARIAMA',
        eventType: 'DRY_OFF',
        eventTypeLabel: 'Mise au Tarissement',
        eventDate: dStr(7),
        bullOrSemenUsed: 'VALENTIN (FR-88910)',
        operatorName: 'Dr. Fall',
        expectedDryOffDate: dStr(7),
        expectedCalvingDate: dStr(67),
        observations: 'Tarissement prévu dans 7 jours. Injection intramammaire.',
        isConfirmed: true
      }
    ];
    this.reproductionEvents.set(fallback);
  }

  loadFallbackReproAlerts(): void {
    const today = new Date();
    const dStr = (offsetDays: number) => {
      const d = new Date(today.getTime() + offsetDays * 86400000);
      return d.toISOString().slice(0, 10);
    };

    const alerts: ReproductionAlert[] = [
      {
        alertType: 'CALVING_IMMINENT',
        animalInternalId: 'FL-007',
        animalName: 'ROKHAYA',
        targetDate: dStr(12),
        daysRemaining: 12,
        message: 'Vêlage prévu pour ROKHAYA (FL-007) dans 12 jours (' + dStr(12) + ')',
        severity: 'WARNING'
      },
      {
        alertType: 'DRY_OFF_DUE',
        animalInternalId: 'FL-002',
        animalName: 'MARIAMA',
        targetDate: dStr(7),
        daysRemaining: 7,
        message: 'Tarissement à programmer pour MARIAMA (FL-002) - J-7 avant repos',
        severity: 'WARNING'
      },
      {
        alertType: 'HEAT_ACTIVE',
        animalInternalId: 'FL-005',
        animalName: 'FATOU',
        targetDate: dStr(0),
        daysRemaining: 0,
        message: 'Chaleurs actives pour FATOU (FL-005) — IA recommandée aujourd\'hui',
        severity: 'DANGER'
      }
    ];
    this.reproductionAlerts.set(alerts);
  }

  // ==========================================
  // SPRINT 3: TRANSFORMATION METHODS & LOADERS
  // ==========================================
  loadTransformationData(): void {
    // 1. Recipes
    this.apiService.getAllRecipes().subscribe(recs => {
      if (recs && recs.length > 0) {
        this.recipes.set(recs);
      } else {
        this.loadFallbackRecipes();
      }
    });

    // 2. Batches
    this.apiService.getAllBatches().subscribe(b => {
      if (b && b.length > 0) {
        this.transformationBatches.set(b);
      } else {
        this.loadFallbackBatches();
      }
    });

    // 3. Stocks
    this.apiService.getAllStocks().subscribe(s => {
      if (s && s.length > 0) {
        this.productStocks.set(s);
      } else {
        this.loadFallbackStocks();
      }
    });

    // 4. Summary
    this.apiService.getTransformationSummary().subscribe(sum => {
      if (sum) {
        this.transformationSummary.set(sum);
      } else {
        this.updateLocalTransformationSummary();
      }
    });
  }

  loadFallbackRecipes(): void {
    const recs: Recipe[] = [
      {
        id: 1,
        code: 'REC-CHEESE-01',
        name: 'Fromage Fermier Frais Bio (200g)',
        productType: 'CHEESE',
        targetUnit: 'pièce 200g',
        milkLitersPerUnit: 2.0,
        ingredientsList: 'Lait entier bio pasteurisé, ferments mésophiles, présure liquide naturelle, sel de Saloum non raffiné',
        shelfLifeDays: 45,
        processInstructions: 'Pasteurisation douce 65°C 30min, refroidissement 36°C, ensemencement ferments 30min, emprésurage 45min, découpe caillé en dés 1cm, égouttage en faisselle 18h, salage manuel.',
        emoji: '🧀',
        standardSellingPriceFcfa: 2000
      },
      {
        id: 2,
        code: 'REC-YOG-01',
        name: 'Yaourt Brassé Bio Nature (Pot 125g)',
        productType: 'YOGURT',
        targetUnit: 'pot 125g',
        milkLitersPerUnit: 0.15,
        ingredientsList: 'Lait entier bio, ferments lactiques vivants (Lactobacillus bulgaricus & Streptococcus thermophilus)',
        shelfLifeDays: 21,
        processInstructions: 'Chauffage 85°C 5min, refroidissement 43°C, ensemencement ferments vivants, étuvage 6h à 42°C, brassage délicat et mise en pots.',
        emoji: '🥣',
        standardSellingPriceFcfa: 600
      },
      {
        id: 3,
        code: 'REC-SOW-01',
        name: 'Lait Caillé Bio Artisanal (Sow - Bouteille 1L)',
        productType: 'CURDLED_MILK',
        targetUnit: 'bouteille 1L',
        milkLitersPerUnit: 1.0,
        ingredientsList: 'Lait entier bio pasteurisé, ferments traditionnels de terroir, sucre de canne bio (option)',
        shelfLifeDays: 14,
        processInstructions: 'Pasteurisation 72°C 15s, maturation lente à 30°C pendant 12h jusqu\'à pH 4.2, battage traditionnel et embouteillage stérile.',
        emoji: '🥛',
        standardSellingPriceFcfa: 1200
      },
      {
        id: 4,
        code: 'REC-BUTTER-01',
        name: 'Beurre Fermier Bio Demi-Sel (Plaquette 250g)',
        productType: 'BUTTER',
        targetUnit: 'plaquette 250g',
        milkLitersPerUnit: 5.0,
        ingredientsList: 'Crème fraîche maturée bio, sel fin de Saloum (2%)',
        shelfLifeDays: 60,
        processInstructions: 'Écrémage du lait du matin, pasteurisation crème, maturation biologique 18h à 14°C, barattage mécanique, lavage eau glacée, malaxage et moulage.',
        emoji: '🧈',
        standardSellingPriceFcfa: 2500
      },
      {
        id: 5,
        code: 'REC-MILK-01',
        name: 'Lait Frais Entier Pasteurisé Bio (1L)',
        productType: 'PASTEURIZED_MILK',
        targetUnit: 'bouteille 1L',
        milkLitersPerUnit: 1.0,
        ingredientsList: '100% Lait entier de vaches nourries à l\'herbe bio',
        shelfLifeDays: 7,
        processInstructions: 'Homogénéisation légère, pasteurisation flash 75°C 20s, refroidissement immédiat à 3°C et conditionnement sous flux laminaire.',
        emoji: '🍶',
        standardSellingPriceFcfa: 1000
      }
    ];
    this.recipes.set(recs);
  }

  loadFallbackBatches(): void {
    const today = new Date();
    const dStr = (offsetDays: number) => {
      const d = new Date(today.getTime() + offsetDays * 86400000);
      return d.toISOString().slice(0, 10);
    };

    const batches: TransformationBatch[] = [
      {
        id: 1,
        batchNumber: 'LOT-TR-' + dStr(-2).replace(/-/g, '') + '-01',
        recipeId: 1,
        recipeName: 'Fromage Fermier Frais Bio (200g)',
        recipeCode: 'REC-CHEESE-01',
        productType: 'CHEESE',
        emoji: '🧀',
        status: 'COMPLETED',
        productionDate: dStr(-2),
        milkLitersConsumed: 40.0,
        expectedQuantity: 20.0,
        actualQuantityProduced: 19.5,
        unit: 'pièces',
        yieldEfficiencyPercentage: 97.5,
        wasteLossQuantity: 0.5,
        dlcExpiryDate: dStr(43),
        operatorName: 'Mamadou Diallo (Maître Fromager)',
        qualityNotes: 'Excellente tenue de pâte, texture crémeuse, goût franc et doux.',
        phLevel: 5.1,
        fatPercentage: 4.2,
        sourceTank: 'Cuve Réfrigérée N°1 (Bio)'
      },
      {
        id: 2,
        batchNumber: 'LOT-TR-' + dStr(-1).replace(/-/g, '') + '-01',
        recipeId: 3,
        recipeName: 'Lait Caillé Bio Artisanal (Sow 1L)',
        recipeCode: 'REC-SOW-01',
        productType: 'CURDLED_MILK',
        emoji: '🥛',
        status: 'COMPLETED',
        productionDate: dStr(-1),
        milkLitersConsumed: 50.0,
        expectedQuantity: 50.0,
        actualQuantityProduced: 50.0,
        unit: 'bouteilles 1L',
        yieldEfficiencyPercentage: 100.0,
        wasteLossQuantity: 0.0,
        dlcExpiryDate: dStr(13),
        operatorName: 'Awa Seck (Responsable Laiterie)',
        qualityNotes: 'Onctuosité parfaite, acidité maîtrisée pH 4.2.',
        phLevel: 4.2,
        fatPercentage: 4.1,
        sourceTank: 'Cuve Réfrigérée N°1 (Bio)'
      },
      {
        id: 3,
        batchNumber: 'LOT-TR-' + dStr(0).replace(/-/g, '') + '-01',
        recipeId: 2,
        recipeName: 'Yaourt Brassé Bio Nature (Pot 125g)',
        recipeCode: 'REC-YOG-01',
        productType: 'YOGURT',
        emoji: '🥣',
        status: 'COMPLETED',
        productionDate: dStr(0),
        milkLitersConsumed: 30.0,
        expectedQuantity: 200.0,
        actualQuantityProduced: 198.0,
        unit: 'pots 125g',
        yieldEfficiencyPercentage: 99.0,
        wasteLossQuantity: 2.0,
        dlcExpiryDate: dStr(21),
        operatorName: 'Awa Seck',
        qualityNotes: 'Texture soyeuse, arôme naturel lactique pur.',
        phLevel: 4.4,
        fatPercentage: 4.0,
        sourceTank: 'Cuve Réfrigérée N°1 (Bio)'
      },
      {
        id: 4,
        batchNumber: 'LOT-TR-' + dStr(0).replace(/-/g, '') + '-02',
        recipeId: 1,
        recipeName: 'Fromage Fermier Frais Bio (200g)',
        recipeCode: 'REC-CHEESE-01',
        productType: 'CHEESE',
        emoji: '🧀',
        status: 'IN_PROGRESS',
        productionDate: dStr(0),
        milkLitersConsumed: 60.0,
        expectedQuantity: 30.0,
        unit: 'pièces',
        dlcExpiryDate: dStr(45),
        operatorName: 'Mamadou Diallo',
        qualityNotes: 'En cours d\'égouttage en faisselle dans la salle thermo-régulée.',
        phLevel: 5.3,
        fatPercentage: 4.2,
        sourceTank: 'Cuve Réfrigérée N°1 (Bio)'
      }
    ];
    this.transformationBatches.set(batches);
  }

  loadFallbackStocks(): void {
    const today = new Date();
    const dStr = (offsetDays: number) => {
      const d = new Date(today.getTime() + offsetDays * 86400000);
      return d.toISOString().slice(0, 10);
    };

    const stocks: ProductStock[] = [
      {
        id: 1,
        recipeId: 1,
        recipeName: 'Fromage Fermier Frais Bio (200g)',
        productType: 'CHEESE',
        emoji: '🧀',
        batchId: 1,
        batchNumber: 'LOT-TR-' + dStr(-2).replace(/-/g, '') + '-01',
        productName: 'Fromage Fermier Frais Bio (200g)',
        quantityAvailable: 18.0,
        unit: 'pièces',
        unitPriceFcfa: 2000,
        totalValueFcfa: 36000,
        mfgDate: dStr(-2),
        dlcExpiryDate: dStr(43),
        storageLocation: 'Chambre Froide Fromagerie (+4°C)',
        isOrganicCertified: true,
        daysRemainingDlc: 43
      },
      {
        id: 2,
        recipeId: 3,
        recipeName: 'Lait Caillé Bio Artisanal (Sow 1L)',
        productType: 'CURDLED_MILK',
        emoji: '🥛',
        batchId: 2,
        batchNumber: 'LOT-TR-' + dStr(-1).replace(/-/g, '') + '-01',
        productName: 'Lait Caillé Bio Artisanal (Sow 1L)',
        quantityAvailable: 42.0,
        unit: 'bouteilles 1L',
        unitPriceFcfa: 1200,
        totalValueFcfa: 50400,
        mfgDate: dStr(-1),
        dlcExpiryDate: dStr(13),
        storageLocation: 'Chambre Froide Produits Frais (+4°C)',
        isOrganicCertified: true,
        daysRemainingDlc: 13
      },
      {
        id: 3,
        recipeId: 2,
        recipeName: 'Yaourt Brassé Bio Nature (Pot 125g)',
        productType: 'YOGURT',
        emoji: '🥣',
        batchId: 3,
        batchNumber: 'LOT-TR-' + dStr(0).replace(/-/g, '') + '-01',
        productName: 'Yaourt Brassé Bio Nature (Pot 125g)',
        quantityAvailable: 195.0,
        unit: 'pots 125g',
        unitPriceFcfa: 600,
        totalValueFcfa: 117000,
        mfgDate: dStr(0),
        dlcExpiryDate: dStr(21),
        storageLocation: 'Chambre Froide Produits Frais (+4°C)',
        isOrganicCertified: true,
        daysRemainingDlc: 21
      }
    ];
    this.productStocks.set(stocks);
    this.updateLocalTransformationSummary();
  }

  updateLocalTransformationSummary(): void {
    const batches = this.transformationBatches();
    const completed = batches.filter(b => b.status === 'COMPLETED');
    const totalMilk = completed.reduce((acc, b) => acc + (b.milkLitersConsumed || 0), 0);
    const avgYield = completed.length > 0
      ? completed.reduce((acc, b) => acc + (b.yieldEfficiencyPercentage || 100), 0) / completed.length
      : 98.8;
    const activeCount = batches.filter(b => b.status === 'IN_PROGRESS' || b.status === 'PLANNED').length;
    const stocks = this.productStocks();
    const totalStockVal = stocks.reduce((acc, s) => acc + (s.totalValueFcfa || 0), 0);
    const dlcAlerts = stocks.filter(s => s.daysRemainingDlc !== undefined && s.daysRemainingDlc <= 5).length;

    this.transformationSummary.set({
      totalMilkTransformedLiters: Math.round(totalMilk * 10) / 10,
      averageYieldEfficiency: Math.round(avgYield * 10) / 10,
      activeBatchesCount: activeCount,
      totalBatchesCount: batches.length,
      totalStockValueFcfa: totalStockVal,
      productsInStockCount: stocks.length,
      dlcAlertsCount: dlcAlerts
    });
  }

  // --- Transformation UI Controls & Filtering & Pagination ---
  filterTransformation(filter: string): void {
    this.transformationFilter.set(filter);
    this.batchesCurrentPage.set(1);
  }

  filterStock(cat: string): void {
    this.stockCategoryFilter.set(cat);
    this.stocksCurrentPage.set(1);
  }

  toggleTransformationMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isTransformationMenuOpen.update(v => !v);
  }

  navigateToTransformationSubTab(subTab: string): void {
    this.isTransformationMenuOpen.set(true);
    this.activeTransformationSubTab.set(subTab);
    this.showPage('transformation');
  }

  switchTransformationSubTab(subTab: string): void {
    this.activeTransformationSubTab.set(subTab);
  }

  get filteredBatches(): TransformationBatch[] {
    const f = this.transformationFilter();
    return this.transformationBatches().filter(b => {
      if (f === 'in_progress') return b.status === 'IN_PROGRESS' || b.status === 'PLANNED';
      if (f === 'completed') return b.status === 'COMPLETED';
      return true;
    });
  }

  // --- Pagination: Lots de fabrication ---
  get paginatedBatches(): TransformationBatch[] {
    const start = (this.batchesCurrentPage() - 1) * this.batchesPageSize();
    return this.filteredBatches.slice(start, start + this.batchesPageSize());
  }

  get totalBatchesPages(): number {
    return Math.ceil(this.filteredBatches.length / this.batchesPageSize()) || 1;
  }

  get batchesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalBatchesPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setBatchesPage(page: number): void {
    if (page >= 1 && page <= this.totalBatchesPages) {
      this.batchesCurrentPage.set(page);
    }
  }

  nextBatchesPage(): void {
    if (this.batchesCurrentPage() < this.totalBatchesPages) {
      this.batchesCurrentPage.update(p => p + 1);
    }
  }

  prevBatchesPage(): void {
    if (this.batchesCurrentPage() > 1) {
      this.batchesCurrentPage.update(p => p - 1);
    }
  }

  // --- Pagination: Fiches Recettes ---
  get paginatedRecipes(): Recipe[] {
    const start = (this.recipesCurrentPage() - 1) * this.recipesPageSize();
    return this.recipes().slice(start, start + this.recipesPageSize());
  }

  get totalRecipesPages(): number {
    return Math.ceil(this.recipes().length / this.recipesPageSize()) || 1;
  }

  get recipesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalRecipesPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setRecipesPage(page: number): void {
    if (page >= 1 && page <= this.totalRecipesPages) {
      this.recipesCurrentPage.set(page);
    }
  }

  nextRecipesPage(): void {
    if (this.recipesCurrentPage() < this.totalRecipesPages) {
      this.recipesCurrentPage.update(p => p + 1);
    }
  }

  prevRecipesPage(): void {
    if (this.recipesCurrentPage() > 1) {
      this.recipesCurrentPage.update(p => p - 1);
    }
  }

  // --- Pagination: Stocks de Produits Finis ---
  get filteredStocks(): ProductStock[] {
    const cat = this.stockCategoryFilter();
    return this.productStocks().filter(s => {
      if (cat === 'all') return true;
      return s.productType === cat;
    });
  }

  get paginatedStocks(): ProductStock[] {
    const start = (this.stocksCurrentPage() - 1) * this.stocksPageSize();
    return this.filteredStocks.slice(start, start + this.stocksPageSize());
  }

  get totalStocksPages(): number {
    return Math.ceil(this.filteredStocks.length / this.stocksPageSize()) || 1;
  }

  get stocksPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalStocksPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setStocksPage(page: number): void {
    if (page >= 1 && page <= this.totalStocksPages) {
      this.stocksCurrentPage.set(page);
    }
  }

  nextStocksPage(): void {
    if (this.stocksCurrentPage() < this.totalStocksPages) {
      this.stocksCurrentPage.update(p => p + 1);
    }
  }

  prevStocksPage(): void {
    if (this.stocksCurrentPage() > 1) {
      this.stocksCurrentPage.update(p => p - 1);
    }
  }

  getEmojiForProductType(type?: ProductType): string {
    switch (type) {
      case 'CHEESE': return '🧀';
      case 'YOGURT': return '🥣';
      case 'CURDLED_MILK': return '🥛';
      case 'BUTTER': return '🧈';
      case 'CREAM': return '🍶';
      case 'PASTEURIZED_MILK': return '🥛';
      default: return '🥛';
    }
  }

  getCalculatedExpectedYield(recipeId: number, milkLiters: number): number {
    if (this.newBatchForm.isCustomProduct) {
      const ratio = this.newBatchForm.customMilkRatio > 0 ? this.newBatchForm.customMilkRatio : 1.0;
      return Math.round((milkLiters / ratio) * 10) / 10;
    }
    const recipe = this.recipes().find(r => r.id === Number(recipeId));
    if (!recipe || !recipe.milkLitersPerUnit || recipe.milkLitersPerUnit <= 0) {
      return milkLiters;
    }
    return Math.round((milkLiters / recipe.milkLitersPerUnit) * 10) / 10;
  }

  // --- Modals & Actions for Transformation ---
  openNewBatchModal(preselectedRecipeId?: number): void {
    this.newBatchForm.isCustomProduct = false;
    this.newBatchForm.customProductName = '';
    this.newBatchForm.customMilkRatio = 2.0;
    this.newBatchForm.customTargetUnit = 'pièce 200g';
    if (preselectedRecipeId) {
      this.newBatchForm.recipeId = preselectedRecipeId;
    } else if (this.recipes().length > 0 && !this.newBatchForm.recipeId) {
      this.newBatchForm.recipeId = this.recipes()[0].id || 1;
    }
    this.isNewBatchModalOpen.set(true);
  }

  closeNewBatchModal(): void {
    this.isNewBatchModalOpen.set(false);
  }

  submitNewBatch(): void {
    const isCustom = this.newBatchForm.isCustomProduct;
    let rec: Recipe | undefined;

    if (isCustom) {
      if (!this.newBatchForm.customProductName || !this.newBatchForm.customProductName.trim()) {
        this.showToast('Erreur: Veuillez saisir le nom du produit dérivé.');
        return;
      }
      if (!this.newBatchForm.customMilkRatio || this.newBatchForm.customMilkRatio <= 0) {
        this.showToast('Erreur: Veuillez indiquer un ratio de lait par unité valide (> 0).');
        return;
      }

      const customRec: Recipe = {
        code: 'REC-CUST-' + Date.now().toString().slice(-4),
        name: this.newBatchForm.customProductName.trim(),
        productType: this.newBatchForm.customProductType || 'CHEESE',
        targetUnit: this.newBatchForm.customTargetUnit || 'unité',
        milkLitersPerUnit: this.newBatchForm.customMilkRatio,
        ingredientsList: 'Lait entier bio fermier, ingrédients naturels',
        shelfLifeDays: 30,
        processInstructions: 'Transformation artisanale sur-mesure.',
        emoji: this.getEmojiForProductType(this.newBatchForm.customProductType),
        standardSellingPriceFcfa: 2000
      };

      if (this.newBatchForm.saveAsNewRecipe) {
        this.apiService.createRecipe(customRec).subscribe({
          next: (savedRec) => {
            this.recipes.update(list => [...list, savedRec]);
            this.proceedLaunchBatchWithRecipe(savedRec);
          },
          error: () => {
            customRec.id = Date.now();
            this.recipes.update(list => [...list, customRec]);
            this.proceedLaunchBatchWithRecipe(customRec);
          }
        });
        return;
      } else {
        customRec.id = Date.now();
        this.proceedLaunchBatchWithRecipe(customRec);
        return;
      }
    } else {
      rec = this.recipes().find(r => r.id === Number(this.newBatchForm.recipeId));
      if (!rec) {
        this.showToast('Erreur: Veuillez sélectionner une recette valide.');
        return;
      }
      this.proceedLaunchBatchWithRecipe(rec);
    }
  }

  private proceedLaunchBatchWithRecipe(rec: Recipe): void {
    const expected = this.getCalculatedExpectedYield(rec.id || 1, this.newBatchForm.milkLitersConsumed);
    const dateStr = this.newBatchForm.productionDate;
    const batchNum = 'LOT-TR-' + dateStr.replace(/-/g, '') + '-' + String(this.transformationBatches().length + 1).padStart(2, '0');

    const newBatch: TransformationBatch = {
      batchNumber: batchNum,
      recipeId: rec.id || 1,
      recipeName: rec.name,
      recipeCode: rec.code,
      productType: rec.productType,
      emoji: rec.emoji || '🥛',
      status: 'IN_PROGRESS',
      productionDate: dateStr,
      milkLitersConsumed: this.newBatchForm.milkLitersConsumed,
      expectedQuantity: expected,
      unit: rec.targetUnit,
      operatorName: this.newBatchForm.operatorName,
      qualityNotes: this.newBatchForm.qualityNotes || 'Fabrication lancée.',
      phLevel: this.newBatchForm.phLevel,
      fatPercentage: this.newBatchForm.fatPercentage,
      sourceTank: this.newBatchForm.sourceTank
    };

    this.apiService.launchBatch(newBatch).subscribe({
      next: (created) => {
        this.transformationBatches.update(list => [created, ...list]);
        this.updateLocalTransformationSummary();
        this.showToast(`✅ Lot ${created.batchNumber} lancé avec succès (${created.milkLitersConsumed}L prélevés) !`);
        this.closeNewBatchModal();
      },
      error: () => {
        newBatch.id = Date.now();
        this.transformationBatches.update(list => [newBatch, ...list]);
        this.updateLocalTransformationSummary();
        this.showToast(`✅ Lot ${newBatch.batchNumber} lancé (${newBatch.milkLitersConsumed}L prélevés) !`);
        this.closeNewBatchModal();
      }
    });
  }

  openCompleteBatchModal(batch: TransformationBatch): void {
    this.selectedBatchForCompletion.set(batch);
    this.completeBatchForm.actualQuantityProduced = batch.expectedQuantity || 0;
    this.completeBatchForm.wasteLossQuantity = 0;
    this.completeBatchForm.phLevel = batch.phLevel || 4.8;
    this.completeBatchForm.qualityNotes = batch.qualityNotes || 'Contrôle visuel et gustatif conforme bio.';
    this.isCompleteBatchModalOpen.set(true);
  }

  closeCompleteBatchModal(): void {
    this.isCompleteBatchModalOpen.set(false);
    this.selectedBatchForCompletion.set(null);
  }

  submitCompleteBatch(): void {
    const batch = this.selectedBatchForCompletion();
    if (!batch || !batch.id) return;

    const actualQty = Number(this.completeBatchForm.actualQuantityProduced);
    const waste = Number(this.completeBatchForm.wasteLossQuantity) || 0;
    const efficiency = batch.expectedQuantity > 0 
      ? Math.round((actualQty / batch.expectedQuantity) * 1000) / 10 
      : 100;

    const rec = this.recipes().find(r => r.id === batch.recipeId);
    const unitPrice = (rec && rec.standardSellingPriceFcfa) ? rec.standardSellingPriceFcfa : 1500;

    this.apiService.completeBatch(batch.id, {
      actualQuantityProduced: actualQty,
      wasteLossQuantity: waste,
      qualityNotes: this.completeBatchForm.qualityNotes,
      phLevel: this.completeBatchForm.phLevel
    }).subscribe({
      next: (completed) => {
        this.transformationBatches.update(list => list.map(b => b.id === completed.id ? completed : b));
        this.loadTransformationData();
        this.showToast(`🎉 Lot ${completed.batchNumber} finalisé ! Rendement: ${completed.yieldEfficiencyPercentage}%`);
        this.closeCompleteBatchModal();
      },
      error: () => {
        // Fallback local update
        const updated: TransformationBatch = {
          ...batch,
          status: 'COMPLETED',
          actualQuantityProduced: actualQty,
          wasteLossQuantity: waste,
          yieldEfficiencyPercentage: efficiency,
          phLevel: this.completeBatchForm.phLevel,
          qualityNotes: this.completeBatchForm.qualityNotes
        };

        this.transformationBatches.update(list => list.map(b => b.id === batch.id ? updated : b));

        // Create stock entry locally
        const newStock: ProductStock = {
          id: Date.now(),
          recipeId: batch.recipeId,
          recipeName: batch.recipeName,
          productType: batch.productType,
          emoji: batch.emoji,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          productName: batch.recipeName || 'Produit Transformé',
          quantityAvailable: actualQty,
          unit: batch.unit,
          unitPriceFcfa: unitPrice,
          totalValueFcfa: actualQty * unitPrice,
          mfgDate: batch.productionDate,
          dlcExpiryDate: batch.dlcExpiryDate,
          storageLocation: 'Chambre Froide Fromagerie (+4°C)',
          isOrganicCertified: true,
          daysRemainingDlc: 30
        };

        this.productStocks.update(stocks => [newStock, ...stocks]);
        this.updateLocalTransformationSummary();
        this.showToast(`🎉 Lot ${batch.batchNumber} finalisé ! Rendement: ${efficiency}% (${actualQty} ${batch.unit} ajoutés au stock)`);
        this.closeCompleteBatchModal();
      }
    });
  }

  openRecipeModal(recipe?: Recipe): void {
    if (recipe) {
      this.selectedRecipe.set(recipe);
      this.recipeForm = { ...recipe };
    } else {
      this.selectedRecipe.set(null);
      this.recipeForm = {
        code: 'REC-' + String(this.recipes().length + 1).padStart(2, '0'),
        name: '',
        productType: 'CHEESE',
        targetUnit: 'pièce 200g',
        milkLitersPerUnit: 2.0,
        ingredientsList: '',
        shelfLifeDays: 30,
        processInstructions: '',
        emoji: '🧀',
        standardSellingPriceFcfa: 2000
      };
    }
    this.isRecipeModalOpen.set(true);
  }

  closeRecipeModal(): void {
    this.isRecipeModalOpen.set(false);
    this.selectedRecipe.set(null);
  }

  submitRecipe(): void {
    if (!this.recipeForm.name || !this.recipeForm.targetUnit) {
      this.showToast('Veuillez remplir les champs obligatoires de la recette.');
      return;
    }

    const sel = this.selectedRecipe();
    if (sel && sel.id) {
      this.apiService.updateRecipe(sel.id, this.recipeForm).subscribe({
        next: (updated) => {
          this.recipes.update(list => list.map(r => r.id === updated.id ? updated : r));
          this.showToast(`✅ Recette "${updated.name}" mise à jour avec succès !`);
          this.closeRecipeModal();
        },
        error: () => {
          this.recipes.update(list => list.map(r => r.id === sel.id ? { ...this.recipeForm, id: sel.id } : r));
          this.showToast(`✅ Recette "${this.recipeForm.name}" mise à jour !`);
          this.closeRecipeModal();
        }
      });
    } else {
      this.apiService.createRecipe(this.recipeForm).subscribe({
        next: (created) => {
          this.recipes.update(list => [...list, created]);
          this.showToast(`✅ Nouvelle recette "${created.name}" créée !`);
          this.closeRecipeModal();
        },
        error: () => {
          const created = { ...this.recipeForm, id: Date.now() };
          this.recipes.update(list => [...list, created]);
          this.showToast(`✅ Nouvelle recette "${this.recipeForm.name}" créée !`);
          this.closeRecipeModal();
        }
      });
    }
  }

  deleteBatch(id?: number): void {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) return;

    this.apiService.deleteBatch(id).subscribe({
      next: () => {
        this.transformationBatches.update(list => list.filter(b => b.id !== id));
        this.updateLocalTransformationSummary();
        this.showToast('Lot de transformation supprimé.');
      },
      error: () => {
        this.transformationBatches.update(list => list.filter(b => b.id !== id));
        this.updateLocalTransformationSummary();
        this.showToast('Lot de transformation supprimé.');
      }
    });
  }

  deleteRecipe(id?: number): void {
    if (!id) return;
    if (!confirm('Supprimer cette fiche recette standard ?')) return;

    this.apiService.deleteRecipe(id).subscribe({
      next: () => {
        this.recipes.update(list => list.filter(r => r.id !== id));
        this.showToast('Recette supprimée.');
      },
      error: () => {
        this.recipes.update(list => list.filter(r => r.id !== id));
        this.showToast('Recette supprimée.');
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
    } else if (pageId === 'transformation') {
      this.loadTransformationData();
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

  // Sprint 2: Reproduction Helpers & Handlers
  get femaleCows(): Animal[] {
    return this.animals().filter(a => a.category === 'MILKING_COW' || a.category === 'HEIFER_YOUNG');
  }

  get bullsList(): Animal[] {
    return this.animals().filter(a => a.category === 'MALE_BULL');
  }

  get pregnantCows(): Animal[] {
    return this.animals().filter(a => a.status === 'PREGNANT' || (a.reproStatus && a.reproStatus.includes('Gestan')));
  }

  get filteredReproEvents(): ReproductionEvent[] {
    const filter = this.reproFilter();
    if (filter === 'all') return this.reproductionEvents();
    return this.reproductionEvents().filter(e => {
      if (filter === 'ia') return e.eventType === 'ARTIFICIAL_INSEMINATION' || e.eventType === 'NATURAL_MATING';
      if (filter === 'gestation') return e.eventType === 'PREGNANCY_DIAGNOSIS';
      if (filter === 'velage') return e.eventType === 'CALVING';
      if (filter === 'tarissement') return e.eventType === 'DRY_OFF';
      if (filter === 'chaleur') return e.eventType === 'HEAT_DETECTION';
      return true;
    });
  }

  get paginatedReproEvents(): ReproductionEvent[] {
    const start = (this.reproCurrentPage() - 1) * this.reproPageSize();
    return this.filteredReproEvents.slice(start, start + this.reproPageSize());
  }

  get totalReproPages(): number {
    return Math.ceil(this.filteredReproEvents.length / this.reproPageSize()) || 1;
  }

  get reproPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalReproPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setReproPage(page: number): void {
    if (page >= 1 && page <= this.totalReproPages) {
      this.reproCurrentPage.set(page);
    }
  }

  nextReproPage(): void {
    if (this.reproCurrentPage() < this.totalReproPages) {
      this.reproCurrentPage.update(p => p + 1);
    }
  }

  prevReproPage(): void {
    if (this.reproCurrentPage() > 1) {
      this.reproCurrentPage.update(p => p - 1);
    }
  }

  filterRepro(filterType: string): void {
    this.reproFilter.set(filterType);
    this.reproCurrentPage.set(1);
  }

  openReproModal(animalId?: string): void {
    if (animalId) {
      this.reproForm.animalInternalId = animalId;
    }
    this.updateReproCalculations();
    this.isReproModalOpen.set(true);
  }

  handleAlertAction(alert: ReproductionAlert): void {
    this.reproForm.animalInternalId = alert.animalInternalId;
    if (alert.alertType === 'CALVING_IMMINENT') {
      this.reproForm.eventType = 'CALVING';
      this.reproForm.observations = 'Vêlage & mise bas contrôlée';
    } else if (alert.alertType === 'DRY_OFF_DUE') {
      this.reproForm.eventType = 'DRY_OFF';
      this.reproForm.observations = 'Mise au repos pré-vêlage';
    } else if (alert.alertType === 'HEAT_ACTIVE') {
      this.reproForm.eventType = 'ARTIFICIAL_INSEMINATION';
      this.reproForm.observations = 'Insémination sur chaleurs observées';
    }
    this.reproForm.eventDate = new Date().toISOString().slice(0, 10);
    this.updateReproCalculations();
    this.isReproModalOpen.set(true);
  }

  updateReproCalculations(): void {
    if (!this.reproForm.eventDate) {
      this.reproForm.eventDate = new Date().toISOString().slice(0, 10);
    }
    const evtDate = new Date(this.reproForm.eventDate);

    if (this.reproForm.eventType === 'ARTIFICIAL_INSEMINATION' || this.reproForm.eventType === 'NATURAL_MATING') {
      // Vêlage prévisionnel = +282 jours (Standard CowMaster)
      const calvingDate = new Date(evtDate.getTime() + 282 * 86400000);
      this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);

      // Tarissement prévisionnel = J-60 avant vêlage (+222j)
      const dryOffDate = new Date(evtDate.getTime() + 222 * 86400000);
      this.reproForm.expectedDryOffDate = dryOffDate.toISOString().slice(0, 10);
    } else if (this.reproForm.eventType === 'DRY_OFF') {
      this.reproForm.expectedDryOffDate = this.reproForm.eventDate;
      const calvingDate = new Date(evtDate.getTime() + 60 * 86400000);
      this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
    } else if (this.reproForm.eventType === 'PREGNANCY_DIAGNOSIS') {
      if (!this.reproForm.expectedCalvingDate) {
        const calvingDate = new Date(evtDate.getTime() + 150 * 86400000);
        this.reproForm.expectedCalvingDate = calvingDate.toISOString().slice(0, 10);
      }
    } else if (this.reproForm.eventType === 'CALVING') {
      this.reproForm.expectedCalvingDate = '';
      this.reproForm.expectedDryOffDate = '';
    }
  }

  submitReproEntry(): void {
    const targetCow = this.animals().find(a => a.internalId === this.reproForm.animalInternalId);
    const cowName = targetCow ? targetCow.name : this.reproForm.animalInternalId;

    const event: ReproductionEvent = {
      animalInternalId: this.reproForm.animalInternalId,
      animalName: cowName,
      eventType: this.reproForm.eventType,
      eventDate: this.reproForm.eventDate,
      bullOrSemenUsed: this.reproForm.bullOrSemenUsed,
      operatorName: this.reproForm.operatorName,
      expectedDryOffDate: this.reproForm.expectedDryOffDate,
      expectedCalvingDate: this.reproForm.expectedCalvingDate,
      observations: this.reproForm.observations,
      isConfirmed: this.reproForm.isConfirmed
    };

    this.apiService.recordReproEvent(event).subscribe({
      next: (created) => {
        this.reproductionEvents.update(list => [created, ...list]);
        this.dismissAlertForCow(event);
        this.showToast(`Événement de reproduction enregistré pour ${cowName} (${event.animalInternalId}) !`);
        this.isReproModalOpen.set(false);
        this.loadInitialData();
      },
      error: () => {
        this.reproductionEvents.update(list => [{ ...event, id: Date.now() }, ...list]);
        this.dismissAlertForCow(event);
        this.showToast(`Événement enregistré en local pour ${cowName} !`);
        this.isReproModalOpen.set(false);
      }
    });
  }

  dismissAlertForCow(event: ReproductionEvent): void {
    this.reproductionAlerts.update(alerts => {
      return alerts.filter(a => {
        if (a.animalInternalId === event.animalInternalId) {
          if (event.eventType === 'CALVING' && a.alertType === 'CALVING_IMMINENT') return false;
          if (event.eventType === 'DRY_OFF' && a.alertType === 'DRY_OFF_DUE') return false;
          if ((event.eventType === 'ARTIFICIAL_INSEMINATION' || event.eventType === 'NATURAL_MATING') && a.alertType === 'HEAT_ACTIVE') return false;
        }
        return true;
      });
    });

    // Also update animal status in local list
    this.animals.update(list => list.map(a => {
      if (a.internalId === event.animalInternalId) {
        if (event.eventType === 'CALVING') {
          return {
            ...a,
            status: 'EXCELLENT',
            category: 'MILKING_COW',
            lactationNumber: (a.lactationNumber || 0) + 1,
            daysInMilk: 0,
            reproStatus: `Vêlage réussi le ${event.eventDate} — Nouvelle lactation (${(a.lactationNumber || 0) + 1}e)`
          };
        } else if (event.eventType === 'DRY_OFF') {
          return {
            ...a,
            reproStatus: 'Tarie — Repos pré-vêlage'
          };
        } else if (event.eventType === 'ARTIFICIAL_INSEMINATION' || event.eventType === 'NATURAL_MATING') {
          return {
            ...a,
            reproStatus: `Inséminée le ${event.eventDate}`
          };
        }
      }
      return a;
    }));
  }

  deleteReproEntry(id?: number): void {
    if (!id) return;
    this.apiService.deleteReproEvent(id).subscribe({
      next: () => {
        this.reproductionEvents.update(list => list.filter(e => e.id !== id));
        this.showToast('Acte de reproduction supprimé.');
      },
      error: () => {
        this.reproductionEvents.update(list => list.filter(e => e.id !== id));
        this.showToast('Acte supprimé en local.');
      }
    });
  }

  quickMilking(cow: Animal, session: 'MORNING' | 'EVENING'): void {
    if (cow.status === 'FEVER_TREATMENT') {
      this.showToast(`⚠️ ATTENTION : Lait de ${cow.name} exclu de la cuve (traitement en cours).`);
      return;
    }

    const volume = session === 'MORNING' 
      ? Math.round(((cow.dailyMilkYield || 18) * 0.58) * 10) / 10 
      : Math.round(((cow.dailyMilkYield || 18) * 0.42) * 10) / 10;

    const prod: MilkProduction = {
      animalInternalId: cow.internalId,
      session: session,
      volumeLiters: volume,
      milkTemperature: 34.2,
      destinationTank: 'Cuve Réfrigérée N°1 (Bio)',
      productionDate: new Date().toISOString().slice(0, 10),
      isOrganicCompliant: true
    };

    this.apiService.recordMilk(prod).subscribe({
      next: () => {
        this.showToast(`Traite ${session === 'MORNING' ? 'Matin' : 'Soir'} : +${volume}L pour ${cow.name} ajoutés à la Cuve Bio !`);
        this.loadMilkData();
      },
      error: () => {
        this.showToast(`Traite : +${volume}L enregistrée pour ${cow.name} !`);
      }
    });
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
