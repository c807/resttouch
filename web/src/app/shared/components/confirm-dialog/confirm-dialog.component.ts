import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export class ConfirmDialogModel {
  constructor(
    public title: string,
    public message: string,
    public lblBtnConfirm: string,
    public lblBtnDeny: string = '',
    public config: any = null,
    public showAlert = false
  ) { }
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  public title: string;
  public message: string;
  public lblBtnConfirm: string;
  public lblBtnDeny: string;
  public config: any;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel
  ) {
    this.title = data.title;
    this.message = data.message;
    this.lblBtnConfirm = data.lblBtnConfirm;
    this.lblBtnDeny = data.lblBtnDeny;
    this.config = data.config;
    // console.log(this.config);
  }

  ngOnInit() {
  }

  onConfirm(): void {
    if (this.config !== null) {
      this.dialogRef.close({ resultado: true, config: this.config });
    } else {
      this.dialogRef.close(true);
    }
  }

  onDismiss(): void {
    if (this.config !== null) {
      this.dialogRef.close({ resultado: false, config: this.config });
    } else {
      this.dialogRef.close(false);
    }
  }
}
