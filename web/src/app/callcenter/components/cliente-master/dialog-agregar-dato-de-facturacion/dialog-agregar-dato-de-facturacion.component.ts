import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClienteMaster, ClienteMasterCliente } from '../../../interfaces/cliente-master';

@Component({
  selector: 'app-dialog-agregar-dato-de-facturacion',
  templateUrl: './dialog-agregar-dato-de-facturacion.component.html',
  styleUrls: ['./dialog-agregar-dato-de-facturacion.component.css']
})
export class DialogAgregarDatoDeFacturacionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogAgregarDatoDeFacturacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteMaster,
  ) { }

  ngOnInit(): void {
  }

  terminar = (datosFact: ClienteMasterCliente = null) => this.dialogRef.close(datosFact);

}
