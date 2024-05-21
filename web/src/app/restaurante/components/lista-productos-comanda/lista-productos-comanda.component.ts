import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidaPwdGerenteTurnoComponent } from '@restaurante-components/valida-pwd-gerente-turno/valida-pwd-gerente-turno.component';
import { Socket } from 'ngx-socket-io';

import { ProductoSelected } from '@wms-interfaces/articulo';

import { DetalleComanda } from '@restaurante-interfaces/detalle-comanda';
import { ComandaService } from '@restaurante-services/comanda.service';
import { DialogElminarProductoComponent, ElminarProductoModel } from '@shared-components/dialog-elminar-producto/dialog-elminar-producto.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-productos-comanda',
  templateUrl: './lista-productos-comanda.component.html',
  styleUrls: ['./lista-productos-comanda.component.css']
})
export class ListaProductosComandaComponent implements OnInit, OnDestroy {

  get cantidadDeProductos() {
    let cntProd = 0;
    for (const p of this.listaProductos) {
      cntProd += p.cantidad;
    }
    return cntProd;
  }

  get totalDeProductos() {
    let totProd = 0.00;
    for (const p of this.listaProductos) {
      totProd += ((p.cantidad * p.precio) + p.monto_extra);
    }
    return totProd;
  }

  @Input() listaProductos: ProductoSelected[] = [];
  @Input() noCuenta: number = null;
  @Input() listHeight = '450px';
  @Input() IdComanda = 0;
  @Input() IdCuenta = 0;
  @Input() bloqueoBotones = false;
  @Input() mesaEnUso: any = {};
  @Output() productoRemovedEv = new EventEmitter();
  public esMovil = false;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public detalleComanda: DetalleComanda;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private socket: Socket,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  removeProducto = (p: ProductoSelected, idx: number, estaAutorizado = false, cantidad?: number) => {
    this.bloqueoBotones = true;
    this.detalleComanda = {
      detalle_cuenta: p.detalle_cuenta,
      detalle_comanda: p.detalle_comanda,
      articulo: p.id,
      cantidad: +p.cantidad > 1 ? (+p.cantidad) - 1 : 0,
      precio: +p.precio,
      total: +p.cantidad > 1 ? ((+p.cantidad) - 1) * (+p.precio) : 0,
      notas: p.notas,
      notas_predefinidas: p.notas_predefinidas,
      autorizado: estaAutorizado
    };

    if (cantidad) {
      this.detalleComanda.cantidad = cantidad;
      this.detalleComanda.total = (cantidad * this.detalleComanda.precio)
    }

    this.endSubs.add(
      this.comandaSrvc.saveDetalle(this.IdComanda, this.IdCuenta, this.detalleComanda).subscribe(res => {
        if (res.exito) {
          p.cantidad = this.detalleComanda.cantidad;
          this.productoRemovedEv.emit({ listaProductos: this.listaProductos, comanda: res.comanda });
          if (+p.cantidad === 0) {
            this.socket.emit('refrescar:mesa', { mesaenuso: this.mesaEnUso });
            this.socket.emit('refrescar:listaCocina', { mesaenuso: this.mesaEnUso });
          }
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Comanda', { duration: 3000 });
        }
        this.bloqueoBotones = false;
      })
    );
  }

  deleteProductoFromList = (p: ProductoSelected, idx: number, estaAutorizado = false) => {
    p.cantidad = 0;
    p.notas = '';
    p.notas_predefinidas = '';
    this.removeProducto(p, idx, estaAutorizado);
  }

  deleteProductoFromListAfterPrinted = (p: ProductoSelected, idx: number) => {
    this.bloqueoBotones = true;
    const dialogoRef = this.dialog.open(ValidaPwdGerenteTurnoComponent, {
      width: '40%', disableClose: true
    });

    this.endSubs.add(
      dialogoRef.afterClosed().subscribe(res => {
        // console.log(res);
        if (res) {
          // this.autorizar = true;
          //this.deleteProductoFromList(p, idx, true);
          const dialogDelete = this.dialog.open(DialogElminarProductoComponent, {
            width: '40%', disableClose: true, data: new ElminarProductoModel(p)
          });

          this.endSubs.add(
            dialogDelete.afterClosed().subscribe(res => {
              if (res && res.respuesta) {
                this.removeProducto(res.producto, idx, true, res.producto.cantidad)
                this.snackBar.open('Se eliminará el producto seleccionado.', 'Comanda', { duration: 5000 });
              }
            })
          );
        } else {
          this.snackBar.open('La contraseña no es correcta', 'Comanda', { duration: 5000 });
        }
        this.bloqueoBotones = false;
      })
    );
  }

  toggleShowInputNotas(p: ProductoSelected) {
    // console.log('ARTICULO = ', p);
    p.showInputNotas = !p.showInputNotas;
    if (p.showInputNotas) {
      p.itemListHeight = '140px';
    } else {
      p.itemListHeight = '70px';
      this.saveNotasProducto(p);
    }
  }

  saveNotasProducto = (p: ProductoSelected) => {
    this.endSubs.add(
      this.comandaSrvc.saveNotasProducto({ detalle_comanda: p.detalle_comanda, notas: p.notas }).subscribe(res => {
        if (res.exito) {
          this.snackBar.open('Notas de producto guardadas con éxito...', 'Producto', { duration: 3000 });
        }
      })
    );
  }

  saveNotasPredefinidas = (p: ProductoSelected) => {
    this.endSubs.add(
      this.comandaSrvc.saveNotasPredefinidas({ detalle_comanda: p.detalle_comanda, notas_predefinidas: p.notas_predefinidas }).subscribe(res => {
        if (res.exito) {
          this.snackBar.open('Notas de producto guardadas con éxito...', 'Producto', { duration: 3000 });
        }
      })
    );
  }

  doAction(ev: string) {
    console.log(ev);
  }
}
