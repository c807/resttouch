import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import { BookerComponent } from './components/booker/booker.component';
import { HistorialReservasComponent } from './components/reporte/historial-reservas/historial-reservas.component';
import { TipoHabitacionComponent } from './components/tipo-habitacion/tipo-habitacion/tipo-habitacion.component';

const routes: Routes = [
  { path: 'reservas', component: BookerComponent, canActivate: [AuthGuard] },
  { path: 'rpthistrsrv', component: HistorialReservasComponent, canActivate: [AuthGuard] },
  { path: 'tipo_habitacion', component: TipoHabitacionComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule { }
