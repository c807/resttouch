import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { GLOBAL, MultiFiltro } from '../../../shared/global';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { DesktopNotificationService } from '../../../shared/services/desktop-notification.service';
import * as moment from 'moment';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { FormaPagoComandaOrigenDialogComponent } from '../../../admin/components/formaPagoComandaOrigen/forma-pago-comanda-origen-dialog/forma-pago-comanda-origen-dialog.component';
import { FormSedeVendorTerceroDialogComponent } from '../../../admin/components/vendor-tercero/form-sede-vendor-tercero-dialog/form-sede-vendor-tercero-dialog.component';

import { OrdenGkResponse } from '../../interfaces/orden-gk';
import { EstatusOrdenGk } from '../../interfaces/estatus-orden-gk';
import { VendorTercero } from '../../../admin/interfaces/vendor-tercero';
import { OrdenGkService } from '../../services/orden-gk.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SeguimientoComponent implements AfterViewInit, OnInit {

  @ViewChild('tblOrdenesGk') tblOrdenesGk: MatTable<OrdenGkResponse[]>;
  
  public ordenesgk: OrdenGkResponse[] = [];
  public ordenesgkFiltered: OrdenGkResponse[] = [];
  public columnsToDisplay = ['orden_gk', 'comanda_origen', 'fhcreacion', 'numero_orden', 'estatus_orden_gk', 'total', 'acciones'];
  public expandedElement: any | null;
  public cargando = false;

  constructor(
    private ordengkSrvc: OrdenGkService,
    private socket: Socket,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private dns: DesktopNotificationService,
    public dialog: MatDialog
  ) { }

  ngAfterViewInit(): void { }

  ngOnInit(): void {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('gk:updlista', (obj: any) => {
        if (this.ls.get(GLOBAL.usrTokenVar).sede_uuid.indexOf(obj.corporacion) > -1) {
          this.loadOrdenesGK();
          this.notificarUsuario();
        }
      });

      this.socket.on('gk:updEstatusOrden', (msg: any) => {
        const obj = JSON.parse(msg);        
        const corporacion = obj.sede_uuid.substring(0, 36);
        if (this.ls.get(GLOBAL.usrTokenVar).sede_uuid.indexOf(corporacion) > -1) {
          if (obj.orden_gk && obj.estatus_orden_gk)
          {            
            this.updateEstatusOrden(obj.orden_gk, obj.estatus_orden_gk);
          }
        }
      });

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('connect_timeout', () => {
        const msg = 'DESCONECTADO DEL SERVIDOR (TIMEOUT)';
        this.snackBar.open(msg, 'ERROR', { duration: 5000 });
      });

      this.socket.on(
        'reconnect_attempt',
        (attempt: number) => this.snackBar.open(`INTENTO DE RECONEXIÓN #${attempt}`, 'ERROR', { duration: 10000 })
      );
    }

    this.loadOrdenesGK();
  }

  notificarUsuario = () => {
    const opciones: NotificationOptions = {
      icon: 'assets/img/minilogo.png',
      body: `Se recibió una nueva orden a las ${moment().format(GLOBAL.dateTimeFormat)}.`,
      dir: 'auto'
    };
    this.dns.createNotification('Rest-Touch Pro', 10000, opciones);
  }

  loadOrdenesGK = (estatus: number = 0) => {
    this.cargando = true;

    const fltr = { estatus_orden_gk: estatus };

    if (+estatus === 0)
    {
      delete fltr.estatus_orden_gk;
    }    

    this.ordengkSrvc.seguimiento(fltr).subscribe((res: OrdenGkResponse[]) => {
      if (res) {
        this.ordenesgk = res;
        this.ordenesgkFiltered = JSON.parse(JSON.stringify(this.ordenesgk));        
      }
      this.cargando = false;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue);
    if (filterValue.length > 0) {
      this.ordenesgkFiltered = MultiFiltro(this.ordenesgk, filterValue);
    } else {
      this.ordenesgkFiltered = JSON.parse(JSON.stringify(this.ordenesgk));
    }
  }

  cancelarOrden = (ord: OrdenGkResponse) => {
    this.cargando = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Anular pedido',
        'Si anula el pedido, será necesario volver a ingresarlo. ¿Desea continuar?',
        'Sí',
        'No',
        {
          input: [
            {
              select: false,
              label: 'Comentario',
              valor: null,
              id: 'comentario',
              requerido: false
            }
          ]
        }
      )
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res.resultado) {
        const params = {
          orden_gk: ord.orden_gk,
          origen: ord.comanda_origen.descripcion
        };

        for (const input of res.config.input) {
          params[input.id] = input.valor;
        }

        this.ordengkSrvc.anular(params).subscribe(resAnula => {
          if (resAnula.exito) {
            this.snackBar.open(resAnula.mensaje, 'Anular pedido', { duration: 5000 });
            if (resAnula.estatus_orden_gk) {
              this.updateEstatusOrden(ord.orden_gk, resAnula.estatus_orden_gk);
            } else {
              this.loadOrdenesGK();
            }
          } else {
            this.snackBar.open(`ERROR: ${resAnula.mensaje}`, 'Anular pedido', { duration: 5000 });
          }
          this.cargando = false;
        });
      } else {
        this.cargando = false;
      }
    });
  }

  enviarVendors = (ord: OrdenGkResponse) => {
    this.cargando = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Enviar a vendors',
        'Esto enviará los pedidos a sus respectivas cocinas. ¿Desea continuar?',
        'Sí',
        'No'
      )
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {        
        this.snackBar.open(`Enviando orden #${ord.numero_orden} de ${ord.comanda_origen.descripcion}`, 'Envío a vendors', { duration: 5000 });
        this.ordengkSrvc.enviarVendors({ orden_gk: ord.orden_gk }).subscribe(resEnvio => {
          if (resEnvio.exito) {
            this.updateEstatusOrden(ord.orden_gk, resEnvio.estatus_orden_gk);
            this.snackBar.open(`${resEnvio.mensaje}`, 'Envío a vendors', { duration: 7000 });
          } else {
            this.snackBar.open(`ERROR: ${resEnvio.mensaje}`, 'Envío a vendors', { duration: 10000 });
          }
          this.cargando = false;
        });
      } else {
        this.cargando = false;
      }
    });    
  }

  updateEstatusOrden = (idordengk: number, estatus: EstatusOrdenGk) => {
    this.ordengkSrvc.cambiarEstatusSede(idordengk).subscribe(res => {
      if (res.exito && res.orden) {
        this.updateRegistroOrden(res.orden);
      }
      let idx = this.ordenesgk.findIndex(o => +o.orden_gk === +idordengk);
      if (idx > -1) {
        this.ordenesgk[idx].estatus_orden_gk = estatus;
      }
  
      idx = this.ordenesgkFiltered.findIndex(o => +o.orden_gk === +idordengk);
      if (idx > -1) {
        this.ordenesgkFiltered[idx].estatus_orden_gk = estatus;
      }
    });
  }

  updateRegistroOrden = (ord: OrdenGkResponse) => {
    let idx = this.ordenesgk.findIndex(o => +o.orden_gk === +ord.orden_gk);
    if (idx > -1) {
      this.ordenesgk[idx] = ord;
    }

    idx = this.ordenesgkFiltered.findIndex(o => +o.orden_gk === +ord.orden_gk);
    if (idx > -1) {
      this.ordenesgkFiltered[idx] = ord;
      this.tblOrdenesGk.renderRows();
    }
  }

  openFormaPagoComandaOrigen = (ord: OrdenGkResponse) => {
    this.cargando = true;
    const dialogRef = this.dialog.open(FormaPagoComandaOrigenDialogComponent, {
      maxWidth: '100vw', width: '90vw', height: '80vh',
      disableClose: true,
      data: { comanda_origen: +ord.comanda_origen.comanda_origen }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.ordengkSrvc.regeneraOrdenRT(ord.orden_gk).subscribe(res => {
        if (res.exito) {
          this.updateRegistroOrden(res.orden);
          this.snackBar.open(res.mensaje, 'Formas de pago por origen.', { duration: 7000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Formas de pago por origen.', { duration: 7000 });
        }
        this.cargando = false;
      });
    });
  }

  openSedeVendorTercero = (vt: VendorTercero, idOrdenGk: number) => {    
    console.log(vt);
    this.cargando = true;
    const dialogRef = this.dialog.open(FormSedeVendorTerceroDialogComponent, {
      maxWidth: '100vw', width: '50vw', height: '40vh',
      disableClose: true,
      data: { vendor_tercero: vt.vendor_tercero, nombre_vendor_tercero: vt.nombre }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.ordengkSrvc.regeneraOrdenRT(idOrdenGk).subscribe(res => {
        if (res.exito) {
          this.updateRegistroOrden(res.orden);
          this.snackBar.open(res.mensaje, 'Sede para vendor.', { duration: 7000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede para vendor.', { duration: 7000 });
        }
        this.cargando = false;
      });
    });
  }
}
