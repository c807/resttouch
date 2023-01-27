import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

import { Impresora } from '@wms-interfaces/impresora';
import { Categoria } from '@wms-interfaces/categoria';
import { CategoriaGrupo } from '@wms-interfaces/categoria-grupo';
import { ArticuloService } from '@wms-services/articulo.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { CheckPasswordComponent, ConfigCheckPasswordModel } from '@shared-components/check-password/check-password.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categoria-producto',
  templateUrl: './categoria-producto.component.html',
  styleUrls: ['./categoria-producto.component.css']
})
export class CategoriaProductoComponent implements OnInit, OnDestroy {

  @Output() categoriaGrupoSvd = new EventEmitter();  
  // @Output() onChangeSubCategoriaEv = new EventEmitter();

  public categoria: Categoria;
  public categorias: Categoria[] = [];
  public categoriaGrupo: CategoriaGrupo;
  public categoriasGruposPadre: CategoriaGrupo[] = [];
  public categoriasGrupos: CategoriaGrupo[] = [];
  // public editCategoriaMode = false;
  public editSubCategoriaMode = false;
  public showCategoriasForm = true;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public impresoras: Impresora[] = [];
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetCategoria();
    this.loadCategorias();    
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetCategoria = () => {
    this.categoria = { categoria: null, sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0), descripcion: null };
  }

  loadCategorias = () => {
    this.endSubs.add(
      this.articuloSrvc.getCategorias({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0), _activos: true }).subscribe(res => {
        this.categorias = res;
      })
    );
  }

  onSubmitCategoria = () => {
    this.cargando = true;
    this.endSubs.add(      
      this.articuloSrvc.saveCategoria(this.categoria).subscribe(res => {
        if (res.exito) {          
          this.resetCategoria();
          this.loadCategorias();
          this.categoriaGrupoSvd.emit();
          this.snackBar.open('Grabada con éxito.', 'Categoría', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Categoría', { duration: 5000 });
        }
        this.cargando = false;
      })
    );
  } 

  darDeBajaChkPass = () => {
    const dialogChkPass = this.dialog.open(CheckPasswordComponent, {
      width: '40%',
      disableClose: true,
      data: new ConfigCheckPasswordModel(1)
    });

    this.endSubs.add(
      dialogChkPass.afterClosed().subscribe(res => {          
        if (res) {
          this.darDeBaja();
        } else {
          this.snackBar.open('La contraseña no es correcta.', 'Sub-categoría', { duration: 7000 });
        }        
      })
    );        
  }

  darDeBaja = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        this.categoria.descripcion,
        `Esto dará de baja la categoría, subcategoría y sus artículos en TODOS los proceso y ya NO podrá usarlos. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(      
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.articuloSrvc.darDeBajaCategoria(+this.categoria.categoria).subscribe(res => {
              if (res.exito && res.categoria) {
                this.categoria = res.categoria;
                this.loadCategorias();
              }
              this.snackBar.open(`${res.exito ? '': 'ERROR:'} ${res.mensaje}`, 'Sub-categoría', { duration: 5000 });
              this.cargando = false;
            })
          );
        }
      })
    );    
  }

  selectCat = (cat: Categoria) => {    
    this.categoria = cat;
  }
}
