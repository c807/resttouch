import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';

import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { OnlineService } from '../../../../shared/services/online.service';
import { db } from '../../../../offline/db';

import { ArbolArticulos, ArbolCategoriaGrupo, Articulo, NodoProducto } from '../../../interfaces/articulo';
import { ArticuloService } from '../../../services/articulo.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-producto-alt',
  templateUrl: './lista-producto-alt.component.html',
  styleUrls: ['./lista-producto-alt.component.css']
})
export class ListaProductoAltComponent implements OnInit, OnDestroy {

  get isOnline() {
    return this.onlineSrvc.isOnline$.value;
  }

  @Input() bloqueoBotones = false;
  @Output() productoClickedEv = new EventEmitter();
  @Output() categoriasFilledEv = new EventEmitter();
  public categorias: ArbolArticulos[] = [];
  public subcategorias: ArbolCategoriaGrupo[] = [];
  public articulos: Articulo[] = [];

  private endSubs = new Subscription();

  constructor(
    private articuloSrvc: ArticuloService,
    private ls: LocalstorageService,
    private onlineSrvc: OnlineService
  ) { }

  ngOnInit() {
    this.loadArbolArticulos();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadArbolArticulos = () => {
    if (this.isOnline) {
      this.endSubs.add(        
        this.articuloSrvc.getArbolArticulos((this.ls.get(GLOBAL.usrTokenVar).sede || 0)).subscribe((res: ArbolArticulos[]) => {
          this.fillCategorias(res);
          db.arbol_articulos.clear().then(() => {
            db.arbol_articulos.bulkAdd(res);
          });
        })
      );
    } else {
      db.arbol_articulos.toArray().then((res: ArbolArticulos[]) => {
        this.fillCategorias(res);
      });
    }
  }

  fillCategorias = (cats: ArbolArticulos[]) => {
    this.categorias = [];
    this.subcategorias = [];
    this.articulos = [];
    for (const cat of cats) {
      this.categorias.push(cat);
    }
    this.categoriasFilledEv.emit(this.categorias);
  }

  fillSubCategorias = (subcats: ArbolCategoriaGrupo[]) => {
    this.subcategorias = [];
    this.articulos = [];
    for (const subcat of subcats) {
      if (+subcat.debaja === 0){
        this.subcategorias.push(subcat);
      }
    }
  }

  fillArticulos = (arts: Articulo[]) => {
    this.articulos = [];
    for (const a of arts) {
      if (+a.debaja === 0)
      {
        this.articulos.push(a);
      }
    }
  }

  clickOnCategoria = (cat: ArbolArticulos) => {
    if (cat.categoria_grupo.length > 0) {
      this.fillSubCategorias(cat.categoria_grupo);
    }
  }

  clickOnSubCategoria = (scat: ArbolCategoriaGrupo) => {
    if (scat.articulo.length > 0) {
      this.fillArticulos(scat.articulo);
    }
  }

  clickOnArticulo = (art: Articulo) => {
    const obj: NodoProducto = {
      id: +art.articulo,
      nombre: art.descripcion,
      precio: +art.precio,
      impresora: art.impresora,
      presentacion: art.presentacion,
      codigo: art.codigo,
      combo: art.combo,
      multiple: art.multiple,
      debaja: art.debaja
    };
    // console.log(obj);
    this.productoClickedEv.emit(obj);
    // this.subcategorias = [];
    // this.articulos = [];
  }
}
