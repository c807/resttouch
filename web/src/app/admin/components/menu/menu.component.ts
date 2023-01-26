import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

import { NodoAppMenu } from '@admin-interfaces/acceso-usuario';
import { AppMenuService } from '@admin-services/app-menu.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

  @Output() public elementClicked = new EventEmitter();
  
  treeControl = new NestedTreeControl<NodoAppMenu>(node => node.hijos);
  dataSource = new MatTreeNestedDataSource<NodoAppMenu>();
  public opciones: NodoAppMenu[] = [];

  private endSubs = new Subscription();

  constructor(
    private appMenuSrvc: AppMenuService
  ) { }

  ngOnInit() {
    this.endSubs.add(      
      this.appMenuSrvc.getOpciones().subscribe((res: NodoAppMenu[]) => {        
        this.opciones = res;
        this.dataSource.data = this.opciones;
      })
    );
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  itemClicked() {
    this.elementClicked.emit();
  }

  hasChild = (_: number, node: NodoAppMenu) => !!node.hijos && node.hijos.length > 0;

  tieneHijos = (node: NodoAppMenu) => !!node.hijos && node.hijos.length > 0;

  onProductoClicked(opc: NodoAppMenu) { }
}
