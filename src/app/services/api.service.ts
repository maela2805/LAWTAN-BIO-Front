import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Animal } from '../models/animal.model';
import { HealthRecord, VaccineSchedule } from '../models/health.model';
import { MilkProduction, DashboardStats, TankStatus, MilkHistory } from '../models/milk.model';
import { ReproductionEvent, ReproductionAlert } from '../models/reproduction.model';
import { Recipe, TransformationBatch, ProductStock, TransformationSummary } from '../models/transformation.model';
import { Customer, SaleInvoice, PaymentTransaction, CommercialSummary, CustomerType, InvoiceStatus } from '../models/commercial.model';
import { FeedStock, FeedRation, SolarTelemetry } from '../models/feed-solar.model';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // Détection dynamique : localhost en dev, Render en production sur Vercel
  get baseUrl(): string {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('lawtan_api_url');
      if (custom) return custom;
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://lawtan-bio-back.onrender.com/api';
      }
    }
    return 'http://localhost:8080/api';
  }

  // --- Dashboard ---
  getDashboardStats(): Observable<DashboardStats | null> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`).pipe(
      catchError(err => {
        console.warn('Backend non disponible, utilisation des données locales', err);
        return of(null);
      })
    );
  }

  // --- Animals ---
  getAllAnimals(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.baseUrl}/animals`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les animaux', err);
        return of([]);
      })
    );
  }

  getAnimalById(internalId: string): Observable<Animal | null> {
    return this.http.get<Animal>(`${this.baseUrl}/animals/${internalId}`).pipe(
      catchError(() => of(null))
    );
  }

  createAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(`${this.baseUrl}/animals`, animal);
  }

  updateAnimal(internalId: string, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.baseUrl}/animals/${internalId}`, animal);
  }

  deleteAnimal(internalId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/animals/${internalId}`);
  }

  // --- Health ---
  getAllHealthRecords(): Observable<HealthRecord[]> {
    return this.http.get<HealthRecord[]>(`${this.baseUrl}/health/records`).pipe(
      catchError(() => of([]))
    );
  }

  createHealthRecord(record: HealthRecord): Observable<HealthRecord> {
    return this.http.post<HealthRecord>(`${this.baseUrl}/health/records`, record);
  }

  updateHealthRecord(id: number, record: HealthRecord): Observable<HealthRecord> {
    return this.http.put<HealthRecord>(`${this.baseUrl}/health/records/${id}`, record);
  }

  deleteHealthRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/health/records/${id}`);
  }

  getAllVaccines(): Observable<VaccineSchedule[]> {
    return this.http.get<VaccineSchedule[]>(`${this.baseUrl}/health/vaccines`).pipe(
      catchError(() => of([]))
    );
  }

  createVaccine(schedule: VaccineSchedule): Observable<VaccineSchedule> {
    return this.http.post<VaccineSchedule>(`${this.baseUrl}/health/vaccines`, schedule);
  }

  // --- Reproduction ---
  getAllReproEvents(): Observable<ReproductionEvent[]> {
    return this.http.get<ReproductionEvent[]>(`${this.baseUrl}/reproduction`).pipe(
      catchError(err => {
        console.warn('Backend reproduction non disponible', err);
        return of([]);
      })
    );
  }

  getReproByAnimal(animalId: number): Observable<ReproductionEvent[]> {
    return this.http.get<ReproductionEvent[]>(`${this.baseUrl}/reproduction/by-animal/${animalId}`).pipe(
      catchError(() => of([]))
    );
  }

  recordReproEvent(event: ReproductionEvent): Observable<ReproductionEvent> {
    return this.http.post<ReproductionEvent>(`${this.baseUrl}/reproduction/record`, event);
  }

  updateReproEvent(id: number, event: ReproductionEvent): Observable<ReproductionEvent> {
    return this.http.put<ReproductionEvent>(`${this.baseUrl}/reproduction/${id}`, event);
  }

  deleteReproEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reproduction/${id}`);
  }

  getReproAlerts(): Observable<ReproductionAlert[]> {
    return this.http.get<ReproductionAlert[]>(`${this.baseUrl}/reproduction/alerts`).pipe(
      catchError(() => of([]))
    );
  }

  // --- Milk Production & Tank ---
  getProductionsByDate(date?: string): Observable<MilkProduction[]> {
    const url = date ? `${this.baseUrl}/milk/by-date?date=${date}` : `${this.baseUrl}/milk/by-date`;
    return this.http.get<MilkProduction[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  recordMilk(production: MilkProduction): Observable<MilkProduction> {
    return this.http.post<MilkProduction>(`${this.baseUrl}/milk/record`, production);
  }

  getTankStatus(): Observable<TankStatus | null> {
    return this.http.get<TankStatus>(`${this.baseUrl}/milk/tank-status`).pipe(
      catchError(() => of(null))
    );
  }

  getMilkHistory(days: number = 7): Observable<MilkHistory[]> {
    return this.http.get<MilkHistory[]>(`${this.baseUrl}/milk/history?days=${days}`).pipe(
      catchError(() => of([]))
    );
  }

  // ==========================================
  // SPRINT 3: TRANSFORMATION, RECIPES & STOCKS
  // ==========================================

  // --- Recipes ---
  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.baseUrl}/recipes`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les recettes', err);
        return of([]);
      })
    );
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.baseUrl}/recipes`, recipe);
  }

  updateRecipe(id: number, recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.baseUrl}/recipes/${id}`, recipe);
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/${id}`);
  }

  // --- Transformation Batches ---
  getAllBatches(): Observable<TransformationBatch[]> {
    return this.http.get<TransformationBatch[]>(`${this.baseUrl}/transformations/batches`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les lots', err);
        return of([]);
      })
    );
  }

  launchBatch(batch: TransformationBatch): Observable<TransformationBatch> {
    return this.http.post<TransformationBatch>(`${this.baseUrl}/transformations/batches`, batch);
  }

  completeBatch(id: number, data: { actualQuantityProduced: number; wasteLossQuantity?: number; qualityNotes?: string; phLevel?: number }): Observable<TransformationBatch> {
    return this.http.post<TransformationBatch>(`${this.baseUrl}/transformations/batches/${id}/complete`, data);
  }

  updateBatch(id: number, batch: TransformationBatch): Observable<TransformationBatch> {
    return this.http.put<TransformationBatch>(`${this.baseUrl}/transformations/batches/${id}`, batch);
  }

  deleteBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transformations/batches/${id}`);
  }

  getTransformationSummary(): Observable<TransformationSummary | null> {
    return this.http.get<TransformationSummary>(`${this.baseUrl}/transformations/summary`).pipe(
      catchError(() => of(null))
    );
  }

  // --- Stocks ---
  getAllStocks(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(`${this.baseUrl}/stocks`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les stocks', err);
        return of([]);
      })
    );
  }

  createOrUpdateStock(stock: ProductStock): Observable<ProductStock> {
    return this.http.post<ProductStock>(`${this.baseUrl}/stocks`, stock);
  }

  deleteStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stocks/${id}`);
  }

  // ==========================================
  // SPRINT 4: COMMERCIAL, INVOICES & PAYMENTS
  // ==========================================

  // --- Customers ---
  getAllCustomers(type?: CustomerType): Observable<Customer[]> {
    const url = type ? `${this.baseUrl}/customers?type=${type}` : `${this.baseUrl}/customers`;
    return this.http.get<Customer[]>(url).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les clients', err);
        return of([]);
      })
    );
  }

  getCustomerById(id: number): Observable<Customer | null> {
    return this.http.get<Customer>(`${this.baseUrl}/customers/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/customers/${id}`);
  }

  // --- Invoices ---
  getAllInvoices(status?: InvoiceStatus, customerId?: number): Observable<SaleInvoice[]> {
    let url = `${this.baseUrl}/invoices`;
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (customerId) params.push(`customerId=${customerId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<SaleInvoice[]>(url).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les factures', err);
        return of([]);
      })
    );
  }

  getInvoiceById(id: number): Observable<SaleInvoice | null> {
    return this.http.get<SaleInvoice>(`${this.baseUrl}/invoices/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  createInvoice(invoice: SaleInvoice): Observable<SaleInvoice> {
    return this.http.post<SaleInvoice>(`${this.baseUrl}/invoices`, invoice);
  }

  recordInvoicePayment(invoiceId: number, payment: PaymentTransaction): Observable<SaleInvoice> {
    return this.http.post<SaleInvoice>(`${this.baseUrl}/invoices/${invoiceId}/pay`, payment);
  }

  updateInvoiceStatus(id: number, status: InvoiceStatus): Observable<SaleInvoice> {
    return this.http.patch<SaleInvoice>(`${this.baseUrl}/invoices/${id}/status?status=${status}`, {});
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`);
  }

  // --- Payments ---
  getAllPayments(invoiceId?: number, customerId?: number): Observable<PaymentTransaction[]> {
    let url = `${this.baseUrl}/payments`;
    const params: string[] = [];
    if (invoiceId) params.push(`invoiceId=${invoiceId}`);
    if (customerId) params.push(`customerId=${customerId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<PaymentTransaction[]>(url).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les paiements', err);
        return of([]);
      })
    );
  }

  // --- Commercial Summary ---
  getCommercialSummary(): Observable<CommercialSummary | null> {
    return this.http.get<CommercialSummary>(`${this.baseUrl}/commercial/summary`).pipe(
      catchError(() => of(null))
    );
  }

  // ==========================================
  // SPRINT 5: FEED, RATIONS & SOLAR TELEMETRY
  // ==========================================

  // --- Feed Stocks ---
  getAllFeedStocks(): Observable<FeedStock[]> {
    return this.http.get<FeedStock[]>(`${this.baseUrl}/feed/stocks`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les stocks d\'aliments', err);
        return of([]);
      })
    );
  }

  updateFeedStockQuantity(id: number, currentStockKg: number): Observable<FeedStock> {
    return this.http.patch<FeedStock>(`${this.baseUrl}/feed/stocks/${id}/quantity`, { currentStockKg });
  }

  createFeedStock(feed: FeedStock): Observable<FeedStock> {
    return this.http.post<FeedStock>(`${this.baseUrl}/feed/stocks`, feed);
  }

  deleteFeedStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feed/stocks/${id}`);
  }

  // --- Feed Rations ---
  getAllFeedRations(): Observable<FeedRation[]> {
    return this.http.get<FeedRation[]>(`${this.baseUrl}/feed/rations`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les fiches rations', err);
        return of([]);
      })
    );
  }

  createFeedRation(ration: FeedRation): Observable<FeedRation> {
    return this.http.post<FeedRation>(`${this.baseUrl}/feed/rations`, ration);
  }

  updateFeedRation(id: number, ration: FeedRation): Observable<FeedRation> {
    return this.http.put<FeedRation>(`${this.baseUrl}/feed/rations/${id}`, ration);
  }

  deleteFeedRation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/feed/rations/${id}`);
  }

  // --- Solar Telemetry ---
  getSolarTelemetry(): Observable<SolarTelemetry | null> {
    return this.http.get<SolarTelemetry>(`${this.baseUrl}/solar/telemetry`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour la télémétrie solaire', err);
        return of(null);
      })
    );
  }

  // ==========================================
  // FOURNISSEURS & APPROVISIONNEMENTS
  // ==========================================
  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`).pipe(
      catchError(err => {
        console.warn('Backend non disponible pour les fournisseurs', err);
        return of([]);
      })
    );
  }

  getSupplierById(id: number): Observable<Supplier | null> {
    return this.http.get<Supplier>(`${this.baseUrl}/suppliers/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers/search?query=${encodeURIComponent(query)}`).pipe(
      catchError(() => of([]))
    );
  }

  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/suppliers`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/suppliers/${id}`);
  }
}

