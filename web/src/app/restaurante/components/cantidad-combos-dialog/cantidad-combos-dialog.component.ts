import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cantidad-combos-dialog',
  templateUrl: './cantidad-combos-dialog.component.html',
  styleUrls: ['./cantidad-combos-dialog.component.css']
})
export class CantidadCombosDialogComponent implements OnInit {

  public cantidadCombos = 1;

  constructor(
    public dialogRef: MatDialogRef<CantidadCombosDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  terminar = () => this.dialogRef.close(this.cantidadCombos);

}
