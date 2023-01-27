import { Component, OnInit, Inject, OnDestroy } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

import { FacturaService } from '@pos-services/factura.service'
import { DresultadoItemComponent } from '@pos-components/facturaManual/dresultado-item/dresultado-item.component'

import { Subscription } from 'rxjs'

@Component({
	selector: 'app-dresultado-lista',
	templateUrl: './dresultado-lista.component.html',
	styleUrls: ['./dresultado-lista.component.css']
})
export class DresultadoListaComponent implements OnInit, OnDestroy {

	public datos: any
	public cargando: boolean
	private endSubs = new Subscription()

	constructor(
		private facturaSrvc: FacturaService,
		public dialog: MatDialog,
		public dialogRef: MatDialogRef<DresultadoListaComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {

	}

	ngOnInit() {
		this.cargando = false
		this.getlistaResultado()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	getlistaResultado = () => {
		this.cargando = true
		this.endSubs.add(
			this.facturaSrvc.getFacturaFel(this.data.factura).subscribe(res => {
				if (res) {
					this.datos = res;
					this.cargando = false;
				}
			})
		)
	}

	setItemResultado = (obj: any) => {
		this.dialog.open(DresultadoItemComponent, {
			data: obj, width: '90%', height: '82%'
		});		
	}
}
