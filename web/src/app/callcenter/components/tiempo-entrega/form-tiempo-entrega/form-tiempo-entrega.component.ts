import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TiempoEntrega } from '../../../interfaces/tiempo-entrega';
import { TiempoEntregaService } from '../../../services/tiempo-entrega.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tiempo-entrega',
  templateUrl: './form-tiempo-entrega.component.html',
  styleUrls: ['./form-tiempo-entrega.component.css']
})
export class FormTiempoEntregaComponent implements OnInit, OnDestroy {

  @Input() tiempoEntrega: TiempoEntrega;
  @Output() tiempoEntregaSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tiempoEntregaSrvc: TiempoEntregaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTiempoEntrega() {
    this.tiempoEntrega = { tiempo_entrega: null, descripcion: null, orden: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tiempoEntregaSrvc.save(this.tiempoEntrega).subscribe((res) => {
        if (res) {
          this.resetTiempoEntrega();
          this.tiempoEntregaSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tiempo de entrega', { duration: 5000 });
        }
      })
    );
  }

}
