import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { CategoriaGrupoResponse } from '@wms-interfaces/categoria-grupo';
import { ArticuloService } from '@wms-services/articulo.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'app-margen-receta',
	templateUrl: './margen-receta.component.html',
	styleUrls: ['./margen-receta.component.css']
})
export class MargenRecetaComponent implements OnInit, OnDestroy {

	get configBotones() {
		const deshabilitar = false
		return {
			showPdf: true, showHtml: false, showExcel: true,
			isPdfDisabled: deshabilitar,
			isExcelDisabled: deshabilitar
		}
	};

	public params: any = { _coniva: '0' };
	public titulo: string = 'Margen_receta';
	public subCategorias: CategoriaGrupoResponse[] = [];
	public cargando = false;
	public archivo_pdf: string = null;

	private endSubs = new Subscription();

	constructor(
		private snackBar: MatSnackBar,
		private pdfServicio: ReportePdfService,
		private ls: LocalstorageService,
		private articuloSrvc: ArticuloService
	) { }

	ngOnInit() {
		this.getSubCategorias()
		this.resetParams()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	resetParams = () => {
		this.params = {
			categoria_grupo: null,
			_coniva: '0'
		}
		this.archivo_pdf = null;
	}

	getSubCategorias = () => {
		this.endSubs.add(
			this.articuloSrvc.getCategoriasGrupos({ _activos: true, _sede: this.ls.get(GLOBAL.usrTokenVar).sede }).subscribe(res => {
				this.subCategorias = res.map(r => {
					r.categoria_grupo = +r.categoria_grupo;
					return r;
				});
			})
		);
	}

	requestPDF = (esExcel = 0) => {

		if (this.params.categoria_grupo === null) {
			delete this.params.categoria_grupo
		}

		this.params._excel = esExcel;

		this.cargando = true;
		this.endSubs.add(
			this.pdfServicio.generar_margen_receta(this.params).subscribe(res => {
				if (res) {
					const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
					if (+esExcel === 0) {
						this.archivo_pdf = URL.createObjectURL(blob);
					} else {
						saveAs(blob, `${this.titulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
					}
				} else {
					this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
				}
				this.cargando = false;
			})
		);
	}
}
