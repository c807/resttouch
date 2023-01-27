import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { NodoProducto } from '@wms-interfaces/articulo';
import { ArticuloService } from '@wms-services/articulo.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-producto',
  templateUrl: './lista-producto.component.html',
  styleUrls: ['./lista-producto.component.css']
})
export class ListaProductoComponent implements OnInit, OnDestroy {

  @Input() treeHeight = '450px';
  @Output() productoClickedEv = new EventEmitter();

  treeControl = new NestedTreeControl<NodoProducto>(node => node.hijos);
  dataSource = new MatTreeNestedDataSource<NodoProducto>();
  public arbol: NodoProducto[];

  private endSubs = new Subscription();

  constructor(
    private ls: LocalstorageService,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit() {
    this.loadArbolArticulos();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  hasChild = (_: number, node: NodoProducto) => !!node.hijos && node.hijos.length > 0;

  tieneHijos = (node: NodoProducto) => !!node.hijos && node.hijos.length > 0;

  onProductoClicked(producto: NodoProducto) {
    this.productoClickedEv.emit(producto);
  }

  loadArbolArticulos() {
    this.endSubs.add(      
      this.articuloSrvc.getArbolArticulosMante((this.ls.get(GLOBAL.usrTokenVar).sede || 0)).subscribe(res => {        
        if (res) {
          this.arbol = this.articuloSrvc.convertToArbolNodoProducto(res);          
          this.dataSource.data = this.arbol;
        }
      })
    );
  }
}
