import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthguardService as AuthGuard } from './services/authguard.service';
import { GLOBAL } from '../shared/global';
import * as moment from 'moment';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsuarioComponent } from './components/usuario/usuario/usuario.component';
import { ClienteComponent } from './components/cliente/cliente/cliente.component';
import { MedidaComponent } from './components/medida/medida/medida.component';
import { PresentacionComponent } from './components/presentacion/presentacion/presentacion.component';
import { ImpresoraComponent } from './components/impresora/impresora/impresora.component';
import { FpagoComponent } from './components/fpago/fpago/fpago.component';
import { TipoUsuarioComponent } from './components/tipo-usuario/tipo-usuario/tipo-usuario.component';
import { AccesoUsuarioComponent } from './components/acceso-usuario/acceso-usuario/acceso-usuario.component';
import { TableroComponent } from './components/tablero/tablero.component';
import { ProveedorComponent } from './components/proveedor/proveedor/proveedor.component';
import { ImpuestoEspecialComponent } from './components/impuestoEspecial/impuesto-especial/impuesto-especial.component';
import { BodegaComponent } from './components/bodega/bodega/bodega.component';
import { UsuarioSedeComponent } from './components/usuario-sede/usuario-sede/usuario-sede.component';
import { CertificadorConfiguracionComponent } from './components/certificador/configuracion/certificador-configuracion/certificador-configuracion.component';
import { CertificadorFelComponent } from './components/certificador/datos/certificador-fel/certificador-fel.component';
import { CorporacionComponent } from './components/corporacion/corporacion/corporacion.component';
import { RazonAnulacionComponent } from './components/razon-anulacion/razon-anulacion/razon-anulacion.component';
import { TipoCompraVentaComponent } from './components/tipoCompraVenta/tipo-compra-venta/tipo-compra-venta.component';
import { DocumentoTipoComponent } from './components/documento-tipo/documento-tipo/documento-tipo.component';
import { FormaPagoComandaOrigenComponent } from './components/formaPagoComandaOrigen/forma-pago-comanda-origen/forma-pago-comanda-origen.component';
import { VendorTerceroComponent } from './components/vendor-tercero/vendor-tercero/vendor-tercero.component';
import { ReporteBitacoraComponent } from './components/bitacora/reporte-bitacora/reporte-bitacora.component';
import { TipoClienteComponent } from './components/tipo-cliente/tipo-cliente/tipo-cliente.component';
import { SolicitudRegistroComponent } from './components/solicitud-registro/solicitud-registro.component';
import { SetupComponent } from './components/setup/setup/setup.component';
import { DoctoresComponent } from './components/doctores/doctores/doctores.component';

const dataTokenVar = localStorage.getItem(GLOBAL.usrTokenVar) || '{}';
const cnfRoute: string = (JSON.parse(dataTokenVar)?.cnf || moment().format('YYYYMMDD')) as string;

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'usuario', component: UsuarioComponent, canActivate: [AuthGuard] },
  { path: 'cliente', component: ClienteComponent, canActivate: [AuthGuard] },
  { path: 'medida', component: MedidaComponent, canActivate: [AuthGuard] },
  { path: 'presentacion', component: PresentacionComponent, canActivate: [AuthGuard] },
  { path: 'impresora', component: ImpresoraComponent, canActivate: [AuthGuard] },
  { path: 'formapago', component: FpagoComponent, canActivate: [AuthGuard] },
  { path: 'tipo_usuario', component: TipoUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'acceso', component: AccesoUsuarioComponent, canActivate: [AuthGuard] },
  { path: 'tablero', component: TableroComponent, canActivate: [AuthGuard] },
  { path: 'proveedor', component: ProveedorComponent, canActivate: [AuthGuard] },
  { path: 'impuesto_especial', component: ImpuestoEspecialComponent, canActivate: [AuthGuard] },
  { path: 'bodega', component: BodegaComponent, canActivate: [AuthGuard] },
  { path: 'usuario_sede', component: UsuarioSedeComponent, canActivate: [AuthGuard] },
  { path: 'certificador_admin', component: CertificadorConfiguracionComponent, canActivate: [AuthGuard] },
  { path: 'certificador_fel', component: CertificadorFelComponent, canActivate: [AuthGuard] },
  { path: 'corporacion', component: CorporacionComponent, canActivate: [AuthGuard] },
  { path: 'razon_anulacion', component: RazonAnulacionComponent, canActivate: [AuthGuard] },
  { path: 'tipo_compra_venta', component: TipoCompraVentaComponent, canActivate: [AuthGuard] },
  { path: 'documento_tipo', component: DocumentoTipoComponent, canActivate: [AuthGuard] },
  { path: 'fp_co', component: FormaPagoComandaOrigenComponent, canActivate: [AuthGuard] },
  { path: 'vdt', component: VendorTerceroComponent, canActivate: [AuthGuard] },
  { path: 'rptbitacora', component: ReporteBitacoraComponent, canActivate: [AuthGuard] },
  { path: 'tipo_cliente', component: TipoClienteComponent, canActivate: [AuthGuard] },
  { path: `doctores`, component: DoctoresComponent, canActivate: [AuthGuard] },
  { path: `cnf${cnfRoute}`, component: SetupComponent, canActivate: [AuthGuard] },  
  { path: 'solicitud_registro', component: SolicitudRegistroComponent },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
