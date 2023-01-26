import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SedeVendorTercero } from '@admin-interfaces/vendor-tercero';

interface IDataSedeVendorTercero {
  vendor_tercero: number;
  nombre_vendor_tercero: string;
}

@Component({
  selector: 'app-form-sede-vendor-tercero-dialog',
  templateUrl: './form-sede-vendor-tercero-dialog.component.html',
  styleUrls: ['./form-sede-vendor-tercero-dialog.component.css']
})
export class FormSedeVendorTerceroDialogComponent implements OnInit {

  public sedeVendorTercero: SedeVendorTercero;

  constructor(
    public dialogRef: MatDialogRef<FormSedeVendorTerceroDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataSedeVendorTercero
  ) {
    this.sedeVendorTercero = {
      sede_vendor_tercero: null, sede: null, vendor_tercero: data.vendor_tercero
    }
  }

  ngOnInit(): void {
  }

  cancelar = () => this.dialogRef.close();

}
