import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../services/localstorage.service';
import { GLOBAL } from '../../../shared/global';
import { UsuarioService } from '../../services/usuario.service';
import { AppMenuService } from '../../services/app-menu.service';
import { ConfiguracionService } from '../../services/configuracion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

import { SolicitaPinInactividadComponent } from '../solicita-pin-inactividad/solicita-pin-inactividad.component';
import { AcercaDeComponent } from '../acerca-de/acerca-de.component';
import { NotificacionesClienteComponent } from '../notificaciones-cliente/notificaciones-cliente.component';

import { NotificacionClienteService } from '../../services/notificacion-cliente.service';
import { NotificacionCliente } from '../../interfaces/notificacion-cliente';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {

  public usrInfo: any = {};
  public appMenu: any[];
  public idleState = false;
  public timedOut = false;
  public lastPing?: Date = null;
  public notificaciones: NotificacionCliente[] = [];

  constructor(
    private router: Router,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private usrSrvc: UsuarioService,
    private appMenuSrvc: AppMenuService,
    private idle: Idle,
    private keepalive: Keepalive,
    private configSrvc: ConfiguracionService,
    public dialog: MatDialog,
    public notificacionClienteSrvc: NotificacionClienteService
  ) {
    this.usrInfo = this.ls.get(GLOBAL.usrTokenVar);
    this.configSrvc.load().then(() => this.setIdleConfigs());
  }

  ngOnInit() {
    this.loadNotificacionesCliente();
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

  loadNotificacionesCliente = () => {
    this.notificacionClienteSrvc.get().subscribe((res: NotificacionCliente[]) => {
      if (res && res.length > 0) {
        this.notificaciones = res;
        this.snackBar.openFromComponent(NotificacionesClienteComponent, {
          data: this.notificaciones,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  setIdleConfigs = () => {
    if ((this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_HABILITA_BLOQUEO_INACTIVIDAD) as boolean)) {
      const tiempo = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_SEGUNDOS_INACTIVIDAD) as number;
      this.idle.setIdle(tiempo);
      this.idle.setTimeout(tiempo);
      this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      this.idle.onIdleEnd.subscribe(() => this.idleState = false);

      this.idle.onTimeout.subscribe(() => {
        this.idleState = true;
        this.timedOut = true;

        const solicitaPinRef = this.dialog.open(SolicitaPinInactividadComponent, {
          width: '25%',
          hasBackdrop: true,
          disableClose: true,
          autoFocus: true,
          data: null
        });

        solicitaPinRef.afterClosed().subscribe(() => this.reset());
      });

      this.idle.onIdleStart.subscribe(() => this.idleState = true);

      this.idle.onTimeoutWarning.subscribe((conteo: number) => this.idleState = true);

      this.keepalive.interval(15);

      this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

      this.reset();
    }
  }

  reset = () => {
    this.idle.watch();
    this.idleState = false;
    this.timedOut = false;
  }

  handleClick = (modulo: string = '') => {
    this.ls.set(GLOBAL.usrLastModuleVar, modulo);
    const objModulo: any = this.appMenu.find(m => m.nombre === modulo);
    // console.log(objModulo);
    if (objModulo) {
      const submodulo: any = this.usrSrvc.transformSubModule(objModulo.submodulo);
      // console.log(submodulo);
      this.appMenuSrvc.updOpciones(submodulo);
      this.snackBar.open(`Cambio al módulo ${modulo}`, 'Módulo', { duration: 5000 });
    }
  }

  LogOut() {
    this.ls.clear('ng2Idle.main.expiry');
    this.ls.clear('ng2Idle.main.idling');
    this.ls.clearRTStorage();
    this.idle.stop();
    this.router.navigate(['/admin/login']);
  }

  acercaDe = () => {
    const aboutRef = this.dialog.open(AcercaDeComponent, {
      width: '50%',
      hasBackdrop: true,
      autoFocus: true,
      data: null
    });

    // aboutRef.afterClosed().subscribe(() => { });
  }

}
