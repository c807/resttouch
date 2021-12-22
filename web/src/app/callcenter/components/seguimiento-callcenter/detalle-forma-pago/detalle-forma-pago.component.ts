import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-detalle-forma-pago',
  templateUrl: './detalle-forma-pago.component.html',
  styleUrls: ['./detalle-forma-pago.component.css']
})
export class DetalleFormaPagoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DetalleFormaPagoComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

  cerrar = () => this.dialogRef.close();
}
