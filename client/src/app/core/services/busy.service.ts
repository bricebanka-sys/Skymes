import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {

  busyRequestCount = signal(0);
  loading = computed(() => this.busyRequestCount() > 0);

  busy() {
    this.busyRequestCount.update((count) => count + 1);
  }

  idle() {
    this.busyRequestCount.update((count) => {
      const next = count - 1;
      return next <= 0 ? 0 : next;
    });
  }
}
