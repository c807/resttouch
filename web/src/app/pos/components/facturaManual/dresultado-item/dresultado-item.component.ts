import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"

@Component({
	selector: "app-dresultado-item",
	templateUrl: "./dresultado-item.component.html",
	styleUrls: ["./dresultado-item.component.css"]
})
export class DresultadoItemComponent implements OnInit {

	public resJson: any

	constructor(
		public dialogRef: MatDialogRef<DresultadoItemComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
		) { }

	ngOnInit(){
		this.resJson = JSON.stringify(this.data)
	}
}