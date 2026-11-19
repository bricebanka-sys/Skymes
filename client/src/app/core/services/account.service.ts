import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Address, User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);


  // Ressource HTTP pour récupérer l'état de l'utilisateur connecté au démarrage
  userResource = httpResource<User>(() => ({
    url: `${this.baseUrl}account/user-info`,
    withCredentials: true
  }));

  // Signal calculé en lecture seule pour simplifier l'accès à l'utilisateur actuel
  currentUser = computed(() => this.userResource.value() ?? null);

  public login(values: any) {
    let params = new HttpParams().append('useCookies', 'true');
    
    return this.http.post<User>(`${this.baseUrl}login`, values, {params});
  }

  // Méthode d'enregistrement (les utilisateurs anonymes n'ont pas besoin de credentials spécifiques)
  public register(values: any) {
    return this.http.post(`${this.baseUrl}account/register`, values);
  }

  // Méthode de déconnexion (nécessite withCredentials pour purger le cookie côté serveur/navigateur)
  public logout() {
    return this.http.post(`${this.baseUrl}account/logout`, {});
  }

  // Méthode de mise à jour de l'adresse de livraison
  public updateAddress(address: Address) {
    return this.http.post<Address>(`${this.baseUrl}account/address`, address);
  }
}


