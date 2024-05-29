import { UsuarioSedeRPT } from '@admin/interfaces/acceso';
import { AccesoUsuarioService } from '@admin/services/acceso-usuario.service';
import { Component, OnDestroy, OnInit} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportesCallcenter } from '@callcenter/services/reportes-callcenter.service';
import { GLOBAL, openInNewTab } from '@shared/global';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { Categoria } from '@wms/interfaces/categoria';

@Component({
	selector: 'app-clientes',
	templateUrl: './clientes.component.html',
	styleUrls: ['./clientes.component.css']
})

export class ClientesComponent implements OnInit, OnDestroy {

  get configBotones() {
    return {
      showPdf: true, showHtml: false, showExcel: true,
    }
  };

  public params: any = {};
  public paramsToSend: any = {};
  public msgGenerandoReporte: string = null;
  public sedes: UsuarioSedeRPT[] = [];
  public cargando = false;
  public tituloArticulo = 'clientes_callcenter';
  public categorias: Categoria[] = [];
  public listaCategoria: any[] = [];

	private endSubs = new Subscription();


  constructor(
    private ReporteSrvc: ReportesCallcenter,
    private snackBar: MatSnackBar,
    private sedeSrvc: AccesoUsuarioService
  ) {
  }

  
  ngOnInit(): void {
    this.resetParams();
    this.loadSedes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetParams = () => {
    this.msgGenerandoReporte = null;
    this.params = {
      sede: undefined,
    };
    this.cargando = false;
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => {
        this.sedes = res;
      })
    );
  }

  onSedeSelected = (obj: any) => {
		this.setListaCategoria()
	}

  setListaCategoria() {
		let data = []
		if (this.params.sede !== undefined) {

			for (var i in this.params.sede) {

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

  requestPDF = (esExcel = 0) => {
    if (!this.params.sede) {
      this.snackBar.open('Por favor, seleccione una sede.', 'Error', { duration: 3000 });
      return;
    }

    this.cargando = true;
    this.paramsToSend = JSON.parse(JSON.stringify(this.params));
    this.paramsToSend._excel = esExcel;

    if (this.params.sede !== undefined && this.params.sede !== null) {
      const idx = this.sedes.findIndex(s => +s.sede.sede === +this.params.sede);
      if (idx > -1) {
        this.paramsToSend.sedeNName = this.sedes[idx].sede.nombre;
      }
    }

    this.endSubs.add(
      this.ReporteSrvc.generar_archivo_clientes(this.paramsToSend).subscribe(res => {
        this.cargando = false;
        if (res) {          
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          if (+esExcel === 0) {            
            openInNewTab(URL.createObjectURL(blob));
          } else {
            saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Reporte clientes Call Center.', { duration: 3000 });
        }
      })
    );
  }
  
}
