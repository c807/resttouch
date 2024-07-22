import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL, OrdenarArrayObjetos } from '@shared/global';
import { DesktopNotificationService } from '@shared-services/desktop-notification.service';
import * as moment from 'moment';

import { ComandaService } from '@restaurante-services/comanda.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tran-cocina',
  templateUrl: './tran-cocina.component.html',
  styleUrls: ['./tran-cocina.component.css']
})
export class TranCocinaComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('divContenedorPedidos') divContenedorPedidos: ElementRef;

  get sumaCantidadProductos() {
    return (obj: any) => {
      let cantProd = 0;
      obj.cuentas.forEach(cta => cantProd += cta.productos.length);
      return cantProd;
    }
  }

  public lstComandasCocina: any[] = [];
  public lstComandasCocinaEnProceso: any[] = [];  

  private endSubs: Subscription = new Subscription();

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

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('connect_timeout', () => {
        const msg = 'DESCONECTADO DEL SERVIDOR (TIMEOUT)';
        this.snackBar.open(msg, 'ERROR', { duration: 5000 });        
      });      

      this.socket.on('reconnect_attempt', (attempt: number) => this.snackBar.open(`INTENTO DE RECONEXIÓN #${attempt}`, 'ERROR', { duration: 10000 }));

      setInterval(() => {
        this.setTiempo();
      }, 1000);

    }
    this.loadComandasCocina();
  }

  ngAfterViewInit() {
    Promise.resolve(null).then(() => {      
      // console.log('Elemento = ', this.divContenedorPedidos);
      // console.log('ScrollHeight = ', this.divContenedorPedidos);
    });
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
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

    this.endSubs.add(
      this.comandaSrvc.getComandasCocina(fltr).subscribe(res => {
        if (+idcomanda > 0) {
          this.lstComandasCocina = this.lstComandasCocina.filter(c => +c.comanda !== +idcomanda);
          this.lstComandasCocinaEnProceso = this.lstComandasCocinaEnProceso.filter(c => +c.comanda !== +idcomanda);
          res.pendientes.forEach(p => {
            p.fecha_inicio = new Date();
            localStorage.setItem(`comanda_${p.comanda}_${p.numero}_fecha_inicio`, p.fecha_inicio.toISOString());
            this.lstComandasCocina.push(p);
          });
          res.enproceso.forEach(p => this.lstComandasCocinaEnProceso.push(p));
          this.lstComandasCocinaEnProceso = OrdenarArrayObjetos(this.lstComandasCocinaEnProceso, 'fecha_proceso', 3);
        } else {
          this.lstComandasCocina = res.pendientes.map(p => {
            const storedFechaInicio = localStorage.getItem(`comanda_${p.comanda}_${p.numero}_fecha_inicio`);
            p.fecha_inicio = storedFechaInicio ? new Date(storedFechaInicio) : new Date();
            if (!storedFechaInicio) {
              localStorage.setItem(`comanda_${p.comanda}_${p.numero}_fecha_inicio`, p.fecha_inicio.toISOString());
            }
            return p;
          });
          this.lstComandasCocinaEnProceso = res.enproceso;
        }
        this.setTiempo();
      })
    );
  }

  setTiempo = () => {
    const calcularTiempo = (fechaInicio) => {
    const msecPerMinute = 1000 * 60;
    const msecPerHour = msecPerMinute * 60;
    const msecPerDay = msecPerHour * 24;

    let date = new Date(fechaInicio);
    const dateMsec = date.getTime();

    date = new Date();

      let interval = date.getTime() - dateMsec;

      const days = Math.floor(interval / msecPerDay);
      interval = interval - (days * msecPerDay);

      const hours = Math.floor(interval / msecPerHour);
      interval = interval - (hours * msecPerHour);

      const minutes = Math.floor(interval / msecPerMinute);
      interval = interval - (minutes * msecPerMinute);

      const seconds = Math.floor(interval / 1000);
      const tiempo = new Date();

      tiempo.setHours(hours);
      tiempo.setMinutes(minutes);
      tiempo.setSeconds(seconds);

      return tiempo;
    };

    if (this.lstComandasCocinaEnProceso) {
      for (let i = 0; i < this.lstComandasCocinaEnProceso.length; i++) {
        const comanda = this.lstComandasCocinaEnProceso[i];
        if (comanda.fecha_proceso) {
          this.lstComandasCocinaEnProceso[i].tiempo_transcurrido = calcularTiempo(comanda.fecha_proceso);
          if (comanda.tiempo_preparacion) {
            const tiempo_preparacion = comanda.tiempo_preparacion.split(':');
            comanda.inicio_proceso = new Date(comanda.fecha_proceso);
            comanda.inicio_proceso.setHours(comanda.inicio_proceso.getHours() + (+tiempo_preparacion[0]));
            comanda.inicio_proceso.setMinutes(comanda.inicio_proceso.getMinutes() + (+tiempo_preparacion[1]));
            this.lstComandasCocinaEnProceso[i].fin_proceso = comanda.inicio_proceso;
          } else {
            this.lstComandasCocinaEnProceso[i].fin_proceso = new Date();
          }
        }
      }
    }

    if (this.lstComandasCocina) {
      for (let i = 0; i < this.lstComandasCocina.length; i++) {
        const comanda = this.lstComandasCocina[i];
        if (comanda.fecha_inicio) {
          this.lstComandasCocina[i].tiempo_transcurrido = calcularTiempo(comanda.fecha_inicio);
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
      const fechaInicioPendiente = moment(localStorage.getItem(`comanda_${cmd.comanda}_${cmd.numero}_fecha_inicio`));
      const duracionPendiente = moment.duration(moment().diff(fechaInicioPendiente));
      const horasPendiente = Math.floor(duracionPendiente.asHours()).toString().padStart(2, '0');
      const minutosPendiente = duracionPendiente.minutes().toString().padStart(2, '0');
      const segundosPendiente = duracionPendiente.seconds().toString().padStart(2, '0');
      datos.tiempo_pendiente = `${horasPendiente}:${minutosPendiente}:${segundosPendiente}`;
      this.lstComandasCocinaEnProceso.push(this.lstComandasCocina[idx]);
      this.lstComandasCocina.splice(idx, 1);
      localStorage.removeItem(`comanda_${cmd.comanda}_${cmd.numero}_fecha_inicio`);
      this.setTiempo();
    } else if (estatus === 2) {
      const inicioProceso = moment(cmd.fecha_proceso);
      const finProceso = moment();
      const duracion = moment.duration(finProceso.diff(inicioProceso));
      const horas = Math.floor(duracion.asHours()).toString().padStart(2, '0');
      const minutos = duracion.minutes().toString().padStart(2, '0');
      const segundos = duracion.seconds().toString().padStart(2, '0');
      datos.tiempo_preparacion = `${horas}:${minutos}:${segundos}`;
      this.lstComandasCocinaEnProceso.splice(idx, 1);
    }

    this.endSubs.add(
      this.comandaSrvc.setComandaCocinada(+cmd.comanda, datos).subscribe((respuesta: any) => this.snackBar.open('Datos actualizados con éxito.', 'Cocina', { duration: 3000 }))
    );
  }

  bajarPantalla = () => {
    // this.divContenedorPedidos.nativeElement.scrollTop = this.divContenedorPedidos.nativeElement.scrollHeight;
    // console.log('bajarPantalla a ', this.divContenedorPedidos.nativeElement.scrollTop);
  }

}
