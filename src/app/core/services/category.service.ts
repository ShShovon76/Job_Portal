import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from 'src/app/models/category.models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly api = environment.apiUrl + '/categories';

  constructor(private http: HttpClient) {}

  // Use the /all endpoint from your backend
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/all`);
  }

   getTopCategories(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.api}/top`, { params });
  }
  getCategories(page: number = 0, size: number = 50): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString()
    };
    return this.http.get<any>(this.api, { params });
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.api}/${id}`);
  }

  getCategoryByName(name: string): Observable<Category> {
    return this.http.get<Category>(`${this.api}/name/${name}`);
  }
}
