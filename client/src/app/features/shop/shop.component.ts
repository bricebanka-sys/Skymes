import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { MatCard } from '@angular/material/card';
import { ProductItemComponent } from './product-item/product-item.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ShopParams } from '../../shared/models/shopParams';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
    MatPaginator,
    FormsModule
],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {

  // Injection de notre service personnalisé
  private shopService = inject(ShopService);

  private dialogService = inject(MatDialog);


  // Propriété pour stocker les produits reçus
  products?: Pagination<Product>;
 
  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low-High', value: 'priceAsc' },
    { name: 'Price: High-Low', value: 'priceDesc' },
  ];

  shopParams = new ShopParams();
  pageSizeOptions = [5, 10, 15, 20];

   ngOnInit(): void {
    this.initializeShop();
  }

  initializeShop() {
    // Chargement des filtres (marques et types)
    this.shopService.getBrands();
    this.shopService.getTypes();
    this.getProducts();
  }


  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products = response,
      error: error => console.error(error)
    });
  }

  onSearchChange() {
    this.shopParams.pageNumber = 1; // Réinitialisation à la première page
    this.getProducts();
  }


  // Gestion de la pagination
  handlePageEvent(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1; // L'API commence à 1, Material à 0
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }

  onSortChange(event: MatSelectionListChange) {
  const selectedOption = event.options[0];
  if (selectedOption) {
    this.shopParams.sort = selectedOption.value;
    this.shopParams.pageNumber = 1; // Retour à la première page
    this.getProducts();
  }
}

  // Méthode pour ouvrir la modale de filtres
  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    });

    //Écoute de l'événement de fermeture de la modale
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.shopParams.brands = result.selectedBrands;
          this.shopParams.types = result.selectedTypes;

          // Appel du service avec les filtres sélectionnés
          this.shopParams.pageNumber = 1;
          this.getProducts();
        }
      }
    });
  }

}
