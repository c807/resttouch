import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-seguimiento-callcenter',
  templateUrl: './dialog-seguimiento-callcenter.component.html',
  styleUrls: ['./dialog-seguimiento-callcenter.component.css']
})
export class DialogSeguimientoCallcenterComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogSeguimientoCallcenterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  cerrar = () => this.dialogRef.close();

}
