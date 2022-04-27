import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatInput } from '@angular/material/input';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
// import { GLOBAL } from '../../../../shared/global';
import { TranComanda } from '../../../classes/tran-comanda';
import { Socket } from 'ngx-socket-io';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { ConfiguracionService } from '../../../../admin/services/configuracion.service';

import { IDatosTranComanda } from '../../../interfaces/comanda';
import { Articulo } from '../../../../wms/interfaces/articulo';

import { ComandaService } from '../../../services/comanda.service';
import { ArticuloService } from '../../../../wms/services/articulo.service';
import { ReportePdfService } from '../../../services/reporte-pdf.service';
import { UsuarioService } from '../../../../admin/services/usuario.service';

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
    protected usuarioSrvc: UsuarioService        
  ) {
    super(dialog, snackBar, comandaSrvc, socket, ls, pdfServicio, configSrvc, articuloSrvc, bsAccionesCmd, usuarioSrvc);
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

}
