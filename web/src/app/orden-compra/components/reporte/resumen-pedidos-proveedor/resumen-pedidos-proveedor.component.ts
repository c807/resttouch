import {Component, OnDestroy, OnInit} from '@angular/core';

import * as moment from "moment";
import { GLOBAL } from "../../../../shared/global";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { saveAs } from "file-saver";
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';

@Component({
	selector: "app-resumen-pedidos-proveedor",
	templateUrl: "./resumen-pedidos-proveedor.component.html",
	styleUrls: ["./resumen-pedidos-proveedor.component.css"]
})
export class ResumenPedidosProveedorComponent implements OnInit, OnDestroy {

	get configBotones() {
		const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
		return {
			showPdf: true, showHtml: false, showExcel: true,
			isPdfDisabled: deshabilitar,
			isExcelDisabled: deshabilitar
		}
	};

	public params: any = {};
	public paramsToSend: any = {};
	public titulo: string = "Resumen_pedidos_proveedor";
	public cargando = false;
	private endSubs = new Subscription();

	constructor(
		private snackBar: MatSnackBar,
		private ReporteSrvc: ReportePdfService
	) { }

	ngOnInit() {
		this.resetParams()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			fdel: moment().format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat)
		}
	}

	requestPDF = (esExcel = 0) => {
		this.cargando            = true;
		this.paramsToSend        = JSON.parse(JSON.stringify(this.params));
		this.paramsToSend._excel = esExcel;
		this.paramsToSend.fdel   = moment(this.paramsToSend.fdel).format("YYYY-MM-DD");
		this.paramsToSend.fal    = moment(this.paramsToSend.fal).format("YYYY-MM-DD");

		this.endSubs.add(
			this.ReporteSrvc.generar_archivo_pedidos_proveedor(this.paramsToSend).subscribe(res => {
				this.cargando = false;
				if (res) {
					const blob = new Blob([res], {type: (+esExcel === 0 ? "application/pdf" : "application/vnd.ms-excel")});
					saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? "pdf" : "xls"}`);
				} else {
					this.snackBar.open("No se pudo generar el reporte...", "Resumen pedidos proveedor.", {duration: 3000});
				}
			})
		);
	}
}
