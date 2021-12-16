import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdminModule } from '../admin/admin.module';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';

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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatBadgeModule } from '@angular/material/badge';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { CallcenterRoutingModule } from './callcenter-routing.module';
import { PideTelefonoDialogComponent } from './components/pide-telefono-dialog/pide-telefono-dialog.component';
import { TipoDireccionComponent } from './components/tipo-direccion/tipo-direccion/tipo-direccion.component';
import { ListaTipoDireccionComponent } from './components/tipo-direccion/lista-tipo-direccion/lista-tipo-direccion.component';
import { FormTipoDireccionComponent } from './components/tipo-direccion/form-tipo-direccion/form-tipo-direccion.component';
import { ClienteMasterComponent } from './components/cliente-master/cliente-master/cliente-master.component';
import { ClienteMasterDialogComponent } from './components/cliente-master/cliente-master-dialog/cliente-master-dialog.component';
import { FormClienteMasterComponent } from './components/cliente-master/form-cliente-master/form-cliente-master.component';
import { ClienteMasterTelefonoComponent } from './components/cliente-master/cliente-master-telefono/cliente-master-telefono.component';
import { SeleccionaTelefonoComponent } from './components/cliente-master/selecciona-telefono/selecciona-telefono.component';
import { ClienteMasterDireccionComponent } from './components/cliente-master/cliente-master-direccion/cliente-master-direccion.component';
import {AgregaDireccionComponent} from './components/cliente-master/agrega-direccion/agrega-direccion.component';
import {ClienteMasterNotaComponent} from './components/cliente-master/cliente-master-nota/cliente-master-nota.component';
import {AgregaNotaComponent} from './components/cliente-master/agregar-nota/agrega-nota.component';
import {AgregarDatoDeFacturacionComponent} from './components/cliente-master/agregar-dato-de-facturacion/agregar-dato-de-facturacion';
import {DialogAgregarClienteComponent} from './components/cliente-master/dialog-agregar-cliente/dialog-agregar-cliente.component';

/**
 * New Components must be added in declarations,
 * Modules from libraries for example Angular.Material must be added on imports
 */
@NgModule({
  declarations: [DialogAgregarClienteComponent , AgregarDatoDeFacturacionComponent, AgregaNotaComponent, AgregaDireccionComponent, PideTelefonoDialogComponent, TipoDireccionComponent, ListaTipoDireccionComponent, FormTipoDireccionComponent, ClienteMasterComponent, ClienteMasterDialogComponent, FormClienteMasterComponent, ClienteMasterTelefonoComponent, SeleccionaTelefonoComponent, ClienteMasterNotaComponent ,ClienteMasterDireccionComponent],
  imports: [
    CommonModule,
    CallcenterRoutingModule,
    HttpClientModule,
    FormsModule,
    MatKeyboardModule,
    SharedModule,
    AdminModule,
    FlexLayoutModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    DragDropModule,
    MatBadgeModule,
    ScrollingModule
  ],
  exports: [PideTelefonoDialogComponent]
})
export class CallcenterModule { }
