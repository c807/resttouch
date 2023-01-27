import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Articulo } from '@wms-interfaces/articulo';
import { ArticuloTipoCliente } from '@wms-interfaces/articulo-tipo-cliente';
import { ArticuloService } from '@wms-services/articulo.service';

import { TipoCliente } from '@admin-interfaces/tipo-cliente';
import { TipoClienteService } from '@admin-services/tipo-cliente.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-precios-tipo-cliente',
  templateUrl: './lista-precios-tipo-cliente.component.html',
  styleUrls: ['./lista-precios-tipo-cliente.component.css']
})
export class ListaPreciosTipoClienteComponent implements OnInit, OnDestroy {

  public articulo: Articulo;
  public articuloTipoCliente: ArticuloTipoCliente;
  public lstArticulosTipoCliente: ArticuloTipoCliente[] = [];
  public tiposCliente: TipoCliente[] = [];
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private articuloSrvc: ArticuloService,
    private tipoClienteSrvc: TipoClienteService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.resetArticuloTipoCliente();
    this.loadTiposCliente();
    this.loadArticulosTipoCliente();
  }

  ngOnDestroy(): void {
      this.endSubs.unsubscribe();
  }

  resetArticuloTipoCliente = () => {
    this.articuloTipoCliente = { articulo_tipo_cliente: null, articulo: this.articulo?.articulo || null, tipo_cliente: null, precio: null };
  }

  loadTiposCliente = () => this.endSubs.add(this.tipoClienteSrvc.get().subscribe(res => this.tiposCliente = res));

  loadArticulosTipoCliente = (idArticulo: number = null) => {
    let fltr = { articulo: null };

    if (idArticulo) {
      fltr.articulo = idArticulo;
    } else if (+this.articulo?.articulo > 0) {
      fltr.articulo = +this.articulo.articulo;
    } else {
      return;
    }

    this.endSubs.add(
      this.articuloSrvc.getArticulosPorTipoCliente(fltr).subscribe(res => {
        this.lstArticulosTipoCliente = (res as ArticuloTipoCliente[]);
      })
    );
  }

  updArticuloTipoCliente = (artTipCli: ArticuloTipoCliente) => {
    const obj: ArticuloTipoCliente = {
      articulo_tipo_cliente: artTipCli.articulo_tipo_cliente ? +artTipCli.articulo_tipo_cliente : null,
      articulo: +this.articulo.articulo,
      tipo_cliente: artTipCli.articulo_tipo_cliente ? +(artTipCli.tipo_cliente as TipoCliente).tipo_cliente : +(artTipCli.tipo_cliente as number),
      precio : +artTipCli.precio
    }

    this.cargando = true;
    this.endSubs.add(
      this.articuloSrvc.saveArticuloTipocliente(obj).subscribe(res => {
        if (res.exito) {
          this.resetArticuloTipoCliente();
          this.loadArticulosTipoCliente(this.articulo.articulo);
          this.snackBar.open(res.mensaje, 'Artículo', { duration: 3000 });          
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Artículo', { duration: 7000 });
        }
        this.cargando = false;
      })
    );
  }

}
