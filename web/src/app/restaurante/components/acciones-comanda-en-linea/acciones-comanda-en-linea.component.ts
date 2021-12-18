import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../shared/global';
import * as moment from 'moment';

import { NotasGeneralesComandaComponent } from '../notas-generales-comanda/notas-generales-comanda.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { ComandaService } from '../../services/comanda.service';
import { ProductoSelected } from '../../../wms/interfaces/articulo';
import { OrdenGkService } from '../../../ghost-kitchen/services/orden-gk.service';
import { FacturaService } from '../../../pos/services/factura.service';
import { ConfiguracionService } from '../../../admin/services/configuracion.service';
import { EstatusCallcenterService } from '../../../callcenter/services/estatus-callcenter.service';
import { EstatusCallcenter } from '../../../callcenter/interfaces/estatus-callcenter';

import { Subscription } from 'rxjs';

interface IDataAccionesComandaEnLinea {
  comanda: any;
}

@Component({
  selector: 'app-acciones-comanda-en-linea',
  templateUrl: './acciones-comanda-en-linea.component.html',
  styleUrls: ['./acciones-comanda-en-linea.component.css']
})
export class AccionesComandaEnLineaComponent implements OnInit, OnDestroy {

  public lstEstatusCallCenter: EstatusCallcenter[] = [];
  
  private endSubs = new Subscription();

  constructor(
    private bsAccionesComanda: MatBottomSheetRef<AccionesComandaEnLineaComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: IDataAccionesComandaEnLinea,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private comandaSrvc: ComandaService,
    private socket: Socket,
    private ls: LocalstorageService,
    private ordenGkSrvc: OrdenGkService,
    private facturaSrvc: FacturaService,
    private configSrvc: ConfiguracionService,
    private estatusCallcenterSrvc: EstatusCallcenterService

  ) { }

  ngOnInit(): void {
    if (this.data.comanda.estatus_callcenter.estatus_callcenter !== undefined && this.data.comanda.estatus_callcenter.estatus_callcenter !== null) {
      this.loadEstatusCallCenter();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadEstatusCallCenter = () => this.endSubs.add(this.estatusCallcenterSrvc.get({ esautomatico: 0 }).subscribe(res => this.lstEstatusCallCenter = res));

  cerrar = (refrescar = false, comanda: any = null) => this.bsAccionesComanda.dismiss({refrescar, comanda});

  getNotasGenerales = (obj: any) => {
    // console.log(obj); return;
    const ngenDialog = this.dialog.open(NotasGeneralesComandaComponent, {
      width: '50%',
      data: { notasGenerales: (obj.notas_generales || '') }
    });
    this.endSubs.add(      
      ngenDialog.afterClosed().subscribe((notasGen: string) => {
        if (notasGen !== null) {
          if (notasGen.trim().length > 0) {
            this.endSubs.add(              
              this.comandaSrvc.saveNotasGenerales({ comanda: obj.comanda, notas_generales: notasGen }).subscribe(res => {
                if (res.exito) {
                  obj.notas_generales = notasGen;
                  this.snackBar.open(res.mensaje, 'Comanda', { duration: 3000 });
                } else {
                  this.snackBar.open(`ERROR: ${res.mensaje}`, 'Comanda', { duration: 7000 });
                }
              })
            );
          }
        }
      })
    );
  }  

  setToPrint = (articulos: any[]) => {
    const lstArticulos: any[] = [];
    articulos.forEach(item => {
      lstArticulos.push({
        id: +item.articulo.articulo,
        nombre: item.articulo.descripcion,
        cantidad: +item.cantidad,
        total: +item.total,
        notas: item.notas || '',
        impresora: {
          bluetooth: +item.articulo.impresora.bluetooth,
          direccion_ip: item.articulo.impresora.direccion_ip || '',
          impresora: +item.articulo.impresora.impresora,
          nombre: item.articulo.impresora.nombre || '',
          sede: +item.articulo.impresora.sede,
          ubicacion: item.articulo.impresora.ubicacion || ''
        },
        detalle: item.detalle
      });
    });
    return lstArticulos;
  }

  imprimir = (obj: any, idx: number = 0) => {
    // console.log(obj); // return;
    const listaProductos = this.setToPrint(obj.cuentas[0].productos);
    const AImpresoraNormal: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 0);
    const AImpresoraBT: ProductoSelected[] = listaProductos.filter(p => +p.impresora.bluetooth === 1);

    let objToPrint = {};

    if (AImpresoraNormal.length > 0) {
      // console.log(AImpresoraNormal);
      objToPrint = {
        Indice: (idx + 1),
        Tipo: 'Comanda',
        Nombre: obj.cuentas[0].nombre,
        Numero: obj.comanda,
        NoOrdenEnLinea: obj.origen_datos.numero_orden,
        DireccionEntrega: obj.origen_datos.direccion_entrega,
        DetalleCuenta: AImpresoraNormal,
        Total: 0.00,
        NotasGenerales: obj.notas_generales || ''
      };
      // console.log('STRING (IN) = ', JSON.stringify(objToPrint));
      // console.log('OBJETO (IN) = ', objToPrint);
      this.socket.emit('print:comanda', `${JSON.stringify(objToPrint)}`);
    }

    if (AImpresoraBT.length > 0) {
      objToPrint = {
        Tipo: 'Comanda',
        Nombre: obj.cuentas[0].nombre,
        Numero: obj.comanda,
        NoOrdenEnLinea: obj.origen_datos.numero_orden,
        DireccionEntrega: obj.origen_datos.direccion_entrega,
        DetalleCuenta: AImpresoraBT,
        Total: 0.00
      };
      // console.log('STRING (BT) = ', JSON.stringify(objToPrint));
      // console.log('OBJETO (BT) = ', objToPrint);
      this.printToBT(JSON.stringify(objToPrint));
    }

    if (+obj.orden_gk > 0) {
      const params = {
        orden_gk: +obj.orden_gk,
        estatus_orden_gk: 5,
        sede: this.ls.get(GLOBAL.usrTokenVar).sede,
        comentario: `Se mandó a imprimir la comanda #${obj.comanda} de la orden #${obj.orden_gk} de Ghost Kitchen.`
      };
      this.cambiarEstatusOrdenGK(params);
    }
  }

  printToBT = (msgToPrint: string = '') => {
    const AppHref = `com.restouch.impresion://impresion/${msgToPrint}`;
    const wref = window.open(AppHref, 'PrntBT', 'height=200,width=200,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
    setTimeout(() => wref.close(), 1000);
  }

  cambiarEstatusOrdenGK = (params: any) => {
    this.endSubs.add(      
      this.ordenGkSrvc.cambiarEstatus(params).subscribe(res => {
        if (res.exito) {
          this.socket.emit('gk:updEstatusOrden', `${JSON.stringify({ orden_gk: params.orden_gk, estatus_orden_gk: res.estatus_orden_gk, sede_uuid: this.ls.get(GLOBAL.usrTokenVar).sede_uuid })}`);
        } else {
          this.snackBar.open(`ERROR:${res.mensaje}`, 'Orden de Ghost Kitchen', { duration: 7000 });
        }
      })
    );
  }

  cancelarPedido = (obj: any) => {
    // console.log(obj);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Cancelar pedido',
        'Si cancela el pedido, será necesario volver a ingresarlo. ¿Desea continuar?',
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
          const params = {};  
          for (const input of res.config.input) {
            params[input.id] = input.valor;
          }
          this.endSubs.add(            
            this.comandaSrvc.cancelarPedido(obj.comanda, params).subscribe(resAnula => {
              if (resAnula.exito) {    
                if (+obj.orden_gk > 0) {
                  const params = {
                    orden_gk: +obj.orden_gk,
                    estatus_orden_gk: 2,
                    sede: this.ls.get(GLOBAL.usrTokenVar).sede,
                    comentario: `Se canceló la comanda #${obj.comanda} de la orden #${obj.orden_gk} de Ghost Kitchen.`
                  };
                  this.cambiarEstatusOrdenGK(params);
                }    
                this.snackBar.open('Pedido cancelado con éxito...', 'Pedido', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${resAnula.mensaje}`, 'Pedido', { duration: 7000 });
              }
              this.cerrar(true);
            })
          );  
        }
      })
    );
  }

  firmar = (obj: any) => {
    // console.log(obj);
    this.endSubs.add(
      this.facturaSrvc.firmar(+obj.factura.factura).subscribe((res: any) => {
        // console.log(res);
        if (res.exito) {       
  
          if (+obj.orden_gk > 0) {
            const params = {
              orden_gk: +obj.orden_gk,
              estatus_orden_gk: 6,
              sede: this.ls.get(GLOBAL.usrTokenVar).sede,
              comentario: `Se firmó la factura de la comanda #${obj.comanda} de la orden #${obj.orden_gk} de Ghost Kitchen.`
            };
            this.cambiarEstatusOrdenGK(params);
          }
  
          const confirmRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: new ConfirmDialogModel('Imprimir factura', '¿Desea imprimir la factura?', 'Sí', 'No')
          });
  
          this.endSubs.add(            
            confirmRef.afterClosed().subscribe((confirma: boolean) => {
              if (confirma) {
                const modoFactura = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_MODO_FACTURA) || 1;
                // console.log(`MODO FACTURA = ${modoFactura}`);
                if (modoFactura === 1) {
                  this.printFactura(res.factura, obj.origen_datos);
                } else {
                  this.representacionGrafica(+obj.factura.factura);
                }
              }
              this.cerrar(true);
            })
          );
        }
        this.snackBar.open(res.mensaje, 'Facturación', { duration: (res.exito ? 3000 : 10000) });
      })
    );
  }

  printFactura = (fact: any, datosOrigen: any = {}) => {
    const dataToPrint = {
      NombreEmpresa: fact.empresa.nombre_comercial,
      NitEmpresa: fact.empresa.nit,
      SedeEmpresa: fact.sedeFactura.nombre,
      DireccionEmpresa: fact.empresa.direccion,
      Fecha: moment(fact.fecha_factura).format(GLOBAL.dateFormat),
      Nit: fact.receptor.nit,
      Nombre: fact.receptor.nombre,
      Direccion: fact.receptor.direccion,
      Serie: fact.serie_factura,
      Numero: fact.numero_factura,
      Total: 0.00,
      NoAutorizacion: fact.fel_uuid,
      NombreCertificador: fact.certificador_fel.nombre,
      NitCertificador: fact.certificador_fel.nit,
      FechaDeAutorizacion: fact.fecha_autorizacion,
      NoOrdenEnLinea: datosOrigen.numero_orden,
      FormaDePago: (datosOrigen.metodo_pago && datosOrigen.metodo_pago.length > 0) ? datosOrigen.metodo_pago.join(', ') : '',
      DetalleFactura: []
    };

    for (const det of fact.detalle) {
      dataToPrint.DetalleFactura.push({
        Cantidad: parseInt(det.cantidad),
        Descripcion: det.articulo.descripcion,
        Total: parseFloat(det.total),
        PrecioUnitario: +det.precio_unitario
      });
      dataToPrint.Total += parseFloat(det.total);
    }

    this.socket.emit('print:factura', JSON.stringify(dataToPrint));
  }

  representacionGrafica = (idfactura: number) => {
    this.endSubs.add(
      this.facturaSrvc.getGrafo(idfactura).subscribe(res => {
        if (res.exito) {
          switch (res.tipo) {
            case 'link': this.openLinkWindow(res.documento); break;
            case 'pdf': this.openPdfDocument(res.documento); break;
          }
        }
      })
    );
  }

  openLinkWindow = (url: string) => window.open(url, 'winFactPdf', 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no');

  openPdfDocument = (pdf: string) => {
    const pdfWindow = window.open('', 'winFactPdf', 'height=700,width=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no');
    pdfWindow.document.write(
      '<iframe width="100%" style="margin: -8px;border: none;" height="100%" src="data:application/pdf;base64, ' +
      encodeURI(pdf) +
      '"></iframe>');
  }

  cambiarEstatusPedidoCallCenter = (estatusCC: EstatusCallcenter) => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel('Cambiar estatus de pedido', `¿Desea cambiar el estatus a ${estatusCC.descripcion}`, 'Sí', 'No')
    });

    this.endSubs.add(            
      confirmRef.afterClosed().subscribe((confirma: boolean) => {
        if (confirma) {
          const params = {
            estatus_callcenter: +estatusCC.estatus_callcenter,
            comanda: +this.data.comanda.comanda
          };
          this.endSubs.add(
            this.comandaSrvc.cambiaEstatusPedidoCallCenter(params).subscribe(res => {
              if (res.exito) {
                this.snackBar.open(res.mensaje, 'Estatus', { duration: 3000 });
                this.cerrar(false, res.comanda);
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Estatus', { duration: 7000 });
              }      
            })
          );          
        }        
      })
    );
  }
}
