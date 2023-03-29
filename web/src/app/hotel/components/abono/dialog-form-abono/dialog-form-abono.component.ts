import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FormAbonoComponent } from '@hotel-components/abono/form-abono/form-abono.component';
import { Abono, IDataAbono } from '@hotel/interfaces/abono';

@Component({
  selector: 'app-dialog-form-abono',
  templateUrl: './dialog-form-abono.component.html',
  styleUrls: ['./dialog-form-abono.component.css']
})
export class DialogFormAbonoComponent implements OnInit {

  @ViewChild('frmAbono') frmAbono: FormAbonoComponent;

  public titulo = 'Abonos de la';

  constructor(
    public dialogRef: MatDialogRef<DialogFormAbonoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataAbono,
  ) { }

  ngOnInit(): void {
    this.setTitulo();
  }
  
  setTitulo = () => {
    const esReserva = this.data.reserva && +this.data.reserva > 0;
    const esFactura = this.data.factura && +this.data.factura > 0 && this.data.serie_factura && this.data.numero_factura;
    
    if (esReserva) {
      this.titulo = `${this.titulo} reserva número ${+this.data.reserva}`;
    } else if(esFactura) {
      this.titulo = `${this.titulo} factura número ${this.data.serie_factura}-${this.data.numero_factura}`;
    }
  }

  setAbono = (obj: Abono) => {    
    this.frmAbono.abono = obj;
    this.frmAbono.loadDetalleAbono();
  }
}
