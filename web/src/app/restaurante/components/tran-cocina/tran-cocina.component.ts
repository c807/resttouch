import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { GLOBAL, OrdenarArrayObjetos } from '../../../shared/global';
// import { DialogCocina } from '../../../shared/interfaces/config-reportes';
import { DesktopNotificationService } from '../../../shared/services/desktop-notification.service';
// import { ConfirmDialogModel, DialogCocinaComponent } from '../../../shared/components/dialog-cocina/dialog-cocina.component';
import * as moment from 'moment';

import { ComandaService } from '../../services/comanda.service';

@Component({
  selector: 'app-tran-cocina',
  templateUrl: './tran-cocina.component.html',
  styleUrls: ['./tran-cocina.component.css']
})
export class TranCocinaComponent implements OnInit {

  get sumaCantidadProductos() {
    return (obj: any) => {      
      let cantProd = 0;
      obj.cuentas.forEach(cta => cantProd += cta.productos.length);
      return cantProd;
    }
  }

  public lstComandasCocina: any[] = [];
  public lstComandasCocinaEnProceso: any[] = [];

  constructor(
    private ls: LocalstorageService,
    private comandaSrvc: ComandaService,
    private socket: Socket,
    private dns: DesktopNotificationService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('refrescar:listaCocina', (obj: any) => {
        if (obj && obj.mesaenuso && obj.mesaenuso.comanda) {
          this.loadComandasCocina(obj.mesaenuso.comanda);
        } else {
          this.loadComandasCocina();
        }
        this.notificarUsuario();
      });

      setInterval(() => {
        this.setTiempo();
      }, 1000);

    }
    this.loadComandasCocina();
  }

  notificarUsuario = () => {
    const opciones: NotificationOptions = {
      icon: 'assets/img/minilogo.png',
      body: `Se recibió una nueva orden a las ${moment().format(GLOBAL.dateTimeFormat)}.`,
      dir: 'auto'
    };
    this.dns.createNotification('Rest-Touch Pro', 10000, opciones);
  }

  loadComandasCocina = (idcomanda: number = 0) => {
    const fltr: any = {};

    if (+idcomanda > 0) {
      fltr.comanda = +idcomanda;
    }

    this.comandaSrvc.getComandasCocina(fltr).subscribe(res => {
      if (+idcomanda > 0) {
        this.lstComandasCocina = this.lstComandasCocina.filter(c => +c.comanda !== +idcomanda);
        this.lstComandasCocinaEnProceso = this.lstComandasCocinaEnProceso.filter(c => +c.comanda !== +idcomanda);
        res.pendientes.forEach(p => this.lstComandasCocina.push(p));        
        res.enproceso.forEach(p => this.lstComandasCocinaEnProceso.push(p));
        this.lstComandasCocinaEnProceso = OrdenarArrayObjetos(this.lstComandasCocinaEnProceso, 'fecha_proceso', 3);
      } else {
        this.lstComandasCocina = res.pendientes;
        this.lstComandasCocinaEnProceso = res.enproceso;
      }
      this.setTiempo();
    });
  }

  setTiempo = () => {
    if (this.lstComandasCocinaEnProceso) {
      for (let i = 0; i < this.lstComandasCocinaEnProceso.length; i++) {
        const comanda = this.lstComandasCocinaEnProceso[i];
        const msecPerMinute = 1000 * 60;
        const msecPerHour = msecPerMinute * 60;
        const msecPerDay = msecPerHour * 24;

        // asignar la fecha en milisegundos
        let date = new Date(comanda.fecha_proceso);
        this.lstComandasCocinaEnProceso[i].inicio_proceso = date;
        comanda.inicio = date;
        const dateMsec = date.getTime();

        // asignar la fecha el 1 de enero del a la media noche
        date = new Date();

        // Obtener la diferencia en milisegundos
        let interval = date.getTime() - dateMsec;

        // Calcular cuentos días contiene el intervalo. Substraer cuantos días
        // tiene el intervalo para determinar el sobrante
        const days = Math.floor(interval / msecPerDay);
        interval = interval - (days * msecPerDay);

        // Calcular las horas , minutos y segundos
        const hours = Math.floor(interval / msecPerHour);
        interval = interval - (hours * msecPerHour);

        const minutes = Math.floor(interval / msecPerMinute);
        interval = interval - (minutes * msecPerMinute);

        const seconds = Math.floor(interval / 1000);
        const tiempo = new Date();

        tiempo.setHours(hours);
        tiempo.setMinutes(minutes);
        tiempo.setSeconds(seconds);

        this.lstComandasCocinaEnProceso[i].tiempo_transcurrido = tiempo;
        if (comanda.tiempo_preparacion) {
          // tslint:disable-next-line: variable-name
          const tiempo_preparacion = comanda.tiempo_preparacion.split(':');
          comanda.inicio.setHours(comanda.inicio.getHours() + (+tiempo_preparacion[0]));
          comanda.inicio.setMinutes(comanda.inicio.getMinutes() + (+tiempo_preparacion[1]));
          this.lstComandasCocinaEnProceso[i].fin_proceso = comanda.inicio;
        } else {
          this.lstComandasCocinaEnProceso[i].fin_proceso = date;
        }
      }
    }

  }

  comparaFecha = (cmd: any) => {
    const date = new Date();
    return date > cmd.fin_proceso;
  }

  setCocinado = (cmd: any, estatus = 2, idx: number) => {    
    const datos: any = {
      numero: +cmd.numero,
      estatus: estatus,
      tiempo: 0
    };

    if (estatus === 1) {
      const ahora = moment().format(GLOBAL.dbDateTimeFormat);
      this.lstComandasCocina[idx].fecha_proceso = ahora;
      datos.fecha_proceso = ahora;
      this.lstComandasCocinaEnProceso.push(this.lstComandasCocina[idx]);
      this.lstComandasCocina.splice(idx, 1);
      this.setTiempo();
    } else if (estatus === 2) {
      this.lstComandasCocinaEnProceso.splice(idx, 1);      
    }

    this.comandaSrvc.setComandaCocinada(+cmd.comanda, datos).subscribe((respuesta: any) => this.snackBar.open('Datos actualizados con éxito.', 'Cocina', { duration: 3000 }));
  }

}
