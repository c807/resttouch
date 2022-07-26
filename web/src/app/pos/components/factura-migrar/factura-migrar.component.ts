import { Component, OnInit, OnDestroy } from "@angular/core";

import * as moment from "moment";
import { GLOBAL } from "../../../shared/global";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { UsuarioSede } from "../../../admin/interfaces/acceso";
import { LocalstorageService } from "../../../admin/services/localstorage.service";
import { AccesoUsuarioService } from "../../../admin/services/acceso-usuario.service";
import { FacturaService } from "../../services/factura.service";

@Component({
	selector: 'app-factura-migrar',
	templateUrl: './factura-migrar.component.html',
	styleUrls: ['./factura-migrar.component.css']
})
export class FacturaMigrarComponent implements OnInit, OnDestroy {

	public params: any          = {}
	public paramsToSend: any    = {}
	public lista: any           = []
	public sedes: UsuarioSede[] = []
	
	public cargando = false
	private endSubs = new Subscription()

	constructor(
		private snackBar: MatSnackBar,
		private ls: LocalstorageService,
		private facturaSrvc: FacturaService,
		private sedeSrvc: AccesoUsuarioService
	) { }

	ngOnInit() {
		this.getSede()
		this.resetParams()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			fdel: moment().startOf("month").format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			sede: this.ls.get(GLOBAL.usrTokenVar).sede
		}
	}

	getSede = () => {
		this.endSubs.add(
			this.sedeSrvc.getSedes({}).subscribe(res => {
				this.sedes = res
			})
		)
	}

	toggleChk = (chk) => {
		this.lista.forEach(function (obj) {
			obj.checked = chk.checked
		})
	}

	getLista () {
		if (
			this.params.fdel && moment(this.params.fdel).isValid() && 
			this.params.fal && moment(this.params.fal).isValid()
		) {
			this.paramsToSend      = JSON.parse(JSON.stringify(this.params));
			this.paramsToSend.fdel = moment(this.paramsToSend.fdel).format("YYYY-MM-DD");
			this.paramsToSend.fal  = moment(this.paramsToSend.fal).format("YYYY-MM-DD");


			this.cargando = true
			this.lista    = []

			this.endSubs.add(
				this.facturaSrvc.getListaFactura(this.paramsToSend).subscribe(res => {
					if (res) {
						if (res.exito) {
							this.lista = res.items
						} else {
							this.snackBar.open(res.mensaje, "Factura", { duration: 3000 })
						}
					} else {
						this.snackBar.open("No se logró obtener los datos...", "Factura", { duration: 3000 })
					}
					this.cargando = false
				})
			)
		} else {
			this.snackBar.open("Por favor ingrese todos los parámetros.", "Factura", { duration: 7000 })
		}
	}

	enviarFacturas () {
		let facturas = this.lista.filter(obj => obj.checked === true).map(obj => obj.factura)
		
		if (facturas.length === 0) {
			this.snackBar.open("Debe seleccionar una factura", "Factura", { duration: 3000 })
		} else {
			this.cargando = true

			this.endSubs.add(
				this.facturaSrvc.enviarFacturaConta({facturas: facturas}).subscribe(res => {
					if (res) {
						this.snackBar.open(res.mensaje, "Factura", { duration: 7000 })
					} else {
						this.snackBar.open("No se logró procesar los datos...", "Factura", { duration: 3000 })
					}
					this.cargando = false
				})
			)
		}
	}
}
