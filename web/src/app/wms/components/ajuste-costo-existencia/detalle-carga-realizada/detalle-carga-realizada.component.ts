import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MultiFiltro } from '@shared/global';
import * as moment from 'moment';

import { CargaRealizada_BodegaArticuloCosto, DetalleCargaRealizada_BodegaArticuloCosto } from '@wms-interfaces/bodega';
import { AjusteCostoExistenciaService } from '@wms-services/ajuste-costo-existencia.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-carga-realizada',
  templateUrl: './detalle-carga-realizada.component.html',
  styleUrls: ['./detalle-carga-realizada.component.css']
})
export class DetalleCargaRealizadaComponent implements OnInit, OnDestroy {

  public detalle: DetalleCargaRealizada_BodegaArticuloCosto[] = [];
  public detalleFiltered: DetalleCargaRealizada_BodegaArticuloCosto[] = [];
  public txtFiltro = '';

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<DetalleCargaRealizadaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CargaRealizada_BodegaArticuloCosto,
    private ajusteCostoExistenciaSrvc: AjusteCostoExistenciaService
  ) { }

  ngOnInit(): void {
    this.loadDetalleCarga();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  cerrar = () => this.dialogRef.close();

  loadDetalleCarga = () => {
    if (moment(this.data.fecha).isValid()) {
      this.endSubs.add(
        this.ajusteCostoExistenciaSrvc.getDetalleCargaRealizada(this.data.fecha).subscribe(res => {
          this.detalle = res;
          this.detalleFiltered = [...this.detalle];
        })
      );
    }
  }

  applyFilter = () => {
    if (this.txtFiltro.length > 0) {
      this.detalleFiltered = MultiFiltro(this.detalle, this.txtFiltro);      
    } else {
      this.detalleFiltered = [...this.detalle];
    }    
  }
}
