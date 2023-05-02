import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-form-presentacion',
  templateUrl: './dialog-form-presentacion.component.html',
  styleUrls: ['./dialog-form-presentacion.component.css']
})
export class DialogFormPresentacionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogFormPresentacionComponent>,
  ) { }

  ngOnInit(): void {
  }

}
