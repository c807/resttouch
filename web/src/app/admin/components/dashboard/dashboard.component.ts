import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, isNotNullOrUndefined, openInNewTab } from '@shared/global';

import { UsuarioService } from '@admin-services/usuario.service';
import { AppMenuService } from '@admin-services/app-menu.service';
import { DesktopNotificationService } from '@shared-services/desktop-notification.service';
import { ClienteService } from '@admin-services/cliente.service';
import { TableroService } from '@admin-services/tablero.service';
import { DashboardParameters } from '@admin/interfaces/tablero';
import { ReporteVentasService } from '@restaurante/services/reporte-ventas.service';
import { ReportePdfService } from '@restaurante/services/reporte-pdf.service';
import { DashboardParametersComponent } from './dashboard-parameters/dashboard-parameters.component';
import { MainSidenavService } from '@shared-services/mainsidenav.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('paramsPorFecha') paramsPorFecha: DashboardParametersComponent;

  get moduloEnUso(): string {
    const usando: string = this.ls.get(GLOBAL.usrLastModuleVar, false) as string || null;
    if (isNotNullOrUndefined(usando)) {
      return usando.replace(/[^0-9A-Z/]+/gi, '')
    }
    return null;
  }

  public appMenu: any[];
  public dataPorSedeFecha: any = {};
  public verPanorama: boolean = false;

  private endSubs = new Subscription();

  constructor(
    private router: Router,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private usrSrvc: UsuarioService,
    private appMenuSrvc: AppMenuService,
    private dns: DesktopNotificationService,
    private clienteSrvc: ClienteService,
    private tableroSrvc: TableroService,
    private rptVentasSrvc: ReporteVentasService,
    private pdfServicio: ReportePdfService,
    private mainSidenavSrvc: MainSidenavService
  ) { }

  ngOnInit() {
    this.verPanorama = (+this.ls.get(GLOBAL.usrTokenVar).pos?.ver_panorama || 0) === 1;
    this.dns.havePermission().then((res) => {
      if (!res) {
        this.dns.requestPermission();
      }
    });

    this.endSubs.add(
      this.clienteSrvc.get().subscribe(res => this.clienteSrvc.lstClientes = res)
    );
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  ngAfterViewInit(): void {
    Promise.resolve(null).then(() => {
      const usrAppMenu = this.usrSrvc.getAppMenu()
      this.appMenuSrvc.updData(usrAppMenu);
      this.appMenu = usrAppMenu;
      const lastModule: string = this.ls.get(GLOBAL.usrLastModuleVar);
      if (lastModule) {
        this.handleClick(lastModule);
      }
    });
  }

  handleClick = (modulo: string = '') => {
    this.ls.set(GLOBAL.usrLastModuleVar, modulo);
    const objModulo: any = this.appMenu.find(m => m.nombre === modulo);
    if (objModulo) {
      const submodulo: any = this.usrSrvc.transformSubModule(objModulo.submodulo);
      this.appMenuSrvc.updOpciones(submodulo);
      this.mainSidenavSrvc.setState(true);
      this.snackBar.open(`Cambio al módulo ${modulo}`, 'Módulo', { duration: 5000 });
    }
  }

  LogOut() {
    this.ls.clear('ng2Idle.main.expiry');
    this.ls.clear('ng2Idle.main.idling');
    this.ls.clear(GLOBAL.usrTokenVar);
    this.ls.clear(GLOBAL.usrUnlockVar);
    this.ls.clear(GLOBAL.usrLastModuleVar);
    this.router.navigate(['/admin/login']);
  }

  reloadAllPorFecha = (params: DashboardParameters) => {
    // console.log('PARAMS = ', params);
    this.endSubs.add(
      this.tableroSrvc.getDatosPanoramaSedeFecha(params).subscribe(res => {
        if (res.exito && res.info && res.info.totales) {
          this.dataPorSedeFecha = { ...res.info.totales };
          // console.log(this.dataPorSedeFecha);
        }
      })
    );
  }

  downloadCategoriasPDF = () => {
    const paramsRpt = {
      _excel: 0,
      fdel: this.paramsPorFecha.params.fdel,
      fal: this.paramsPorFecha.params.fal,
      sede: [this.paramsPorFecha.params.sede]
    };

    this.endSubs.add(
      this.rptVentasSrvc.porCategoriaPdf(paramsRpt).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });
          openInNewTab(URL.createObjectURL(blob));
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas por categoría', { duration: 3000 });
        }
      })
    );
  }

  downloadMeserosPDF = () => {
    const paramsRpt = {
      _excel: 0,
      fdel: this.paramsPorFecha.params.fdel,
      fal: this.paramsPorFecha.params.fal,
      sede: [this.paramsPorFecha.params.sede]
    };

    this.endSubs.add(
      this.rptVentasSrvc.porMesero(paramsRpt).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });
          openInNewTab(URL.createObjectURL(blob));
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Ventas por categoría', { duration: 3000 });
        }
      })
    );
  }

  downloadCajaPDF = () => {
    const paramsRpt = {
      _excel: 0,
      fdel: this.paramsPorFecha.params.fdel,
      fal: this.paramsPorFecha.params.fal,
      sede: [this.paramsPorFecha.params.sede],
      porTurno: false,
      _digital: true,
      _encomandera: 0,
      _pagos: [],
      _validar: false
    };

    this.endSubs.add(
      this.pdfServicio.getReporteCaja(paramsRpt).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });
          openInNewTab(URL.createObjectURL(blob));
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'Caja', { duration: 3000 });
        }
      })
    );
  }

  reloadAllPorTurno = (params: DashboardParameters) => {
    console.log('PARAMS = ', params);
  }

}
