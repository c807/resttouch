import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, MultiFiltro, OrdenarArrayObjetos } from '@shared/global';

import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { Categoria } from '@wms-interfaces/categoria';
import { ArticuloFastEdit } from '@wms-interfaces/articulo';
import { ArticuloService } from '@wms-services/articulo.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quick-edit-producto',
  templateUrl: './quick-edit-producto.component.html',
  styleUrls: ['./quick-edit-producto.component.css']
})
export class QuickEditProductoComponent implements OnInit, OnDestroy {

  public categorias: Categoria[] = [];
  public categoriasGrupos: any[] = [];  
  public lstArticulos: ArticuloFastEdit[] = [];
  public lstArticulosFull: ArticuloFastEdit[] = [];
  public txtFiltro = '';
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadSubCategorias();
    this.loadArticulos();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadCategorias = () => this.endSubs.add(this.articuloSrvc.getCategorias({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe(res => this.categorias = res));

  loadSubCategorias = (idcategoria: number = null) => {  
    const fltr = {
      _sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 1),
      categoria: +idcategoria
    }  

    if(!idcategoria) {
      delete fltr.categoria
    }

    this.endSubs.add(      
      this.articuloSrvc.getCategoriasGrupos(fltr).subscribe(res => {
        this.categoriasGrupos = this.articuloSrvc.adaptCategoriaGrupoResponse(res);  
        this.categoriasGrupos.map(cg => {
          const cat = this.categorias.find(c => +c.categoria === +cg.categoria);
          if (cat) {
            cg.descripcion = `${cat.descripcion}-${cg.descripcion}`;            
          }
          return cg;
        });
        this.categoriasGrupos = OrdenarArrayObjetos(this.categoriasGrupos, 'descripcion');
      })
    );
  }

  loadArticulos = () => {
    this.endSubs.add(      
      this.articuloSrvc.getArticulo({ _sede: 1 }).subscribe(res => {
        res.forEach(r => {
          this.lstArticulosFull.push({
            articulo: r.articulo, 
            categoria: r.categoria_grupo.categoria,
            categoria_grupo: +r.categoria_grupo.categoria_grupo,
            descripcion: r.descripcion,
            mostrar_pos: r.mostrar_pos,
            precio: +r.precio
          });
        });
        this.lstArticulos = JSON.parse(JSON.stringify(this.lstArticulosFull));
      })
    );
  }  

  applyFilter() {
    if (this.txtFiltro.length > 0) {
      this.lstArticulos = MultiFiltro(this.lstArticulosFull, this.txtFiltro);
    } else {
      this.lstArticulos = JSON.parse(JSON.stringify(this.lstArticulosFull));
    }
  }

  updArticulo = (articulo: ArticuloFastEdit) => {
    articulo.mostrar_pos = articulo.mostrar_pos ? 1 : 0;    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Actualizar artículo',
        `Esto guardará las modificaciones realizadas en ${articulo.descripcion}. ¿Desea continuar?`,
        'Sí', 'No'
      )
    });

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          this.endSubs.add(            
            this.articuloSrvc.fastEdit(articulo).subscribe(res => {
              if (res.exito) {
                this.snackBar.open(res.mensaje, 'Artículo', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Artículo', { duration: 7000 });
              }
              this.cargando = false;
            })
          );
        }
      })
    );
  }
}
