import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ccGeneral } from '@restaurante-interfaces/cajacorte';
import { CajacorteService } from '@restaurante-services/cajacorte.service';

import { Subscription } from 'rxjs';

interface ICajaCorte {
  caja_corte: ccGeneral;
}

@Component({
  selector: 'app-caja-corte-preview',
  templateUrl: './caja-corte-preview.component.html',
  styleUrls: ['./caja-corte-preview.component.css']
})
export class CajaCortePreviewComponent implements OnInit, OnDestroy {

  public detalle: any;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<CajaCortePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICajaCorte,
    private cajaCorteSrvc: CajacorteService
  ) { }

  ngOnInit(): void {
    // console.log(this.data.caja_corte);
    this.loadDetalleCC();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadDetalleCC = () => {
    if (this.data.caja_corte && +this.data.caja_corte.caja_corte > 0) {
      this.endSubs.add(
        this.cajaCorteSrvc.getDetalleCaja(+this.data.caja_corte.caja_corte).subscribe((det: any) => this.detalle = det)
      );
    }
  }

  cerrar = () => this.dialogRef.close();

}
