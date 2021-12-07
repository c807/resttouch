import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ClienteMaster } from '../../../interfaces/cliente-master';
import { FormClienteMasterComponent } from '../form-cliente-master/form-cliente-master.component';

interface IDataClienteMasterDialog {
  clienteMaster: ClienteMaster
}


@Component({
  selector: 'app-cliente-master-dialog',
  templateUrl: './cliente-master-dialog.component.html',
  styleUrls: ['./cliente-master-dialog.component.css']
})
export class ClienteMasterDialogComponent implements OnInit {

  @ViewChild('frmClienteMaster') frmClienteMaster: FormClienteMasterComponent;
  public clienteMaster: ClienteMaster;

  constructor(
    public dialogRef: MatDialogRef<ClienteMasterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataClienteMasterDialog
  ) { }

  ngOnInit(): void {
    if (this.data.clienteMaster) {
      this.clienteMaster = this.data.clienteMaster;
    }
  }

  cancelar = () => this.dialogRef.close();

}
