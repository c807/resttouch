import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, openInNewTab } from '@shared/global';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { SubCategoriaSimpleSearch } from '@wms-interfaces/categoria-grupo';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin-services/acceso-usuario.service';
import { ArticuloService } from '@wms-services/articulo.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-consumo-articulo',
	templateUrl: './consumo-articulo.component.html',
	styleUrls: ['./consumo-articulo.component.css']
})
export class ConsumoArticuloComponent implements OnInit, OnDestroy {

	get configBotones() {
		const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid()
		return {
			showPdf: true, showHtml: false, showExcel: true,
			isPdfDisabled: deshabilitar,
			isExcelDisabled: deshabilitar
		}
	};

	public params: any = {};
	public paramsToSend: any = {};
	public titulo: string = 'Consumo_articulo';
	public subCategorias: SubCategoriaSimpleSearch[] = [];
	public sedes: UsuarioSede[] = [];
	public cargando = false;
	// public archivo_pdf: any = null;

	private endSubs = new Subscription();

	constructor(
		private snackBar: MatSnackBar,
		private pdfServicio: ReportePdfService,
		private ls: LocalstorageService,
		private articuloSrvc: ArticuloService,
		private sedeSrvc: AccesoUsuarioService,
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
			fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			sede: this.ls.get(GLOBAL.usrTokenVar).sede,
			categoria_grupo: null,
			_coniva: '0'
		}
		// this.archivo_pdf = null;
	}

	getSede = (params: any = {}) => {
		this.endSubs.add(
			this.sedeSrvc.getSedes(params).subscribe(res => {
				this.sedes = res;
			})
		);
	}

	onSedesSelected = (obj: any) => {
		let param = {
			_activos: true,
			sede: this.ls.get(GLOBAL.usrTokenVar).sede
		}

		if (this.params.sede.length > 0) {
			param.sede = this.params.sede
		}
		
		this.getSubCategorias(param);
	}

	getSubCategorias = (param: any) => {
		this.endSubs.add(
			this.articuloSrvc.getCategoriasGruposSimple(param).subscribe(res => {
				this.subCategorias = res.map(r => {
					r.categoria_grupo = +r.categoria_grupo;
					return r;
				});
			})
		);
	}

	requestPDF = (esExcel = 0) => {
		if (
			this.params.fdel && moment(this.params.fdel).isValid() && 
			this.params.fal && moment(this.params.fal).isValid()
		) {
			this.paramsToSend        = JSON.parse(JSON.stringify(this.params));
			this.paramsToSend._excel = esExcel;
			this.paramsToSend.fdel   = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
			this.paramsToSend.fal    = moment(this.paramsToSend.fal).format('YYYY-MM-DD');

			if (this.params.categoria_grupo !== undefined && this.params.categoria_grupo !== null) {
				let tmpGrupo = this.subCategorias.filter(obj => {
					return obj.categoria_grupo == this.params.categoria_grupo
				})[0]

				if (tmpGrupo) {
					this.paramsToSend.grupo_nombre  = `${tmpGrupo.descripcion} (${tmpGrupo.categoria})`
				}
			}

			this.cargando = true;
			this.endSubs.add(
				this.pdfServicio.generar_consumo_articulo(this.paramsToSend).subscribe(res => {
					if (res) {
						const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
						if(+esExcel === 0) {							
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
			this.snackBar.open('Por favor ingrese todos los parámetros.', 'Resumen consumo articulo', { duration: 7000 });
		}
	}
}
