import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import { AreaComponent } from './components/area/area/area.component';
import { TranAreasComponent } from './components/tran-areas/tran-areas.component';
import { TurnoComponent } from './components/turno/turno/turno.component';
import { RptVentasComponent } from './components/reportes/rpt-ventas/rpt-ventas.component';
import { TurnosComponent } from './components/reportes/turnos/turnos.component';
import { PropinasComponent } from './components/reportes/propinas/propinas.component';
import { ComandaEnLineaComponent } from './components/comanda-en-linea/comanda-en-linea.component';
import { CajaComponent } from './components/reportes/caja/caja.component';
import { FacturaComponent } from './components/reportes/factura/factura.component';
import { TurnoTipoComponent } from './components/turno-tipo/turno/turno.component';
import { PropinaComponent } from './components/propina/propina/propina.component';
import { AutoconsultaComponent } from './components/reportes/autoconsulta/autoconsulta.component';
import { CajacorteComponent } from './components/caja-corte/cajacorte/cajacorte.component';
import { TranCocinaComponent } from './components/tran-cocina/tran-cocina.component';
import { TranAnulaComandaComponent } from './components/tran-anula-comanda/tran-anula-comanda.component';
import { ComandaComponent } from './components/reportes/comanda/comanda.component';
import { VentasAdminComponent } from './components/reportes/ventas-admin/ventas-admin.component';

const routes: Routes = [
  { path: 'mantareas', component: AreaComponent, canActivate: [AuthGuard] },
  { path: 'tranareas', component: TranAreasComponent, canActivate: [AuthGuard] },
  { path: 'turno', component: TurnoComponent, canActivate: [AuthGuard] },
  { path: 'rptvtascat', component: RptVentasComponent, canActivate: [AuthGuard] },
  { path: 'rptturnos', component: TurnosComponent, canActivate: [AuthGuard] },
  { path: 'rptpropinas', component: PropinasComponent, canActivate: [AuthGuard] },
  { path: 'rptcaja', component: CajaComponent, canActivate: [AuthGuard]},
  { path: 'rptfactura', component: FacturaComponent, canActivate: [AuthGuard]},
  { path: 'cmdonline', component: ComandaEnLineaComponent, canActivate: [AuthGuard] },
  { path: 'tipoturno', component: TurnoTipoComponent, canActivate: [AuthGuard] },
  { path: 'propina', component: PropinaComponent, canActivate: [AuthGuard] },
  { path: 'autoconsulta', component: AutoconsultaComponent, canActivate: [AuthGuard] },
  { path: 'cajacorte', component: CajacorteComponent, canActivate: [AuthGuard] },
  { path: 'trancocina', component: TranCocinaComponent, canActivate: [AuthGuard] },
  { path: 'anulacomanda', component: TranAnulaComandaComponent, canActivate: [AuthGuard] },
  { path: 'rptcomanda', component: ComandaComponent, canActivate: [AuthGuard] },
  { path: 'rptvtasadm', component: VentasAdminComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestauranteRoutingModule { }
