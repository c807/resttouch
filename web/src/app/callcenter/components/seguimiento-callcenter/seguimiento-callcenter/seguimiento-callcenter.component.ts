import { Component, OnInit, OnDestroy } from '@angular/core';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';

import { SeguimientoCallcenterService } from '../../../services/seguimiento-callcenter.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seguimiento-callcenter',
  templateUrl: './seguimiento-callcenter.component.html',
  styleUrls: ['./seguimiento-callcenter.component.css']
})
export class SeguimientoCallcenterComponent implements OnInit, OnDestroy {

  public lstPedidos: any[] = [];  
  public params: any = {
    _fdel: moment().format(GLOBAL.dbDateFormat),
    _fal: moment().format(GLOBAL.dbDateFormat)
  };
  
  private endSubs = new Subscription();

  constructor(
    private seguimientoCallcenterSrvc: SeguimientoCallcenterService,
    private ls: LocalstorageService,
    private socket: Socket
  ) { }

  ngOnInit(): void {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('callcenter:updseguimiento', (obj: any) => {
        this.loadPedidos();
      });
    }    
    this.loadPedidos();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadPedidos = () => {
    this.endSubs.add(      
      this.seguimientoCallcenterSrvc.get_pedidos(this.params).subscribe((lista: any[]) => {
        this.lstPedidos = lista;
      })
    );
  }

}
