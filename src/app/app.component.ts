import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Animal, Pedigree } from './models/animal.model';
import { HealthRecord, VaccineSchedule } from './models/health.model';
import { DashboardStats, MilkProduction, TankStatus, MilkHistory } from './models/milk.model';
import { ReproductionEvent, ReproductionAlert, ReproEventType } from './models/reproduction.model';
import { Recipe, TransformationBatch, ProductStock, TransformationSummary, ProductType, BatchStatus } from './models/transformation.model';
import { Customer, SaleInvoice, InvoiceItem, PaymentTransaction, CommercialSummary, CustomerType, InvoiceStatus, PaymentMethod } from './models/commercial.model';
import { FeedStock, FeedRation, SolarTelemetry } from './models/feed-solar.model';
import { Supplier } from './models/supplier.model';
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
  public apiService = inject(ApiService);

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

  healthForm = {
    cowId: 'H-1043',
    actType: 'Traitement Pathologie',
    diagnosis: '',
    treatmentPrescription: '',
    practitionerName: 'Dr. Fall',
    cost: 12500,
    milkWithdrawalDays: 0,
    status: 'En cours',
    recordDate: new Date().toISOString().split('T')[0]
  };

  editingHealthRecord: HealthRecord = {
    id: 1,
    animalInternalId: 'H-1043',
    actType: 'Traitement Pathologie',
    costFcfa: 12500,
    diagnosis: '',
    treatmentPrescription: '',
    practitionerName: 'Dr. Fall',
    status: 'En cours',
    milkWithdrawalDays: 0,
    recordDate: new Date().toISOString().split('T')[0]
  };

  orderForm = {
    client: 'Restaurant Teranga Dakar',
    product: 'Lait Frais Bio',
    qty: 25,
    unitPrice: 800,
    total: 20000
  };

  newAnimalForm: Animal = {
    internalId: 'FL-020',
    name: '',
    category: 'MILKING_COW',
    status: 'HEALTHY',
    breed: 'Holstein Pure',
    birthDate: new Date().toISOString().split('T')[0],
    weight: 460,
    imageUrl: ''
  };
  newAnimalFather = '';
  newAnimalFatherEarTag = '';
  newAnimalMother = '';
  newAnimalMotherEarTag = '';

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

  // Sprint 2: Data Collections & Milk Form
  reproductionEvents = signal<ReproductionEvent[]>([]);
  reproductionAlerts = signal<ReproductionAlert[]>([]);
  tankStatus = signal<TankStatus | null>(null);
  milkHistory = signal<MilkHistory[]>([]);
  milkForm = {
    cowId: 'H-1043',
    session: 'Matin',
    litres: 11.5,
    temp: 34.2,
    fatPercentage: 3.9,
    tank: 'Cuve Réfrigérée N°1 (Bio)',
    productionDate: new Date().toISOString().split('T')[0],
    isOrganicCompliant: true
  };
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

  // Sprint 4: Data Collections, Pagination & Modals (Commercial, Invoices, Customers, Payments)
  isCommercialMenuOpen = signal<boolean>(false);
  activeCommercialSubTab = signal<string>('invoices'); // 'invoices' | 'customers' | 'payments'
  commercialSummary = signal<CommercialSummary | null>(null);
  customers = signal<Customer[]>([]);
  invoices = signal<SaleInvoice[]>([]);
  payments = signal<PaymentTransaction[]>([]);

  isNewInvoiceModalOpen = signal<boolean>(false);
  isNewCustomerModalOpen = signal<boolean>(false);
  isPaymentModalOpen = signal<boolean>(false);
  isInvoicePrintModalOpen = signal<boolean>(false);

  selectedInvoiceForDetail = signal<SaleInvoice | null>(null);
  selectedInvoiceForPayment = signal<SaleInvoice | null>(null);
  selectedInvoiceForPrint = signal<SaleInvoice | null>(null);
  selectedCustomerForDetail = signal<Customer | null>(null);

  invoiceFilterStatus = signal<string>('ALL');
  invoicesSearchTerm = signal<string>('');
  customersSearchTerm = signal<string>('');
  customerTypeFilter = signal<string>('ALL');
  paymentsSearchTerm = signal<string>('');

  invoicesCurrentPage = signal<number>(1);
  invoicesPageSize = signal<number>(6);

  customersCurrentPage = signal<number>(1);
  customersPageSize = signal<number>(6);

  paymentsCurrentPage = signal<number>(1);
  paymentsPageSize = signal<number>(8);

  // Commercial Forms
  newInvoiceForm = {
    customerId: 1,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    discountFcfa: 0,
    taxFcfa: 0,
    notes: '',
    paymentMethod: 'WAVE' as PaymentMethod,
    paymentReference: '',
    immediatePayment: false,
    items: [
      {
        productId: 1 as number | undefined,
        productName: 'Fromage Fermier Frais Bio (200g)',
        productType: 'CHEESE' as ProductType | undefined,
        quantity: 10,
        unit: 'pièces 200g',
        unitPriceFcfa: 2000,
        lineTotalFcfa: 20000
      }
    ] as Array<{
      productId?: number;
      productName: string;
      productType?: ProductType;
      quantity: number;
      unit: string;
      unitPriceFcfa: number;
      lineTotalFcfa: number;
    }>
  };

  newCustomerForm: Customer = {
    name: '',
    companyName: '',
    customerType: 'SUPERMARKET',
    phone: '',
    email: '',
    address: '',
    city: 'Dakar',
    nineaNumber: '',
    notes: ''
  };

  paymentForm = {
    amountPaidFcfa: 0,
    paymentMethod: 'WAVE' as PaymentMethod,
    transactionReference: '',
    receivedBy: 'Comptabilité Ferme LAWTAN',
    notes: ''
  };

  // ==========================================
  // SPRINT 5: ALIMENTATION, SOLAIRE & AUDIT
  // ==========================================
  feedStocks = signal<FeedStock[]>([]);
  feedRations = signal<FeedRation[]>([]);
  solarTelemetry = signal<SolarTelemetry | null>(null);

  isFeedMenuOpen = signal<boolean>(false);
  activeFeedSubTab = signal<'stocks' | 'rations' | 'suppliers'>('stocks');
  isFeedStockModalOpen = signal<boolean>(false);
  isFeedRationModalOpen = signal<boolean>(false);
  isAuditReportModalOpen = signal<boolean>(false);
  selectedAuditReportType = signal<string>('BIO_CERTIFICATE');

  // Fournisseurs / Suppliers State
  suppliers = signal<Supplier[]>([]);
  isSupplierModalOpen = signal<boolean>(false);
  isQuickSupplierModalOpen = signal<boolean>(false);
  supplierSearchTerm = signal<string>('');
  supplierCategoryFilter = signal<string>('ALL');
  suppliersCurrentPage = signal<number>(1);
  suppliersItemsPerPage = signal<number>(6);

  supplierForm: Supplier = {
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Thiès',
    category: 'FOURRAGE_ALIMENT',
    paymentTerms: 'Paiement à livraison / Wave',
    bioCertified: true,
    notes: ''
  };

  quickSupplierForm: Supplier = {
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    city: 'Thiès',
    category: 'FOURRAGE_ALIMENT',
    paymentTerms: 'Comptant / Wave',
    bioCertified: true
  };

  feedStockForm: FeedStock = {
    name: '',
    category: 'FORAGE_GREEN',
    currentStockKg: 500,
    alertThresholdKg: 200,
    unitPricePerKgFcfa: 80,
    supplierName: '',
    storageLocation: 'Hangar Principal',
    notes: ''
  };

  feedRationForm: FeedRation = {
    rationName: '',
    targetCategory: 'Vaches Haute Lactation',
    dailyDryMatterKg: 15.0,
    compositionDescription: '',
    dailyCostFcfa: 2400,
    energyUfl: 13.0,
    proteinPdiGrams: 1250
  };

  feedStockSearchTerm = signal<string>('');
  feedCategoryFilter = signal<string>('ALL');
  feedStocksCurrentPage = signal<number>(1);
  feedStocksItemsPerPage = signal<number>(6);

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
    this.apiService.getAllAnimals().subscribe({
      next: (data) => {
        this.isOffline.set(false);
        this.animals.set(data || []);
      },
      error: () => {
        this.isOffline.set(true);
        if (this.animals().length === 0) {
          this.loadFallbackAnimals();
        }
      }
    });

    // 2. Fetch Health Records
    this.apiService.getAllHealthRecords().subscribe({
      next: (data) => {
        this.healthRecords.set(data || []);
      },
      error: () => {
        if (this.healthRecords().length === 0) {
          this.loadFallbackHealth();
        }
      }
    });

    // 3. Fetch Vaccines
    this.apiService.getAllVaccines().subscribe({
      next: (data) => {
        this.vaccineSchedules.set(data || []);
      },
      error: () => {
        if (this.vaccineSchedules().length === 0) {
          this.loadFallbackVaccines();
        }
      }
    });

    // 4. Fetch Dashboard Stats
    this.apiService.getDashboardStats().subscribe({
      next: (stats) => {
        if (stats) this.dashboardStats.set(stats);
      },
      error: () => {}
    });

    // 5. Sprint 2: Reproduction Data & Alerts
    this.loadReproductionData();

    // 6. Sprint 2: Tank Status & Milk History
    this.loadMilkData();

    // 7. Sprint 3: Transformation, Recipes & Stocks
    this.loadTransformationData();

    // 8. Sprint 4: Commercial, Customers, Invoices & Payments
    this.loadCommercialData();

    // 9. Sprint 5: Feed, Rations & Solar Telemetry
    this.loadFeedAndSolarData();
  }

  // Action utilisateur pour synchroniser manuellement avec PostgreSQL
  refreshAndSyncAllData(): void {
    this.showToast('Synchronisation avec la base de données PostgreSQL en cours...');
    this.apiService.checkBackendHealth().subscribe(online => {
      if (online) {
        this.isOffline.set(false);
        this.loadInitialData();
        this.showToast('✅ Données synchronisées avec succès depuis PostgreSQL !');
      } else {
        this.isOffline.set(true);
        this.showToast('⚠️ Impossible de joindre le serveur Spring Boot (port 8080).');
      }
    });
  }

  loadReproductionData(): void {
    this.apiService.getAllReproEvents().subscribe({
      next: (events) => {
        this.reproductionEvents.set(events || []);
      },
      error: () => {
        if (this.reproductionEvents().length === 0) {
          this.loadFallbackRepro();
        }
      }
    });

    this.apiService.getReproAlerts().subscribe({
      next: (alerts) => {
        this.reproductionAlerts.set(alerts || []);
      },
      error: () => {
        if (this.reproductionAlerts().length === 0) {
          this.loadFallbackReproAlerts();
        }
      }
    });
  }

  loadMilkData(): void {
    this.apiService.getTankStatus().subscribe({
      next: (status) => {
        if (status) {
          const morn = status.morningVolume || 0;
          const eve = status.eveningVolume || 0;
          const sumMornEve = Math.round((morn + eve) * 10) / 10;
          const gross = (status.grossVolumeCollected !== undefined && status.grossVolumeCollected !== null && status.grossVolumeCollected > 0)
            ? status.grossVolumeCollected
            : (sumMornEve > 0 ? sumMornEve : (status.currentVolume || 0));

          const todayStr = new Date().toISOString().slice(0, 10);
          const localConsumedToday = this.transformationBatches()
            .filter(b => (!b.productionDate || b.productionDate === todayStr) && (b.status === 'IN_PROGRESS' || b.status === 'COMPLETED'))
            .reduce((sum, b) => sum + (b.milkLitersConsumed || 0), 0);

          const transformed = localConsumedToday > 0 
            ? localConsumedToday 
            : (status.transformedVolume || 0);

          const net = Math.max(0, Math.round((gross - transformed) * 10) / 10);
          const maxCap = status.maxCapacity || 500.0;
          const fill = Math.round((net / maxCap) * 1000) / 10;

          this.tankStatus.set({
            ...status,
            grossVolumeCollected: gross,
            transformedVolume: transformed,
            currentVolume: net,
            fillPercentage: fill
          });
        }
      },
      error: () => {
        this.recalculateLocalTankVolume();
      }
    });

    this.apiService.getMilkHistory(7).subscribe({
      next: (hist) => {
        if (hist) this.milkHistory.set(hist);
      },
      error: () => {}
    });
  }

  recalculateLocalTankVolume(): void {
    const morn = this.tankStatus()?.morningVolume ?? 0.0;
    const eve = this.tankStatus()?.eveningVolume ?? 0.0;
    const currentGross = this.tankStatus()?.grossVolumeCollected || Math.round((morn + eve) * 10) / 10 || (this.tankStatus()?.currentVolume ?? 0.0);
    const todayStr = new Date().toISOString().slice(0, 10);
    const consumed = this.transformationBatches()
      .filter(b => (!b.productionDate || b.productionDate === todayStr) && (b.status === 'IN_PROGRESS' || b.status === 'COMPLETED'))
      .reduce((sum, b) => sum + (b.milkLitersConsumed || 0), 0);
    const net = Math.max(0, Math.round((currentGross - consumed) * 10) / 10);
    const fill = Math.round((net / 500.0) * 1000) / 10;

    this.tankStatus.set({
      tankName: 'Cuve Réfrigérée N°1 (Bio)',
      grossVolumeCollected: currentGross,
      transformedVolume: consumed,
      currentVolume: net,
      maxCapacity: 500.0,
      fillPercentage: fill,
      temperature: 3.9,
      phLevel: 6.68,
      qualityStatus: net > 0 ? 'CONFORME BIO & PASTEURISATION' : (currentGross > 0 ? 'TRANSFORMÉ EN TOTALITÉ' : 'EN ATTENTE COLLECTE'),
      targetBatch: 'LOT-TR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01',
      morningVolume: morn,
      eveningVolume: eve,
      collectionDate: new Date().toISOString().slice(0, 10)
    });
  }

  get milkingCows(): Animal[] {
    return this.animals().filter(a => a.gender === 'FEMALE' && (a.category === 'MILKING_COW' || (a.dailyMilkYield && a.dailyMilkYield > 0)));
  }

  quickMilking(cow: Animal, session: 'MORNING' | 'EVENING'): void {
    const daily = cow.dailyMilkYield || 18.0;
    const vol = session === 'MORNING' ? Math.round(daily * 0.58 * 10) / 10 : Math.round(daily * 0.42 * 10) / 10;

    const prod: MilkProduction = {
      animalInternalId: cow.internalId,
      animalName: cow.name,
      productionDate: new Date().toISOString().slice(0, 10),
      session: session,
      volumeLiters: vol,
      milkTemperature: 34.2,
      destinationTank: 'Cuve Réfrigérée N°1 (Bio)',
      isOrganicCompliant: cow.status !== 'FEVER_TREATMENT'
    };

    this.apiService.recordMilk(prod).subscribe({
      next: () => {
        this.loadMilkData();
        this.showToast(`🥛 Traite ${session === 'MORNING' ? 'Matin ☀️' : 'Soir 🌙'} enregistrée pour ${cow.name} (+${vol}L) !`);
      },
      error: () => {
        this.tankStatus.update(st => {
          const currentGross = st?.grossVolumeCollected ?? 0.0;
          const newGross = Math.round((currentGross + vol) * 10) / 10;
          const currentMorn = st?.morningVolume ?? 0.0;
          const currentEve = st?.eveningVolume ?? 0.0;
          const newMorn = session === 'MORNING' ? Math.round((currentMorn + vol) * 10) / 10 : currentMorn;
          const newEve = session === 'EVENING' ? Math.round((currentEve + vol) * 10) / 10 : currentEve;
          const transformed = st?.transformedVolume ?? 0.0;
          const newNet = Math.max(0, Math.round((newGross - transformed) * 10) / 10);
          const maxCap = st?.maxCapacity ?? 500.0;
          const newFill = Math.round((newNet / maxCap) * 1000) / 10;
          return {
            tankName: st?.tankName ?? 'Cuve Réfrigérée N°1 (Bio)',
            grossVolumeCollected: newGross,
            morningVolume: newMorn,
            eveningVolume: newEve,
            transformedVolume: transformed,
            currentVolume: newNet,
            maxCapacity: maxCap,
            fillPercentage: newFill,
            temperature: 3.9,
            phLevel: 6.68,
            qualityStatus: newNet > 0 ? 'CONFORME BIO & PASTEURISATION' : 'EN ATTENTE COLLECTE',
            targetBatch: 'LOT-TR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01',
            collectionDate: new Date().toISOString().slice(0, 10)
          };
        });
        this.showToast(`🥛 Traite ${session === 'MORNING' ? 'Matin ☀️' : 'Soir 🌙'} validée (+${vol}L) ! Total brut : ${this.tankStatus()?.grossVolumeCollected}L`);
      }
    });
  }

  openMilkModal(): void {
    const firstCow = this.milkingCows[0];
    this.milkForm = {
      cowId: firstCow ? firstCow.internalId : 'H-1043',
      session: 'Matin',
      litres: firstCow && firstCow.dailyMilkYield ? Math.round(firstCow.dailyMilkYield * 0.58 * 10) / 10 : 11.5,
      temp: 34.2,
      fatPercentage: 3.9,
      tank: 'Cuve Réfrigérée N°1 (Bio)',
      productionDate: new Date().toISOString().split('T')[0],
      isOrganicCompliant: true
    };
    this.isMilkModalOpen.set(true);
  }

  closeMilkModal(): void {
    this.isMilkModalOpen.set(false);
  }

  submitMilkEntry(): void {
    const vol = Number(this.milkForm.litres) || 0;
    if (!this.milkForm.cowId || vol <= 0) {
      this.showToast('Veuillez sélectionner une vache et un volume de lait valide.');
      return;
    }

    const prod: MilkProduction = {
      animalInternalId: this.milkForm.cowId,
      session: this.milkForm.session.includes('Matin') ? 'MORNING' : 'EVENING',
      volumeLiters: vol,
      milkTemperature: this.milkForm.temp,
      fatPercentage: this.milkForm.fatPercentage,
      destinationTank: this.milkForm.tank,
      isOrganicCompliant: this.milkForm.isOrganicCompliant,
      productionDate: this.milkForm.productionDate || new Date().toISOString().split('T')[0]
    };

    this.apiService.recordMilk(prod).subscribe({
      next: (created) => {
        this.loadMilkData();
        this.closeMilkModal();
        this.showToast(`✅ Traite de ${created.volumeLiters || vol}L enregistrée pour ${this.milkForm.cowId} !`);
      },
      error: () => {
        this.tankStatus.update(st => {
          const currentGross = st?.grossVolumeCollected ?? 0.0;
          const newGross = Math.round((currentGross + vol) * 10) / 10;
          const transformed = st?.transformedVolume ?? 0.0;
          const newNet = Math.max(0, Math.round((newGross - transformed) * 10) / 10);
          const maxCap = st?.maxCapacity ?? 500.0;
          const newFill = Math.round((newNet / maxCap) * 1000) / 10;
          return {
            tankName: st?.tankName ?? 'Cuve Réfrigérée N°1 (Bio)',
            grossVolumeCollected: newGross,
            morningVolume: st?.morningVolume ?? (this.milkForm.session.includes('Matin') ? vol : 0),
            eveningVolume: st?.eveningVolume ?? (!this.milkForm.session.includes('Matin') ? vol : 0),
            transformedVolume: transformed,
            currentVolume: newNet,
            maxCapacity: maxCap,
            fillPercentage: newFill,
            temperature: 3.9,
            phLevel: 6.68,
            qualityStatus: newNet > 0 ? 'CONFORME BIO & PASTEURISATION' : 'EN ATTENTE COLLECTE',
            targetBatch: 'LOT-TR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01',
            collectionDate: new Date().toISOString().slice(0, 10)
          };
        });
        this.closeMilkModal();
        this.showToast(`✅ Traite manuelle de ${vol}L validée ! Total brut : ${this.tankStatus()?.grossVolumeCollected}L`);
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
    this.apiService.getAllRecipes().subscribe({
      next: (recs) => {
        this.recipes.set(recs || []);
      },
      error: () => {
        if (this.recipes().length === 0) {
          this.loadFallbackRecipes();
        }
      }
    });

    // 2. Batches
    this.apiService.getAllBatches().subscribe({
      next: (b) => {
        this.transformationBatches.set(b || []);
        this.updateLocalTransformationSummary();
        this.recalculateLocalTankVolume();
      },
      error: () => {
        if (this.transformationBatches().length === 0) {
          this.loadFallbackBatches();
        }
        this.recalculateLocalTankVolume();
      }
    });

    // 3. Stocks
    this.apiService.getAllStocks().subscribe({
      next: (s) => {
        this.productStocks.set(s || []);
      },
      error: () => {
        if (this.productStocks().length === 0) {
          this.loadFallbackStocks();
        }
      }
    });

    // 4. Summary
    this.apiService.getTransformationSummary().subscribe({
      next: (sum) => {
        if (sum) this.transformationSummary.set(sum);
        else this.updateLocalTransformationSummary();
      },
      error: () => {
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
    if (this.transformationBatches().length === 0) {
      this.transformationBatches.set([]);
    }
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

  // --- Tank Volume & Decrement Calculations ---
  getTankCurrentVolume(tankName: string): number {
    if (this.tankStatus()) {
      return this.tankStatus()!.currentVolume ?? 0;
    }
    return 0;
  }

  getTankAvailableMilk(tankName: string): number {
    return this.getTankCurrentVolume(tankName);
  }

  getEstimatedDurationForRecipe(recipeId: number): string {
    const rec = this.recipes().find(r => r.id === Number(recipeId));
    if (!rec) return '2 à 24 heures';
    if (rec.productType === 'PASTEURIZED_MILK') return '~2 heures (Pasteurisation & Refroidissement)';
    if (rec.productType === 'CURDLED_MILK') return '18 à 24 heures (Fermentation naturelle en cuve)';
    if (rec.productType === 'YOGURT') return '12 heures (Étuve 43°C & Prise au froid)';
    if (rec.productType === 'CHEESE') return '24 à 48 heures (Caillage, Moulage & Égouttage)';
    if (rec.productType === 'BUTTER') return '4 heures (Écrémage & Barattage)';
    return '12 à 24 heures';
  }

  getEstimatedCompletionDate(recipeId: number, launchDateStr?: string): string {
    const rec = this.recipes().find(r => r.id === Number(recipeId));
    const launch = launchDateStr ? new Date(launchDateStr) : new Date();
    if (!rec) return 'Aujourd\'hui / Demain';
    if (rec.productType === 'PASTEURIZED_MILK' || rec.productType === 'BUTTER') {
      return `Aujourd'hui (${launch.toLocaleDateString('fr-FR')}) en fin de journée`;
    }
    if (rec.productType === 'CURDLED_MILK' || rec.productType === 'YOGURT') {
      const nextDay = new Date(launch);
      nextDay.setDate(nextDay.getDate() + 1);
      return `Demain matin (${nextDay.toLocaleDateString('fr-FR')})`;
    }
    if (rec.productType === 'CHEESE') {
      const cheeseDate = new Date(launch);
      cheeseDate.setDate(cheeseDate.getDate() + 2);
      return `J+2 (${cheeseDate.toLocaleDateString('fr-FR')}) après égouttage`;
    }
    return `Dans 24h`;
  }

  getBatchDurationLabel(batch: TransformationBatch): string {
    if (batch.status === 'COMPLETED') return '✅ Conditionné & En Stock';
    if (batch.productType === 'PASTEURIZED_MILK') return '⏱️ Prêt aujourd\'hui (~2h)';
    if (batch.productType === 'CURDLED_MILK') return '⏱️ Prêt demain (24h)';
    if (batch.productType === 'YOGURT') return '⏱️ Prêt demain (12h)';
    if (batch.productType === 'CHEESE') return '⏱️ Égouttage J+2';
    if (batch.productType === 'BUTTER') return '⏱️ Prêt aujourd\'hui (~4h)';
    return '⏱️ En fabrication (24h)';
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
            this.showToast('⚠️ Erreur création recette personnalisée dans PostgreSQL.');
          }
        });
        return;
      } else {
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
    const available = this.getTankAvailableMilk(this.newBatchForm.sourceTank);
    const requested = Number(this.newBatchForm.milkLitersConsumed) || 0;

    if (available <= 0) {
      this.showToast(`🚫 Stock de lait épuisé (0 L disponible). Effectuez une collecte avant de lancer un lot.`);
      return;
    }
    if (requested > available) {
      this.showToast(`🚫 Stock insuffisant : ${requested} L demandés mais seulement ${available} L disponibles en cuve.`);
      return;
    }

    const expected = this.getCalculatedExpectedYield(rec.id || 1, requested);
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
        const batchToSave: TransformationBatch = { ...created, status: 'IN_PROGRESS' };
        this.transformationBatches.update(list => [batchToSave, ...list]);
        this.updateLocalTransformationSummary();
        this.recalculateLocalTankVolume();
        this.loadMilkData();
        this.showToast(`✅ Lot ${batchToSave.batchNumber} lancé en cours (${batchToSave.milkLitersConsumed}L prélevés de la cuve) !`);
        this.closeNewBatchModal();
      },
      error: () => {
        const batchToSave: TransformationBatch = { ...newBatch, status: 'IN_PROGRESS' };
        this.transformationBatches.update(list => [batchToSave, ...list]);
        this.updateLocalTransformationSummary();
        this.recalculateLocalTankVolume();
        this.showToast(`✅ Lot ${batchToSave.batchNumber} lancé en cours (${batchToSave.milkLitersConsumed}L prélevés de la cuve) !`);
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

    this.apiService.completeBatch(batch.id, {
      actualQuantityProduced: actualQty,
      wasteLossQuantity: waste,
      qualityNotes: this.completeBatchForm.qualityNotes,
      phLevel: this.completeBatchForm.phLevel
    }).subscribe({
      next: (completed) => {
        this.transformationBatches.update(list => list.map(b => b.id === completed.id ? completed : b));
        this.loadTransformationData();
        this.recalculateLocalTankVolume();
        this.loadMilkData();
        this.showToast(`🎉 Lot ${completed.batchNumber} clôturé et entré en stock marchant ! Rendement: ${completed.yieldEfficiencyPercentage}%`);
        this.closeCompleteBatchModal();
      },
      error: () => {
        const completed: TransformationBatch = {
          ...batch,
          status: 'COMPLETED',
          actualQuantityProduced: actualQty,
          wasteLossQuantity: waste,
          qualityNotes: this.completeBatchForm.qualityNotes,
          phLevel: this.completeBatchForm.phLevel,
          yieldEfficiencyPercentage: batch.expectedQuantity ? Math.round((actualQty / batch.expectedQuantity) * 1000) / 10 : 100
        };
        this.transformationBatches.update(list => list.map(b => b.id === batch.id ? completed : b));
        this.updateLocalTransformationSummary();
        this.recalculateLocalTankVolume();
        this.showToast(`🎉 Lot ${completed.batchNumber} clôturé et entré en stock marchant !`);
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
          this.showToast(`✅ Recette "${updated.name}" mise à jour dans PostgreSQL !`);
          this.closeRecipeModal();
        },
        error: () => {
          this.showToast(`⚠️ Erreur de mise à jour de la recette dans PostgreSQL.`);
        }
      });
    } else {
      this.apiService.createRecipe(this.recipeForm).subscribe({
        next: (created) => {
          this.recipes.update(list => [...list, created]);
          this.showToast(`✅ Nouvelle recette "${created.name}" enregistrée dans PostgreSQL !`);
          this.closeRecipeModal();
        },
        error: () => {
          this.showToast(`⚠️ Erreur de création de la recette dans PostgreSQL.`);
        }
      });
    }
  }

  deleteBatch(id?: number): void {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ? Le lait prélevé sera restitué à la cuve.')) return;

    this.apiService.deleteBatch(id).subscribe({
      next: () => {
        this.transformationBatches.update(list => list.filter(b => b.id !== id));
        this.updateLocalTransformationSummary();
        this.recalculateLocalTankVolume();
        this.loadMilkData();
        this.showToast('✅ Lot de transformation supprimé. Le lait a été restitué à la cuve.');
      },
      error: () => {
        this.transformationBatches.update(list => list.filter(b => b.id !== id));
        this.updateLocalTransformationSummary();
        this.recalculateLocalTankVolume();
        this.loadMilkData();
        this.showToast('🗑️ Lot supprimé localement. Le lait a été restitué à la cuve.');
      }
    });
  }

  deleteRecipe(id?: number): void {
    if (!id) return;
    if (!confirm('Supprimer cette fiche recette standard ?')) return;

    this.apiService.deleteRecipe(id).subscribe({
      next: () => {
        this.recipes.update(list => list.filter(r => r.id !== id));
        this.showToast('✅ Recette supprimée de PostgreSQL.');
      },
      error: () => {
        this.showToast('⚠️ Erreur de suppression de la recette.');
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
          (a.earTagNumber?.toLowerCase() || '').includes(q) ||
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

  submitHealthEntry(): void {
    const record: HealthRecord = {
      animalInternalId: this.healthForm.cowId.split(' ')[0],
      actType: this.healthForm.actType,
      diagnosis: this.healthForm.diagnosis || 'Intervention clinique',
      treatmentPrescription: this.healthForm.treatmentPrescription || 'Aucune prescription spécifique',
      practitionerName: this.healthForm.practitionerName || 'Dr. Fall',
      costFcfa: this.healthForm.cost || 0,
      status: this.healthForm.status || 'En cours',
      milkWithdrawalDays: this.healthForm.milkWithdrawalDays || 0,
      recordDate: this.healthForm.recordDate || new Date().toISOString().split('T')[0]
    };

    this.apiService.createHealthRecord(record).subscribe({
      next: (created) => {
        this.healthRecords.update(records => [created, ...records]);
        this.showToast('✅ Acte vétérinaire avec ordonnance enregistré dans PostgreSQL !');
        this.isHealthModalOpen.set(false);
      },
      error: (err) => {
        console.error('Erreur santé:', err);
        this.showToast(`⚠️ Erreur : Impossible d'enregistrer l'acte dans PostgreSQL.`);
      }
    });
  }

  submitOrderEntry(): void {
    this.showToast(`Commande ${this.orderForm.client} (${this.orderForm.qty} ${this.orderForm.product}) validée !`);
    this.isOrderModalOpen.set(false);
  }

  openNewAnimalModal(): void {
    const count = this.animals().length + 1;
    const idStr = String(count).padStart(3, '0');
    this.newAnimalForm = {
      internalId: `FL-${idStr}`,
      name: '',
      gender: 'FEMALE',
      category: 'MILKING_COW',
      status: 'HEALTHY',
      breed: 'Holstein Pure',
      birthDate: new Date().toISOString().split('T')[0],
      weight: 480,
      imageUrl: ''
    };
    this.newAnimalFather = '';
    this.newAnimalFatherEarTag = '';
    this.newAnimalMother = '';
    this.newAnimalMotherEarTag = '';
    this.isNewAnimalModalOpen.set(true);
  }

  submitNewAnimal(): void {
    if (!this.newAnimalForm.name || !this.newAnimalForm.name.trim()) {
      this.showToast('Veuillez renseigner le nom de l\'animal.');
      return;
    }
    const isMale = this.newAnimalForm.gender === 'MALE' || this.newAnimalForm.category === 'MALE_BULL';
    const animal: Animal = {
      ...this.newAnimalForm,
      gender: isMale ? 'MALE' : 'FEMALE',
      genderLabel: isMale ? 'Mâle' : 'Femelle',
      avatarEmoji: isMale ? '🐂' : (this.newAnimalForm.category === 'HEIFER_YOUNG' ? '🐮' : '🐄'),
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
        this.showToast(`✅ Animal ${created.name} (${created.internalId}) enregistré dans PostgreSQL !`);
        this.isNewAnimalModalOpen.set(false);
      },
      error: (err) => {
        console.error('Erreur ajout animal:', err);
        this.showToast(`⚠️ Erreur d'enregistrement dans PostgreSQL : vérifiez que l'identifiant est unique.`);
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
    const isMale = this.editAnimalForm.gender === 'MALE' || this.editAnimalForm.category === 'MALE_BULL';
    const updated: Animal = {
      ...this.editAnimalForm,
      gender: isMale ? 'MALE' : 'FEMALE',
      genderLabel: isMale ? 'Mâle' : 'Femelle',
      avatarEmoji: isMale ? '🐂' : (this.editAnimalForm.category === 'HEIFER_YOUNG' ? '🐮' : '🐄'),
      pedigree: {
        ...(this.editAnimalForm.pedigree || {}),
        fatherName: this.editAnimalFather,
        fatherEarTag: this.editAnimalFatherEarTag,
        motherName: this.editAnimalMother,
        motherEarTag: this.editAnimalMotherEarTag
      }
    };

    if (updated.internalId) {
      this.apiService.updateAnimal(updated.internalId, updated).subscribe({
        next: (res) => {
          this.animals.update(list => list.map(a => a.internalId === updated.internalId ? res : a));
          if (this.selectedAnimal()?.internalId === updated.internalId) {
            this.selectedAnimal.set(res);
          }
          this.showToast(`✅ Fiche de ${updated.name} mise à jour dans PostgreSQL !`);
          this.isEditAnimalModalOpen.set(false);
        },
        error: () => {
          this.showToast(`⚠️ Erreur : Impossible de mettre à jour l'animal dans PostgreSQL.`);
        }
      });
    }
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
        this.showToast('✅ Acte médical mis à jour dans PostgreSQL !');
        this.isEditHealthModalOpen.set(false);
      },
      error: () => {
        this.showToast('⚠️ Erreur de mise à jour dans PostgreSQL.');
      }
    });
  }

  submitVaccinePlan(): void {
    const v: VaccineSchedule = {
      vaccineType: this.vaccineForm.type,
      targetHerd: this.vaccineForm.target,
      scheduledDate: this.vaccineForm.date || new Date().toISOString().split('T')[0],
      practitioner: this.vaccineForm.vet,
      estimatedCost: this.vaccineForm.cost,
      status: 'Planifié',
      notes: this.vaccineForm.notes
    };

    this.apiService.createVaccine(v).subscribe({
      next: (created) => {
        this.vaccineSchedules.update(list => [...list, created]);
        this.showToast('✅ Planification vaccinale enregistrée dans PostgreSQL !');
        this.isVaccineModalOpen.set(false);
      },
      error: () => {
        this.showToast(`⚠️ Erreur d'enregistrement du vaccin dans PostgreSQL.`);
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
        this.showToast(`✅ Événement de reproduction enregistré dans PostgreSQL pour ${cowName} (${event.animalInternalId}) !`);
        this.isReproModalOpen.set(false);
      },
      error: () => {
        this.showToast(`⚠️ Erreur d'enregistrement dans PostgreSQL : impossible de joindre le backend.`);
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
        this.showToast('✅ Acte de reproduction supprimé de PostgreSQL.');
      },
      error: () => {
        this.showToast('⚠️ Erreur de suppression dans la base de données.');
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

  // ==========================================
  // SPRINT 4: COMMERCIAL & FINANCES LOGIC
  // ==========================================

  loadCommercialData(): void {
    // 1. Fetch Customers
    this.apiService.getAllCustomers().subscribe({
      next: (custs) => {
        this.customers.set(custs || []);
      },
      error: () => {
        if (this.customers().length === 0) {
          this.loadFallbackCustomers();
        }
      }
    });

    // 2. Fetch Invoices
    this.apiService.getAllInvoices().subscribe({
      next: (invs) => {
        this.invoices.set(invs || []);
      },
      error: () => {
        if (this.invoices().length === 0) {
          this.loadFallbackInvoices();
        }
      }
    });

    // 3. Fetch Payments
    this.apiService.getAllPayments().subscribe({
      next: (pays) => {
        this.payments.set(pays || []);
      },
      error: () => {
        if (this.payments().length === 0) {
          this.loadFallbackPayments();
        }
      }
    });

    // 4. Fetch Summary
    this.apiService.getCommercialSummary().subscribe({
      next: (sum) => {
        if (sum) this.commercialSummary.set(sum);
        else this.updateLocalCommercialSummary();
      },
      error: () => {
        this.updateLocalCommercialSummary();
      }
    });
  }

  loadFallbackCustomers(): void {
    const custs: Customer[] = [
      {
        id: 1,
        name: 'Supermarché Auchan (Plateau)',
        companyName: 'Auchan Retail Sénégal SA',
        customerType: 'SUPERMARKET',
        phone: '+221 33 889 40 00',
        email: 'achats@auchan.sn',
        address: 'Avenue Georges Pompidou',
        city: 'Dakar',
        nineaNumber: 'SN-DKR-2015-B-142',
        totalOrdersCount: 2,
        totalSpentFcfa: 246000,
        balanceDueFcfa: 0,
        notes: 'Distributeur officiel Bio — Livraison hebdomadaire les mardis et jeudis.'
      },
      {
        id: 2,
        name: 'Hôtel Pullman Teranga',
        companyName: 'Accor Hospitality Sénégal',
        customerType: 'HOTEL_RESTAURANT',
        phone: '+221 33 889 22 00',
        email: 'chef.cuisine@pullman-teranga.com',
        address: "Place de l'Indépendance",
        city: 'Dakar',
        nineaNumber: 'SN-DKR-2008-B-088',
        totalOrdersCount: 1,
        totalSpentFcfa: 97500,
        balanceDueFcfa: 0,
        notes: 'Commandes de fromages affinés et beurres fermiers pour le petit-déjeuner prestige.'
      },
      {
        id: 3,
        name: "L'Épicerie Bio des Almadies",
        companyName: 'Terroir & Saveurs SARL',
        customerType: 'GROCERY_BIO',
        phone: '+221 77 645 12 34',
        email: 'contact@epiceriebio-almadies.sn',
        address: 'Route des Almadies, en face Pharmacie',
        city: 'Dakar',
        nineaNumber: 'SN-DKR-2020-B-991',
        totalOrdersCount: 1,
        totalSpentFcfa: 54000,
        balanceDueFcfa: 24000,
        notes: 'Boutique diététique & bio. Reste à payer en attente de livraison complémentaire.'
      },
      {
        id: 4,
        name: 'Dr. Amadou Sow',
        companyName: 'Abonné Particulier Lait & Terroir',
        customerType: 'INDIVIDUAL',
        phone: '+221 78 123 45 67',
        email: 'amadou.sow@gmail.com',
        address: 'Cité Keur Gorgui, Villa 42',
        city: 'Dakar',
        totalOrdersCount: 1,
        totalSpentFcfa: 14000,
        balanceDueFcfa: 0,
        notes: 'Abonnement mensuel Lait frais pasteurisé et Lait caillé Sow.'
      }
    ];
    this.customers.set(custs);
  }

  loadFallbackInvoices(): void {
    const today = new Date();
    const dStr = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const invs: SaleInvoice[] = [
      {
        id: 1,
        invoiceNumber: 'FAC-2026-0001',
        customerId: 1,
        customerName: 'Supermarché Auchan (Plateau)',
        customerPhone: '+221 33 889 40 00',
        customerEmail: 'achats@auchan.sn',
        customerAddress: 'Avenue Georges Pompidou, Dakar',
        customerNinea: 'SN-DKR-2015-B-142',
        issueDate: dStr(-5),
        dueDate: dStr(10),
        subTotalFcfa: 106000,
        discountFcfa: 0,
        taxFcfa: 0,
        totalAmountFcfa: 106000,
        paidAmountFcfa: 106000,
        remainingAmountFcfa: 0,
        status: 'PAID',
        paymentMethod: 'WAVE',
        paymentReference: 'WAVE-SN-9982410',
        notes: 'Livraison conforme chambre froide Auchan.',
        items: [
          { id: 1, productId: 1, productName: 'Fromage Fermier Frais Bio (200g)', productType: 'CHEESE', quantity: 20, unit: 'pièces 200g', unitPriceFcfa: 2000, lineTotalFcfa: 40000 },
          { id: 2, productId: 3, productName: 'Yaourt Brassé Bio Nature (Pot 125g)', productType: 'YOGURT', quantity: 60, unit: 'pots 125g', unitPriceFcfa: 600, lineTotalFcfa: 36000 },
          { id: 3, productId: 2, productName: 'Lait Caillé Bio Artisanal (Sow 1L)', productType: 'CURDLED_MILK', quantity: 25, unit: 'bouteilles 1L', unitPriceFcfa: 1200, lineTotalFcfa: 30000 }
        ]
      },
      {
        id: 2,
        invoiceNumber: 'FAC-2026-0002',
        customerId: 2,
        customerName: 'Hôtel Pullman Teranga',
        customerPhone: '+221 33 889 22 00',
        customerEmail: 'chef.cuisine@pullman-teranga.com',
        customerAddress: "Place de l'Indépendance, Dakar",
        customerNinea: 'SN-DKR-2008-B-088',
        issueDate: dStr(-3),
        dueDate: dStr(12),
        subTotalFcfa: 97500,
        discountFcfa: 0,
        taxFcfa: 0,
        totalAmountFcfa: 97500,
        paidAmountFcfa: 97500,
        remainingAmountFcfa: 0,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'VIR-BOA-88201',
        notes: 'Commande spéciale banquet.',
        items: [
          { id: 4, productId: 1, productName: 'Fromage Fermier Frais Bio (200g)', productType: 'CHEESE', quantity: 30, unit: 'pièces 200g', unitPriceFcfa: 2000, lineTotalFcfa: 60000 },
          { id: 5, productId: 4, productName: 'Beurre Fermier Bio Demi-Sel (250g)', productType: 'BUTTER', quantity: 15, unit: 'plaquettes 250g', unitPriceFcfa: 2500, lineTotalFcfa: 37500 }
        ]
      },
      {
        id: 3,
        invoiceNumber: 'FAC-2026-0003',
        customerId: 3,
        customerName: "L'Épicerie Bio des Almadies",
        customerPhone: '+221 77 645 12 34',
        customerEmail: 'contact@epiceriebio-almadies.sn',
        customerAddress: 'Route des Almadies, Dakar',
        customerNinea: 'SN-DKR-2020-B-991',
        issueDate: dStr(-1),
        dueDate: dStr(14),
        subTotalFcfa: 54000,
        discountFcfa: 0,
        taxFcfa: 0,
        totalAmountFcfa: 54000,
        paidAmountFcfa: 30000,
        remainingAmountFcfa: 24000,
        status: 'PARTIALLY_PAID',
        paymentMethod: 'ORANGE_MONEY',
        paymentReference: 'OM-SN-441029',
        notes: 'Acompte versé par Orange Money à la commande.',
        items: [
          { id: 6, productId: 2, productName: 'Lait Caillé Bio Artisanal (Sow 1L)', productType: 'CURDLED_MILK', quantity: 25, unit: 'bouteilles 1L', unitPriceFcfa: 1200, lineTotalFcfa: 30000 },
          { id: 7, productId: 3, productName: 'Yaourt Brassé Bio Nature (Pot 125g)', productType: 'YOGURT', quantity: 40, unit: 'pots 125g', unitPriceFcfa: 600, lineTotalFcfa: 24000 }
        ]
      },
      {
        id: 4,
        invoiceNumber: 'FAC-2026-0004',
        customerId: 4,
        customerName: 'Dr. Amadou Sow',
        customerPhone: '+221 78 123 45 67',
        customerEmail: 'amadou.sow@gmail.com',
        customerAddress: 'Cité Keur Gorgui, Villa 42, Dakar',
        issueDate: dStr(0),
        dueDate: dStr(7),
        subTotalFcfa: 14000,
        discountFcfa: 0,
        taxFcfa: 0,
        totalAmountFcfa: 14000,
        paidAmountFcfa: 14000,
        remainingAmountFcfa: 0,
        status: 'PAID',
        paymentMethod: 'CASH',
        paymentReference: 'CASH-DIRECT',
        notes: 'Livraison directe à domicile.',
        items: [
          { id: 8, productId: 5, productName: 'Lait Frais Pasteurisé Bio (1L)', productType: 'PASTEURIZED_MILK', quantity: 10, unit: 'bouteilles 1L', unitPriceFcfa: 1000, lineTotalFcfa: 10000 },
          { id: 9, productId: 1, productName: 'Fromage Fermier Frais Bio (200g)', productType: 'CHEESE', quantity: 2, unit: 'pièces 200g', unitPriceFcfa: 2000, lineTotalFcfa: 4000 }
        ]
      }
    ];
    this.invoices.set(invs);
    this.updateLocalCommercialSummary();
  }

  loadFallbackPayments(): void {
    const today = new Date();
    const dStr = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().replace('T', ' ').slice(0, 16);
    };

    const pays: PaymentTransaction[] = [
      {
        id: 1,
        invoiceId: 1,
        invoiceNumber: 'FAC-2026-0001',
        customerId: 1,
        customerName: 'Supermarché Auchan (Plateau)',
        paymentDate: dStr(-5),
        amountPaidFcfa: 106000,
        paymentMethod: 'WAVE',
        transactionReference: 'WAVE-SN-9982410',
        receiptNumber: 'REC-2026-0001',
        receivedBy: 'Comptabilité LAWTAN',
        notes: 'Règlement complet Wave'
      },
      {
        id: 2,
        invoiceId: 2,
        invoiceNumber: 'FAC-2026-0002',
        customerId: 2,
        customerName: 'Hôtel Pullman Teranga',
        paymentDate: dStr(-3),
        amountPaidFcfa: 97500,
        paymentMethod: 'BANK_TRANSFER',
        transactionReference: 'VIR-BOA-88201',
        receiptNumber: 'REC-2026-0002',
        receivedBy: 'Service Finance',
        notes: 'Virement Bancaire BOA'
      },
      {
        id: 3,
        invoiceId: 3,
        invoiceNumber: 'FAC-2026-0003',
        customerId: 3,
        customerName: "L'Épicerie Bio des Almadies",
        paymentDate: dStr(-1),
        amountPaidFcfa: 30000,
        paymentMethod: 'ORANGE_MONEY',
        transactionReference: 'OM-SN-441029',
        receiptNumber: 'REC-2026-0003',
        receivedBy: 'Caisse Ferme',
        notes: 'Acompte Orange Money'
      },
      {
        id: 4,
        invoiceId: 4,
        invoiceNumber: 'FAC-2026-0004',
        customerId: 4,
        customerName: 'Dr. Amadou Sow',
        paymentDate: dStr(0),
        amountPaidFcfa: 14000,
        paymentMethod: 'CASH',
        transactionReference: 'CASH-DIRECT',
        receiptNumber: 'REC-2026-0004',
        receivedBy: 'Livreur Ferme',
        notes: 'Règlement en espèces à la livraison'
      }
    ];
    this.payments.set(pays);
  }

  updateLocalCommercialSummary(): void {
    const invs = this.invoices();
    const activeInvs = invs.filter(i => i.status !== 'CANCELLED');
    const totalRev = activeInvs.reduce((acc, i) => acc + (i.totalAmountFcfa || 0), 0);
    const totalCol = activeInvs.reduce((acc, i) => acc + (i.paidAmountFcfa || 0), 0);
    const totalOut = activeInvs.reduce((acc, i) => acc + (i.remainingAmountFcfa || 0), 0);
    const paidCount = activeInvs.filter(i => i.status === 'PAID').length;
    const pendCount = activeInvs.filter(i => i.status === 'ISSUED' || i.status === 'PARTIALLY_PAID').length;
    const avgOrder = activeInvs.length > 0 ? totalRev / activeInvs.length : 0;

    this.commercialSummary.set({
      totalRevenueFcfa: totalRev,
      totalCollectedFcfa: totalCol,
      totalOutstandingFcfa: totalOut,
      totalInvoicesCount: activeInvs.length,
      paidInvoicesCount: paidCount,
      pendingInvoicesCount: pendCount,
      totalCustomersCount: this.customers().length,
      averageOrderValueFcfa: Math.round(avgOrder)
    });
  }

  // --- Commercial Navigation & Tabs ---
  toggleCommercialMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCommercialMenuOpen.update(v => !v);
  }

  navigateToCommercialSubTab(subTab: string): void {
    this.isCommercialMenuOpen.set(true);
    this.activeCommercialSubTab.set(subTab);
    this.showPage('commercial');
  }

  switchCommercialSubTab(subTab: string): void {
    this.activeCommercialSubTab.set(subTab);
  }

  // --- Invoices: Filtering & Pagination ---
  filterInvoices(status: string): void {
    this.invoiceFilterStatus.set(status);
    this.invoicesCurrentPage.set(1);
  }

  get filteredInvoices(): SaleInvoice[] {
    const st = this.invoiceFilterStatus();
    const query = this.invoicesSearchTerm().toLowerCase().trim();

    return this.invoices().filter(inv => {
      // Status filter
      if (st !== 'ALL' && inv.status !== st) {
        return false;
      }
      // Query filter
      if (query) {
        const invNum = inv.invoiceNumber.toLowerCase();
        const custName = (inv.customerName || '').toLowerCase();
        return invNum.includes(query) || custName.includes(query);
      }
      return true;
    });
  }

  get paginatedInvoices(): SaleInvoice[] {
    const start = (this.invoicesCurrentPage() - 1) * this.invoicesPageSize();
    return this.filteredInvoices.slice(start, start + this.invoicesPageSize());
  }

  get totalInvoicesPages(): number {
    return Math.ceil(this.filteredInvoices.length / this.invoicesPageSize()) || 1;
  }

  get invoicesPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalInvoicesPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setInvoicesPage(page: number): void {
    if (page >= 1 && page <= this.totalInvoicesPages) {
      this.invoicesCurrentPage.set(page);
    }
  }

  nextInvoicesPage(): void {
    if (this.invoicesCurrentPage() < this.totalInvoicesPages) {
      this.invoicesCurrentPage.update(p => p + 1);
    }
  }

  prevInvoicesPage(): void {
    if (this.invoicesCurrentPage() > 1) {
      this.invoicesCurrentPage.update(p => p - 1);
    }
  }

  // --- Customers: Filtering & Pagination ---
  filterCustomers(type: string): void {
    this.customerTypeFilter.set(type);
    this.customersCurrentPage.set(1);
  }

  get filteredCustomers(): Customer[] {
    const tf = this.customerTypeFilter();
    const query = this.customersSearchTerm().toLowerCase().trim();

    return this.customers().filter(c => {
      if (tf !== 'ALL' && c.customerType !== tf) {
        return false;
      }
      if (query) {
        const name = c.name.toLowerCase();
        const company = (c.companyName || '').toLowerCase();
        const city = (c.city || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        return name.includes(query) || company.includes(query) || city.includes(query) || phone.includes(query);
      }
      return true;
    });
  }

  get paginatedCustomers(): Customer[] {
    const start = (this.customersCurrentPage() - 1) * this.customersPageSize();
    return this.filteredCustomers.slice(start, start + this.customersPageSize());
  }

  get totalCustomersPages(): number {
    return Math.ceil(this.filteredCustomers.length / this.customersPageSize()) || 1;
  }

  get customersPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalCustomersPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setCustomersPage(page: number): void {
    if (page >= 1 && page <= this.totalCustomersPages) {
      this.customersCurrentPage.set(page);
    }
  }

  nextCustomersPage(): void {
    if (this.customersCurrentPage() < this.totalCustomersPages) {
      this.customersCurrentPage.update(p => p + 1);
    }
  }

  prevCustomersPage(): void {
    if (this.customersCurrentPage() > 1) {
      this.customersCurrentPage.update(p => p - 1);
    }
  }

  // --- Payments: Filtering & Pagination ---
  get filteredPayments(): PaymentTransaction[] {
    const query = this.paymentsSearchTerm().toLowerCase().trim();
    return this.payments().filter(p => {
      if (!query) return true;
      const ref = (p.transactionReference || '').toLowerCase();
      const rec = (p.receiptNumber || '').toLowerCase();
      const cust = (p.customerName || '').toLowerCase();
      const inv = (p.invoiceNumber || '').toLowerCase();
      return ref.includes(query) || rec.includes(query) || cust.includes(query) || inv.includes(query);
    });
  }

  get paginatedPayments(): PaymentTransaction[] {
    const start = (this.paymentsCurrentPage() - 1) * this.paymentsPageSize();
    return this.filteredPayments.slice(start, start + this.paymentsPageSize());
  }

  get totalPaymentsPages(): number {
    return Math.ceil(this.filteredPayments.length / this.paymentsPageSize()) || 1;
  }

  get paymentsPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPaymentsPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  setPaymentsPage(page: number): void {
    if (page >= 1 && page <= this.totalPaymentsPages) {
      this.paymentsCurrentPage.set(page);
    }
  }

  nextPaymentsPage(): void {
    if (this.paymentsCurrentPage() < this.totalPaymentsPages) {
      this.paymentsCurrentPage.update(p => p + 1);
    }
  }

  prevPaymentsPage(): void {
    if (this.paymentsCurrentPage() > 1) {
      this.paymentsCurrentPage.update(p => p - 1);
    }
  }

  // --- New Invoice Actions ---
  openNewInvoiceModal(preselectedCustomerId?: number): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const custId = preselectedCustomerId || (this.customers().length > 0 ? this.customers()[0].id || 1 : 1);

    this.newInvoiceForm = {
      customerId: custId,
      issueDate: todayStr,
      dueDate: dueStr,
      discountFcfa: 0,
      taxFcfa: 0,
      notes: '',
      paymentMethod: 'WAVE',
      paymentReference: 'WAVE-SN-' + Math.floor(100000 + Math.random() * 900000),
      immediatePayment: false,
      items: [
        {
          productId: 1,
          productName: 'Fromage Fermier Frais Bio (200g)',
          productType: 'CHEESE',
          quantity: 10,
          unit: 'pièces 200g',
          unitPriceFcfa: 2000,
          lineTotalFcfa: 20000
        }
      ]
    };
    this.isNewInvoiceModalOpen.set(true);
  }

  closeNewInvoiceModal(): void {
    this.isNewInvoiceModalOpen.set(false);
  }

  addInvoiceItemLine(): void {
    this.newInvoiceForm.items.push({
      productId: undefined,
      productName: '',
      productType: 'CHEESE',
      quantity: 1,
      unit: 'unité',
      unitPriceFcfa: 1000,
      lineTotalFcfa: 1000
    });
  }

  removeInvoiceItemLine(index: number): void {
    if (this.newInvoiceForm.items.length > 1) {
      this.newInvoiceForm.items.splice(index, 1);
    }
  }

  onInvoiceItemProductSelect(index: number, stockId: any): void {
    const id = Number(stockId);
    const stock = this.productStocks().find(s => s.id === id);
    if (stock) {
      const item = this.newInvoiceForm.items[index];
      item.productId = stock.id;
      item.productName = stock.productName;
      item.productType = stock.productType;
      item.unit = stock.unit || 'unité';
      item.unitPriceFcfa = stock.unitPriceFcfa || 1000;
      item.lineTotalFcfa = item.quantity * item.unitPriceFcfa;
    }
  }

  onInvoiceItemQtyPriceChange(index: number): void {
    const item = this.newInvoiceForm.items[index];
    item.lineTotalFcfa = (item.quantity || 0) * (item.unitPriceFcfa || 0);
  }

  get newInvoiceSubTotal(): number {
    return this.newInvoiceForm.items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPriceFcfa || 0)), 0);
  }

  get newInvoiceGrandTotal(): number {
    return Math.max(0, this.newInvoiceSubTotal - (this.newInvoiceForm.discountFcfa || 0));
  }

  submitNewInvoice(): void {
    if (!this.newInvoiceForm.customerId) {
      this.showToast('Erreur: Veuillez sélectionner un client.');
      return;
    }
    if (this.newInvoiceForm.items.length === 0 || !this.newInvoiceForm.items[0].productName) {
      this.showToast('Erreur: Veuillez ajouter au moins un produit à la facture.');
      return;
    }

    const customer = this.customers().find(c => c.id === Number(this.newInvoiceForm.customerId));
    const invCount = this.invoices().length + 1;
    const invNum = `FAC-${new Date().getFullYear()}-${String(invCount).padStart(4, '0')}`;
    const grandTotal = this.newInvoiceGrandTotal;
    const paid = this.newInvoiceForm.immediatePayment ? grandTotal : 0;
    const remaining = grandTotal - paid;
    const status: InvoiceStatus = paid >= grandTotal ? 'PAID' : 'ISSUED';

    const invoicePayload: SaleInvoice = {
      invoiceNumber: invNum,
      customerId: Number(this.newInvoiceForm.customerId),
      customerName: customer?.name || 'Client',
      customerPhone: customer?.phone,
      customerEmail: customer?.email,
      customerAddress: customer ? `${customer.address || ''}, ${customer.city || ''}` : '',
      customerNinea: customer?.nineaNumber,
      issueDate: this.newInvoiceForm.issueDate,
      dueDate: this.newInvoiceForm.dueDate,
      subTotalFcfa: this.newInvoiceSubTotal,
      discountFcfa: this.newInvoiceForm.discountFcfa,
      taxFcfa: 0,
      totalAmountFcfa: grandTotal,
      paidAmountFcfa: paid,
      remainingAmountFcfa: remaining,
      status: status,
      paymentMethod: this.newInvoiceForm.immediatePayment ? this.newInvoiceForm.paymentMethod : undefined,
      paymentReference: this.newInvoiceForm.immediatePayment ? this.newInvoiceForm.paymentReference : undefined,
      notes: this.newInvoiceForm.notes,
      items: this.newInvoiceForm.items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        productType: it.productType,
        quantity: it.quantity,
        unit: it.unit,
        unitPriceFcfa: it.unitPriceFcfa,
        lineTotalFcfa: it.quantity * it.unitPriceFcfa
      }))
    };

    this.apiService.createInvoice(invoicePayload).subscribe({
      next: (created) => {
        this.invoices.update(list => [created, ...list]);
        this.decrementStockFromInvoice(created);
        this.updateLocalCommercialSummary();
        this.showToast(`✅ Facture ${created.invoiceNumber} enregistrée dans PostgreSQL (${created.totalAmountFcfa.toLocaleString()} FCFA) !`);
        this.closeNewInvoiceModal();
      },
      error: () => {
        this.showToast(`⚠️ Erreur : Impossible d'enregistrer la facture dans PostgreSQL (serveur indisponible).`);
      }
    });
  }

  private decrementStockFromInvoice(invoice: SaleInvoice): void {
    if (invoice.items) {
      invoice.items.forEach(item => {
        if (item.productId) {
          this.productStocks.update(stocks => stocks.map(s => {
            if (s.id === item.productId) {
              const newQty = Math.max(0, s.quantityAvailable - item.quantity);
              return { ...s, quantityAvailable: newQty, totalValueFcfa: newQty * (s.unitPriceFcfa || 0) };
            }
            return s;
          }));
        }
      });
      this.updateLocalTransformationSummary();
    }
  }

  // --- Customer Modals & Actions ---
  openNewCustomerModal(): void {
    this.newCustomerForm = {
      name: '',
      companyName: '',
      customerType: 'SUPERMARKET',
      phone: '',
      email: '',
      address: '',
      city: 'Dakar',
      nineaNumber: '',
      notes: ''
    };
    this.isNewCustomerModalOpen.set(true);
  }

  closeNewCustomerModal(): void {
    this.isNewCustomerModalOpen.set(false);
  }

  submitNewCustomer(): void {
    if (!this.newCustomerForm.name || !this.newCustomerForm.name.trim()) {
      this.showToast('Erreur: Veuillez renseigner le nom du client.');
      return;
    }

    const payload: Customer = {
      ...this.newCustomerForm,
      totalOrdersCount: 0,
      totalSpentFcfa: 0,
      balanceDueFcfa: 0
    };

    this.apiService.createCustomer(payload).subscribe({
      next: (created) => {
        this.customers.update(list => [...list, created]);
        this.updateLocalCommercialSummary();
        this.showToast(`✅ Client "${created.name}" enregistré dans PostgreSQL !`);
        this.closeNewCustomerModal();
      },
      error: () => {
        this.showToast(`⚠️ Erreur : Impossible d'enregistrer le client dans PostgreSQL.`);
      }
    });
  }

  // --- Payment Modal & Actions ---
  openPaymentModal(invoice: SaleInvoice): void {
    this.selectedInvoiceForPayment.set(invoice);
    this.paymentForm = {
      amountPaidFcfa: invoice.remainingAmountFcfa || invoice.totalAmountFcfa,
      paymentMethod: 'WAVE',
      transactionReference: this.generateSimulatedPaymentRef('WAVE'),
      receivedBy: 'Comptabilité Ferme LAWTAN',
      notes: `Règlement facture ${invoice.invoiceNumber}`
    };
    this.isPaymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen.set(false);
    this.selectedInvoiceForPayment.set(null);
  }

  onPaymentMethodChange(): void {
    this.paymentForm.transactionReference = this.generateSimulatedPaymentRef(this.paymentForm.paymentMethod);
  }

  generateSimulatedPaymentRef(method: PaymentMethod): string {
    const rand = Math.floor(100000 + Math.random() * 900000);
    switch (method) {
      case 'WAVE': return `WAVE-SN-${rand}`;
      case 'ORANGE_MONEY': return `OM-SN-${rand}`;
      case 'CASH': return `CASH-REC-${rand.toString().slice(-4)}`;
      case 'BANK_TRANSFER': return `VIR-BOA-${rand}`;
      case 'CHECK': return `CHQ-SGBS-${rand}`;
      default: return `PAY-${rand}`;
    }
  }

  submitPayment(): void {
    const inv = this.selectedInvoiceForPayment();
    if (!inv || !inv.id) return;

    const amount = Number(this.paymentForm.amountPaidFcfa);
    if (!amount || amount <= 0) {
      this.showToast('Erreur: Veuillez saisir un montant de règlement valide (> 0 FCFA).');
      return;
    }

    const receiptNum = `REC-${new Date().getFullYear()}-${String(this.payments().length + 1).padStart(4, '0')}`;
    const paymentPayload: PaymentTransaction = {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      paymentDate: new Date().toISOString(),
      amountPaidFcfa: amount,
      paymentMethod: this.paymentForm.paymentMethod,
      transactionReference: this.paymentForm.transactionReference,
      receiptNumber: receiptNum,
      receivedBy: this.paymentForm.receivedBy,
      notes: this.paymentForm.notes
    };

    this.apiService.recordInvoicePayment(inv.id, paymentPayload).subscribe({
      next: (updatedInvoice) => {
        this.invoices.update(list => list.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
        this.payments.update(list => [paymentPayload, ...list]);
        this.updateLocalCommercialSummary();
        this.showToast(`✅ Règlement de ${amount.toLocaleString()} FCFA enregistré dans PostgreSQL (${paymentPayload.paymentMethod}) !`);
        this.closePaymentModal();
      },
      error: () => {
        this.showToast(`⚠️ Erreur : Impossible d'enregistrer le paiement dans PostgreSQL.`);
      }
    });
  }

  // --- Print / Detail Modal & Actions ---
  openInvoicePrintModal(invoice: SaleInvoice): void {
    this.selectedInvoiceForPrint.set(invoice);
    this.isInvoicePrintModalOpen.set(true);
  }

  closeInvoicePrintModal(): void {
    this.isInvoicePrintModalOpen.set(false);
    this.selectedInvoiceForPrint.set(null);
  }

  triggerPrint(): void {
    window.print();
  }

  // --- Commercial UI Label & Badge Helpers ---
  getInvoiceStatusBadgeClass(status?: InvoiceStatus): string {
    switch (status) {
      case 'PAID': return 'badge-status-paid';
      case 'PARTIALLY_PAID': return 'badge-status-partial';
      case 'ISSUED': return 'badge-status-issued';
      case 'OVERDUE': return 'badge-status-overdue';
      case 'CANCELLED': return 'badge-status-cancelled';
      default: return 'badge-status-issued';
    }
  }

  getInvoiceStatusLabel(status?: InvoiceStatus): string {
    switch (status) {
      case 'PAID': return 'Soldée / Payée';
      case 'PARTIALLY_PAID': return 'Acompte Versé';
      case 'ISSUED': return 'Émise / En attente';
      case 'OVERDUE': return 'En Retard';
      case 'CANCELLED': return 'Annulée';
      case 'DRAFT': return 'Brouillon';
      default: return 'Émise';
    }
  }

  getCustomerTypeBadgeClass(type?: CustomerType): string {
    switch (type) {
      case 'SUPERMARKET': return 'badge-cust-supermarket';
      case 'HOTEL_RESTAURANT': return 'badge-cust-hotel';
      case 'GROCERY_BIO': return 'badge-cust-grocery';
      case 'INDIVIDUAL': return 'badge-cust-individual';
      default: return 'badge-cust-individual';
    }
  }

  getCustomerTypeLabel(type?: CustomerType): string {
    switch (type) {
      case 'SUPERMARKET': return '🛒 Supermarché / GMS';
      case 'HOTEL_RESTAURANT': return '🏨 Hôtel & Resto';
      case 'GROCERY_BIO': return '🏪 Épicerie Bio';
      case 'INDIVIDUAL': return '🏡 Particulier';
      default: return 'Client';
    }
  }

  getPaymentMethodBadgeClass(method?: PaymentMethod): string {
    switch (method) {
      case 'WAVE': return 'badge-pay-wave';
      case 'ORANGE_MONEY': return 'badge-pay-om';
      case 'CASH': return 'badge-pay-cash';
      case 'BANK_TRANSFER': return 'badge-pay-bank';
      case 'CHECK': return 'badge-pay-check';
      default: return 'badge-pay-cash';
    }
  }

  getPaymentMethodLabel(method?: PaymentMethod): string {
    switch (method) {
      case 'WAVE': return '🌊 Wave Sénégal';
      case 'ORANGE_MONEY': return '🟠 Orange Money';
      case 'CASH': return '💵 Espèces';
      case 'BANK_TRANSFER': return '🏦 Virement Bancaire';
      case 'CHECK': return '📜 Chèque';
      default: return 'Règlement';
    }
  }

  getPaymentMethodIcon(method?: PaymentMethod): string {
    switch (method) {
      case 'WAVE': return '🌊';
      case 'ORANGE_MONEY': return '🟠';
      case 'CASH': return '💵';
      case 'BANK_TRANSFER': return '🏦';
      case 'CHECK': return '📜';
      default: return '💳';
    }
  }

  // ==========================================
  // SPRINT 5: ALIMENTATION, SOLAIRE & AUDIT METHODS
  // ==========================================

  loadFeedAndSolarData(): void {
    // 1. Feed Stocks
    this.apiService.getAllFeedStocks().subscribe({
      next: (stocks) => {
        this.feedStocks.set(stocks || []);
      },
      error: () => {
        if (this.feedStocks().length === 0) {
          this.loadFallbackFeedStocks();
        }
      }
    });

    // 2. Feed Rations
    this.apiService.getAllFeedRations().subscribe({
      next: (rations) => {
        this.feedRations.set(rations || []);
      },
      error: () => {
        if (this.feedRations().length === 0) {
          this.loadFallbackFeedRations();
        }
      }
    });

    // 3. Solar Telemetry
    this.apiService.getSolarTelemetry().subscribe({
      next: (solar) => {
        if (solar) this.solarTelemetry.set(solar);
      },
      error: () => {
        if (!this.solarTelemetry()) {
          this.solarTelemetry.set({
            currentSolarPowerKw: 38.4,
            batterySocPercent: 94.0,
            dailySolarYieldKwh: 215.0,
            totalSolarYieldMwh: 68.4,
            gridStatus: 'SOLAR_OPTIMAL',
            coldRoomTempCelsius: 3.8,
            secondColdRoomTempCelsius: 4.1,
            waterPumpFlowM3h: 14.5,
            waterTankLevelPercent: 92.0,
            co2SavedKg: 182.5
          });
        }
      }
    });

    // 4. Fournisseurs / Suppliers
    this.loadSuppliersData();
  }

  loadSuppliersData(): void {
    this.apiService.getAllSuppliers().subscribe({
      next: (sups) => {
        this.suppliers.set(sups || []);
      },
      error: () => {
        if (this.suppliers().length === 0) {
          this.loadFallbackSuppliers();
        }
      }
    });
  }

  loadFallbackSuppliers(): void {
    this.suppliers.set([
      { id: 1, name: 'Parcelles Bio Pout', companyName: 'Agro Pout Bio SARL', contactPerson: 'Mamadou Ousmane Ndiaye', phone: '+221 77 654 32 10', email: 'contact@agropout.sn', address: 'RN2 Pout', city: 'Thiès / Pout', category: 'FOURRAGE_ALIMENT', paymentTerms: 'Paiement à livraison / Wave', totalOrdersCount: 8, totalSpentFcfa: 1850000, bioCertified: true, active: true, notes: 'Producteur certifié d\'ensilage de maïs biologique.' },
      { id: 2, name: 'GIE Femmes Niayes', companyName: 'GIE Femmes Productrices des Niayes', contactPerson: 'Fatou Sarr', phone: '+221 78 123 45 67', email: 'gie.niayes.bio@gmail.com', address: 'Zone Maraîchère Kayar', city: 'Kayar / Niayes', category: 'FOURRAGE_ALIMENT', paymentTerms: 'Comptant / OM', totalOrdersCount: 12, totalSpentFcfa: 940000, bioCertified: true, active: true, notes: 'Foin de niébé riche en protéines brutes.' },
      { id: 3, name: 'Huilerie Artisanale Kaolack', companyName: 'Kaolack Agro Press GIE', contactPerson: 'Babacar Sy', phone: '+221 76 987 65 43', email: 'agro.kaolack@yahoo.fr', address: 'Avenue Valdiodio Ndiaye', city: 'Kaolack', category: 'FOURRAGE_ALIMENT', paymentTerms: '30 jours fin de mois', totalOrdersCount: 5, totalSpentFcfa: 1200000, bioCertified: true, active: true, notes: 'Tourteaux d\'arachide bio première pression à froid.' },
      { id: 4, name: 'Grands Moulins de Dakar (GMD Agro)', companyName: 'Grands Moulins de Dakar SA', contactPerson: 'Jean-Baptiste Mendy', phone: '+221 33 839 00 00', email: 'commandes.agro@gmd.sn', address: 'Zone Industrielle Bel-Air', city: 'Dakar', category: 'FOURRAGE_ALIMENT', paymentTerms: 'Virement Bancaire', totalOrdersCount: 15, totalSpentFcfa: 2800000, bioCertified: false, active: true, notes: 'Son fin de blé et brisures de céréales.' },
      { id: 5, name: 'Plantation Bio Thiès', companyName: 'Moringa & Bio Herb Africa', contactPerson: 'Dr. Aïssatou Ba', phone: '+221 77 345 67 89', email: 'aissatou.ba@moringa-africa.sn', address: 'Route de Mont-Rolland', city: 'Thiès', category: 'VETERINAIRE_SANTE', paymentTerms: 'Comptant / Wave', totalOrdersCount: 6, totalSpentFcfa: 450000, bioCertified: true, active: true, notes: 'Poudre de feuilles de Moringa et complexes CMV bio.' },
      { id: 6, name: 'Salins Siné Saloum', companyName: 'Coopérative Sel Artisanal Gandiol', contactPerson: 'Cheikh Tidiane Diouf', phone: '+221 70 876 54 32', email: 'salins.gandiol@orange.sn', address: 'Delta du Saloum', city: 'Fatick / Foundiougne', category: 'FOURRAGE_ALIMENT', paymentTerms: 'Comptant à la commande', totalOrdersCount: 4, totalSpentFcfa: 180000, bioCertified: true, active: true, notes: 'Blocs à lécher en sel naturel purifié.' },
      { id: 7, name: 'EcoPack Sénégal', companyName: 'EcoPack Solutions Packaging', contactPerson: 'Ibrahima Fall', phone: '+221 77 890 12 34', email: 'sales@ecopack.sn', address: 'Route de Rufisque Km 14', city: 'Dakar / Rufisque', category: 'EMBALLAGE_PACKAGING', paymentTerms: 'Acompte 50% / Solde livraison', totalOrdersCount: 10, totalSpentFcfa: 3200000, bioCertified: true, active: true, notes: 'Bocaux en verre recyclable pour yaourts et étiquettes bio.' }
    ]);
  }

  loadFallbackFeedStocks(): void {
    this.feedStocks.set([
      { id: 1, name: 'Ensilage de Maïs Bio', category: 'FORAGE_GREEN', currentStockKg: 4200, alertThresholdKg: 1000, unitPricePerKgFcfa: 65, supplierName: 'Parcelles Bio Pout', storageLocation: 'Silo Couloir N°1', isLowStock: false },
      { id: 2, name: 'Foin de Niébé Riche en Protéines', category: 'FORAGE_DRY', currentStockKg: 1850, alertThresholdKg: 500, unitPricePerKgFcfa: 110, supplierName: 'GIE Femmes Niayes', storageLocation: 'Hangar Fourrages', isLowStock: false },
      { id: 3, name: 'Tourteau d\'Arachide Pressé à Froid', category: 'CONCENTRATE', currentStockKg: 850, alertThresholdKg: 300, unitPricePerKgFcfa: 240, supplierName: 'Huilerie Artisanale Kaolack', storageLocation: 'Magasin Concentrés', isLowStock: false },
      { id: 4, name: 'Son de Blé Fin', category: 'CONCENTRATE', currentStockKg: 1200, alertThresholdKg: 400, unitPricePerKgFcfa: 140, supplierName: 'Grands Moulins de Dakar', storageLocation: 'Magasin Concentrés', isLowStock: false },
      { id: 5, name: 'Poudre de Moringa & CMV Bio', category: 'MINERALS_VITAMINS', currentStockKg: 120, alertThresholdKg: 30, unitPricePerKgFcfa: 1500, supplierName: 'Plantation Bio Thiès', storageLocation: 'Pharmacie Vétérinaire', isLowStock: false },
      { id: 6, name: 'Blocs à Lécher au Sel de Gandiol', category: 'MINERALS_VITAMINS', currentStockKg: 85, alertThresholdKg: 20, unitPricePerKgFcfa: 800, supplierName: 'Salins Siné Saloum', storageLocation: 'Magasin Concentrés', isLowStock: false }
    ]);
  }

  loadFallbackFeedRations(): void {
    this.feedRations.set([
      {
        id: 1,
        rationName: 'Ration Haute Lactation (> 20 L/j)',
        targetCategory: 'Vaches Haute Lactation',
        dailyDryMatterKg: 16.5,
        compositionDescription: '15 kg Ensilage Maïs + 4 kg Foin Niébé + 3.5 kg Tourteau Arachide + 2 kg Son de Blé + 150g CMV Bio',
        dailyCostFcfa: 2850,
        energyUfl: 14.2,
        proteinPdiGrams: 1450
      },
      {
        id: 2,
        rationName: 'Ration Moyenne Lactation (14 - 18 L/j)',
        targetCategory: 'Vaches en Lactation Standard',
        dailyDryMatterKg: 14.0,
        compositionDescription: '12 kg Ensilage Maïs + 4 kg Foin Niébé + 2 kg Tourteau Arachide + 1.5 kg Son de Blé + 100g CMV Bio',
        dailyCostFcfa: 2150,
        energyUfl: 11.8,
        proteinPdiGrams: 1100
      },
      {
        id: 3,
        rationName: 'Ration Tarissement & Gestation Fin',
        targetCategory: 'Vaches Taries & Gestantes',
        dailyDryMatterKg: 11.5,
        compositionDescription: '6 kg Ensilage Maïs + 5 kg Foin Niébé / Paille + 1 kg Son de Blé + Sel de Gandiol',
        dailyCostFcfa: 1350,
        energyUfl: 8.5,
        proteinPdiGrams: 720
      },
      {
        id: 4,
        rationName: 'Ration Croissance Génisses',
        targetCategory: 'Génisses de Renouvellement',
        dailyDryMatterKg: 9.0,
        compositionDescription: '5 kg Ensilage Maïs + 3 kg Foin Niébé + 1 kg Tourteau Arachide + 50g CMV',
        dailyCostFcfa: 1200,
        energyUfl: 7.8,
        proteinPdiGrams: 680
      }
    ]);
  }

  // Navigation sub-tabs
  toggleFeedMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.isFeedMenuOpen.update(v => !v);
  }

  navigateToFeedSubTab(subTab: 'stocks' | 'rations' | 'suppliers'): void {
    this.isFeedMenuOpen.set(true);
    this.activeFeedSubTab.set(subTab);
    this.showPage('alimentation');
  }

  switchFeedSubTab(tab: 'stocks' | 'rations' | 'suppliers'): void {
    this.activeFeedSubTab.set(tab);
  }

  // Filters & Pagination for Feed Stocks
  filterFeedStocks(category: string): void {
    this.feedCategoryFilter.set(category);
    this.feedStocksCurrentPage.set(1);
  }

  get filteredFeedStocks(): FeedStock[] {
    let result = this.feedStocks();
    const cat = this.feedCategoryFilter();
    if (cat !== 'ALL') {
      result = result.filter(s => s.category === cat);
    }
    const q = this.feedStockSearchTerm().toLowerCase().trim();
    if (q) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.supplierName && s.supplierName.toLowerCase().includes(q)) ||
        (s.storageLocation && s.storageLocation.toLowerCase().includes(q))
      );
    }
    return result;
  }

  get paginatedFeedStocks(): FeedStock[] {
    const start = (this.feedStocksCurrentPage() - 1) * this.feedStocksItemsPerPage();
    return this.filteredFeedStocks.slice(start, start + this.feedStocksItemsPerPage());
  }

  get totalFeedStocksPages(): number {
    return Math.ceil(this.filteredFeedStocks.length / this.feedStocksItemsPerPage()) || 1;
  }

  get feedStocksPageNumbers(): number[] {
    const total = this.totalFeedStocksPages;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  setFeedStocksPage(page: number): void {
    if (page >= 1 && page <= this.totalFeedStocksPages) {
      this.feedStocksCurrentPage.set(page);
    }
  }

  prevFeedStocksPage(): void {
    if (this.feedStocksCurrentPage() > 1) {
      this.feedStocksCurrentPage.update(p => p - 1);
    }
  }

  nextFeedStocksPage(): void {
    if (this.feedStocksCurrentPage() < this.totalFeedStocksPages) {
      this.feedStocksCurrentPage.update(p => p + 1);
    }
  }

  // Summaries
  get totalFeedStockKg(): number {
    return this.feedStocks().reduce((sum, s) => sum + (s.currentStockKg || 0), 0);
  }

  get lowFeedStockCount(): number {
    return this.feedStocks().filter(s => s.currentStockKg <= s.alertThresholdKg).length;
  }

  get averageDailyFeedCostFcfa(): number {
    const rations = this.feedRations();
    if (rations.length === 0) return 0;
    const total = rations.reduce((sum, r) => sum + (r.dailyCostFcfa || 0), 0);
    return Math.round(total / rations.length);
  }

  // Modals & Actions Feed Stock
  openNewFeedStockModal(): void {
    this.feedStockForm = {
      name: '',
      category: 'FORAGE_GREEN',
      currentStockKg: 500,
      alertThresholdKg: 200,
      unitPricePerKgFcfa: 80,
      supplierName: '',
      storageLocation: 'Hangar Fourrages',
      notes: ''
    };
    this.isFeedStockModalOpen.set(true);
  }

  closeFeedStockModal(): void {
    this.isFeedStockModalOpen.set(false);
  }

  saveFeedStock(): void {
    if (!this.feedStockForm.name) {
      this.showToast('Veuillez renseigner le nom de l\'aliment');
      return;
    }
    this.apiService.createFeedStock(this.feedStockForm).subscribe({
      next: (created) => {
        this.feedStocks.update(stocks => [created, ...stocks]);
        this.closeFeedStockModal();
        this.showToast(`Aliment "${created.name}" ajouté avec succès !`);
      },
      error: () => {
        const fallback: FeedStock = { ...this.feedStockForm, id: Date.now() };
        this.feedStocks.update(stocks => [fallback, ...stocks]);
        this.closeFeedStockModal();
        this.showToast(`Aliment "${fallback.name}" enregistré (mode local)`);
      }
    });
  }

  quickAddFeedStockKg(stock: FeedStock, addKg: number): void {
    const newQty = (stock.currentStockKg || 0) + addKg;
    if (stock.id) {
      this.apiService.updateFeedStockQuantity(stock.id, newQty).subscribe({
        next: (updated) => {
          this.feedStocks.update(list => list.map(s => s.id === updated.id ? updated : s));
          this.showToast(`Stock de "${stock.name}" approvisionné (+${addKg} kg)`);
        },
        error: () => {
          stock.currentStockKg = newQty;
          stock.isLowStock = stock.currentStockKg <= stock.alertThresholdKg;
          this.feedStocks.update(list => [...list]);
          this.showToast(`Stock approvisionné (+${addKg} kg)`);
        }
      });
    }
  }

  deleteFeedStock(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet aliment du registre ?')) {
      this.apiService.deleteFeedStock(id).subscribe({
        next: () => {
          this.feedStocks.update(list => list.filter(s => s.id !== id));
          this.showToast('✅ Aliment supprimé de PostgreSQL.');
        },
        error: () => {
          this.showToast('⚠️ Erreur de suppression de l\'aliment dans PostgreSQL.');
        }
      });
    }
  }

  // Modals & Actions Feed Ration
  openNewFeedRationModal(): void {
    this.feedRationForm = {
      rationName: '',
      targetCategory: 'Vaches Haute Lactation',
      dailyDryMatterKg: 15.0,
      compositionDescription: '',
      dailyCostFcfa: 2400,
      energyUfl: 13.0,
      proteinPdiGrams: 1250
    };
    this.isFeedRationModalOpen.set(true);
  }

  closeFeedRationModal(): void {
    this.isFeedRationModalOpen.set(false);
  }

  saveFeedRation(): void {
    if (!this.feedRationForm.rationName) {
      this.showToast('Veuillez renseigner le nom de la formule');
      return;
    }
    this.apiService.createFeedRation(this.feedRationForm).subscribe({
      next: (created) => {
        this.feedRations.update(rations => [created, ...rations]);
        this.closeFeedRationModal();
        this.showToast(`✅ Fiche Ration "${created.rationName}" enregistrée dans PostgreSQL !`);
      },
      error: () => {
        const localId = Date.now();
        const fallback: FeedRation = { ...this.feedRationForm, id: localId };
        this.feedRations.update(rations => [fallback, ...rations]);
        this.closeFeedRationModal();
        this.showToast(`✅ Fiche Ration "${fallback.rationName}" enregistrée !`);
      }
    });
  }

  deleteFeedRation(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous supprimer cette formule de ration ?')) {
      this.apiService.deleteFeedRation(id).subscribe({
        next: () => {
          this.feedRations.update(list => list.filter(r => r.id !== id));
          this.showToast('✅ Ration supprimée de PostgreSQL.');
        },
        error: () => {
          this.showToast('⚠️ Erreur de suppression de la ration.');
        }
      });
    }
  }

  // Badge helpers Sprint 5
  getFeedCategoryLabel(cat?: string): string {
    switch (cat) {
      case 'FORAGE_GREEN': return '🌱 Fourrage Vert / Ensilage';
      case 'FORAGE_DRY': return '🌾 Fourrage Sec & Foin';
      case 'CONCENTRATE': return '🌽 Concentré & Tourteau';
      case 'MINERALS_VITAMINS': return '🧂 Minéraux, Sel & CMV';
      default: return 'Aliment';
    }
  }

  getFeedCategoryBadgeClass(cat?: string): string {
    switch (cat) {
      case 'FORAGE_GREEN': return 'badge-green';
      case 'FORAGE_DRY': return 'badge-gold';
      case 'CONCENTRATE': return 'badge-purple';
      case 'MINERALS_VITAMINS': return 'badge-blue';
      default: return 'badge-green';
    }
  }

  // ==========================================
  // FOURNISSEURS (SUPPLIERS) LOGIC & MODALS
  // ==========================================
  filterSuppliers(category: string): void {
    this.supplierCategoryFilter.set(category);
    this.suppliersCurrentPage.set(1);
  }

  get filteredSuppliers(): Supplier[] {
    let result = this.suppliers();
    const cat = this.supplierCategoryFilter();
    if (cat !== 'ALL') {
      result = result.filter(s => s.category === cat);
    }
    const q = this.supplierSearchTerm().toLowerCase().trim();
    if (q) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.companyName && s.companyName.toLowerCase().includes(q)) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }
    return result;
  }

  get paginatedSuppliers(): Supplier[] {
    const start = (this.suppliersCurrentPage() - 1) * this.suppliersItemsPerPage();
    return this.filteredSuppliers.slice(start, start + this.suppliersItemsPerPage());
  }

  get totalSuppliersPages(): number {
    return Math.ceil(this.filteredSuppliers.length / this.suppliersItemsPerPage()) || 1;
  }

  get suppliersPageNumbers(): number[] {
    const total = this.totalSuppliersPages;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  setSuppliersPage(page: number): void {
    if (page >= 1 && page <= this.totalSuppliersPages) {
      this.suppliersCurrentPage.set(page);
    }
  }

  prevSuppliersPage(): void {
    if (this.suppliersCurrentPage() > 1) {
      this.suppliersCurrentPage.update(p => p - 1);
    }
  }

  nextSuppliersPage(): void {
    if (this.suppliersCurrentPage() < this.totalSuppliersPages) {
      this.suppliersCurrentPage.update(p => p + 1);
    }
  }

  get totalSuppliersSpent(): number {
    return this.suppliers().reduce((sum, s) => sum + (s.totalSpentFcfa || 0), 0);
  }

  get bioCertifiedSuppliersCount(): number {
    return this.suppliers().filter(s => s.bioCertified).length;
  }

  openNewSupplierModal(sup?: Supplier): void {
    if (sup) {
      this.supplierForm = { ...sup };
    } else {
      this.supplierForm = {
        name: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: 'Thiès',
        category: 'FOURRAGE_ALIMENT',
        paymentTerms: 'Paiement à livraison / Wave',
        bioCertified: true,
        notes: ''
      };
    }
    this.isSupplierModalOpen.set(true);
  }

  closeSupplierModal(): void {
    this.isSupplierModalOpen.set(false);
  }

  saveSupplier(): void {
    if (!this.supplierForm.name.trim()) {
      this.showToast('Veuillez renseigner le nom du fournisseur');
      return;
    }
    if (this.supplierForm.id) {
      this.apiService.updateSupplier(this.supplierForm.id, this.supplierForm).subscribe({
        next: (updated) => {
          this.suppliers.update(list => list.map(s => s.id === updated.id ? updated : s));
          this.closeSupplierModal();
          this.showToast(`✅ Fournisseur "${updated.name}" mis à jour dans PostgreSQL !`);
        },
        error: () => {
          this.showToast(`⚠️ Erreur de mise à jour du fournisseur dans PostgreSQL.`);
        }
      });
    } else {
      this.apiService.createSupplier(this.supplierForm).subscribe({
        next: (created) => {
          this.suppliers.update(list => [created, ...list]);
          this.closeSupplierModal();
          this.showToast(`✅ Fournisseur "${created.name}" enregistré dans PostgreSQL !`);
        },
        error: () => {
          this.showToast(`⚠️ Erreur de création du fournisseur dans PostgreSQL.`);
        }
      });
    }
  }

  deleteSupplier(id?: number): void {
    if (!id) return;
    if (confirm('Voulez-vous désactiver ce fournisseur ?')) {
      this.apiService.deleteSupplier(id).subscribe({
        next: () => {
          this.suppliers.update(list => list.filter(s => s.id !== id));
          this.showToast('✅ Fournisseur retiré de PostgreSQL.');
        },
        error: () => {
          this.showToast('⚠️ Erreur de suppression du fournisseur.');
        }
      });
    }
  }

  // Quick Supplier Inline Creation (Used directly within order/restock forms)
  openQuickSupplierModal(): void {
    this.quickSupplierForm = {
      name: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      city: 'Thiès',
      category: 'FOURRAGE_ALIMENT',
      paymentTerms: 'Comptant / Wave',
      bioCertified: true
    };
    this.isQuickSupplierModalOpen.set(true);
  }

  closeQuickSupplierModal(): void {
    this.isQuickSupplierModalOpen.set(false);
  }

  saveQuickSupplier(): void {
    if (!this.quickSupplierForm.name.trim()) {
      this.showToast('Veuillez saisir le nom du fournisseur');
      return;
    }
    this.apiService.createSupplier(this.quickSupplierForm).subscribe({
      next: (created) => {
        this.suppliers.update(list => [created, ...list]);
        this.feedStockForm.supplierName = created.name;
        this.closeQuickSupplierModal();
        this.showToast(`✅ Fournisseur "${created.name}" enregistré dans PostgreSQL et sélectionné !`);
      },
      error: () => {
        this.showToast(`⚠️ Erreur d'enregistrement du fournisseur dans PostgreSQL.`);
      }
    });
  }

  getSupplierCategoryLabel(cat?: string): string {
    switch (cat) {
      case 'FOURRAGE_ALIMENT': return '🌱 Fourrages & Aliments';
      case 'EMBALLAGE_PACKAGING': return '📦 Packaging & Bouteilles';
      case 'EQUIPEMENT_PIECES': return '⚙️ Équipements & Pièces';
      case 'VETERINAIRE_SANTE': return '🩺 Vétérinaire & Hygiène';
      default: return 'Général / Intrants';
    }
  }

  // Audit & Exportations
  openAuditReportModal(type: string = 'BIO_CERTIFICATE'): void {
    this.selectedAuditReportType.set(type);
    this.isAuditReportModalOpen.set(true);
  }

  closeAuditReportModal(): void {
    this.isAuditReportModalOpen.set(false);
  }

  downloadAuditReport(reportType: string): void {
    let reportTitle = 'Bilan_Audit_Bio_LAWTAN';
    let content = `=================================================================\n`;
    content += `FERME LAWTAN AGRO INDUSTRIES — RAPPORT D'AUDIT OFFICIEL\n`;
    content += `Certification Agriculture & Élevage Biologique • Sénégal\n`;
    content += `NINEA: SN-DKR-2023-A-0982 | Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    content += `=================================================================\n\n`;

    if (reportType === 'BIO_CERTIFICATE') {
      reportTitle = `Certificat_Conformite_Bio_${new Date().getFullYear()}`;
      content += `TYPE : PASSEPORT & CONFORMITÉ BIO\n`;
      content += `- Cheptel total : ${this.animals().length} têtes identifiées RFID\n`;
      content += `- Alimentation 100% Bio & Locale (Maïs bio, Niébé, Moringa, Sel de Gandiol)\n`;
      content += `- Utilisation antibiotiques : 0 résidu détecté (délai d'attente respecté à 100%)\n`;
      content += `- Énergie : 98.5% d'autonomie solaire photovoltaïque (45 kWc)\n`;
      content += `- Produits finis certifiés : Lait frais, Lait caillé Sow, Fromage fermier, Yaourt bio, Beurre\n\n`;
    } else if (reportType === 'DAIRY_ANNUAL') {
      reportTitle = `Bilan_Lactation_Annuel_${new Date().getFullYear()}`;
      content += `TYPE : BILAN DE LACTATION & COLLECTE LAITIÈRE\n`;
      content += `- Collecte moyenne jour : 142.5 Litres/jour\n`;
      content += `- Taux Butyrique moyen : 4.1%\n`;
      content += `- Vaches en lactation : ${this.animals().filter(a => a.category === 'MILKING_COW').length} vaches\n`;
      content += `- Température cuve moyenne : 3.8 °C (Chaîne du froid respectée à 100%)\n\n`;
    } else {
      reportTitle = `Compte_Exploitation_Commercial_${new Date().getFullYear()}`;
      content += `TYPE : COMPTE D'EXPLOITATION & VALORISATION COMMERCIALE\n`;
      content += `- Chiffre d'Affaires : ${(this.commercialSummary()?.totalRevenueFcfa || 1850000).toLocaleString()} FCFA\n`;
      content += `- Total Encaissé (Wave/OM/Cash/Virement) : ${(this.commercialSummary()?.totalCollectedFcfa || 1780000).toLocaleString()} FCFA\n`;
      content += `- Coût de l'Alimentation : ${this.averageDailyFeedCostFcfa * 30 * this.animals().length} FCFA/mois\n`;
      content += `- Marge brute sur transformation : 38.2%\n\n`;
    }

    content += `Document certifié conforme par la Direction d'Exploitation Ferme LAWTAN.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast(`Rapport "${reportTitle}" téléchargé avec succès !`);
    this.closeAuditReportModal();
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

