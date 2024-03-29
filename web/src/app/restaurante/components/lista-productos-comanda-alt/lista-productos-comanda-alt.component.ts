import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { ValidaPwdGerenteTurnoComponent } from '@restaurante-components/valida-pwd-gerente-turno/valida-pwd-gerente-turno.component';
import { DialogElminarProductoComponent, ElminarProductoModel } from '@shared-components/dialog-elminar-producto/dialog-elminar-producto.component';
import { NotasGeneralesComandaComponent } from '@restaurante-components/notas-generales-comanda/notas-generales-comanda.component';
import { MAccionesArticuloComandaComponent } from '@restaurante-components/mobile/m-acciones-articulo-comanda/m-acciones-articulo-comanda.component';
import { Socket } from 'ngx-socket-io';

import { DetalleCuentaSimplified } from '@restaurante-interfaces/cuenta';
import { DetalleComanda } from '@restaurante-interfaces/detalle-comanda';
import { ComandaService } from '@restaurante-services/comanda.service';
import { ComandaGetResponse } from '@restaurante-interfaces/comanda';

import { Impresion } from '@restaurante-classes/impresion';

import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-productos-comanda-alt',
  templateUrl: './lista-productos-comanda-alt.component.html',
  styleUrls: ['./lista-productos-comanda-alt.component.css']
})
export class ListaProductosComandaAltComponent implements OnInit, OnDestroy {

  get cantidadDeProductos() {
    let cntProd = 0;
    for (const p of this.detalleCuenta) {
      cntProd += +p.cantidad;
    }    
    return cntProd;
  }

  get totalDeProductos() {
    return (lista: DetalleCuentaSimplified[] = null) => {
      let totProd = 0.00;
      let lst: DetalleCuentaSimplified[] = lista || this.detalleCuenta;      
      for (const p of lst) {          
        totProd += +p.total + this.totalDeProductos(p.detalle);
      }      
      return totProd;
    }
  }

  get esGerente() {    
    if (+this.mesaEnUso.mesa.escallcenter === 1) {
      return true;
    }
    return this.rolesUsuario.indexOf('gerente') > -1;
  }

  @Input() detalleCuenta: DetalleCuentaSimplified[] = [];
  @Input() listHeight = '450px';
  @Input() bloqueoBotones = false;
  @Input() mesaEnUso: ComandaGetResponse = undefined;
  @Input() rolesUsuario = '';
  @Output() productoRemovedEv = new EventEmitter();  

  public esMovil = false;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public detalleComanda: DetalleComanda;
  public layoutChanges: Observable<BreakpointState>;
  public isXSmallScreen = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private socket: Socket,
    public dialog: MatDialog,
    public breakpointObserver: BreakpointObserver,
    public bsAccionesArticuloCmd: MatBottomSheet,
  ) { }

  ngOnInit(): void {    
    this.isXSmallScreen = this.breakpointObserver.isMatched(Breakpoints.XSmall);
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;


    this.layoutChanges = this.breakpointObserver.observe([
      Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge
    ]);

    this.endSubs.add(
      this.layoutChanges.subscribe(() => this.isXSmallScreen = this.breakpointObserver.isMatched(Breakpoints.XSmall))
    );
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  toggleShowInputNotas = (p: DetalleCuentaSimplified) => {
    const ngenDialog = this.dialog.open(NotasGeneralesComandaComponent, {
      width: '50%',
      data: {
        titulo: `artículo ${p.descripcion}`,
        notasGenerales: (p.notas || '')
      }
    });

    this.endSubs.add(
      ngenDialog.afterClosed().subscribe((notasGen: string) => {
        if (notasGen !== null && notasGen !== undefined) {
          this.endSubs.add(
            this.comandaSrvc.saveNotasProducto({ detalle_comanda: p.detalle_comanda, notas: notasGen.trim() }).subscribe(res => {
              if (res.exito) {
                p.notas = notasGen.trim();
                this.snackBar.open(res.mensaje, 'Artículo', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Artículo', { duration: 7000 });
              }
            })
          );          
        }
      })
    );
  }

  removeProducto = (p: DetalleCuentaSimplified, idx: number, estaAutorizado = false, cantidad?: number, gerente = 0, regresa_inventario = true) => {
    this.bloqueoBotones = true;

    this.detalleComanda = {
      detalle_cuenta: p.detalle_cuenta,
      detalle_comanda: p.detalle_comanda,
      articulo: p.articulo,
      cantidad: +p.cantidad > 1 ? (+p.cantidad) - 1 : 0,
      precio: +p.precio,
      total: +p.cantidad > 1 ? ((+p.cantidad) - 1) * (+p.precio) : 0,
      notas: p.notas,
      autorizado: estaAutorizado,
      gerente,
      regresa_inventario
    };

    if (cantidad) {
      this.detalleComanda.cantidad = +p.cantidad - +cantidad;
      this.detalleComanda.total = (this.detalleComanda.cantidad * this.detalleComanda.precio)
    }

    const params = {
      detalle_comanda: p.detalle_comanda,
      cantidad: +p.cantidad > 1 ? (+p.cantidad) - 1 : 0,
      total: +p.cantidad > 1 ? ((+p.cantidad) - 1) * (+p.precio) : 0,
      autorizado: estaAutorizado,
      gerente,
      regresa_inventario,
      cuenta: +p.cuenta_cuenta
    };

    if (+p.combo === 0) {
      this.endSubs.add(
        this.comandaSrvc.saveDetalle(p.comanda, p.cuenta_cuenta, this.detalleComanda).subscribe(res => {          
          if (res.exito) {
            if (res.anulacion) {
              this.imprimirAnulacionDeProducto(res.comanda, res.anulacion);
            }
            p.cantidad = this.detalleComanda.cantidad;            
            this.productoRemovedEv.emit(+p.numero_cuenta);
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
    } else {
      params.cantidad = +p.cantidad - cantidad;
      params.total = (params.cantidad * +p.precio);
      this.endSubs.add(
        this.comandaSrvc.eliminarDetalleComanda(params).subscribe(res => {
          if (res.exito) {
            if (res.anulacion) {
              this.imprimirAnulacionDeProducto(res.comanda, res.anulacion);
            }
            this.productoRemovedEv.emit(+p.numero_cuenta);
            if (+params.cantidad === 0) {
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
  }

  deleteProductoFromList = (p: DetalleCuentaSimplified, idx: number, estaAutorizado = false) => {
    p.notas = '';
    this.removeProducto(p, idx, estaAutorizado, +p.cantidad);
  }

  deleteProductoFromListAfterPrinted = (p: DetalleCuentaSimplified, idx: number) => {
    this.bloqueoBotones = true;
    if (+this.mesaEnUso.mesa.escallcenter === 1) {
      const idUsr = this.ls.get(GLOBAL.usrTokenVar).idusr || 0;
      this.executeDeleteAfterPrinted(p, idx, +idUsr);
    } else {
      const dialogoRef = this.dialog.open(ValidaPwdGerenteTurnoComponent, {
        width: '40%', disableClose: true
      });  
      this.endSubs.add(
        dialogoRef.afterClosed().subscribe(res => {        
          if (res) {
            if (res.esgerente) {
              this.executeDeleteAfterPrinted(p, idx, +res.gerente_turno);                          
            } else {
              this.snackBar.open('La contraseña no es correcta', 'Comanda', { duration: 5000 });
            }
          }
          this.bloqueoBotones = false;
        })
      );
    }
  }

  executeDeleteAfterPrinted = (p: DetalleCuentaSimplified, idx: number, gerente = 0) => {
    const dialogDelete = this.dialog.open(DialogElminarProductoComponent, {
      width: '50%', disableClose: true, data: new ElminarProductoModel(JSON.parse(JSON.stringify(p)))
    });
    this.endSubs.add(
      dialogDelete.afterClosed().subscribe(resDel => {                
        if (resDel && resDel.respuesta) {
          this.removeProducto(p, idx, true, resDel.producto.cantidad, gerente, resDel.retornar_inventario);
        }
        // this.productoRemovedEv.emit(+p.numero_cuenta);
        this.bloqueoBotones = false;
      })
    );
    this.snackBar.open('Se eliminará el producto seleccionado.', 'Comanda', { duration: 5000 });    
  }

  abrirAccionesArticuloComanda = (p: DetalleCuentaSimplified, i: number) => {
    const bs = this.bsAccionesArticuloCmd.open(MAccionesArticuloComandaComponent, {
      autoFocus: false,
      data: { p }
    });

    this.endSubs.add(
      bs.afterDismissed().subscribe((res: number) => {        
        switch(+res) {
          case 1: this.deleteProductoFromList(p, i); break;
          case 2: this.removeProducto(p, i); break;
          case 3: this.toggleShowInputNotas(p); break;
          case 4: this.deleteProductoFromListAfterPrinted(p, i); break;
        }
      })
    );

  }

  imprimirAnulacionDeProducto = (comanda: any, anulacion: any) => {
    const obj = {
      ubicacion: `${this.mesaEnUso.mesa.area.nombre} - Mesa ${this.mesaEnUso.mesa.etiqueta || this.mesaEnUso.mesa.numero}`,
      atiende: `${this.mesaEnUso.mesero.nombres} ${this.mesaEnUso.mesero.apellidos}`,
      comanda: +comanda.comanda,
      cuenta: +comanda.cuentas[0].numero,
      nombre: comanda.cuentas[0].nombre,
      usuario_cancela: `${this.ls.get(GLOBAL.usrTokenVar).nombres} ${this.ls.get(GLOBAL.usrTokenVar).apellidos}`,
      articulo: anulacion.articulo,
      cantidad: +anulacion.cantidad,
      impresora: anulacion.impresora
    }

    const objImpresion = new Impresion(this.socket);
    objImpresion.imprimirAnulacionProducto(obj);
  }
}
