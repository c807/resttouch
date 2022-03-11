import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClienteMasterTelefono, ClienteMasterCliente } from '../../../interfaces/cliente-master';

@Component({
  selector: 'app-dialog-cliente-master-cliente',
  templateUrl: './dialog-cliente-master-cliente.component.html',
  styleUrls: ['./dialog-cliente-master-cliente.component.css']
})
export class DialogClienteMasterClienteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogClienteMasterClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteMasterTelefono
  ) { }

  ngOnInit(): void {
  }

  terminar = (datosFactSel: ClienteMasterCliente = null) => this.dialogRef.close(datosFactSel);

}
