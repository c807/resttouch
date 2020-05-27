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
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestauranteRoutingModule { }
