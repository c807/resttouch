import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { BodegaService } from '@wms-services/bodega.service';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { TipoMovimientoService } from '@wms-services/tipo-movimiento.service';
import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';
import { Bodega } from '@wms-interfaces/bodega';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { UsuarioSede } from '@admin-interfaces/acceso';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-resumen-egreso',
	templateUrl: './resumen-egreso.component.html',
	styleUrls: ['./resumen-egreso.component.css']
})
export class ResumenEgresoComponent implements OnInit, OnDestroy {

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
	public titulo: string = 'Resumen_egreso';
	public cargando = false;
	private endSubs = new Subscription();

	public tiposMovimiento: TipoMovimiento[] = [];
	public bodegas: Bodega[] = [];
	public estatus = [
		{ id: 1, descripcion: 'Abierto' },
		{ id: 2, descripcion: 'Confirmado' }
	];
	public sedes: UsuarioSede[] = [];

	constructor(
		private snackBar: MatSnackBar,
		private pdfServicio: ReportePdfService,
		private bodegaSrvc: BodegaService,
		private tipoMovimientoSrvc: TipoMovimientoService,
		private sedeSrvc: AccesoUsuarioService
	) { }

	ngOnInit() {
		this.getTipoMovimiento();
		// this.getBodega();
		this.resetParams();
		this.getSede();
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			fdel: moment().startOf('month').format(GLOBAL.dbDateFormat), //moment().format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			tipo_egreso: null,
			estatus_movimiento: null,
			bodega: null,
			sede: null
		};
		this.bodegas = [];
	}

	getTipoMovimiento = () => {
		this.tipoMovimientoSrvc.get({ egreso: 1 }).subscribe(res => {
			if (res) {
				this.tiposMovimiento = res;
			}
		});
	}

	getSede = (params: any = {}) => {
		this.endSubs.add(
			this.sedeSrvc.getSedes(params).subscribe(res => {
				this.sedes = res;
			})
		);
	}

	onSedesSelected = (obj: any) => {
		this.getBodega({ sede: this.params.sede });		
	}

	getBodega = (params: any = {}) => {
		this.endSubs.add(
			this.bodegaSrvc.get(params).subscribe(res => {
				this.bodegas = res;
			})
		);
	}

	requestPDF = (esExcel = 0) => {
		if (
			this.params.fdel && moment(this.params.fdel).isValid() &&
			this.params.fal && moment(this.params.fal).isValid() &&
			this.params.bodega
		) {
			this.paramsToSend = JSON.parse(JSON.stringify(this.params));
			this.paramsToSend._excel = esExcel;
			this.paramsToSend.fdel = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
			this.paramsToSend.fal = moment(this.paramsToSend.fal).format('YYYY-MM-DD');

			if (this.params.bodega !== undefined && this.params.bodega !== null) {
				let tmpBodega = this.bodegas.filter(obj => {
					return obj.bodega == this.params.bodega
				})[0]

				if (tmpBodega) {
					this.paramsToSend.bodega_nombre = tmpBodega.descripcion
				}
			}

			this.cargando = true;
			this.endSubs.add(
				this.pdfServicio.generar_resumen_egreso(this.paramsToSend).subscribe(res => {
					if (res) {
						const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
						saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
					} else {
						this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
					}
					this.cargando = false;
				})
			);
		} else {
			this.snackBar.open('Por favor ingrese todos los parámetros.', 'Resumen egreso', { duration: 7000 });
		}
	}
}
