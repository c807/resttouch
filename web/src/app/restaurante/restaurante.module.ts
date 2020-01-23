import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { WmsModule } from '../wms/wms.module';
import { PosModule } from '../pos/pos.module';
//import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

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

import { MatKeyboardModule } from '@ngx-material-keyboard/core';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';

import { RestauranteRoutingModule } from './restaurante-routing.module';
import { TranAreasComponent } from './components/tran-areas/tran-areas.component';
import { MesaComponent } from './components/mesa/mesa.component';
import { AbrirMesaComponent } from './components/abrir-mesa/abrir-mesa.component';
import { TranComandaComponent } from './components/tran-comanda/tran-comanda.component';
import { ListaProductosComandaComponent } from './components/lista-productos-comanda/lista-productos-comanda.component';
import { UnirCuentaComponent } from './components/unir-cuenta/unir-cuenta.component';
import { ListaAreaComponent } from './components/area/lista-area/lista-area.component';
import { FormAreaComponent } from './components/area/form-area/form-area.component';
import { AreaComponent } from './components/area/area/area.component';
import { PideDatosCuentasComponent } from './components/pide-datos-cuentas/pide-datos-cuentas.component';

//const config: SocketIoConfig = { url: 'http://localhost:8988', options: {} };

@NgModule({
  declarations: [TranAreasComponent, MesaComponent, AbrirMesaComponent, TranComandaComponent, ListaProductosComandaComponent, UnirCuentaComponent, ListaAreaComponent, FormAreaComponent, AreaComponent, PideDatosCuentasComponent],
  entryComponents: [
    AbrirMesaComponent, UnirCuentaComponent, PideDatosCuentasComponent
  ],
  imports: [
    CommonModule,
    RestauranteRoutingModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    WmsModule,
    PosModule,
    //SocketIoModule.forRoot(config),
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
    EcoFabSpeedDialModule
  ]
})
export class RestauranteModule { }
