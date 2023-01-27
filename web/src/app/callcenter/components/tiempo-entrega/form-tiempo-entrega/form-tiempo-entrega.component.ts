import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TiempoEntrega } from '@callcenter-interfaces/tiempo-entrega';
import { TiempoEntregaService } from '@callcenter-services/tiempo-entrega.service';

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
        if (res.exito) {
          this.resetTiempoEntrega();
          this.tiempoEntregaSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tiempo de entrega', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Tiempo de entrega', { duration: 7000 });
        }
      })
    );
  }

  validateKey = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

}
