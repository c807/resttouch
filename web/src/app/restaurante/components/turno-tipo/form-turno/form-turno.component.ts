import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from "rxjs";
import { TipoTurno } from '../../../interfaces/tipo-turno';
import { TipoTurnoService } from '../../../services/tipo-turno.service';
import { BodegaService } from '../../../../wms/services/bodega.service';
import { Bodega } from '../../../../wms/interfaces/bodega';

@Component({
  selector: 'app-form-turno-tipo',
  templateUrl: './form-turno.component.html',
  styleUrls: ['./form-turno.component.css']
})
export class FormTurnoTipoComponent implements OnInit {
  
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

  resetTurno = () => this.turno = { 
    turno_tipo: null,
    descripcion: null,
    activo:1,
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
    this.turnoSrvc.save(this.turno).subscribe(res => {
      //console.log(res);
      if (res.exito) {
        this.turnoSavedEv.emit();
        this.resetTurno();
        this._snackBar.open('Tipo de Turno agregado...', 'Turno', { duration: 3000 });
      } else {
        this._snackBar.open(`ERROR: ${res.mensaje}`, 'Turno', { duration: 3000 });        
      }
    });
  }

}
