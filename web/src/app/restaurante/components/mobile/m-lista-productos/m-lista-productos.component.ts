import { Component, OnInit, Input } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { Articulo } from '../../../../wms/interfaces/articulo';

@Component({
  selector: 'app-m-lista-productos',
  templateUrl: './m-lista-productos.component.html',
  styleUrls: ['./m-lista-productos.component.css']
})
export class MListaProductosComponent implements OnInit {

  get listaSubCategorias() {
    return (idCategoria: number) => {
      return this.subCategorias.filter(sc => +sc.categoria === +idCategoria);
    }
  }

  @Input() categorias: any[] = [];
  @Input() subCategorias: any[] = [];  
  @Input() articulos: Articulo[] = [];
  public articulosFiltered: Articulo[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  changeCategoriaTab = (mtce: MatTabChangeEvent) => {    
    this.listaArticulos(this.categorias[mtce.index].categoria);
  }

  listaArticulos = (idCategoria: number, idSubCategoria: number = null) => {    
    if (idSubCategoria && +idSubCategoria > 0) {
      this.articulosFiltered = this.articulos.filter(a => +a.categoria === +idCategoria && +a.categoria_grupo === +idSubCategoria);
    } else if(idCategoria && +idCategoria > 0) {
      this.articulosFiltered = this.articulos.filter(a => +a.categoria === +idCategoria);
    } else {
      this.articulosFiltered = JSON.parse(JSON.stringify(this.articulos));
    }
  }

  clickEnArticulo = (obj: Articulo) => {
    console.log('ARTICULO = ', obj);
  }

}
