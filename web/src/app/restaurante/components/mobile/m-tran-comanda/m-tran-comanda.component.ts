import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSelectChange } from '@angular/material/select';
import { TranComanda } from '@restaurante-classes/tran-comanda';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { ConfiguracionService } from '@admin/services/configuracion.service';

import { IDatosTranComanda } from '@restaurante-interfaces/comanda';
import { Articulo, NodoProducto } from '@wms-interfaces/articulo';

import { ComandaService } from '@restaurante-services/comanda.service';
import { ArticuloService } from '@wms-services/articulo.service';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { UsuarioService } from '@admin-services/usuario.service';
import { CorrelativoService } from '@admin-services/correlativo.service';

@Component({
  selector: 'app-m-tran-comanda',
  templateUrl: './m-tran-comanda.component.html',
  styleUrls: ['./m-tran-comanda.component.css']
})
export class MTranComandaComponent extends TranComanda implements OnInit, OnDestroy {

  // @ViewChild('txtCodigoBarras') txtCodigoBarras: MatInput;  

  public categorias: any[] = [];
  public subCategorias: any[] = [];
  public listaSubCategorias: any[] = [];
  public articulos: Articulo[] = [];
  public fullListArticulos: Articulo[] = [];  
  // public cantidadDeArticulos = 0;
  // public totalDeCuenta = 0;

  constructor(
    public dialogRef: MatDialogRef<MTranComandaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDatosTranComanda,
    public dialog: MatDialog,
    protected snackBar: MatSnackBar,
    public comandaSrvc: ComandaService,
    protected socket: Socket,
    protected ls: LocalstorageService,
    protected pdfServicio: ReportePdfService,
    protected configSrvc: ConfiguracionService,
    protected articuloSrvc: ArticuloService,
    protected bsAccionesCmd: MatBottomSheet,
    protected usuarioSrvc: UsuarioService,
    protected correlativoSrvc: CorrelativoService
  ) {
    super(dialog, snackBar, comandaSrvc, socket, ls, pdfServicio, configSrvc, articuloSrvc, bsAccionesCmd, usuarioSrvc, correlativoSrvc);
  }

  ngOnInit(): void {
    this.loadArticulosDePOS();
    this.setDatos();    
  }

  ngOnDestroy(): void {    
  }
  
  setDatos = () => {
    if (this.data) {
      if (this.data.mesa) {
        this.mesaEnUso = this.data.mesa;

        if (this.data.clientePedido) {
          this.clientePedido = this.data.clientePedido;
        }

        this.alIniciar();
        const ctaAbierta = this.mesaEnUso.cuentas.find(c => +c.cerrada === 0);
        if(ctaAbierta) {
          this.setSelectedCuenta(ctaAbierta.numero);
        }        
      }      
    }
  }

  cerrar = () => this.dialogRef.close();

  loadArticulosDePOS = () => {
    this.endSubs.add(
      this.articuloSrvc.getArticulosDePOS().subscribe((res: any) => {
        if (res) {
          this.categorias = res.categorias;
          this.subCategorias = res.subcategorias;
          this.articulos = res.articulos;
          this.fullListArticulos = JSON.parse(JSON.stringify(this.articulos));
        }
      })
    );
  }

  addArticulo = (art: Articulo) => {    
    if (!this.bloqueoBotones) {
      const obj: NodoProducto = {
        id: +art.articulo,
        nombre: art.descripcion,
        precio: +art.precio,
        impresora: art.impresora,
        presentacion: art.presentacion,
        codigo: art.codigo,
        combo: art.combo,
        multiple: art.multiple
      };      
      this.pedirCantidadArticulo(obj);
    }
  }

  msChangeCuenta = (laCuenta: MatSelectChange) => {
    this.setSelectedCuenta(laCuenta.value.numero);
  }

  // setCantidadDeArticulos = (cnt: number) => {    
  //   this.cantidadDeArticulos = cnt;
  // }

  // setTotalDeCuenta = (tot: number) => {    
  //   this.totalDeCuenta = tot;
  // }

}
