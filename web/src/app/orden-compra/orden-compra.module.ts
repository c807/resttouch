import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';

import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';

import { OrdenCompraRoutingModule } from './orden-compra-routing.module';
import { OrdenCompraComponent } from './components/orden-compra/orden-compra/orden-compra.component';
import { ListaOrdenCompraComponent } from './components/orden-compra/lista-orden-compra/lista-orden-compra.component';
import { FormOrdenCompraComponent } from './components/orden-compra/form-orden-compra/form-orden-compra.component';
import { RptListaPedidosComponent } from './components/reporte/rpt-lista-pedidos/rpt-lista-pedidos.component';
import { ResumenPedidosProveedorComponent } from './components/reporte/resumen-pedidos-proveedor/resumen-pedidos-proveedor.component';


@NgModule({
  declarations: [OrdenCompraComponent, ListaOrdenCompraComponent, FormOrdenCompraComponent, RptListaPedidosComponent, ResumenPedidosProveedorComponent],
  imports: [
    CommonModule,
    OrdenCompraRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    MatKeyboardModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatTabsModule,
    MatTableModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatMenuModule,
    MatGridListModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSidenavModule,
    MatTreeModule,
  ]
})
export class OrdenCompraModule { }
