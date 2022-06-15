import { Component, OnInit, OnDestroy } from "@angular/core";

import * as moment from "moment";
import { GLOBAL } from "../../../../shared/global";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from 'rxjs';
import { saveAs } from "file-saver";
import { Articulo } from "../../../interfaces/articulo";
import { ArticuloService } from "../../../services/articulo.service";
import { ReportePdfService } from '../../../../restaurante/services/reporte-pdf.service';

@Component({
	selector: "app-uso-ingrediente",
	templateUrl: "./uso-ingrediente.component.html",
	styleUrls: ["./uso-ingrediente.component.css"]
})
export class UsoIngredienteComponent implements OnInit, OnDestroy {

	get configBotones() {
		const deshabilitar = !this.params.articulo // false //!moment(this.params.fdel).isValid() || !moment(this.params.fal).isValid();
		return {
			showPdf: true, showHtml: false, showExcel: true,
			isPdfDisabled: deshabilitar,
			isExcelDisabled: deshabilitar
		}
	};

	public articulos: Articulo[] = [];
	public cargando = false;
	public titulo: string = "Uso_ingrediente";
	public params: any = {};
	private endSubs = new Subscription();
	
	constructor(
		private snackBar: MatSnackBar,
		private pdfServicio: ReportePdfService,
		private articuloSrvc: ArticuloService
	) { }

	ngOnInit() {
		this.getArticulos()
	}

	ngOnDestroy() {
		this.endSubs.unsubscribe()
	}

	resetParams = () => {
		this.params = {
			articulo: null
		}
	}

	getArticulos = () => {
		const fltr: any = { ingreso: true };

		this.endSubs.add(
			this.articuloSrvc.getArticulos(fltr).subscribe((res: Articulo[]) => {
				if (res) {
					this.articulos = res
				}
			})
		);
	}

	requestPDF = (esExcel = 0) => {
		if (this.params.articulo) {
			this.params._excel = esExcel;

			let tmpArt = this.articulos.filter(obj => {
				return obj.articulo == this.params.articulo
			})[0]

			if (tmpArt) {
				this.params.articulo_nombre = tmpArt.descripcion
			}

			this.cargando = true;
			this.endSubs.add(
				this.pdfServicio.generar_uso_ingrediente(this.params).subscribe(res => {
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
			this.snackBar.open("Por favor ingrese todos los parámetros.", "Uso de ingrediente", { duration: 7000 });
		}
	}
}
