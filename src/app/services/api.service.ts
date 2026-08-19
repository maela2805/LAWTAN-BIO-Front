import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Animal } from '../models/animal.model';
import { HealthRecord, VaccineSchedule } from '../models/health.model';
import { MilkProduction, DashboardStats, TankStatus, MilkHistory } from '../models/milk.model';
import { ReproductionEvent, ReproductionAlert } from '../models/reproduction.model';
import { Recipe, TransformationBatch, ProductStock, TransformationSummary } from '../models/transformation.model';

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
}
