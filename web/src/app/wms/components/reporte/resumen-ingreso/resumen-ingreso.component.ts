import { Component, OnDestroy, OnInit } from '@angular/core';

import * as moment from "moment";
import { GLOBAL } from "../../../../shared/global";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { saveAs } from "file-saver";
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
import { TipoMovimientoService } from '../../../services/tipo-movimiento.service';
import { BodegaService } from '../../../services/bodega.service';
import { TipoMovimiento } from '../../../interfaces/tipo-movimiento';
import { Bodega } from '../../../interfaces/bodega';

@Component({
	selector: 'app-resumen-ingreso',
	templateUrl: './resumen-ingreso.component.html',
	styleUrls: ['./resumen-ingreso.component.css']
})
export class ResumenIngresoComponent implements OnInit, OnDestroy {

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
	public titulo: string = "Resumen_ingreso";
	public cargando = false;
	private endSubs = new Subscription();
	public tiposMovimiento: TipoMovimiento[] = [];
	public bodegas: Bodega[] = [];
	public iva = [
		{id: 1, descripcion: "Con IVA"},
		{id: 2, descripcion: "Sin IVA"}
	];

	constructor(
		private snackBar: MatSnackBar,
		private pdfServicio: ReportePdfService,
		private tipoMovimientoSrvc: TipoMovimientoService,
		private bodegaSrvc: BodegaService
	) { }

	ngOnInit() {
		this.getTipoMovimiento()
		this.getBodega()
		this.resetParams()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			fdel: moment().startOf("month").format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			tipo_egreso: null,
			bodega: null,
			iva: 1
		}
	}

	getTipoMovimiento = () => {
		this.tipoMovimientoSrvc.get({ ingreso: 1 }).subscribe(res => {
			if (res) {
				this.tiposMovimiento = res;
			}
		});
	}

	getBodega = () => {
		this.endSubs.add(
			this.bodegaSrvc.get({}).subscribe(res => {
				this.bodegas = res;
			})
		);
	}

	requestPDF = (esExcel = 0) => {
		if (
			this.params.fdel && moment(this.params.fdel).isValid() && 
			this.params.fal && moment(this.params.fal).isValid()
		) {
			this.cargando            = true;
			this.paramsToSend        = JSON.parse(JSON.stringify(this.params));
			this.paramsToSend._excel = esExcel;
			this.paramsToSend.fdel   = moment(this.paramsToSend.fdel).format("YYYY-MM-DD");
			this.paramsToSend.fal    = moment(this.paramsToSend.fal).format("YYYY-MM-DD");

			this.endSubs.add(
				this.pdfServicio.generar_resumen_ingreso(this.paramsToSend).subscribe(res => {
					if (res) {
						const blob = new Blob([res], { type: (+esExcel === 0 ? "application/pdf" : "application/vnd.ms-excel") });
						saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? "pdf" : "xls"}`);
					} else {
						this.snackBar.open("No se pudo generar el reporte...", this.titulo, { duration: 3000 });
					}
					this.cargando = false;
				})
			);
		} else {
			this.snackBar.open("Por favor ingrese todos los parámetros.", "Resumen ingresos", { duration: 7000 });
		}
	}
}
