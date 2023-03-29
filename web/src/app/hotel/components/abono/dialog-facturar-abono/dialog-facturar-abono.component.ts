import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Abono } from '@hotel/interfaces/abono';

interface IDataDialog {
  abono: Abono
}

@Component({
  selector: 'app-dialog-facturar-abono',
  templateUrl: './dialog-facturar-abono.component.html',
  styleUrls: ['./dialog-facturar-abono.component.css']
})
export class DialogFacturarAbonoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogFacturarAbonoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataDialog,
  ) { }

  ngOnInit(): void {
  }

}
