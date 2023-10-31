import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-turno',
  templateUrl: './dialog-turno.component.html',
  styleUrls: ['./dialog-turno.component.css']
})
export class DialogTurnoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogTurnoComponent>,
  ) { }

  ngOnInit(): void {
  }

  terminar = () => this.dialogRef.close();

}
