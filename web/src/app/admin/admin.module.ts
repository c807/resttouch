import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
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
import { MatTreeModule } from '@angular/material/tree';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { SidebarDirective } from './directives/sidebar.directive';
import { MatKeyboardModule } from 'angular-onscreen-material-keyboard';

import { PivotViewAllModule, PivotFieldListAllModule } from '@syncfusion/ej2-angular-pivotview';
import {
  ChartModule, LineSeriesService, CategoryService, LegendService, DataLabelService, TooltipService
} from '@syncfusion/ej2-angular-charts';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';

import { ChartsModule } from 'ng2-charts';

import { AdminRoutingModule } from './admin-routing.module';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { ClockComponent } from './components/clock/clock.component';
import { MenuComponent } from './components/menu/menu.component';
import { UsuarioComponent } from './components/usuario/usuario/usuario.component';
import { ListaUsuarioComponent } from './components/usuario/lista-usuario/lista-usuario.component';
import { FormUsuarioComponent } from './components/usuario/form-usuario/form-usuario.component';
import { ClienteComponent } from './components/cliente/cliente/cliente.component';
import { ListaClienteComponent } from './components/cliente/lista-cliente/lista-cliente.component';
import { FormClienteComponent } from './components/cliente/form-cliente/form-cliente.component';
import { MedidaComponent } from './components/medida/medida/medida.component';
import { ListaMedidaComponent } from './components/medida/lista-medida/lista-medida.component';
import { FormMedidaComponent } from './components/medida/form-medida/form-medida.component';
import { PresentacionComponent } from './components/presentacion/presentacion/presentacion.component';
import { ListaPresentacionComponent } from './components/presentacion/lista-presentacion/lista-presentacion.component';
import { FormPresentacionComponent } from './components/presentacion/form-presentacion/form-presentacion.component';
import { FormClienteDialogComponent } from './components/cliente/form-cliente-dialog/form-cliente-dialog.component';
import { ImpresoraComponent } from './components/impresora/impresora/impresora.component';
import { FormImpresoraComponent } from './components/impresora/form-impresora/form-impresora.component';
import { ListaImpresoraComponent } from './components/impresora/lista-impresora/lista-impresora.component';
import { FpagoComponent } from './components/fpago/fpago/fpago.component';
import { FormPagoComponent } from './components/fpago/form-pago/form-pago.component';
import { ListaPagoComponent } from './components/fpago/lista-pago/lista-pago.component';
import { TipoUsuarioComponent } from './components/tipo-usuario/tipo-usuario/tipo-usuario.component';
import { ListaTipoUsuarioComponent } from './components/tipo-usuario/lista-tipo-usuario/lista-tipo-usuario.component';
import { FormTipoUsuarioComponent } from './components/tipo-usuario/form-tipo-usuario/form-tipo-usuario.component';
import { AccesoUsuarioComponent } from './components/acceso-usuario/acceso-usuario/acceso-usuario.component';
import { FormAccesoUsuarioComponent } from './components/acceso-usuario/form-acceso-usuario/form-acceso-usuario.component';
import { ListaAccesoUsuarioComponent } from './components/acceso-usuario/lista-acceso-usuario/lista-acceso-usuario.component';
import { TableroComponent } from './components/tablero/tablero.component';
import { ProveedorComponent } from './components/proveedor/proveedor/proveedor.component';
import { ListaProveedorComponent } from './components/proveedor/lista-proveedor/lista-proveedor.component';
import { FormProveedorComponent } from './components/proveedor/form-proveedor/form-proveedor.component';
import { VentasComponent } from './components/tablero/graficas/ventas/ventas.component';
import { SolicitaPinInactividadComponent } from './components/solicita-pin-inactividad/solicita-pin-inactividad.component';
import { ImpuestoEspecialComponent } from './components/impuestoEspecial/impuesto-especial/impuesto-especial.component';
import { FormImpuestoEspecialComponent } from './components/impuestoEspecial/form-impuesto-especial/form-impuesto-especial.component';
import { ListaImpuestoEspecialComponent } from './components/impuestoEspecial/lista-impuesto-especial/lista-impuesto-especial.component';
import { BodegaComponent } from './components/bodega/bodega/bodega.component';
import { FormBodegaComponent } from './components/bodega/form-bodega/form-bodega.component';
import { ListaBodegaComponent } from './components/bodega/lista-bodega/lista-bodega.component';
import { UsuarioSedeComponent } from './components/usuario-sede/usuario-sede/usuario-sede.component';
import { UsuarioSedeListaComponent } from './components/usuario-sede/usuario-sede-lista/usuario-sede-lista.component';
import { UsuarioSedeFormComponent } from './components/usuario-sede/usuario-sede-form/usuario-sede-form.component';
import { AcercaDeComponent } from './components/acerca-de/acerca-de.component';

import { ListaCertificadorConfiguracionComponent } from './components/certificador/configuracion/lista-certificador-configuracion/lista-certificador-configuracion.component';
import { FormCertificadorConfiguracionComponent } from './components/certificador/configuracion/form-certificador-configuracion/form-certificador-configuracion.component';
import { CertificadorConfiguracionComponent } from './components/certificador/configuracion/certificador-configuracion/certificador-configuracion.component'
import { CertificadorFelComponent } from './components/certificador/datos/certificador-fel/certificador-fel.component'
import { FormCertificadorFelComponent } from './components/certificador/datos/form-certificador-fel/form-certificador-fel.component';
import { CorporacionComponent } from './components/corporacion/corporacion/corporacion.component';
import { FormCorporacionComponent } from './components/corporacion/form-corporacion/form-corporacion.component';
import { ListaCorporacionComponent } from './components/corporacion/lista-corporacion/lista-corporacion.component';
import { FormSedeComponent } from './components/sede/form-sede/form-sede.component';
import { ListaSedeComponent } from './components/sede/lista-sede/lista-sede.component';
import { FormEmpresaComponent } from './components/empresa/form-empresa/form-empresa.component';
import { ListaEmpresaComponent } from './components/empresa/lista-empresa/lista-empresa.component';
import { RazonAnulacionComponent } from './components/razon-anulacion/razon-anulacion/razon-anulacion.component';
import { FormRazonAnulacionComponent } from './components/razon-anulacion/form-razon-anulacion/form-razon-anulacion.component';
import { ListaRazonAnulacionComponent } from './components/razon-anulacion/lista-razon-anulacion/lista-razon-anulacion.component';
import { GraficaLineaComponent } from './components/tablero/graficas/grafica-linea/grafica-linea.component';
import { TipoCompraVentaComponent } from './components/tipoCompraVenta/tipo-compra-venta/tipo-compra-venta.component';
import { FormTipoCompraVentaComponent } from './components/tipoCompraVenta/form-tipo-compra-venta/form-tipo-compra-venta.component';
import { ListaTipoCompraVentaComponent } from './components/tipoCompraVenta/lista-tipo-compra-venta/lista-tipo-compra-venta.component';
import { DocumentoTipoComponent } from './components/documento-tipo/documento-tipo/documento-tipo.component';
import { ListaDocumentoTipoComponent } from './components/documento-tipo/lista-documento-tipo/lista-documento-tipo.component';
import { FormDocumentoTipoComponent } from './components/documento-tipo/form-documento-tipo/form-documento-tipo.component';
import { NotificacionesClienteComponent } from './components/notificaciones-cliente/notificaciones-cliente.component';
import { FormaPagoComandaOrigenComponent } from './components/formaPagoComandaOrigen/forma-pago-comanda-origen/forma-pago-comanda-origen.component';
import { ListaFormaPagoComandaOrigenComponent } from './components/formaPagoComandaOrigen/lista-forma-pago-comanda-origen/lista-forma-pago-comanda-origen.component';
import { FormFormaPagoComandaOrigenComponent } from './components/formaPagoComandaOrigen/form-forma-pago-comanda-origen/form-forma-pago-comanda-origen.component';
import { FormaPagoComandaOrigenDialogComponent } from './components/formaPagoComandaOrigen/forma-pago-comanda-origen-dialog/forma-pago-comanda-origen-dialog.component';
import { VendorTerceroComponent } from './components/vendor-tercero/vendor-tercero/vendor-tercero.component';
import { ListaVendorTerceroComponent } from './components/vendor-tercero/lista-vendor-tercero/lista-vendor-tercero.component';
import { FormVendorTerceroComponent } from './components/vendor-tercero/form-vendor-tercero/form-vendor-tercero.component';
import { FormSedeVendorTerceroComponent } from './components/vendor-tercero/form-sede-vendor-tercero/form-sede-vendor-tercero.component';
import { FormSedeVendorTerceroDialogComponent } from './components/vendor-tercero/form-sede-vendor-tercero-dialog/form-sede-vendor-tercero-dialog.component';
import { ReporteBitacoraComponent } from './components/bitacora/reporte-bitacora/reporte-bitacora.component';
import { TipoClienteComponent } from './components/tipo-cliente/tipo-cliente/tipo-cliente.component';
import { FormTipoClienteComponent } from './components/tipo-cliente/form-tipo-cliente/form-tipo-cliente.component';
import { ListaTipoClienteComponent } from './components/tipo-cliente/lista-tipo-cliente/lista-tipo-cliente.component';
import { SolicitudRegistroComponent } from './components/solicitud-registro/solicitud-registro.component';
import { InitialSetupComponent } from './components/setup/initial-setup/initial-setup.component';
import { UpdateDataBasesComponent } from './components/setup/update-data-bases/update-data-bases.component';
import { SetConfigCorpComponent } from './components/setup/set-config-corp/set-config-corp.component';
import { SetupComponent } from './components/setup/setup/setup.component';

@NgModule({
  declarations: [
    LoginComponent, DashboardComponent, HeaderComponent, ClockComponent, MenuComponent, SidebarDirective,
    UsuarioComponent, ListaUsuarioComponent, FormUsuarioComponent, ClienteComponent, ListaClienteComponent,
    FormClienteComponent, MedidaComponent, ListaMedidaComponent, FormMedidaComponent, PresentacionComponent,
    ListaPresentacionComponent, FormPresentacionComponent, FormClienteDialogComponent, ImpresoraComponent,
    FormImpresoraComponent, ListaImpresoraComponent, FpagoComponent, FormPagoComponent, ListaPagoComponent,
    TipoUsuarioComponent, ListaTipoUsuarioComponent, FormTipoUsuarioComponent, AccesoUsuarioComponent,
    FormAccesoUsuarioComponent, ListaAccesoUsuarioComponent, TableroComponent, ProveedorComponent,
    ListaProveedorComponent, FormProveedorComponent, VentasComponent, SolicitaPinInactividadComponent,
    ImpuestoEspecialComponent, FormImpuestoEspecialComponent, ListaImpuestoEspecialComponent,
    BodegaComponent, FormBodegaComponent, ListaBodegaComponent, UsuarioSedeComponent,
    UsuarioSedeListaComponent, UsuarioSedeFormComponent, ListaCertificadorConfiguracionComponent,
    CertificadorConfiguracionComponent, FormCertificadorConfiguracionComponent, CertificadorFelComponent,
    FormCertificadorFelComponent, AcercaDeComponent, CorporacionComponent, FormCorporacionComponent,
    ListaCorporacionComponent, FormSedeComponent, ListaSedeComponent, FormEmpresaComponent, ListaEmpresaComponent, RazonAnulacionComponent,
    FormRazonAnulacionComponent, ListaRazonAnulacionComponent, GraficaLineaComponent, TipoCompraVentaComponent,
    FormTipoCompraVentaComponent, ListaTipoCompraVentaComponent, DocumentoTipoComponent, ListaDocumentoTipoComponent,
    FormDocumentoTipoComponent, NotificacionesClienteComponent, FormaPagoComandaOrigenComponent, ListaFormaPagoComandaOrigenComponent,
    FormFormaPagoComandaOrigenComponent, FormaPagoComandaOrigenDialogComponent, VendorTerceroComponent, ListaVendorTerceroComponent, FormVendorTerceroComponent, 
    FormSedeVendorTerceroComponent, FormSedeVendorTerceroDialogComponent, ReporteBitacoraComponent, TipoClienteComponent, FormTipoClienteComponent, ListaTipoClienteComponent, SolicitudRegistroComponent, InitialSetupComponent, UpdateDataBasesComponent, SetConfigCorpComponent, SetupComponent
  ],
  imports: [
    CommonModule, AdminRoutingModule, HttpClientModule, FormsModule, SharedModule, MatListModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatCardModule, MatDividerModule, MatTabsModule, MatTableModule, MatSelectModule, MatCheckboxModule, MatButtonModule,
    MatSnackBarModule, MatToolbarModule, MatMenuModule, MatGridListModule, MatPaginatorModule, MatTreeModule, MatDialogModule,
    MatProgressBarModule, PivotViewAllModule, PivotFieldListAllModule, FlexLayoutModule, ChartModule, NgIdleKeepaliveModule.forRoot(),
    MatAutocompleteModule, ChartsModule, MatKeyboardModule, ScrollingModule
  ],
  exports: [
    HeaderComponent, MenuComponent, ListaClienteComponent, FormClienteComponent, FormClienteDialogComponent,
    FormaPagoComandaOrigenComponent, ListaFormaPagoComandaOrigenComponent, FormFormaPagoComandaOrigenComponent, FormSedeVendorTerceroComponent, FormSedeVendorTerceroDialogComponent
  ],
  providers: [
    LineSeriesService, CategoryService, LegendService, DataLabelService, TooltipService
  ]
})
export class AdminModule { }
