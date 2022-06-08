import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthguardService as AuthGuard } from '../admin/services/authguard.service';

import { OrdenCompraComponent } from './components/orden-compra/orden-compra/orden-compra.component';
import { RptListaPedidosComponent } from './components/reporte/rpt-lista-pedidos/rpt-lista-pedidos.component';
import { ResumenPedidosProveedorComponent } from './components/reporte/resumen-pedidos-proveedor/resumen-pedidos-proveedor.component';

const routes: Routes = [
  { path: 'ordcomp', component: OrdenCompraComponent, canActivate: [AuthGuard] },
  { path: 'rptlistapedido', component: RptListaPedidosComponent, canActivate: [AuthGuard] },
  { path: 'resumen_pedidos_proveedor', component: ResumenPedidosProveedorComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdenCompraRoutingModule { }
