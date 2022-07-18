import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import {SeguimientoComponent } from './components/seguimiento/seguimiento.component';
import { DistribucionPropinasComponent } from './components/reporte/distribucion-propinas/distribucion-propinas.component';
import { VentaMarcaComponent } from './components/reporte/venta-marca/venta-marca.component';

const routes: Routes = [
  { path: 'seguimiento', component: SeguimientoComponent, canActivate: [AuthGuard] },
  { path: 'repdistprop', component: DistribucionPropinasComponent, canActivate: [AuthGuard] },
  { path: 'rep_venta_marca', component: VentaMarcaComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GhostKitchenRoutingModule { }
