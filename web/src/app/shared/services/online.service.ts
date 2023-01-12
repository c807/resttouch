import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  isOnline$ = new BehaviorSubject<boolean>(window.navigator.onLine);

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  listenToOnlineStatus(): void {
    window.addEventListener('online', () => {
      this.isOnline$.next(true);
      this.snackBar.open('Ya estamos en línea.', 'RestTouch Pro', { duration: 7000 });
    });

    window.addEventListener('offline', () => {
      this.isOnline$.next(false);
      this.snackBar.open('Se perdió la conexión a internet. Algunas funciones no podrán ser utilizadas.', 'RestTouch Pro', { duration: 7000 });
    });
  }
}
