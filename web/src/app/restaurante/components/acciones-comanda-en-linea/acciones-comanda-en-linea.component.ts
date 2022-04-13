import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../shared/global';
import * as moment from 'moment';
import { Impresion } from '../../classes/impresion';

import { NotasGeneralesComandaComponent } from '../notas-generales-comanda/notas-generales-comanda.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { PideRepartidorDialogComponent } from '../../../callcenter/components/pide-repartidor-dialog/pide-repartidor-dialog.component';

import { ComandaService } from '../../services/comanda.service';
import { OrdenGkService } from '../../../ghost-kitchen/services/orden-gk.service';
import { FacturaService } from '../../../pos/services/factura.service';
import { ConfiguracionService } from '../../../admin/services/configuracion.service';
import { EstatusCallcenterService } from '../../../callcenter/services/estatus-callcenter.service';
import { EstatusCallcenter } from '../../../callcenter/interfaces/estatus-callcenter';
import { ComandaEnLineaComponent } from '../comanda-en-linea/comanda-en-linea.component';

import { Subscription } from 'rxjs';

interface IDataAccionesComandaEnLinea {
  comanda: any;
  lstEstatus: EstatusCallcenter[];
  comandaEnLinea: ComandaEnLineaComponent;
}

@Component({
  selector: 'app-acciones-comanda-en-linea',
  templateUrl: './acciones-comanda-en-linea.component.html',
  styleUrls: ['./acciones-comanda-en-linea.component.css']
})
export class AccionesComandaEnLineaComponent implements OnInit, OnDestroy {

  get estaFirmada() {
    const fact = this.data.comanda.factura;
    if (fact !== null && fact !== undefined && fact.fel_uuid !== null && fact.fel_uuid !== undefined) {
      return true;
    }
    return false;
  }

  get usaWMS() {
    return (this.ls.get(GLOBAL.usrTokenVar).acceso as Array<any> || []).findIndex(a => a.nombre === 'WMS') > -1;
  }

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
      if (this.data.lstEstatus && this.data.lstEstatus.length > 0) {
        this.lstEstatusCallCenter = this.data.lstEstatus;
      } else {
        this.loadEstatusCallCenter();
      }
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadEstatusCallCenter = () => this.endSubs.add(this.estatusCallcenterSrvc.get({ esautomatico: 0 }).subscribe(res => this.lstEstatusCallCenter = res));

  cerrar = (refrescar = false, comanda: any = null) => this.bsAccionesComanda.dismiss({ refrescar, comanda });

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

  imprimir = (obj: any, idx: number = 0) => {
    obj.EsReimpresion = true;
    // console.log(obj); // return;
    const objImpresion = new Impresion(this.socket, this.ls, this.comandaSrvc, this.configSrvc);
    objImpresion.imprimir(obj, idx);

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

    const inputs: any = {
      input: [
        {
          select: false,
          label: 'Comentario',
          valor: null,
          id: 'comentario',
          requerido: false
        }
      ]
    };

    if (this.usaWMS) {
      inputs.input.push(
        {
          select: true,
          label: '¿Reversar inventario?',
          valor: 1,
          id: 'reversa_inventario',
          descripcion: 'descripcion',
          requerido: true,
          datos: [
            { reversa_inventario: 1, descripcion: 'Sí' },
            { reversa_inventario: 2, descripcion: 'No' }
          ]
        }
      );
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Cancelar pedido',
        'Si cancela el pedido, será necesario volver a ingresarlo. ¿Desea continuar?',
        'Sí',
        'No',
        inputs
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res.resultado) {
          const params = {};
          for (const input of res.config.input) {
            params[input.id] = input.valor;
          }
          // console.log('PARAMS = ', params);
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
                  this.printFactura(res.factura, obj.origen_datos, obj);
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

  printFactura = (fact: any, datosOrigen: any = {}, comanda: any = {}) => {
    const dataToPrint = {
      IdFactura: +fact.factura || 0,
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
      DetalleFactura: [],
      Comanda: comanda.comanda || 0,
      Cuenta: comanda.cuentas[0].cuenta || 0,
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

  updateEstatusPedidoCC = (params: any) => {
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
            comanda: +this.data.comanda.comanda,
            repartidor: null
          };

          if (+estatusCC.pedir_repartidor === 0) {
            this.updateEstatusPedidoCC(params);
          } else {
            const pideRepartidorRef = this.dialog.open(PideRepartidorDialogComponent, {
              width: '50%',
              disableClose: true,
              data: {
                comanda: +this.data.comanda.comanda,
              }
            });

            this.endSubs.add(
              pideRepartidorRef.afterClosed().subscribe((idRepartidor: number = null) => {
                if (idRepartidor) {
                  params.repartidor = idRepartidor;
                  this.updateEstatusPedidoCC(params);
                } else {
                  this.snackBar.open('Se canceló el cambio de estatus.', 'Estatus', { duration: 3000 });
                }
              })
            );
          }
        }
      })
    );
  }

  detenerAudio = () => this.data.comandaEnLinea.detenerAudio();
}
