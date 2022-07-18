import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';

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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';

import { GhostKitchenRoutingModule } from './ghost-kitchen-routing.module';
import { SeguimientoComponent } from './components/seguimiento/seguimiento.component';
import { DistribucionPropinasComponent } from './components/reporte/distribucion-propinas/distribucion-propinas.component';
import { VentaMarcaComponent } from './components/reporte/venta-marca/venta-marca.component';


@NgModule({
  declarations: [SeguimientoComponent, DistribucionPropinasComponent, VentaMarcaComponent],
  imports: [
    CommonModule,
    GhostKitchenRoutingModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    FlexLayoutModule,
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
    MatButtonToggleModule,
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
    MatBadgeModule,
    MatChipsModule,
    MatBottomSheetModule,
    MatKeyboardModule
  ],
  providers: [
    MatNativeDateModule
  ]
})
export class GhostKitchenModule { }
