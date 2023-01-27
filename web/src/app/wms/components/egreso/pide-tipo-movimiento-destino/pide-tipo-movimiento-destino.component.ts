import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';

@Component({
  selector: 'app-pide-tipo-movimiento-destino',
  templateUrl: './pide-tipo-movimiento-destino.component.html',
  styleUrls: ['./pide-tipo-movimiento-destino.component.css']
})
export class PideTipoMovimientoDestinoComponent implements OnInit {

  public tipo_movimiento_destino: number = null;

  constructor(
    public dialogRef: MatDialogRef<PideTipoMovimientoDestinoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TipoMovimiento[]
  ) { }

  ngOnInit(): void {
  }

  terminar = () => this.dialogRef.close(this.tipo_movimiento_destino || 0);

}
