import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { WmsModule } from '../wms/wms.module';
import { PosModule } from '../pos/pos.module';
import { CallcenterModule } from '../callcenter/callcenter.module';
import { FlexLayoutModule } from '@angular/flex-layout';

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

// import { MatKeyboardModule } from '@ngx-material-keyboard/core';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';

// import { NgVirtualKeyboardModule } from '@protacon/ng-virtual-keyboard';

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
import { TurnoComponent } from './components/turno/turno/turno.component';
import { ListaTurnoComponent } from './components/turno/lista-turno/lista-turno.component';
import { FormTurnoComponent } from './components/turno/form-turno/form-turno.component';
import { AreaDesignerComponent } from './components/area/area-designer/area-designer.component';
import { RptVentasComponent } from './components/reportes/rpt-ventas/rpt-ventas.component';
import { PorCategoriaComponent } from './components/reportes/rpt-ventas/por-categoria/por-categoria.component';
import { PorArticuloComponent } from './components/reportes/rpt-ventas/por-articulo/por-articulo.component';
import { TurnosComponent } from './components/reportes/turnos/turnos.component';
import { PropinasComponent } from './components/reportes/propinas/propinas.component';
import { ComandaEnLineaComponent } from './components/comanda-en-linea/comanda-en-linea.component';
import { CajaComponent } from './components/reportes/caja/caja.component';
import { FacturaComponent } from './components/reportes/factura/factura.component';
import { ListaTurnoTipoComponent } from './components/turno-tipo/lista-turno/lista-turno.component';
import { FormTurnoTipoComponent } from './components/turno-tipo/form-turno/form-turno.component';
import { TurnoTipoComponent } from './components/turno-tipo/turno/turno.component';
import { PropinaComponent } from './components/propina/propina/propina.component';
import { FormPropinaComponent } from './components/propina/form-propina/form-propina.component';
import { ListaPropinaComponent } from './components/propina/lista-propina/lista-propina.component';
import { AutoconsultaComponent } from './components/reportes/autoconsulta/autoconsulta.component';
import { CajacorteComponent } from './components/caja-corte/cajacorte/cajacorte.component';
import { CajacorteListaComponent } from './components/caja-corte/cajacorte-lista/cajacorte-lista.component';
import { CajacorteFormComponent } from './components/caja-corte/cajacorte-form/cajacorte-form.component';
import { ValidaPwdGerenteTurnoComponent } from './components/valida-pwd-gerente-turno/valida-pwd-gerente-turno.component';
import { TrasladoMesaComponent } from './components/traslado-mesa/traslado-mesa.component';
import { ConfiguraMesaComponent } from './components/area/configura-mesa/configura-mesa.component';
import { TranCocinaComponent } from './components/tran-cocina/tran-cocina.component';
import { TranComandaAltComponent } from './components/tran-comanda-alt/tran-comanda-alt.component';
import { NotasGeneralesComandaComponent } from './components/notas-generales-comanda/notas-generales-comanda.component';
import { NuevaCuentaComponent } from './components/nueva-cuenta/nueva-cuenta.component';
import { DistribuirProductosCuentasComponent } from './components/distribuir-productos-cuentas/distribuir-productos-cuentas.component';


@NgModule({
  declarations: [
    TranAreasComponent, MesaComponent, AbrirMesaComponent, TranComandaComponent, ListaProductosComandaComponent, UnirCuentaComponent,
    ListaAreaComponent, FormAreaComponent, AreaComponent, PideDatosCuentasComponent, TurnoComponent, ListaTurnoComponent,
    FormTurnoComponent, AreaDesignerComponent, RptVentasComponent, PorCategoriaComponent, PorArticuloComponent, TurnosComponent,
    PropinasComponent, ComandaEnLineaComponent, CajaComponent, FacturaComponent, ListaTurnoTipoComponent, FormTurnoTipoComponent,
    TurnoTipoComponent, PropinaComponent, FormPropinaComponent, ListaPropinaComponent, AutoconsultaComponent,
    CajacorteComponent, CajacorteListaComponent, CajacorteFormComponent, ValidaPwdGerenteTurnoComponent, TrasladoMesaComponent,
    ConfiguraMesaComponent, TranCocinaComponent, TranComandaAltComponent, NotasGeneralesComandaComponent, NuevaCuentaComponent,
    DistribuirProductosCuentasComponent
  ],
  imports: [
    CommonModule,
    RestauranteRoutingModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    WmsModule,
    PosModule,
    CallcenterModule,
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
    EcoFabSpeedDialModule,
    DragDropModule,
    MatBadgeModule
  ],
  providers: [
    MatNativeDateModule
  ]
})
export class RestauranteModule { }
