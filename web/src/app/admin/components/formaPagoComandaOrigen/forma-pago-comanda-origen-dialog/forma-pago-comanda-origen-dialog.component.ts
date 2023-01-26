import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface IDataFPComandaOrigen {
  comanda_origen: number  
}

@Component({
  selector: 'app-forma-pago-comanda-origen-dialog',
  templateUrl: './forma-pago-comanda-origen-dialog.component.html',
  styleUrls: ['./forma-pago-comanda-origen-dialog.component.css']
})
export class FormaPagoComandaOrigenDialogComponent implements OnInit { 

  constructor(
    public dialogRef: MatDialogRef<FormaPagoComandaOrigenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataFPComandaOrigen
  ) { }

  ngOnInit(): void { }

  cancelar = () => this.dialogRef.close();
}
