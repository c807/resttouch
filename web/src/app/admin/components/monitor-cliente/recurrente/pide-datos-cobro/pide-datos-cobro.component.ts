import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pide-datos-cobro',
  templateUrl: './pide-datos-cobro.component.html',
  styleUrls: ['./pide-datos-cobro.component.css']
})
export class PideDatosCobroComponent implements OnInit {

  public datos_cobro: {
    nombre_producto_recurrente: string,
    monto: number
  } = {
      nombre_producto_recurrente: null,
      monto: null
    };

  constructor(
    public dialogRef: MatDialogRef<PideDatosCobroComponent>,
  ) { }

  ngOnInit(): void {
  }

}
