import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import { BookerComponent } from './components/booker/booker.component';

const routes: Routes = [
  { path: 'reservas', component: BookerComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelRoutingModule { }
