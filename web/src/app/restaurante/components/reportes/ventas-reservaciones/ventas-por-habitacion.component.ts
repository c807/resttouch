import { UsuarioSede } from "@admin/interfaces/acceso";
import { AccesoUsuarioService } from "@admin/services/acceso-usuario.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GLOBAL, openInNewTab } from "@shared/global";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { saveAs } from 'file-saver';
import { ReporteVentasService } from "@restaurante/services/reporte-ventas.service";

@Component({
  selector: 'app-ventas-por-habitacion',
  templateUrl: './ventas-por-habitacion.component.html',
  styleUrls: ['./ventas-por-habitacion.component.css']
})

export class VentasPorHabitacionComponent implements OnInit, OnDestroy {

  get configBotones() {
    return {
      showPdf: true, showExcel: true,
    }
  };

  public paramsToSend: any = {};
  public params: any = {};
  public cargando = false;
  public sedes: UsuarioSede[] = [];
  public tituloArticulo = 'Ventas_por_Habitacion';

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private sedeSrvc: AccesoUsuarioService,
    private rptVentasSrvc: ReporteVentasService,
  ) { }

  ngOnInit(){
    this.resetParams();
    this.loadSedes();
  }
  
  ngOnDestroy(){
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.getSedes({ reporte: true }).subscribe(res => this.sedes = res)
    );
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
      fal: moment().format(GLOBAL.dbDateFormat),
      sede: null
    };
    this.cargando = false;
  }


  getVentasHabitacion = (esExcel = 0) => {
    if (!this.params.sede) {
      this.snackBar.open('Debe seleccionar una sede.', 'Ventas por Habitación', { duration: 3000 });
      return;
    }
    this.paramsToSend = { ...this.params, _excel: esExcel };
    this.cargando = true;
    this.endSubs.add(
      this.rptVentasSrvc.porVentaHabitacion(this.paramsToSend).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: (+esExcel === 0 ? 'application/pdf' : 'application/vnd.ms-excel') });
          if (+esExcel === 0) {
            openInNewTab(URL.createObjectURL(blob));
          } else {
            saveAs(blob, `${this.tituloArticulo}_${moment().format(GLOBAL.dateTimeFormatRptName)}.${+esExcel === 0 ? 'pdf' : 'xls'}`);
          }
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas por Habitacion', { duration: 3000 });
        }
      })
    );
  }
}
