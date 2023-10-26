import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, openInNewTab } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { TipoMovimientoService } from '@wms-services/tipo-movimiento.service';
import { BodegaService } from '@wms-services/bodega.service';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';
import { Bodega } from '@wms-interfaces/bodega';
import { UsuarioSede } from '@admin-interfaces/acceso';

import { Subscription } from 'rxjs';

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
	public titulo: string = 'Resumen_ingreso';
	public cargando = false;
	private endSubs = new Subscription();
	public tiposMovimiento: TipoMovimiento[] = [];
	public bodegas: Bodega[] = [];
	public sedes: UsuarioSede[] = [];
	public iva = [
		{ id: 1, descripcion: 'Con IVA' },
		{ id: 2, descripcion: 'Sin IVA' }
	];
	public estatus = [
		{ id: 1, descripcion: 'Abierto' },
		{ id: 2, descripcion: 'Confirmado' }
	];

	// public archivo_pdf: string = null;

	constructor(
		private snackBar: MatSnackBar,
		private pdfServicio: ReportePdfService,
		private tipoMovimientoSrvc: TipoMovimientoService,
		private bodegaSrvc: BodegaService,
		private sedeSrvc: AccesoUsuarioService
	) { }

	ngOnInit() {
		this.getTipoMovimiento()
		//this.getBodega()
		this.getSede()
		this.resetParams()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			tipo_egreso: null,
			estatus_movimiento: null,
			bodega: null,
			sede: null,
			iva: 1
		}
		// this.archivo_pdf = null;
	}

	getTipoMovimiento = () => {
		this.tipoMovimientoSrvc.get({ ingreso: 1 }).subscribe(res => {
			if (res) {
				this.tiposMovimiento = res;
			}
		});
	}

	getBodega = (params: any = {}) => {
		this.endSubs.add(
			this.bodegaSrvc.get(params).subscribe(res => {
				this.bodegas = res;
			})
		);
	}

	getSede = () => {
		this.endSubs.add(
			this.sedeSrvc.getSedes({}).subscribe(res => {
				this.sedes = res;
			})
		);
	}

	onSedesSelected = (obj: any) => {
		this.getBodega({ sede: this.params.sede });
		this.params.bodega = null
	}

	requestPDF = (esExcel = 0) => {
		if (
			this.params.fdel && moment(this.params.fdel).isValid() &&
			this.params.fal && moment(this.params.fal).isValid()
		) {
			this.cargando = true;
			this.paramsToSend = JSON.parse(JSON.stringify(this.params));
			this.paramsToSend._excel = esExcel;
			this.paramsToSend.fdel = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
			this.paramsToSend.fal = moment(this.paramsToSend.fal).format('YYYY-MM-DD');

			this.endSubs.add(
				this.pdfServicio.generar_resumen_ingreso(this.paramsToSend).subscribe(res => {
					if (res) {
						const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
						if (+esExcel === 0) {							
							openInNewTab(URL.createObjectURL(blob));
						} else {
							saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
						}
					} else {
						this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
					}
					this.cargando = false;
				})
			);
		} else {
			this.snackBar.open('Por favor ingrese todos los parámetros.', 'Resumen ingresos', { duration: 7000 });
		}
	}
}
