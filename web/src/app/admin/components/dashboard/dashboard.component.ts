import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, isNotNullOrUndefined } from '@shared/global';

import { UsuarioService } from '@admin-services/usuario.service';
import { AppMenuService } from '@admin-services/app-menu.service';
import { DesktopNotificationService } from '@shared-services/desktop-notification.service';
import { ClienteService } from '@admin-services/cliente.service';
import { TableroService } from '@admin-services/tablero.service';

import { Subscription } from 'rxjs';
import { DashboardParameters } from '@admin/interfaces/tablero';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  get moduloEnUso(): string {
    const usando: string = this.ls.get(GLOBAL.usrLastModuleVar, false) as string || null;
    if (isNotNullOrUndefined(usando)) {
      return usando.replace(/[^0-9A-Z/]+/gi, '')
    }
    return null;
  }

  public appMenu: any[];

  public dataPorSedeFecha: any = {};

  private endSubs = new Subscription();

  constructor(
    private router: Router,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private usrSrvc: UsuarioService,
    private appMenuSrvc: AppMenuService,
    private dns: DesktopNotificationService,
    private clienteSrvc: ClienteService,
    private tableroSrvc: TableroService
  ) { }

  ngOnInit() {
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
          console.log(this.dataPorSedeFecha);
        }
      })
    );
  }

  reloadAllPorTurno = (params: DashboardParameters) => {
    console.log('PARAMS = ', params);
  }

}
