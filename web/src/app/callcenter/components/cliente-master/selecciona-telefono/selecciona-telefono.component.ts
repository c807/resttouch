import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Telefono } from '@callcenter-interfaces/telefono';
import { ClienteMaster } from '@callcenter-interfaces/cliente-master';

interface ISelectPhone {
  clienteMaster: ClienteMaster
  telefonos: Telefono[]
}

@Component({
  selector: 'app-selecciona-telefono',
  templateUrl: './selecciona-telefono.component.html',
  styleUrls: ['./selecciona-telefono.component.css']
})
export class SeleccionaTelefonoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SeleccionaTelefonoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISelectPhone
  ) { }

  ngOnInit(): void {
  }

  seleccionar = (obj: Telefono) => this.dialogRef.close(obj);

  cancelar = () => this.dialogRef.close();

}
