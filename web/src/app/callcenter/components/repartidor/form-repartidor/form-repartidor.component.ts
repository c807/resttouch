import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { Repartidor } from '../../../interfaces/repartidor';
import { RepartidorService } from '../../../services/repartidor.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-repartidor',
  templateUrl: './form-repartidor.component.html',
  styleUrls: ['./form-repartidor.component.css']
})
export class FormRepartidorComponent implements OnInit, OnDestroy {

  @Input() repartidor: Repartidor;
  @Output() repartidorSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private repartidorSrvc: RepartidorService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetRepartidor() {
    this.repartidor = { repartidor: null, nombre: null, debaja: 0 };
  }

  onSubmit() {
    this.endSubs.add(      
      this.repartidorSrvc.save(this.repartidor).subscribe((res) => {
        if (res.exito) {
          this.resetRepartidor();
          this.repartidorSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Repartidor', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Repartidor', { duration: 7000 });
        }
      })
    );
  }

}
