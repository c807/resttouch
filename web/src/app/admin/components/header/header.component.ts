import { Component, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { checkForAcceso, GLOBAL } from '@shared/global';

import { UsuarioService } from '@admin-services/usuario.service';
import { AppMenuService } from '@admin-services/app-menu.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';

import { SolicitaPinInactividadComponent } from '@admin-components/solicita-pin-inactividad/solicita-pin-inactividad.component';
import { AcercaDeComponent } from '@admin-components/acerca-de/acerca-de.component';
import { NotificacionesClienteComponent } from '@admin-components/notificaciones-cliente/notificaciones-cliente.component';
import { ChatComponent } from '@admin-components/chat/chat.component';

import { NotificacionClienteService } from '@admin-services/notificacion-cliente.service';
import { NotificacionCliente } from '@admin-interfaces/notificacion-cliente';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() moduleSelectedEv = new EventEmitter();

  get moduloEnUso(): string {
    const usando: string = (this.ls.get(GLOBAL.usrLastModuleVar, false) as string || 'N/A').replace(/[^0-9A-Z/]+/gi, '');
    return usando
  }

  public usrInfo: any = {};
  public appMenu: any[];
  public idleState = false;
  public timedOut = false;
  public lastPing?: Date = null;
  public notificaciones: NotificacionCliente[] = [];
  public conversacion: string = '';
  public mensaje: string = '';
  public verPanorama: boolean = false;
  public tieneAccesoATurno: boolean = false;
  public tieneAccesoAArea: boolean = false;
  private endSubs = new Subscription();

  constructor(
    private router: Router,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private usrSrvc: UsuarioService,
    private appMenuSrvc: AppMenuService,
    private idle: Idle,
    private keepalive: Keepalive,
    private configSrvc: ConfiguracionService,
    private mbs: MatBottomSheet,
    public dialog: MatDialog,
    public notificacionClienteSrvc: NotificacionClienteService
  ) {
    this.usrInfo = this.ls.get(GLOBAL.usrTokenVar);
    this.configSrvc.load().then(() => this.setIdleConfigs());
  }

  ngOnInit() {
    this.loadNotificacionesCliente();
    this.verPanorama = (+this.ls.get(GLOBAL.usrTokenVar).pos?.ver_panorama || 0) === 1;
    this.tieneAccesoATurno = checkForAcceso('pos', 'transacción', 'turno');
    this.tieneAccesoAArea = checkForAcceso('pos', 'transacción', 'área');
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

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadNotificacionesCliente = () => {
    this.endSubs.add(      
      this.notificacionClienteSrvc.get().subscribe((res: NotificacionCliente[]) => {
        if (res && res.length > 0) {
          this.notificaciones = res;
          this.dialog.open(NotificacionesClienteComponent, {
            width: '75%',
            autoFocus: true,
            disableClose: true,
            data: this.notificaciones
          });
        }
      })
    );
  }

  setIdleConfigs = () => {
    if ((this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_HABILITA_BLOQUEO_INACTIVIDAD) as boolean)) {
      const tiempo = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_SEGUNDOS_INACTIVIDAD) as number;
      this.idle.setIdle(tiempo);
      this.idle.setTimeout(tiempo);
      this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      this.endSubs.add(
        this.idle.onIdleEnd.subscribe(() => this.idleState = false)
      );

      this.endSubs.add(        
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
  
          this.endSubs.add(
            solicitaPinRef.afterClosed().subscribe(() => this.reset())
          );
        })
      );


      this.endSubs.add(
        this.idle.onIdleStart.subscribe(() => this.idleState = true)
      );

      this.endSubs.add(        
        this.idle.onTimeoutWarning.subscribe((conteo: number) => this.idleState = true)
      );

      this.keepalive.interval(15);

      this.endSubs.add(        
        this.keepalive.onPing.subscribe(() => this.lastPing = new Date())
      );

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
      this.moduleSelectedEv.emit();
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
    this.dialog.open(AcercaDeComponent, {
      width: '50%',
      hasBackdrop: true,
      autoFocus: true,
      data: null
    });    
  }

  openChat = () => {
    this.mbs.open(ChatComponent);
  }

  goToDashboard = () => {
    this.actualizarModulo('ADMIN');
    this.router.navigate(['/admin/dashboard']);
  };

  goToArea = () => {
    this.actualizarModulo('POS');
    this.router.navigate(['/restaurante/tranareas']);
  };

  goToTurno = () => {
    this.actualizarModulo('POS');
    this.router.navigate(['/restaurante/turno']);
  };

  private actualizarModulo(modulo: string) {
    this.ls.set(GLOBAL.usrLastModuleVar, modulo);
    const objModulo: any = this.appMenu.find(m => m.nombre === modulo);
    if (objModulo) {
      const submodulo: any = this.usrSrvc.transformSubModule(objModulo.submodulo);
      this.appMenuSrvc.updOpciones(submodulo);
    }
  }

}
