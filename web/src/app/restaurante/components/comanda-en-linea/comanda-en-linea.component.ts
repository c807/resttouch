import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatTable } from '@angular/material/table';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../shared/global';
import * as moment from 'moment';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DesktopNotificationService } from '../../../shared/services/desktop-notification.service';
import { AccionesComandaEnLineaComponent } from '../acciones-comanda-en-linea/acciones-comanda-en-linea.component';
import { ComandaService } from '../../services/comanda.service';
import { EstatusCallcenterService } from '../../../callcenter/services/estatus-callcenter.service';
import { EstatusCallcenter } from '../../../callcenter/interfaces/estatus-callcenter';
import { ConfiguracionService } from '../../../admin/services/configuracion.service';
import { Impresion } from '../../classes/impresion';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comanda-en-linea',
  templateUrl: './comanda-en-linea.component.html',
  styleUrls: ['./comanda-en-linea.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class ComandaEnLineaComponent implements OnInit, OnDestroy {

  get montoPropina() {
    return (formas_pago: any = []) => {
      let monto = 0;
      formas_pago.forEach(fp => monto += +fp.propina);
      return monto;
    }
  }

  get audioUrl() {
    const nombreAudio = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_AUDIO_NOTIFICACION) || 'notificacion.wav';
    const urlAudio = `${GLOBAL.sonidos_rt}/${nombreAudio}`;    
    return urlAudio;
  }  

  @ViewChild('tblPedidos') tblPedidos: MatTable<any[]>;
  @ViewChild('audioNotificacion') audioNotificacion: ElementRef;
  public dataSource: any[] = [];
  public columnsToDisplay = ['comanda', 'orden', 'fechahora', 'nombre', 'total', 'acciones'];
  public expandedElement: any | null;
  public comandasEnLinea: any[] = [];
  public params: any = { de: 0, a: 99 };
  public lstEstatusCallCenter: EstatusCallcenter[] = [];
  public ingresoPedidoNuevo = false;
  
  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    public bsAccionesCmd: MatBottomSheet,
    private snackBar: MatSnackBar,
    private socket: Socket,
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private dns: DesktopNotificationService,
    private estatusCallcenterSrvc: EstatusCallcenterService,
    private configSrvc: ConfiguracionService,
  ) { }

  ngOnInit() {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('shopify:updlist', (obj: any = null) => {
        // console.log('OBJECT RECIEVED = ', obj);
        if (obj && obj.corporacion) {
          const suuid: string = this.ls.get(GLOBAL.usrTokenVar).sede_uuid as string;
          if (suuid.trim() === (obj.corporacion as string).trim()) {
            // console.log(`SEDE CORRECTA = ${obj.corporacion}`);
            this.loadComandasEnLinea();
            this.notificarUsuario();
            this.ingresoPedidoNuevo = true;
          } else if (suuid.indexOf(obj.corporacion) > -1) {
            this.loadComandasEnLinea();
            this.notificarUsuario();
          }
        } else {
          this.loadComandasEnLinea();
          this.notificarUsuario();
        }
      });

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('connect_timeout', () => {
        const msg = 'DESCONECTADO DEL SERVIDOR (TIMEOUT)';
        this.snackBar.open(msg, 'ERROR', { duration: 5000 });
        this.avisoSocketIOEvent(msg);
      });

      // this.socket.on('pong', (ms: number) => this.snackBar.open(`PONG: ${ms}ms`, 'Pong', { duration: 5000 }));

      this.socket.on('reconnect_attempt', (attempt: number) => this.snackBar.open(`INTENTO DE RECONEXIÓN #${attempt}`, 'ERROR', { duration: 10000 }));

      this.socket.on('shopify:error', (mensaje: string) => {
        this.loadComandasEnLinea();
        this.snackBar.open(`ERROR: ${mensaje}`, 'Firmar', { duration: 10000 });
      });
    }

    this.loadEstatusCallCenter();
    this.loadComandasEnLinea();
  }  

  avisoSocketIOEvent = (aviso: string = '') => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Socket.IO', aviso, 'Aceptar', 'Cancelar')
    });

    confirmRef.afterClosed().subscribe((confirma: boolean) => { });
  }

  notificarUsuario = () => {
    try {
      const opciones: NotificationOptions = {
        icon: 'assets/img/minilogo.png',
        body: `Se recibió una nueva orden a las ${moment().format(GLOBAL.dateTimeFormat)}.`,
        dir: 'auto'
      };
      this.dns.createNotification('Rest-Touch Pro', 10000, opciones);
    } catch(e) {      
      console.log(e);
    } finally {
      if(this.audioNotificacion.nativeElement.paused) {
        this.audioNotificacion.nativeElement.play().then(() => {}).catch((e) => { console.log(e); });
      }
    }
  }

  detenerAudio = () => {
    this.audioNotificacion.nativeElement.pause();
    this.audioNotificacion.nativeElement.currentTime = 0;
    this.ingresoPedidoNuevo = false;
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadEstatusCallCenter = () => this.endSubs.add(this.estatusCallcenterSrvc.get({ esautomatico: 0 }).subscribe(res => this.lstEstatusCallCenter = res));

  autoImprimir = () => {
    const autoImprimir = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_AUTOIMPRIMIR_PEDIDO);
    const objImprimir = new Impresion(this.socket, this.ls, this.comandaSrvc, this.configSrvc);
    this.comandasEnLinea.forEach((obj, i) => {
      if (autoImprimir) {
        if (+obj.impresa === 0) {
          objImprimir.imprimir(obj, i);
          objImprimir.imprimirCuenta(obj);
        }
      } else {
        objImprimir.marcarComoImpresa(obj);
      }
      this.comandasEnLinea[i].impresa = 1;
    });    
  }

  loadComandasEnLinea = () => {
    this.endSubs.add(
      this.comandaSrvc.getComandasOnLIne({ callcenter: 1 }).subscribe((res: any[]) => {
        this.comandasEnLinea = res;
        this.dataSource = this.comandasEnLinea;
        this.autoImprimir();
      })
    );
  }

  abrirAccionesComandaEnLinea = (obj: any) => {
    const bs = this.bsAccionesCmd.open(AccionesComandaEnLineaComponent, {
      autoFocus: false,
      data: { comanda: obj, lstEstatus: this.lstEstatusCallCenter, comandaEnLinea: this }
    });

    this.endSubs.add(
      bs.afterDismissed().subscribe((res: any) => {
        if (res?.refrescar) {
          this.loadComandasEnLinea();
        }

        if (res?.comanda) {
          this.updateRegistroPedido(res.comanda);
        }
      })
    );
  }

  updateRegistroPedido = (pedido: any) => {
    let idx = this.comandasEnLinea.findIndex(o => +o.comanda === +pedido.comanda);
    if (idx > -1) {
      if (+pedido.estatus_callcenter?.esultimo === 0) {
        this.comandasEnLinea[idx] = pedido;
      } else {
        this.comandasEnLinea.splice(idx, 1);
      }
      this.tblPedidos.renderRows();
    }
  }
    
}
