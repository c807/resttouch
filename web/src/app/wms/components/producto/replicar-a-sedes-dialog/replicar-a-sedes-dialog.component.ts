import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Articulo } from '@wms-interfaces/articulo';

@Component({
  selector: 'app-replicar-a-sedes-dialog',
  templateUrl: './replicar-a-sedes-dialog.component.html',
  styleUrls: ['./replicar-a-sedes-dialog.component.css']
})
export class ReplicarASedesDialogComponent implements OnInit {

  public articulo: Articulo = null;

  constructor(
    public dialogRef: MatDialogRef<ReplicarASedesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data.articulo) {
      this.articulo = this.data.articulo;
    }
  }

}
