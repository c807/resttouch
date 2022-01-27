import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTab } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav, MatDrawerToggleResult } from '@angular/material/sidenav';
import { GLOBAL } from '../../../shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { Socket } from 'ngx-socket-io';
import { PideTelefonoDialogComponent } from '../../../callcenter/components/pide-telefono-dialog/pide-telefono-dialog.component';
import { DialogSeguimientoCallcenterComponent } from '../../../callcenter/components/seguimiento-callcenter/dialog-seguimiento-callcenter/dialog-seguimiento-callcenter.component';
import { OnlineService } from '../../../shared/services/online.service';

import { AbrirMesaComponent } from '../abrir-mesa/abrir-mesa.component';
import { TranComandaComponent } from '../tran-comanda/tran-comanda.component';
import { TranComandaAltComponent } from '../tran-comanda-alt/tran-comanda-alt.component';
import { Area } from '../../interfaces/area';
import { AreaService } from '../../services/area.service';
import { Comanda, ComandaGetResponse } from '../../interfaces/comanda';
import { ComandaService } from '../../services/comanda.service';
import { ConfiguracionService } from '../../../admin/services/configuracion.service';
import { Cliente } from '../../../admin/interfaces/cliente';
import { ClienteMaster } from '../../../callcenter/interfaces/cliente-master';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tran-areas',
  templateUrl: './tran-areas.component.html',
  styleUrls: ['./tran-areas.component.css']
})
export class TranAreasComponent implements OnInit, AfterViewInit, OnDestroy {

  get isOnline() {
    return this.onlineSrvc.isOnline$.value;
  }

  public divSize: any = { h: 0, w: 0 };
  public openedRightPanel: boolean;
  public cargando = false;

  @ViewChild('matTabArea') pestania: ElementRef;
  @ViewChild('rightSidenav') rightSidenav: MatSidenav;
  @ViewChild('tabArea') tabArea: MatTab;
  @ViewChild('snTranComanda') snTrancomanda: TranComandaComponent;
  public lstTabsAreas: Area[] = [];
  public lstTabsAreasForUpdate: Area[] = [];
  public mesaSeleccionada: any;
  public mesaSeleccionadaToOpen: any;
  public configTipoPantalla = 1;
  public clientePedido: (Cliente | ClienteMaster) = null;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    public areaSrvc: AreaService,
    public comandaSrvc: ComandaService,
    private configSrvc: ConfiguracionService,
    private socket: Socket,
    private onlineSrvc: OnlineService
  ) { }

  ngOnInit() {
    this.loadAreas();
    this.resetMesaSeleccionada();
    if (!!this.ls.get(GLOBAL.usrTokenVar).sede_uuid) {
      this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid);

      this.socket.on('reconnect', () => this.socket.emit('joinRestaurant', this.ls.get(GLOBAL.usrTokenVar).sede_uuid));

      this.socket.on('refrescar:mesa', (obj: any) => {
        // console.log(obj);
        this.loadAreas(true, obj);
      });
    }
    this.configTipoPantalla = this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_PANTALLA_TOMA_COMANDA);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.setDivSize();
      this.snTrancomanda.resetMesaEnUso();
    }, 600);
  }

  ngOnDestroy() {
    // this.endSubs.unsubscribe();
  }

  actualizar = () => {
    // console.log('MESA SELECCIONADA = ', this.mesaSeleccionada);
    const area = this.lstTabsAreas.find((c: Area) => +c.area === +this.mesaSeleccionada.mesa.area.area);
    // console.log('AREA = ', area);
    const areaIndex = this.lstTabsAreas.findIndex((c: Area) => +c.area === +this.mesaSeleccionada.mesa.area.area);
    // console.log('AREA IDX = ', areaIndex);
    const mesaIndex = area.mesas.findIndex(x => +x.mesa === +this.mesaSeleccionada.mesa.mesa);
    // console.log('MESA IDX = ', mesaIndex);
    this.lstTabsAreas[areaIndex].mesas[mesaIndex].estatus = 1;
    // console.log('MESA = ', this.lstTabsAreas[areaIndex].mesas[mesaIndex]);
    this.toggleRightSidenav();
    /*switch (this.configTipoPantalla) {
      case 1: this.toggleRightSidenav(); break;
      // case 2: this.openTranComandaAlt(); break;
      // default: this.toggleRightSidenav();
    }*/
  }

  resetMesaSeleccionada = () => this.mesaSeleccionada = {
    comanda: null, usuario: null, sede: null, estatus: null,
    mesa: {
      mesa: null,
      area: { area: null, sede: null, area_padre: null, nombre: null },
      numero: null, posx: null, posy: null, tamanio: null, estatus: null
    },
    cuentas: []
  }

  loadAreas = (saveOnTemp = false, objMesaEnUso: any = {}) => {
    this.cargando = true;
    if(this.isOnline) {
      this.endSubs.add(      
        this.areaSrvc.get({ sede: (+this.ls.get(GLOBAL.usrTokenVar).sede || 0) }).subscribe((res) => {
          if (!saveOnTemp) {
            this.lstTabsAreas = res;
            this.cargando = false;
          } else {
            this.lstTabsAreasForUpdate = res;
            this.updateTableStatus(objMesaEnUso.mesaenuso);
          }
        })
      );
    } else {
      this.cargando = false;
    }
  }

  updateTableStatus = (objMesaEnUso: any = {}) => {
    for (const a of this.lstTabsAreasForUpdate) {
      for (const m of a.mesas) {
        this.setEstatusMesa({ area: +a.area, mesa: +m.mesa }, +m.estatus);
      }
    }
    this.cargando = false;
    if (this.rightSidenav.opened) {
      if (+this.mesaSeleccionada.comanda === +objMesaEnUso.comanda) {
        this.toggleRightSidenav();
      }
    }
  }

  // setDivSize() {
    // this.divSize.w = this.pestania.nativeElement.offsetWidth;
    // this.divSize.h = this.pestania.nativeElement.offsetHeight;
  // }

  // onResize = (event: any) => this.setDivSize();

  onClickMesa(m: any) {
    // console.log(m.mesaSelected); return;
    if (!this.cargando) {
      if (+m.mesaSelected.escallcenter === 0) {        
        this.aperturaCargaMesa(m);
      } else {
        const varCliPedido = `${GLOBAL.rtClientePedido}_${m.mesaSelected.mesa}`;
        if (+m.mesaSelected.estatus === 1) {
          this.ls.clear(varCliPedido);
          const pideTelefonoRef = this.dialog.open(PideTelefonoDialogComponent, {
            width: '50%',
            disableClose: true,
            data: { mesa: m.mesaSelected }
          });

          this.endSubs.add(            
            pideTelefonoRef.afterClosed().subscribe((cli: Cliente) => {
              if (cli) {
                this.clientePedido = cli;
                this.ls.set(varCliPedido, this.clientePedido);
                this.aperturaCargaMesa(m);
              }
            })
          );
        } else {
          this.clientePedido = this.ls.get(varCliPedido);
          this.aperturaCargaMesa(m);
        }
      }
    } else {
      this.snackBar.open('El sistema está terminando de cargar información. Por favor intente de nuevo.', 'Áreas', { duration: 5000 });
    }
  }

  aperturaCargaMesa = (m: any) => {
    switch (+m.mesaSelected.estatus) {
      case 1: this.openAbrirMesaDialog(m.mesaSelected); break;
      case 2: this.loadComandaMesa(m.mesaSelected); break;
    }
  }

  setEstatusMesa = (m: any, estatus: number) => {
    // console.log('Mesa = ', m);
    // console.log('Estatus solicitado = ', estatus);
    const idxArea = this.lstTabsAreas.findIndex(a => +a.area === +m.area);
    // console.log(`Area = ${idxArea}`);
    if (idxArea > -1) {
      const idxMesa = this.lstTabsAreas[idxArea].mesas.findIndex(l => +l.mesa === +m.mesa);
      // console.log(`Mesa = ${idxMesa}`);
      if (idxMesa > -1) {
        this.lstTabsAreas[idxArea].mesas[idxMesa].estatus = estatus;
      }
    }
  }

  guardarMesa = (m: any) => {
    this.endSubs.add(      
      this.comandaSrvc.save(this.mesaSeleccionadaToOpen).subscribe(res => {
        // console.log(res);
        this.cargando = false;
        if (res.exito) {
          this.socket.emit('refrescar:mesa', {});
          this.mesaSeleccionada = res.comanda;
          // console.log('m', m);
          this.setEstatusMesa(m, +res.comanda.mesa.estatus);
          this.snTrancomanda.llenaProductosSeleccionados(this.mesaSeleccionada);
          this.snTrancomanda.setSelectedCuenta(this.mesaSeleccionada.cuentas[0].numero);
          this.snTrancomanda.loadRolesUsuario();
          // this.toggleRightSidenav();
          switch (this.configTipoPantalla) {
            case 1: this.toggleRightSidenav(); break;
            case 2: this.openTranComandaAlt(); break;
            default: this.toggleRightSidenav();
          }
        } else {
          this.snackBar.open(`${res.mensaje}`, 'ERROR', { duration: 5000 });
        }
      })
    );
  }

  openAbrirMesaDialog(m: any) {
    // console.log(m);
    this.cargando = true;
    this.mesaSeleccionadaToOpen = {
      nombreArea: this.tabArea.textLabel,
      area: +m.area,
      mesa: +m.mesa,
      numero: +m.numero,
      mesero: '',
      comensales: '1',
      comanda: 0,
      esEvento: false,
      dividirCuentasPorSillas: false,
      estatus: 1,
      clientePedido: this.clientePedido || null,
      cuentas: [
        {
          numero: 1,
          nombre: +m.escallcenter === 0 ? 'Única' : (this.clientePedido?.nombre || 'Unica'),
          productos: []
        }
      ]
    };

    if (+m.esmostrador === 0) {
      const abrirMesaRef = this.dialog.open(AbrirMesaComponent, {
        width: '50%',
        height: 'auto',
        disableClose: true,
        data: this.mesaSeleccionadaToOpen
      });

      this.endSubs.add(        
        abrirMesaRef.afterClosed().subscribe((result: Comanda) => {
          if (result) {
            this.mesaSeleccionadaToOpen = result;
            // console.log(JSON.stringify(this.mesaSeleccionada));
            this.guardarMesa(m);
          } else {
            this.cargando = false;
          }
        })
      );
    } else {
      if(+m.escallcenter === 1) {
        this.mesaSeleccionadaToOpen.cliente_master = (this.clientePedido as ClienteMaster).cliente_master || null;
      }
      this.mesaSeleccionadaToOpen.mesero = this.ls.get(GLOBAL.usrTokenVar).idusr;
      this.guardarMesa(m);
    }
  }

  toggleRightSidenav = (obj: any = null) => {
    this.rightSidenav.toggle().then((res: MatDrawerToggleResult) => {
      if (res === 'close') {
        // this.checkEstatusMesa();
        if (obj) {
          this.loadAreas(true, { mesaenuso: obj });
        } else {
          // console.log('MESA EN MEMORIA: ', this.mesaSeleccionada);
          // console.log(`TOGGLE SIDE NAV ${moment().format(GLOBAL.dateTimeFormatMilli)}`);
          this.cargando = false;
        }
        this.snTrancomanda.lstProductosCuentaAlt = [];
      } else if (res === 'open') {
        // console.log('MESA SELECTED: ', this.mesaSeleccionada);
        if (this.mesaSeleccionada.cuentas.length === 1) {
          this.snTrancomanda.setSelectedCuenta(this.mesaSeleccionada.cuentas[0].numero);
        }
      }
    });
  }

  cerrandoRightSideNav = () => {
    // console.log('Antes de "resetMesaEnUso"');
    this.snTrancomanda.resetMesaEnUso();
    // console.log('Antes de "resetLstProductosDeCuenta"');
    this.snTrancomanda.resetLstProductosDeCuenta();
    // console.log('Antes de "resetLstProductosSeleccionados"');
    this.snTrancomanda.resetLstProductosSeleccionados();
    // console.log('Antes de "resetCuentaActiva"');
    this.snTrancomanda.resetCuentaActiva();
    // console.log('Antes de "loadComandaMesa"');
    this.snTrancomanda.resetListadoArticulos();
    // console.log('MESA SELECCIONADA EN CERRANDO RIGHT SIDE PANEL = ', this.mesaSeleccionada);    
    // console.log(`CERRANDO ${moment().format(GLOBAL.dateTimeFormatMilli)}`);    
    // this.fuerzaCierreComanda(false);
    this.checkEstatusMesa();
    this.resetMesaSeleccionada();
    // this.cargando = false;
  }

  msnOpenedChange = (abierto: boolean) => {
    if (!abierto) {
      this.cerrandoRightSideNav();
    }
  }

  checkEstatusMesa = () => {
    // console.log('MESA EN CHECK ESTATUS MESA = ', this.mesaSeleccionada);
    if (!!this.mesaSeleccionada && !!this.mesaSeleccionada.cuentas && this.mesaSeleccionada.cuentas.length > 0) {
      const abiertas = this.mesaSeleccionada.cuentas.filter(cta => +cta.cerrada === 0).length || 0;
      // console.log('ABIERTAS = ', abiertas);
      if (abiertas === 0) {
        this.setEstatusMesa({
          area: this.mesaSeleccionada.mesa.area.area,
          mesa: this.mesaSeleccionada.mesa.mesa
        }, 1);
      }
    }
  }

  fuerzaCierreComanda = (shouldToggle: boolean) => {
    this.endSubs.add(      
      this.comandaSrvc.cerrarEstacion(this.mesaSeleccionada.comanda).subscribe(resCierre => {
        this.loadComandaMesa(this.mesaSeleccionada.mesa, shouldToggle);
      })
    );
  }

  openTranComandaAlt = () => {
    const tranComandaRef = this.dialog.open(TranComandaAltComponent, {
      maxWidth: '100vw', maxHeight: '85vh', width: '99vw', height: '85vh',
      disableClose: true,
      data: { mesa: this.mesaSeleccionada, clientePedido: this.clientePedido }
    });

    this.endSubs.add(      
      tranComandaRef.afterClosed().subscribe((res: any) => {
        this.checkEstatusMesa();
        if (res) {
          this.loadAreas(true, { mesaenuso: res });
        } else {
          this.cargando = false;
        }
      })
    );
  }

  loadComandaMesa = (obj: any, shouldToggle = true) => {
    // console.log('OBJETO = ', obj);
    if(shouldToggle && this.cargando) {
      this.snackBar.open('El sistema está terminando de cargar información. Por favor intente de nuevo.', 'Áreas', { duration: 5000 });
      return;
    }

    this.cargando = true;
    this.endSubs.add(      
      this.comandaSrvc.getComandaDeMesa(obj.mesa, false).subscribe((res: ComandaGetResponse) => {
        // console.log('RESPUESTA DE GET COMANDA = ', res);
        // this.cargando = false;
        if (res.exito) {
          if (!Array.isArray(res)) {
            this.mesaSeleccionada = res;
            this.snTrancomanda.loadRolesUsuario();
          } else {
            if (res.length === 0) {
              this.mesaSeleccionada = {
                mesa: this.mesaSeleccionada.mesa,
                cuentas: [
                  { cerrada: 1 }
                ]
              };
            }
            this.checkEstatusMesa();
          }
          // console.log('MESA SELECTED = ', this.mesaSeleccionada);
          this.checkEstatusMesa();
          if (shouldToggle) {
            // const cuentas = this.mesaSeleccionada.cuentas;
            this.snTrancomanda.llenaProductosSeleccionados(this.mesaSeleccionada);
            switch (this.configTipoPantalla) {
              case 1: this.toggleRightSidenav(); break;
              case 2: this.openTranComandaAlt(); break;
              default: this.toggleRightSidenav();
            }
          } else {
            // console.log(`SIN TOGGLE RIGHT PANEL ${moment().format(GLOBAL.dateTimeFormat)}`);
            this.checkEstatusMesa();
            this.cargando = false;
          }
        } else {
          if (res.mensaje) {
            this.snackBar.open(`${res.mensaje}`, 'ERROR', { duration: 5000 });
          }
          if (Array.isArray(res)) {
            if (res.length === 0) {
              this.mesaSeleccionada = {
                mesa: this.mesaSeleccionada.mesa,
                cuentas: [
                  { cerrada: 1 }
                ]
              };
            }
          }
          this.checkEstatusMesa();
          this.cargando = false;
        }
        this.checkEstatusMesa();
      })
    );
  }

  mostrarSeguimientoCallCenter = () => {
    const seguimientoCallCenterRef = this.dialog.open(DialogSeguimientoCallcenterComponent, {
      maxWidth: '100vw', maxHeight: '90vh', width: '97vw', height: '90vh',
      disableClose: true,
      data: { }
    });

    this.endSubs.add(
      seguimientoCallCenterRef.afterClosed().subscribe(() => { })
    );
  }
}
