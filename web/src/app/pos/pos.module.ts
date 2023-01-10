import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdminModule } from '../admin/admin.module';

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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';

import { PosRoutingModule } from './pos-routing.module';
import { CobrarPedidoComponent } from './components/cobrar-pedido/cobrar-pedido.component';
import { FormaPagoComponent } from './components/formaPago/forma-pago/forma-pago.component';
import { ListaFormaPagoComponent } from './components/formaPago/lista-forma-pago/lista-forma-pago.component';
import { FormFormaPagoComponent } from './components/formaPago/form-forma-pago/form-forma-pago.component';
import { FacturaManualComponent } from './components/facturaManual/factura-manual/factura-manual.component';
import { ListaFacturaManualComponent } from './components/facturaManual/lista-factura-manual/lista-factura-manual.component';
import { FormFacturaManualComponent } from './components/facturaManual/form-factura-manual/form-factura-manual.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FacturaMigrarComponent } from './components/factura-migrar/factura-migrar.component';
import { DresultadoListaComponent } from './components/facturaManual/dresultado-lista/dresultado-lista.component';
import { DresultadoItemComponent } from './components/facturaManual/dresultado-item/dresultado-item.component';


@NgModule({
  declarations: [
    CobrarPedidoComponent, FormaPagoComponent, ListaFormaPagoComponent, FormFormaPagoComponent, FacturaManualComponent,
    ListaFacturaManualComponent, FormFacturaManualComponent, FacturaMigrarComponent, DresultadoListaComponent, DresultadoItemComponent
  ],
  imports: [
    CommonModule,
    PosRoutingModule,
    HttpClientModule,
    FormsModule,
    MatKeyboardModule,
    SharedModule,
    AdminModule,
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
    MatAutocompleteModule,
    ScrollingModule,
    EcoFabSpeedDialModule,
    MatTooltipModule
  ],
  exports: [CobrarPedidoComponent]
})
export class PosModule { }
