import {Component, OnDestroy, OnInit} from '@angular/core';

import * as moment from "moment";
import { GLOBAL } from "../../../../shared/global";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { saveAs } from "file-saver";
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';
import { AccesoUsuarioService } from '../../../../admin/services/acceso-usuario.service';
import { BodegaService } from 'src/app/wms/services/bodega.service';
import { UsuarioSede } from 'src/app/admin/interfaces/acceso';
import { Bodega } from 'src/app/wms/interfaces/bodega';

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
	public bodegas: Bodega[] = [];
	public sedes: UsuarioSede[] = [];
	private endSubs = new Subscription();

	constructor(
		private snackBar: MatSnackBar,
		private ReporteSrvc: ReportePdfService,
		private sedeSrvc: AccesoUsuarioService,
		private bodegaSrvc: BodegaService
	) { }

	ngOnInit() {
		this.resetParams();
		this.getSede();
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	getSede = (params: any = {}) => {
		this.endSubs.add(
		  this.sedeSrvc.getSedes(params).subscribe(res => {
			this.sedes = res;
		  })
		);
	  }
	
	  getBodega = (params: any = {}) => {
		this.endSubs.add(
		  this.bodegaSrvc.get(params).subscribe(res => {
			this.bodegas = res;
		  })
		);
	  }
	
	  onSedesSelected = (obj: any) => {
		this.getBodega({ sede: this.params.sede });
	  }	

	resetParams = () => {
		this.params = {
			fdel: moment().format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			_alfa: true,
			sede: null,
			bodega: null
		}
		this.bodegas = [];
	}

	requestPDF = (esExcel = 0) => {
		this.cargando            = true;
		this.paramsToSend        = JSON.parse(JSON.stringify(this.params));
		this.paramsToSend._excel = esExcel;
		this.paramsToSend.fdel   = moment(this.paramsToSend.fdel).format("YYYY-MM-DD");
		this.paramsToSend.fal    = moment(this.paramsToSend.fal).format("YYYY-MM-DD");
		this.paramsToSend._alfa    = this.params._alfa;
		this.paramsToSend.bodega = this.params.bodega;

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
