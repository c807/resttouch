import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
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
import { MatRippleModule } from '@angular/material/core';

import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';

import { FilterPipe } from './pipes/filter.pipe';
import { PROTOCOLO, ANFITRION } from './global';
import { WindowComponent } from './components/window/window.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { RptFechasComponent } from './components/rpt-fechas/rpt-fechas.component';
import { RptBotonesComponent } from './components/rpt-botones/rpt-botones.component';
import { CargandoComponent } from './components/cargando/cargando.component';
import { CheckPasswordComponent } from './components/check-password/check-password.component';
import { DialogCocinaComponent } from './components/dialog-cocina/dialog-cocina.component';
import { DialogPedidoComponent } from './components/dialog-pedido/dialog-pedido.component';
import { DialogComboComponent } from './components/dialog-combo/dialog-combo.component';
import { DialogElminarProductoComponent } from './components/dialog-elminar-producto/dialog-elminar-producto.component';
import { ExtraProductoComponent } from './components/extra-producto/extra-producto.component';
import { TruncarPipe } from './pipes/truncar.pipe';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { SafePipe } from './pipes/safe.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';

const config: SocketIoConfig = { url: `${PROTOCOLO}//${ANFITRION}:8988`, options: {} };

@NgModule({
  declarations: [
    FilterPipe,
    WindowComponent,
    ConfirmDialogComponent,
    RptFechasComponent,
    RptBotonesComponent,
    CargandoComponent,
    CheckPasswordComponent,
    DialogCocinaComponent,
    DialogPedidoComponent,
    DialogComboComponent,
    DialogElminarProductoComponent,
    TruncarPipe,
    ExtraProductoComponent,
    PdfViewerComponent,
    SafePipe,
    SanitizePipe
  ],
  imports: [
    CommonModule,
    PortalModule,
    FormsModule,
    SocketIoModule.forRoot(config),
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
    MatRippleModule,
    FlexLayoutModule
  ],
  exports: [
    FilterPipe,
    WindowComponent,
    ConfirmDialogComponent,
    RptFechasComponent,
    RptBotonesComponent,
    CargandoComponent,
    CheckPasswordComponent,
    DialogCocinaComponent,
    DialogPedidoComponent,
    DialogComboComponent,
    TruncarPipe,
    ExtraProductoComponent,
    PdfViewerComponent,
    SafePipe,
    SanitizePipe
  ]
})
export class SharedModule { }
