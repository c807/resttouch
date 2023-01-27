import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogCocina } from '@shared-interfaces/config-reportes';

export class ConfirmDialogModel {
  constructor(
    public title: string,
    public message: string,
    public lblBtnConfirm: string,
    public lblBtnDeny: string,
    public datos: DialogCocina,
    public showTimer?: boolean
  ) { }
}

@Component({
  selector: 'app-dialog-cocina',
  templateUrl: './dialog-cocina.component.html',
  styleUrls: ['./dialog-cocina.component.css']
})
export class DialogCocinaComponent implements OnInit {

  public title: string;
  public message: string;
  public lblBtnConfirm: string;
  public lblBtnDeny: string;
  public datos: DialogCocina;

  constructor(
    public dialogRef: MatDialogRef<DialogCocinaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel
  ) {
    this.title = data.title;
    this.message = data.message;
    this.lblBtnConfirm = data.lblBtnConfirm;
    this.lblBtnDeny = data.lblBtnDeny;
    this.datos = {
      respuesta: false,
      tiempo: '00:00'
    };
  }

  ngOnInit() {

  }

  onConfirm(datos: DialogCocina): void {
    this.datos.respuesta = true;
    this.datos.tiempo = datos.tiempo;
    this.dialogRef.close(this.datos);
  }

  onDismiss(): void {
    this.datos.respuesta = false;
    this.dialogRef.close(this.datos);
  }

}
