import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'admin', loadChildren:() => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'restaurante', loadChildren:() => import('./restaurante/restaurante.module').then(m => m.RestauranteModule) },
  { path: 'wms', loadChildren:() => import('./wms/wms.module').then(m => m.WmsModule) },
  { path: 'ordcomp', loadChildren:() => import('./orden-compra/orden-compra.module').then(m => m.OrdenCompraModule) },
  { path: 'pos', loadChildren:() => import('./pos/pos.module').then(m => m.PosModule) },
  { path: 'callcenter', loadChildren:() => import('./callcenter/callcenter.module').then(m => m.CallcenterModule) },
  { path: 'gk', loadChildren:() => import('./ghost-kitchen/ghost-kitchen.module').then(m => m.GhostKitchenModule) },
  { path: 'hotel', loadChildren:() => import('./hotel/hotel.module').then(m => m.HotelModule) },
  { path: '', redirectTo: 'admin/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
