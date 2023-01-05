import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Cliente } from '../../../interfaces/cliente';

@Component({
  selector: 'app-form-cliente-dialog',
  templateUrl: './form-cliente-dialog.component.html',
  styleUrls: ['./form-cliente-dialog.component.css']
})
export class FormClienteDialogComponent implements OnInit {

  public cliente: Cliente;

  constructor(
    public dialogRef: MatDialogRef<FormClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data.cliente) {
      // console.log(this.data.cliente);
      this.cliente = this.data.cliente;
      // console.log(this.cliente);
    } else {
      this.cliente = {
        cliente: null, nombre: null, direccion: null, nit: null, telefono: null, correo: null,
        codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null, cui: null, pasaporte: null
      };
    }
  }

  clienteAgregado = (obj: Cliente) => {
    this.dialogRef.close(obj);
  }

  cancelar = () => this.dialogRef.close();

}
