import { Component, OnInit, OnDestroy } from '@angular/core';
import { GLOBAL, MultiFiltro } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';

import { SeguimientoCallcenterService } from '../../../services/seguimiento-callcenter.service';
import { EstatusCallcenter } from '../../../interfaces/estatus-callcenter';
import { EstatusCallcenterService } from '../../../services/estatus-callcenter.service';
import { Repartidor } from '../../../interfaces/repartidor';
import { RepartidorService } from '../../../services/repartidor.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seguimiento-callcenter',
  templateUrl: './seguimiento-callcenter.component.html',
  styleUrls: ['./seguimiento-callcenter.component.css']
})
export class SeguimientoCallcenterComponent implements OnInit, OnDestroy {

  public lstPedidos: any[] = [];  
  public lstPedidosFull: any[] = [];  
  public lstEstatusCallcenter: EstatusCallcenter[] = [];
  public lstRepartidores: Repartidor[] = [];
  public txtFiltro = '';
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  
  public params: any = {
    _fdel: moment().format(GLOBAL.dbDateFormat),
    _fal: moment().format(GLOBAL.dbDateFormat)
  };
  
  private endSubs = new Subscription();

  constructor(
    private seguimientoCallcenterSrvc: SeguimientoCallcenterService,
    private ls: LocalstorageService,
    private socket: Socket,
    private estatusCallcenterSrvc: EstatusCallcenterService,
    private repartidorSrvc: RepartidorService  
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('callcenter:updseguimiento', (obj: any) => {
        this.loadPedidos();
      });

      this.socket.on('callcenter:updpedidocc', (obj: any) => {
        if (obj.comanda && obj.estatus_callcenter) {
          this.actualizaEstatusPedidoCC(+obj.comanda, +obj.estatus_callcenter, (obj.repartidor ? +obj.repartidor : null));
        }
      });
    }    
    this.params._fdel = moment().subtract(5, 'days').format(GLOBAL.dbDateFormat); // Solo para dev
    this.loadEstatusCallcenter();
    this.loadRepartidores();
    this.loadPedidos();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }  

  loadPedidos = (idEstatus: number = 0) => {
    if (+idEstatus === 0) {
      if (this.params.estatus_callcenter !== null && this.params.estatus_callcenter !== undefined) {
        delete this.params.estatus_callcenter;
      }
    } else {
      this.params.estatus_callcenter = +idEstatus;
    }

    this.endSubs.add(      
      this.seguimientoCallcenterSrvc.get_pedidos(this.params).subscribe((lista: any[]) => {
        this.lstPedidos = lista;
        this.lstPedidosFull = JSON.parse(JSON.stringify(this.lstPedidos));
      })
    );
  }

  loadEstatusCallcenter = () => {
    this.endSubs.add(
      this.estatusCallcenterSrvc.get().subscribe((lista: EstatusCallcenter[]) => {
        this.lstEstatusCallcenter = lista;
      })
    );
  }

  loadRepartidores = () => {
    this.endSubs.add(
      this.repartidorSrvc.get().subscribe((lista: Repartidor[]) => {
        this.lstRepartidores = lista;
      })
    );
  }

  applyFilter = () => {
    if (this.txtFiltro.length > 0) {
      this.lstPedidos = MultiFiltro(this.lstPedidosFull, this.txtFiltro);      
    } else {
      this.lstPedidos = JSON.parse(JSON.stringify(this.lstPedidosFull));
    }    
  }

  actualizaEstatusPedidoCC = (idPedido: number, idEstatus: number, idRepartidor: number = null) => {    
    const idxEstatusCC = this.lstEstatusCallcenter.findIndex(ecc => +ecc.estatus_callcenter === +idEstatus);
    const idxPedidoFull = this.lstPedidosFull.findIndex(p => +p.comanda === idPedido);
    const idxPedido = this.lstPedidos.findIndex(p => +p.comanda === idPedido);
    const idxRepartidor = this.lstRepartidores.findIndex(r => +r.repartidor === +idRepartidor);
    if (idxPedido > -1 && idxEstatusCC > -1) {
      this.lstPedidos[idxPedido].estatus_callcenter = this.lstEstatusCallcenter[idxEstatusCC].estatus_callcenter;
      this.lstPedidos[idxPedido].estatus = this.lstEstatusCallcenter[idxEstatusCC].descripcion;
      this.lstPedidos[idxPedido].color_estatus = this.lstEstatusCallcenter[idxEstatusCC].color;
      if (idxRepartidor > -1) {
        this.lstPedidos[idxPedido].motorista = this.lstRepartidores[idxRepartidor].nombre;
      }
    }

    if (idxPedidoFull > -1 && idxEstatusCC > -1) {
      this.lstPedidosFull[idxPedido].estatus_callcenter = this.lstEstatusCallcenter[idxEstatusCC].estatus_callcenter;
      this.lstPedidosFull[idxPedido].estatus = this.lstEstatusCallcenter[idxEstatusCC].descripcion;
      this.lstPedidosFull[idxPedido].color_estatus = this.lstEstatusCallcenter[idxEstatusCC].color;
      if (idxRepartidor > -1) {
        this.lstPedidosFull[idxPedido].motorista = this.lstRepartidores[idxRepartidor].nombre;
      }
    }    

    
  }

}
