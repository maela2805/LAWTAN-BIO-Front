import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Animal } from '../models/animal.model';
import { HealthRecord, VaccineSchedule } from '../models/health.model';
import { MilkProduction, DashboardStats } from '../models/milk.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

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

  // --- Milk ---
  recordMilk(production: MilkProduction): Observable<MilkProduction> {
    return this.http.post<MilkProduction>(`${this.baseUrl}/milk/record`, production);
  }
}
