import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { TipoTurno } from '@restaurante-interfaces/tipo-turno';
import { TipoTurnoService } from '@restaurante-services/tipo-turno.service';
import { BodegaService } from '@wms-services/bodega.service';
import { Bodega } from '@wms-interfaces/bodega';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-turno-tipo',
  templateUrl: './form-turno.component.html',
  styleUrls: ['./form-turno.component.css']
})
export class FormTurnoTipoComponent implements OnInit, OnDestroy {

  @Input() turno: TipoTurno;
  @Output() turnoSavedEv = new EventEmitter();

  public bodegas: Bodega[] = [];
  private endSubs = new Subscription();

  constructor(
    private _snackBar: MatSnackBar,
    private turnoSrvc: TipoTurnoService,
    private bodegaSrvc: BodegaService
  ) { }

  ngOnInit() {
    this.getBodega()
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTurno = () => this.turno = {
    turno_tipo: null,
    descripcion: null,
    activo: 1,
    enviar_reporte: 0,
    correo_cierre: null,
    bodega: null
  };

  getBodega = () => {
    this.endSubs.add(
      this.bodegaSrvc.get({}).subscribe(res => {
        this.bodegas = res;
      })
    );
  }

  onSubmit = () => {
    this.endSubs.add(
      this.turnoSrvc.save(this.turno).subscribe(res => {
        if (res.exito) {
          this.turnoSavedEv.emit();
          this.resetTurno();
          this._snackBar.open('Tipo de Turno agregado...', 'Turno', { duration: 3000 });
        } else {
          this._snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });
        }
      })
    );
  }

}
