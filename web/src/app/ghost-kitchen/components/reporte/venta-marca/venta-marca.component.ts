import {Component, OnDestroy, OnInit} from "@angular/core";

import * as moment from 'moment';
import { GLOBAL } from "../../../../shared/global";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { LocalstorageService } from "../../../../admin/services/localstorage.service";
import { saveAs } from "file-saver";
import { ReporteGkService } from "../../../services/reporte-gk.service";

@Component({
	selector: "app-venta-marca",
	templateUrl: "./venta-marca.component.html",
	styleUrls: ["./venta-marca.component.css"]
})
export class VentaMarcaComponent implements OnInit, OnDestroy {

	get configBotones() {
		const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
		return {
			showPdf: true, showHtml: false, showExcel: true,
			isPdfDisabled: deshabilitar,
			isExcelDisabled: deshabilitar
		}
	};

	public params: any       = {}
	public paramsToSend: any = {}
	public tituloArticulo    = "venta_marca"
	public cargando          = false
	private endSubs          = new Subscription()

	constructor(
		private snackBar: MatSnackBar,
		private ls: LocalstorageService,
		private ReporteSrvc: ReporteGkService
	) { }

	ngOnInit() {
		this.resetParams()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			fdel: moment().startOf("month").format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat)
		}
		this.cargando = false
	}

	requestPDF = (esExcel = 0) => {
		this.cargando            = true;
		this.paramsToSend        = JSON.parse(JSON.stringify(this.params));
		this.paramsToSend._excel = esExcel;
		this.paramsToSend.fdel   = moment(this.paramsToSend.fdel).format("YYYY-MM-DD");
		this.paramsToSend.fal    = moment(this.paramsToSend.fal).format("YYYY-MM-DD");

		this.endSubs.add(
			this.ReporteSrvc.generaVentaMarca(this.paramsToSend).subscribe(res => {
				this.cargando = false;
				if (res) {
					console.log(res)
					const blob = new Blob([res], {type: (+esExcel === 0 ? "application/pdf" : "application/vnd.ms-excel")});
					saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? "pdf" : "xls"}`);
				} else {
					this.snackBar.open("No se pudo generar el reporte...", "Reporte Ventas por Marca.", {duration: 3000});
				}
			})
		);
	}
}
