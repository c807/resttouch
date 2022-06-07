import {Component, OnDestroy, OnInit} from '@angular/core';

import * as moment from 'moment';
import {GLOBAL} from "../../../../shared/global";
import {UsuarioSedeRPT} from "../../../../admin/interfaces/acceso";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Usuario} from "../../../../admin/interfaces/usuario";
import {Subscription} from "rxjs";
import {TipoDomicilio} from "../../../interfaces/tipo-domicilio";
import {AccesoUsuarioService} from "../../../../admin/services/acceso-usuario.service";
import {LocalstorageService} from "../../../../admin/services/localstorage.service";
import {saveAs} from 'file-saver';
import {ReportesCallcenter} from "../../../services/reportes-callcenter.service";
import { ArticuloService } from '../../../../wms/services/articulo.service';
import { Categoria } from '../../../../wms/interfaces/categoria';
import { CategoriaGrupo } from '../../../../wms/interfaces/categoria-grupo';

@Component({
	selector: 'app-venta-callcenter',
	templateUrl: './venta-callcenter.component.html',
	styleUrls: ['./venta-callcenter.component.css']
})
export class VentaCallcenterComponent implements OnInit {

	get configBotones() {
		const deshabilitar = !moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
		return {
			showPdf: true, showHtml: false, showExcel: true,
			isPdfDisabled: deshabilitar,
			isExcelDisabled: deshabilitar
		}
	};

	public tipoReporte: any[] = [];
	public params: any = {};
	public paramsToSend: any = {};
	public msgGenerandoReporte: string = null;
	public sedes: UsuarioSedeRPT[] = [];
	public categorias: Categoria[] = [];
	public categoriasGruposPadre: CategoriaGrupo[] = [];
  	public categoriasGrupos: CategoriaGrupo[] = [];
	public tituloArticulo = 'venta_callcenter';
	public cargando = false;
	public usuarios: Usuario[] = [];
	public tiposDomicilio: TipoDomicilio[] = [];
	public listaCategoria: any[] = [];
	public listaSubCategoria: any[] = [];

	private endSubs = new Subscription();

	constructor(
		private snackBar: MatSnackBar,
		private ReporteSrvc: ReportesCallcenter,
		private sedeSrvc: AccesoUsuarioService,
		private ls: LocalstorageService,
		private articuloSrvc: ArticuloService
	) {
	}

	ngOnInit() {
		this.loadTipoReporte();
		this.loadSedes();
		this.loadCategorias();
		this.resetParams();
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe();
	}

	loadSedes = () => {
		this.endSubs.add(
			this.sedeSrvc.getSedes({reporte: true}).subscribe(res => {
				this.sedes = res;
			})
		);
	}

	loadCategorias = () => {
		this.endSubs.add(      
			this.articuloSrvc.getCategorias({_todos: true}).subscribe(res => {
				this.categorias = res
			})
		);
	}

	loadSubCategorias = (idcategoria: number) => {
		this.endSubs.add(      
			this.articuloSrvc.getCategoriasGrupos({categoria: idcategoria}).subscribe(res => {
				let data = []
				if (res) {
					this.categoriasGrupos = this.articuloSrvc.adaptCategoriaGrupoResponse(res);
					
					let tmpCat = this.categorias.filter(obj => {
						return obj.categoria == idcategoria
					})[0]

					let tmpSede = this.sedes.filter(obj => {
						return obj.sede.sede == tmpCat.sede
					})[0]

					let tmp = {
						indice: `${tmpCat.descripcion} - ${tmpSede.sede.nombre} (${tmpSede.sede.alias})`,
						detalle: this.categoriasGrupos.filter(obj => {
							return obj.categoria == idcategoria
						})
					}

					data.push(tmp)
				}
				
				this.listaSubCategoria = data
			})
		);
	}

	loadTipoReporte = () => {
		this.tipoReporte = [
			{tipo_reporte: 1, descripcion: "Detallado"},
			{tipo_reporte: 2, descripcion: "Resumido"}
		];
	}

	onSedeSelected = (obj: any) => {
		this.setListaCategoria()
	}

	onCategoriaSelected = (obj: any) => {
		this.loadSubCategorias(obj.value);
	}

	setListaCategoria () {
		let data = []
		if (this.params.sede !== undefined) {

			for(var i in this.params.sede) {

				let tmpSede = this.sedes.filter(obj => {
					return obj.sede.sede == this.params.sede[i]
				})[0]

				let tmp = {
					indice: `${tmpSede.sede.nombre} (${tmpSede.sede.alias})`,
					detalle: this.categorias.filter(obj => {
						return obj.sede == this.params.sede[i]
					})
				}

				data.push(tmp)
			}
		}

		this.listaCategoria = data
	}

	/*setListaSubCategoria () {
		let data = []
		if (this.params.categoria !== undefined) {

			let tmpCat = this.categorias.filter(obj => {
				return obj.categoria == this.params.categoria
			})[0]

			let tmpSede = this.sedes.filter(obj => {
				return obj.sede.sede == tmpCat.sede
			})[0]

			let tmp = {
				indice: `${tmpCat.descripcion} - ${tmpSede.sede.nombre} (${tmpSede.sede.alias})`,
				detalle: this.categoriasGrupos.filter(obj => {
					return obj.categoria == this.params.categoria
				})
			}

			data.push(tmp)
		}

		this.listaSubCategoria = data
	}*/

	resetParams = () => {
		this.msgGenerandoReporte = null;
		this.params = {
			fdel: moment().startOf("month").format(GLOBAL.dbDateFormat), //moment().format(GLOBAL.dbDateFormat),
			fal: moment().format(GLOBAL.dbDateFormat),
			sede: undefined,
			categoria: undefined,
			categoria_grupo: undefined,
			tipo_reporte: 1
		};
		this.cargando = false;
	}

	requestPDF = (esExcel = 0) => {
		this.cargando            = true;
		this.paramsToSend        = JSON.parse(JSON.stringify(this.params));
		this.paramsToSend._excel = esExcel;
		this.paramsToSend.fdel   = moment(this.paramsToSend.fdel).format('YYYY-MM-DD');
		this.paramsToSend.fal    = moment(this.paramsToSend.fal).format('YYYY-MM-DD');

		if (this.params.sede !== undefined && this.params.sede !== null) {
			const idx = this.sedes.findIndex(s => +s.sede.sede === +this.params.sede);
			if (idx > -1) {
				this.paramsToSend.sedeNName = this.sedes[idx].sede.nombre;
			}
		}

		if (this.params.tipo_venta !== undefined && this.params.tipo_venta !== null) {
			const idx = this.tiposDomicilio.findIndex(td => +td.tipo_domicilio === +this.params.tipo_venta);
			if (idx > -1) {
				this.paramsToSend.tipoDName = this.tiposDomicilio[idx].descripcion;
			}
		}

		this.endSubs.add(
			this.ReporteSrvc.generar_archivo_venta(this.paramsToSend).subscribe(res => {
				this.cargando = false;
				if (res) {
					console.log(res)
					const blob = new Blob([res], {type: (+esExcel === 0 ? "application/pdf" : "application/vnd.ms-excel")});
					saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? "pdf" : "xls"}`);
				} else {
					this.snackBar.open("No se pudo generar el reporte...", "Reporte ventas Call Center.", {duration: 3000});
				}
			})
		);
	}

}
