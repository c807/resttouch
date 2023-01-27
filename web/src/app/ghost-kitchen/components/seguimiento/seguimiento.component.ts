import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, MultiFiltro } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Socket } from 'ngx-socket-io';
import { Base64 } from 'js-base64';
import * as moment from 'moment';

import { DesktopNotificationService } from '@shared-services/desktop-notification.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { FormaPagoComandaOrigenDialogComponent } from '@admin-components/formaPagoComandaOrigen/forma-pago-comanda-origen-dialog/forma-pago-comanda-origen-dialog.component';
import { FormSedeVendorTerceroDialogComponent } from '@admin-components/vendor-tercero/form-sede-vendor-tercero-dialog/form-sede-vendor-tercero-dialog.component';
import { OrdenGkResponse, OrdenRT, articulo_gk, DatosEntregaGK, DatosFacturaGK } from '@ghost-kitchen-interfaces/orden-gk';
import { FormaPago } from '@admin/interfaces/forma-pago';
import { EstatusOrdenGk } from '@ghost-kitchen-interfaces/estatus-orden-gk';
import { VendorTercero } from '@admin-interfaces/vendor-tercero';
import { Impresora } from '@admin-interfaces/impresora';
import { OrdenGkService } from '@ghost-kitchen-services/orden-gk.service';
import { ImpresoraService } from '@admin-services/impresora.service';
import { ConfiguracionService } from '@admin-services/configuracion.service';

import { Subscription } from 'rxjs';

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
export class SeguimientoComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('tblOrdenesGk') tblOrdenesGk: MatTable<OrdenGkResponse[]>;
  
  public ordenesgk: OrdenGkResponse[] = [];
  public ordenesgkFiltered: OrdenGkResponse[] = [];
  public columnsToDisplay = ['orden_gk', 'comanda_origen', 'fhcreacion', 'numero_orden', 'estatus_orden_gk', 'total', 'acciones'];
  public expandedElement: any | null;
  public cargando = false;
  public impresora: Impresora = null;
  
  private endSubs = new Subscription();

  constructor(
    private ordengkSrvc: OrdenGkService,
    private socket: Socket,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    private dns: DesktopNotificationService,
    public dialog: MatDialog,
    private impresoraSrvc: ImpresoraService,
    private configSrvc: ConfiguracionService
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
    this.loadImpresoraPorDefecto();
  }

  ngOnDestroy() {
    this.socket.disconnect();
    this.endSubs.unsubscribe();
  }

  notificarUsuario = () => {
    const opciones: NotificationOptions = {
      icon: 'assets/img/minilogo.png',
      body: `Se recibió una nueva orden a las ${moment().format(GLOBAL.dateTimeFormat)}.`,
      dir: 'auto'
    };
    this.dns.createNotification('Rest-Touch Pro', 10000, opciones);
  }

  loadImpresoraPorDefecto = () => {
    this.endSubs.add(      
      this.impresoraSrvc.get({ pordefecto: 1 }).subscribe(res => {
        if (res && res.length > 0) {
          this.impresora = res[0];
        }
      })
    );
  }

  loadOrdenesGK = (estatus: number = 0) => {
    this.cargando = true;

    const fltr = { estatus_orden_gk: estatus };

    if (+estatus === 0)
    {
      delete fltr.estatus_orden_gk;
    }    

    this.endSubs.add(      
      this.ordengkSrvc.seguimiento(fltr).subscribe((res: OrdenGkResponse[]) => {
        if (res) {
          this.ordenesgk = res;
          this.ordenesgkFiltered = JSON.parse(JSON.stringify(this.ordenesgk));        
        }
        this.cargando = false;
      })
    );
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

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(res => {
        if (res.resultado) {
          const params = {
            orden_gk: ord.orden_gk,
            origen: ord.comanda_origen.descripcion
          };
  
          for (const input of res.config.input) {
            params[input.id] = input.valor;
          }
  
          this.endSubs.add(            
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
            })
          );
        } else {
          this.cargando = false;
        }
      })
    );
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

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(res => {
        if (res) {        
          this.snackBar.open(`Enviando orden #${ord.numero_orden} de ${ord.comanda_origen.descripcion}`, 'Envío a vendors', { duration: 5000 });
          this.endSubs.add(            
            this.ordengkSrvc.enviarVendors({ orden_gk: ord.orden_gk }).subscribe(resEnvio => {
              if (resEnvio.exito) {
                this.updateEstatusOrden(ord.orden_gk, resEnvio.estatus_orden_gk);
                this.snackBar.open(`${resEnvio.mensaje}`, 'Envío a vendors', { duration: 7000 });
              } else {
                this.snackBar.open(`ERROR: ${resEnvio.mensaje}`, 'Envío a vendors', { duration: 10000 });
              }
              this.cargando = false;
            })
          );
        } else {
          this.cargando = false;
        }
      })    
    );
  }

  updateEstatusOrden = (idordengk: number, estatus: EstatusOrdenGk) => {
    this.endSubs.add(      
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
      })
    );
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

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(() => {
        this.endSubs.add(          
          this.ordengkSrvc.regeneraOrdenRT(ord.orden_gk).subscribe(res => {
            if (res.exito) {
              this.updateRegistroOrden(res.orden);
              this.snackBar.open(res.mensaje, 'Formas de pago por origen.', { duration: 7000 });
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, 'Formas de pago por origen.', { duration: 7000 });
            }
            this.cargando = false;
          })
        );
      })
    );
  }

  openSedeVendorTercero = (vt: VendorTercero, idOrdenGk: number) => {    
    console.log(vt);
    this.cargando = true;
    const dialogRef = this.dialog.open(FormSedeVendorTerceroDialogComponent, {
      maxWidth: '100vw', width: '50vw', height: '40vh',
      disableClose: true,
      data: { vendor_tercero: vt.vendor_tercero, nombre_vendor_tercero: vt.nombre }
    });

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(() => {
        this.endSubs.add(          
          this.ordengkSrvc.regeneraOrdenRT(idOrdenGk).subscribe(res => {
            if (res.exito) {
              this.updateRegistroOrden(res.orden);
              this.snackBar.open(res.mensaje, 'Sede para vendor.', { duration: 7000 });
            } else {
              this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede para vendor.', { duration: 7000 });
            }
            this.cargando = false;
          })
        );
      })
    );
  }

  procesaDetalleOrden = (detalle: articulo_gk[]) => {
    const detOrden: any[] = [];
    detalle.forEach(d => detOrden.push({
      Cantidad: +d.cantidad,
      Descripcion: d.descripcion,
      Total: +d.total,
      PrecioUnitario: +d.precio
    }));
    return detOrden;
  }

  procesaDatosEntregaFactura = (obj: (DatosEntregaGK | DatosFacturaGK )) => {
    for(const prop in obj) {
      obj[prop] = obj[prop] ? obj[prop] : '';
    }    
    return obj;
  }

  printOrdenGK = (ord: OrdenGkResponse) => {

    const ort: OrdenRT = ord.orden_rt;
    const propina = !!ort.total_propina && +ort.total_propina > 0 ? +ort.total_propina : 0.00;

    const msgToPrint = {
      Pedido: ort.numero_orden,
      FechaHora: moment(ord.fhcreacion).format(GLOBAL.dateTimeFormat),
      TotalOrden: ort.total_orden + propina,
      TotalDescuento: ort.total_descuento,
      Origen: ord.comanda_origen.descripcion,
      DatosEntrega: this.procesaDatosEntregaFactura(ort.datos_entrega),
      DatosFactura: this.procesaDatosEntregaFactura(ort.datos_factura),
      FormasPago: '',
      Propina: propina,
      Impresora: this.impresora,
      DetalleOrden: this.procesaDetalleOrden(ort.articulos)
    }

    ort.formas_pago.forEach((fp: FormaPago) => {
      if (msgToPrint.FormasPago !== '') {
        msgToPrint.FormasPago += ', ';
      }
      msgToPrint.FormasPago += fp.descripcion;
    });

    // console.log(JSON.stringify(msgToPrint));
    
    if (!!this.impresora) {
      if (+this.impresora.bluetooth === 0) {
        this.socket.emit(`print:ordengk`, `${JSON.stringify(msgToPrint)}`);
      } else {
        msgToPrint.FechaHora = moment(ord.fhcreacion).format(GLOBAL.dateFormatBT);
        this.printToBT(JSON.stringify(msgToPrint));
      }
    } else {
      this.socket.emit(`print:ordengk`, `${JSON.stringify(msgToPrint)}`);
    }

    this.snackBar.open(`Imprimiendo pedido #${ort.numero_orden}`, 'Impresión', { duration: 3000 });
  }

  printToBT = (msgToPrint: string = '') => {
    const convertir = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_ENVIA_COMO_BASE64);    
    const data = convertir ? Base64.encode(msgToPrint, true) : msgToPrint;    
    const AppHref = GLOBAL.DEEP_LINK_ANDROID.replace('__INFOBASE64__', data);
    try {
      window.location.href = AppHref; 
    } catch(error) {
      this.snackBar.open('No se pudo conectar con la aplicación de impresión', 'Comanda', { duration: 3000 });
    }
  }
}
