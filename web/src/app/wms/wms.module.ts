import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';

import { WmsRoutingModule } from './wms-routing.module';
import { ListaProductoComponent } from './components/producto/lista-producto/lista-producto.component';
import { ListaIngresoComponent } from './components/ingreso/lista-ingreso/lista-ingreso.component';
import { FormIngresoComponent } from './components/ingreso/form-ingreso/form-ingreso.component';
import { IngresoComponent } from './components/ingreso/ingreso/ingreso.component';
import { ProductoComponent } from './components/producto/producto/producto.component';
import { FormProductoComponent } from './components/producto/form-producto/form-producto.component';
import { CategoriaProductoComponent } from './components/producto/categoria-producto/categoria-producto.component';
import { EgresoComponent } from './components/egreso/egreso/egreso.component';
import { ListaEgresoComponent } from './components/egreso/lista-egreso/lista-egreso.component';
import { FormEgresoComponent } from './components/egreso/form-egreso/form-egreso.component';
import { TransformacionComponent } from './components/transformacion/transformacion.component';

// import { TransformacionService } from './services/transformacion.service';
import { ExistenciasComponent } from './components/reporte/existencias/existencias.component';
import { KardexComponent } from './components/reporte/kardex/kardex.component';
import { ListaProductoAltComponent } from './components/producto/lista-producto-alt/lista-producto-alt.component';
import { ProduccionComponent } from './components/produccion/produccion.component';
import { ReporteComponent } from './components/fisico/reporte/reporte.component';
import { ValorizadoComponent } from './components/reporte/valorizado/valorizado.component';
import { FisicoComponent } from './components/fisico/fisico/fisico.component';
import { FormInventarioFisicoComponent } from './components/fisico/form-inventario-fisico/form-inventario-fisico.component';
import { ReplicarASedesComponent } from './components/producto/replicar-a-sedes/replicar-a-sedes.component';
import { ReplicarASedesDialogComponent } from './components/producto/replicar-a-sedes-dialog/replicar-a-sedes-dialog.component';
import { SubCategoriaProductoComponent } from './components/producto/sub-categoria-producto/sub-categoria-producto.component';
import { QuickEditProductoComponent } from './components/producto/quick-edit-producto/quick-edit-producto.component';
import { RepIngresoComponent } from './components/reporte/rep-ingreso/rep-ingreso.component';
import { ListaPreciosTipoClienteComponent } from './components/producto/lista-precios-tipo-cliente/lista-precios-tipo-cliente.component';
import { ConsumosComponent } from './components/reporte/consumos/consumos.component';
import { ResumenEgresoComponent } from './components/reporte/resumen-egreso/resumen-egreso.component';
import { ResumenIngresoComponent } from './components/reporte/resumen-ingreso/resumen-ingreso.component';
import { UsoIngredienteComponent } from './components/reporte/uso-ingrediente/uso-ingrediente.component';
import { MargenRecetaComponent } from './components/reporte/margen-receta/margen-receta.component';
import { ConsumoArticuloComponent } from './components/reporte/consumo-articulo/consumo-articulo.component';
import { PideTipoMovimientoDestinoComponent } from './components/egreso/pide-tipo-movimiento-destino/pide-tipo-movimiento-destino.component';
import { TipoMovimientoComponent } from './components/tipo-movimiento/tipo-movimiento/tipo-movimiento.component';
import { FormTipoMovimientoComponent } from './components/tipo-movimiento/form-tipo-movimiento/form-tipo-movimiento.component';
import { ListaTipoMovimientoComponent } from './components/tipo-movimiento/lista-tipo-movimiento/lista-tipo-movimiento.component';
import { DialogWizardComponent } from './components/producto/wizards/dialog-wizard/dialog-wizard.component';
import { ComboWizardComponent } from './components/producto/wizards/combo/combo-wizard/combo-wizard.component';
import { DetalleComboWizardComponent } from './components/producto/wizards/combo/detalle-combo-wizard/detalle-combo-wizard.component';

@NgModule({
  declarations: [
    ListaProductoComponent, ListaIngresoComponent, FormIngresoComponent, IngresoComponent, ProductoComponent, FormProductoComponent,
    CategoriaProductoComponent, EgresoComponent, ListaEgresoComponent, FormEgresoComponent, TransformacionComponent, ExistenciasComponent,
    KardexComponent, ListaProductoAltComponent, ProduccionComponent, ReporteComponent, ValorizadoComponent, FisicoComponent,
    FormInventarioFisicoComponent, ReplicarASedesComponent, ReplicarASedesDialogComponent, SubCategoriaProductoComponent, QuickEditProductoComponent, RepIngresoComponent, 
    ListaPreciosTipoClienteComponent, ConsumosComponent, ResumenEgresoComponent, ResumenIngresoComponent, UsoIngredienteComponent, MargenRecetaComponent, ConsumoArticuloComponent, 
    PideTipoMovimientoDestinoComponent, TipoMovimientoComponent, FormTipoMovimientoComponent, ListaTipoMovimientoComponent, DialogWizardComponent, ComboWizardComponent, DetalleComboWizardComponent
  ],
  imports: [
    CommonModule,
    WmsRoutingModule,
    FlexLayoutModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatAutocompleteModule,
    MatChipsModule,
    ScrollingModule,
    MatStepperModule,
    MatRadioModule,
    MatExpansionModule
  ],
  providers: [ ],
  exports: [
    ListaProductoComponent, ListaProductoAltComponent
  ]
})
export class WmsModule { }
