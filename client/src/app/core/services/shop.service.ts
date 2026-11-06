import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../shared/models/pagination';
import { Product } from '../../shared/models/product';
import { ShopParams } from '../../shared/models/shopParams';

@Injectable({
  providedIn: 'root', // Indique que le service est un singleton disponible globalement
})
export class ShopService {

  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api/';

  // Propriétés pour stocker l'état global des filtres dans le service singleton
  brands: string[] = [];
  types: string[] = [];
  products: Product[] = [];

  // Méthode mise à jour pour accepter les filtres optionnels de marques et de types
  getProducts(shopParams: ShopParams) {
    
    let params = new HttpParams();

    // Ajout des marques si elles sont sélectionnées
    if (shopParams.brands.length > 0) {
      params = params.append('brands', shopParams.brands.join(','));
    }

    // Ajout des types s'ils sont sélectionnés
    if (shopParams.types.length > 0) {
      params = params.append('types', shopParams.types.join(','));
    }

    // Ajout du paramètre de tri s'il est présent
  if (shopParams.sort) {
    params = params.append('sort', (shopParams.sort));
  }

  // Ajout du filtre de recherche par mot-clé
  if (shopParams.search) {
    params = params.append('search', shopParams.search);
  }

    // Paramètre de pagination (taille de page)
    params = params.append('pageSize', shopParams.pageSize);
    params = params.append('pageIndex', shopParams.pageNumber);

    return this.http.get<Pagination<Product>>(this.baseUrl + 'products', { params });
  }


  // Récupération des marques avec vérification pour ne les charger qu'une seule fois
  getBrands() {
    if (this.brands.length > 0) return;

    this.http.get<string[]>(this.baseUrl + 'products/brands').subscribe({
      next: response => this.brands = response,
      error: (error) => console.error(error)
    });
  }

  // Récupération des types avec vérification similaire
  getTypes() {
    if (this.types.length > 0) return;

    this.http.get<string[]>(this.baseUrl + 'products/types').subscribe({
      next: response => this.types = response,
      error: (error) => console.error(error)
    });
  }
}
