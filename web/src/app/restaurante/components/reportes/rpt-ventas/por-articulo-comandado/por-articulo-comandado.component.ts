import { UsuarioSede } from "@admin/interfaces/acceso";
import { Usuario } from "@admin/models/usuario";
import { AccesoUsuarioService } from "@admin/services/acceso-usuario.service";
import { LocalstorageService } from "@admin/services/localstorage.service";
import { UsuarioService } from "@admin/services/usuario.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TipoTurno } from "@restaurante/interfaces/tipo-turno";
import { ReporteVentasService } from "@restaurante/services/reporte-ventas.service";
import { TipoTurnoService } from "@restaurante/services/tipo-turno.service";
import { GLOBAL, OrdenarArrayObjetos, openInNewTab } from "@shared/global";
import * as moment from "moment";
import { saveAs } from 'file-saver';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-por-articulo-comandado',
  templateUrl: './por-articulo-comandado.component.html',
  styleUrls: ['./por-articulo-comandado.component.css']
})

export class PorArticuloComandadoComponent implements OnInit, OnDestroy {

  get configBotones() {
    return {
      showPdf: true, showHtml: false, showExcel: true,
    }
  };

  public params: any = {};
  public paramsToSend: any = {};
  public tiposTurno: TipoTurno[] = [];
  public sedes: UsuarioSede[] = [];
  public porArticulo: any = { datos: [] };
  public msgGenerandoReporte: string = null;
  public cargando = false;
  public usuarios: Usuario[] = [];
  public tituloArticulo = 'Ventas_Articulos_Comandados';

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private rptVentasSrvc: ReporteVentasService,
    private tipoTurnoSrvc: TipoTurnoService,
    private sedeSrvc: AccesoUsuarioService,
    private usuarioSrvc: UsuarioService,
    private ls: LocalstorageService,
  ) { }
  
  ngOnInit() {
    this.resetParams();
    this.loadTiposTurno();
    this.loadSedes();
    this.loadUsuarios();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => this.sedes = res)
    );
  }

  loadTiposTurno = () => {
    this.endSubs.add(
      this.tipoTurnoSrvc.get().subscribe(res => this.tiposTurno = res)
    );
  }

  resetParams = () => {
    this.porArticulo = [];
    this.msgGenerandoReporte = null;
    this.params = {
      fdel: moment().startOf('week').format(GLOBAL.dbDateFormat),
      fal: moment().endOf('week').format(GLOBAL.dbDateFormat),
    };
    this.cargando = false;
  }

  loadUsuarios = () => {
    this.endSubs.add(
      this.usuarioSrvc.get({
        sede: this.ls.get(GLOBAL.usrTokenVar).sede || 0
      }).subscribe(res => {
        this.usuarios = OrdenarArrayObjetos(res, 'nombres');
      })
    );
  }

  getPorArticuloComandado = (esExcel = 0) => {
    this.paramsToSend = { ...this.params, _excel: esExcel };
    this.cargando = true;
    this.endSubs.add(
      this.rptVentasSrvc.porArticuloComandado(this.paramsToSend).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          if (+esExcel === 0) {
            openInNewTab(URL.createObjectURL(blob));
          } else {
            saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xlsx'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas por artículos Comandados', { duration: 3000 });
        }
      })
    );
  }
  
}