import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import { TipoDireccionComponent } from './components/tipo-direccion/tipo-direccion/tipo-direccion.component';
import { ClienteMasterComponent } from './components/cliente-master/cliente-master/cliente-master.component';
import { TiempoEntregaComponent } from './components/tiempo-entrega/tiempo-entrega/tiempo-entrega.component';
import { EstatusCallcenterComponent } from './components/estatus-callcenter/estatus-callcenter/estatus-callcenter.component';
import { SeguimientoCallcenterComponent } from './components/seguimiento-callcenter/seguimiento-callcenter/seguimiento-callcenter.component';
import { TipoDomicilioComponent } from './components/tipo-domicilio/tipo-domicilio/tipo-domicilio.component';
import { RepartidorComponent } from './components/repartidor/repartidor/repartidor.component';

const routes: Routes = [
  { path: 'tipo_direccion', component: TipoDireccionComponent, canActivate: [AuthGuard] },
  { path: 'cliente_master', component: ClienteMasterComponent, canActivate: [AuthGuard] },
  { path: 'tiempo_entrega', component: TiempoEntregaComponent, canActivate: [AuthGuard] },
  { path: 'estatus_callcenter', component: EstatusCallcenterComponent, canActivate: [AuthGuard] },
  { path: 'seguimiento_callcenter', component: SeguimientoCallcenterComponent, canActivate: [AuthGuard] },
  { path: 'tipo_domicilio', component: TipoDomicilioComponent, canActivate: [AuthGuard] },
  { path: 'repartidor', component: RepartidorComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallcenterRoutingModule { }
