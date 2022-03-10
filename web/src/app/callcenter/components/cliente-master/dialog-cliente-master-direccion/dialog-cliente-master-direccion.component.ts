import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClienteMasterTelefono, ClienteMasterDireccionResponse } from '../../../interfaces/cliente-master';

@Component({
  selector: 'app-dialog-cliente-master-direccion',
  templateUrl: './dialog-cliente-master-direccion.component.html',
  styleUrls: ['./dialog-cliente-master-direccion.component.css']
})
export class DialogClienteMasterDireccionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogClienteMasterDireccionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClienteMasterTelefono
  ) { }

  ngOnInit(): void {
    // console.log(this.data);
  }

  terminar = (dirSel: ClienteMasterDireccionResponse = null) => this.dialogRef.close(dirSel);
}
