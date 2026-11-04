import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { HttpClient } from '@angular/common/http';
import { Product } from './shared/models/product';
import { Pagination } from './shared/models/pagination';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
 

  // URL de base de notre API .NET (port 5001 en HTTPS)
  baseUrl = 'https://localhost:5001/api/';
  // Injection du HttpClient
  private http = inject(HttpClient);
  title = 'Skymes';

  // Propriété pour stocker les produits reçus
  products: Product[] = [];

   ngOnInit(): void {
    // Appel HTTP GET (renvoie un Observable)
    this.http.get<Pagination<Product>>(this.baseUrl + 'products').subscribe({
      next: response => this.products = response.data, // Stockage des produits dans la propriété
      error: (error) => console.log(error),
      complete: () => console.log('Requête HTTP terminée avec succès')
    });
  }
}
