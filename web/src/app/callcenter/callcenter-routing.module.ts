import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import { TipoDireccionComponent } from './components/tipo-direccion/tipo-direccion/tipo-direccion.component';
import { ClienteMasterComponent } from './components/cliente-master/cliente-master/cliente-master.component';

const routes: Routes = [
  { path: 'tipo_direccion', component: TipoDireccionComponent, canActivate: [AuthGuard] },
  { path: 'cliente_master', component: ClienteMasterComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallcenterRoutingModule { }
