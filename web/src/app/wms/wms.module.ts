import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';
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

import { MatKeyboardModule } from '@ngx-material-keyboard/core';


import { WmsRoutingModule } from './wms-routing.module';
import { ListaProductoComponent } from './components/producto/lista-producto/lista-producto.component';
import { ListaIngresoComponent } from './components/ingreso/lista-ingreso/lista-ingreso.component';
import { FormIngresoComponent } from './components/ingreso/form-ingreso/form-ingreso.component';
import { IngresoComponent } from './components/ingreso/ingreso/ingreso.component';
import { ProductoComponent } from './components/producto/producto/producto.component';
import { FormProductoComponent } from './components/producto/form-producto/form-producto.component';
import { CategoriaProductoComponent } from './components/producto/categoria-producto/categoria-producto.component';


@NgModule({
  declarations: [ListaProductoComponent, ListaIngresoComponent, FormIngresoComponent, IngresoComponent, ProductoComponent, FormProductoComponent, CategoriaProductoComponent],
  imports: [
    CommonModule,
    WmsRoutingModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
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
    MatKeyboardModule,
    MatSidenavModule,
    MatTreeModule
  ],
  exports: [
    ListaProductoComponent
  ]
})
export class WmsModule { }
