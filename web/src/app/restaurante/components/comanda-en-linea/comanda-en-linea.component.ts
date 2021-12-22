import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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

  @ViewChild('tblPedidos') tblPedidos: MatTable<any[]>;
  public dataSource: any[] = [];
  // public columnsToDisplay = ['comanda', 'orden', 'fechahora', 'nombre', 'total', 'acciones', 'notas', 'imprimir', 'cancelar', 'facturar'];
  public columnsToDisplay = ['comanda', 'orden', 'fechahora', 'nombre', 'total', 'acciones'];
  public expandedElement: any | null;
  public comandasEnLinea: any[] = [];
  // public intervalId: any;
  public params: any = { de: 0, a: 99 };
  public lstEstatusCallCenter: EstatusCallcenter[] = [];

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    public bsAccionesCmd: MatBottomSheet,
    private snackBar: MatSnackBar,
    private socket: Socket,
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private dns: DesktopNotificationService,
    private estatusCallcenterSrvc: EstatusCallcenterService
    // private facturaSrvc: FacturaService,
    // private pdfServicio: ReportePdfService,
    // private configSrvc: ConfiguracionService,
    // private ordenGkSrvc: OrdenGkService,
  ) { }

  ngOnInit() {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('shopify:updlist', (obj: any = null) => {
        if (obj && obj.corporacion) {
          const suuid = this.ls.get(GLOBAL.usrTokenVar).sede_uuid;
          if (suuid.indexOf(obj.corporacion) > -1) {
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

      this.socket.on(
        'reconnect_attempt',
        (attempt: number) => this.snackBar.open(`INTENTO DE RECONEXIÓN #${attempt}`, 'ERROR', { duration: 10000 })
      );

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
    const opciones: NotificationOptions = {
      icon: 'assets/img/minilogo.png',
      body: `Se recibió una nueva orden a las ${moment().format(GLOBAL.dateTimeFormat)}.`,
      dir: 'auto'
    };
    this.dns.createNotification('Rest-Touch Pro', 10000, opciones);
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadEstatusCallCenter = () => this.endSubs.add(this.estatusCallcenterSrvc.get({ esautomatico: 0 }).subscribe(res => this.lstEstatusCallCenter = res));

  loadComandasEnLinea = () => {
    this.endSubs.add(
      this.comandaSrvc.getComandasOnLIne({ callcenter: 1 }).subscribe((res: any[]) => {
        this.comandasEnLinea = res;
        this.dataSource = this.comandasEnLinea;
      })
    );
  }

  abrirAccionesComandaEnLinea = (obj: any) => {
    const bs = this.bsAccionesCmd.open(AccionesComandaEnLineaComponent, {
      autoFocus: false,
      data: { comanda: obj, lstEstatus: this.lstEstatusCallCenter }
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

  // setToPrint = (articulos: any[]) => {
  //   const lstArticulos: any[] = [];
  //   articulos.forEach(item => {
  //     lstArticulos.push({
  //       id: +item.articulo.articulo,
  //       nombre: item.articulo.descripcion,
  //       cantidad: +item.cantidad,
  //       total: +item.total,
  //       notas: item.notas || '',
  //       impresora: {
  //         bluetooth: +item.articulo.impresora.bluetooth,
  //         direccion_ip: item.articulo.impresora.direccion_ip || '',
  //         impresora: +item.articulo.impresora.impresora,
  //         nombre: item.articulo.impresora.nombre || '',
  //         sede: +item.articulo.impresora.sede,
  //         ubicacion: item.articulo.impresora.ubicacion || ''
  //       },
  //       detalle: item.detalle
  //     });
  //   });
  //   return lstArticulos;
  // }

  // getPdf = (obj: any) => {
  //   const noCuenta = +obj.cuentas[0].cuenta;
  //   this.pdfServicio.getComanda(noCuenta).subscribe(res => {
  //     if (res) {
  //       const blob = new Blob([res], { type: 'application/pdf' });
  //       const url = window.URL.createObjectURL(blob);
  //       window.open(url, `cuenta_${noCuenta}`, 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
  //     } else {
  //       this.snackBar.open('No se pudo generar la comanda...', 'Comanda', { duration: 3000 });
  //     }
  //   });
  // }

  // imprimir = (obj: any, idx: number = 0) => {
  //   // console.log(obj); // return;
  //   const listaProductos = this.setToPrint(obj.cuentas[0].productos);
  //   const AImpresoraNormal: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 0);
  //   const AImpresoraBT: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 1);

  //   let objToPrint = {};

  //   if (AImpresoraNormal.length > 0) {
  //     // console.log(AImpresoraNormal);
  //     objToPrint = {
  //       Indice: (idx + 1),
  //       Tipo: 'Comanda',
  //       Nombre: obj.cuentas[0].nombre,
  //       Numero: obj.comanda,
  //       NoOrdenEnLinea: obj.origen_datos.numero_orden,
  //       DireccionEntrega: obj.origen_datos.direccion_entrega,
  //       DetalleCuenta: AImpresoraNormal,
  //       Total: 0.00,
  //       NotasGenerales: obj.notas_generales || ''
  //     };
  //     // console.log('STRING (IN) = ', JSON.stringify(objToPrint));
  //     // console.log('OBJETO (IN) = ', objToPrint);
  //     this.socket.emit('print:comanda', `${JSON.stringify(objToPrint)}`);
  //   }

  //   if (AImpresoraBT.length > 0) {
  //     objToPrint = {
  //       Tipo: 'Comanda',
  //       Nombre: obj.cuentas[0].nombre,
  //       Numero: obj.comanda,
  //       NoOrdenEnLinea: obj.origen_datos.numero_orden,
  //       DireccionEntrega: obj.origen_datos.direccion_entrega,
  //       DetalleCuenta: AImpresoraBT,
  //       Total: 0.00
  //     };
  //     // console.log('STRING (BT) = ', JSON.stringify(objToPrint));
  //     // console.log('OBJETO (BT) = ', objToPrint);
  //     this.printToBT(JSON.stringify(objToPrint));
  //   }

  //   if (+obj.orden_gk > 0) {
  //     const params = {
  //       orden_gk: +obj.orden_gk,
  //       estatus_orden_gk: 5,
  //       sede: this.ls.get(GLOBAL.usrTokenVar).sede,
  //       comentario: `Se mandó a imprimir la comanda #${obj.comanda} de la orden #${obj.orden_gk} de Ghost Kitchen.`
  //     };
  //     this.cambiarEstatusOrdenGK(params);
  //   }
  // }

  // printToBT = (msgToPrint: string = '') => {
  //   const AppHref = `com.restouch.impresion://impresion/${msgToPrint}`;
  //   const wref = window.open(AppHref, 'PrntBT', 'height=200,width=200,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
  //   setTimeout(() => wref.close(), 1000);
  // }

  // firmar = (obj: any) => {
  //   // console.log(obj);
  //   this.facturaSrvc.firmar(+obj.factura.factura).subscribe((res: any) => {
  //     // console.log(res);
  //     if (res.exito) {
  //       this.loadComandasEnLinea();

  //       if (+obj.orden_gk > 0) {
  //         const params = {
  //           orden_gk: +obj.orden_gk,
  //           estatus_orden_gk: 6,
  //           sede: this.ls.get(GLOBAL.usrTokenVar).sede,
  //           comentario: `Se firmó la factura de la comanda #${obj.comanda} de la orden #${obj.orden_gk} de Ghost Kitchen.`
  //         };
  //         this.cambiarEstatusOrdenGK(params);
  //       }

  //       const confirmRef = this.dialog.open(ConfirmDialogComponent, {
  //         maxWidth: '400px',
  //         data: new ConfirmDialogModel('Imprimir factura', '¿Desea imprimir la factura?', 'Sí', 'No')
  //       });

  //       confirmRef.afterClosed().subscribe((confirma: boolean) => {
  //         if (confirma) {
  //           const modoFactura = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_MODO_FACTURA) || 1;
  //           // console.log(`MODO FACTURA = ${modoFactura}`);
  //           if (modoFactura === 1) {
  //             this.printFactura(res.factura, obj.origen_datos);
  //           } else {
  //             this.representacionGrafica(+obj.factura.factura);
  //           }
  //         }
  //       });
  //     }
  //     this.snackBar.open(res.mensaje, 'Facturación', { duration: (res.exito ? 3000 : 10000) });
  //   });
  // }

  // printFactura = (fact: any, datosOrigen: any = {}) => {
  //   const dataToPrint = {
  //     NombreEmpresa: fact.empresa.nombre_comercial,
  //     NitEmpresa: fact.empresa.nit,
  //     SedeEmpresa: fact.sedeFactura.nombre,
  //     DireccionEmpresa: fact.empresa.direccion,
  //     Fecha: moment(fact.fecha_factura).format(GLOBAL.dateFormat),
  //     Nit: fact.receptor.nit,
  //     Nombre: fact.receptor.nombre,
  //     Direccion: fact.receptor.direccion,
  //     Serie: fact.serie_factura,
  //     Numero: fact.numero_factura,
  //     Total: 0.00,
  //     NoAutorizacion: fact.fel_uuid,
  //     NombreCertificador: fact.certificador_fel.nombre,
  //     NitCertificador: fact.certificador_fel.nit,
  //     FechaDeAutorizacion: fact.fecha_autorizacion,
  //     NoOrdenEnLinea: datosOrigen.numero_orden,
  //     FormaDePago: (datosOrigen.metodo_pago && datosOrigen.metodo_pago.length > 0) ? datosOrigen.metodo_pago.join(', ') : '',
  //     DetalleFactura: []
  //   };

  //   for (const det of fact.detalle) {
  //     dataToPrint.DetalleFactura.push({
  //       Cantidad: parseInt(det.cantidad),
  //       Descripcion: det.articulo.descripcion,
  //       Total: parseFloat(det.total),
  //       PrecioUnitario: +det.precio_unitario
  //     });
  //     dataToPrint.Total += parseFloat(det.total);
  //   }

  //   this.socket.emit('print:factura', JSON.stringify(dataToPrint));
  // }

  // representacionGrafica = (idfactura: number) => {
  //   this.facturaSrvc.getGrafo(idfactura).subscribe(res => {
  //     if (res.exito) {
  //       switch (res.tipo) {
  //         case 'link': this.openLinkWindow(res.documento); break;
  //         case 'pdf': this.openPdfDocument(res.documento); break;
  //       }
  //     }
  //   });
  // }

  // openLinkWindow = (url: string) =>
  //   window.open(url, 'winFactPdf', 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no')

  // openPdfDocument = (pdf: string) => {
  //   const pdfWindow = window.open('', 'winFactPdf', 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
  //   pdfWindow.document.write(
  //     '<iframe width="100%" style="margin: -8px;border: none;" height="100%" src="data:application/pdf;base64, ' +
  //     encodeURI(pdf) +
  //     '"></iframe>');
  // }

  // imprimirLote = () => {
  //   for (let i = this.params.de; i <= this.params.a; i++) {
  //     this.imprimir(this.comandasEnLinea[i], i);
  //   }
  // }

  // cancelarPedido = (obj: any) => {
  //   // console.log(obj);

  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     maxWidth: '400px',
  //     data: new ConfirmDialogModel(
  //       'Cancelar pedido',
  //       'Si cancela el pedido, será necesario volver a ingresarlo. ¿Desea continuar?',
  //       'Sí',
  //       'No',
  //       {
  //         input: [
  //           {
  //             select: false,
  //             label: 'Comentario',
  //             valor: null,
  //             id: 'comentario',
  //             requerido: false
  //           }
  //         ]
  //       }
  //     )
  //   });

  //   dialogRef.afterClosed().subscribe(res => {
  //     if (res.resultado) {
  //       const params = {};

  //       for (const input of res.config.input) {
  //         params[input.id] = input.valor;
  //       }

  //       this.comandaSrvc.cancelarPedido(obj.comanda, params).subscribe(resAnula => {
  //         if (resAnula.exito) {

  //           if (+obj.orden_gk > 0) {
  //             const params = {
  //               orden_gk: +obj.orden_gk,
  //               estatus_orden_gk: 2,
  //               sede: this.ls.get(GLOBAL.usrTokenVar).sede,
  //               comentario: `Se canceló la comanda #${obj.comanda} de la orden #${obj.orden_gk} de Ghost Kitchen.`
  //             };
  //             this.cambiarEstatusOrdenGK(params);
  //           }

  //           this.snackBar.open('Pedido cancelado con éxito...', 'Pedido', { duration: 3000 });
  //         } else {
  //           this.snackBar.open(`ERROR: ${resAnula.mensaje}`, 'Pedido', { duration: 7000 });
  //         }
  //         this.loadComandasEnLinea();
  //       });
  //     }
  //   });

  // }

  // cambiarEstatusOrdenGK = (params: any) => {
  //   this.ordenGkSrvc.cambiarEstatus(params).subscribe(res => {
  //     if (res.exito) {
  //       this.socket.emit('gk:updEstatusOrden', `${JSON.stringify({ orden_gk: params.orden_gk, estatus_orden_gk: res.estatus_orden_gk, sede_uuid: this.ls.get(GLOBAL.usrTokenVar).sede_uuid })}`);
  //     } else {
  //       this.snackBar.open(`ERROR:${res.mensaje}`, 'Orden de Ghost Kitchen', { duration: 7000 });
  //     }
  //   });
  // }

  // getNotasGenerales = (obj: any) => {
  //   // console.log(obj); return;
  //   const ngenDialog = this.dialog.open(NotasGeneralesComandaComponent, {
  //     width: '50%',
  //     data: { notasGenerales: (obj.notas_generales || '') }
  //   });
  //   ngenDialog.afterClosed().subscribe((notasGen: string) => {
  //     if (notasGen !== null) {
  //       if (notasGen.trim().length > 0) {
  //         this.comandaSrvc.saveNotasGenerales({ comanda: obj.comanda, notas_generales: notasGen }).subscribe(res => {
  //           if (res.exito) {
  //             obj.notas_generales = notasGen;
  //             this.snackBar.open(res.mensaje, 'Comanda', { duration: 3000 });
  //           } else {
  //             this.snackBar.open(`ERROR: ${res.mensaje}`, 'Comanda', { duration: 7000 });
  //           }
  //         });
  //       }
  //     }
  //   });
  // }
}
