import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ClienteMaster } from '../../../interfaces/cliente-master';
import { FormClienteMasterComponent } from '../form-cliente-master/form-cliente-master.component';
import { ClienteMasterTelefonoComponent } from '../cliente-master-telefono/cliente-master-telefono.component';

interface IDataClienteMasterDialog {
  clienteMaster: ClienteMaster,
  numero?: string
}

@Component({
  selector: 'app-cliente-master-dialog',
  templateUrl: './cliente-master-dialog.component.html',
  styleUrls: ['./cliente-master-dialog.component.css']
})
export class ClienteMasterDialogComponent implements OnInit {

  @ViewChild('frmClienteMaster') frmClienteMaster: FormClienteMasterComponent;
  @ViewChild('frmClienteMasterTelefono') frmClienteMasterTelefono: ClienteMasterTelefonoComponent;
  public clienteMaster: ClienteMaster;

  constructor(
    public dialogRef: MatDialogRef<ClienteMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataClienteMasterDialog
  ) { }

  ngOnInit(): void {
    // console.log(this.data);
    if (this.data.clienteMaster) {
      this.clienteMaster = this.data.clienteMaster;
    }
  }

  cancelar = () => this.dialogRef.close(this.clienteMaster);

  clienteMasterSvd = (cliMas: ClienteMaster) => {
    this.clienteMaster = cliMas;
    if (this.data.numero && this.data.numero.trim().length >= 8) {
      this.frmClienteMasterTelefono.clienteMaster = this.clienteMaster;
      this.frmClienteMasterTelefono.telefono = { telefono: null, numero: this.data.numero.trim() };
      this.frmClienteMasterTelefono.checkTelefono();
    }
  }

}
