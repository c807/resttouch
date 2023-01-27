import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ClienteService } from '@admin-services/cliente.service';
import { Cliente } from '@admin-interfaces/cliente';
import { ClienteMaster, ClienteMasterTelefono, ClienteMasterDireccion, ClienteMasterDireccionResponse, ClienteMasterCliente } from '@callcenter-interfaces/cliente-master';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { ClienteMasterDialogComponent } from '@callcenter-components/cliente-master/cliente-master-dialog/cliente-master-dialog.component';
import { TipoDomicilio } from '@callcenter-interfaces/tipo-domicilio';
import { TipoDomicilioService } from '@callcenter-services/tipo-domicilio.service';

import { DialogClienteMasterDireccionComponent } from '@callcenter-components/cliente-master/dialog-cliente-master-direccion/dialog-cliente-master-direccion.component';
import { DialogClienteMasterClienteComponent } from '@callcenter-components/cliente-master/dialog-cliente-master-cliente/dialog-cliente-master-cliente.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pide-telefono-dialog',
  templateUrl: './pide-telefono-dialog.component.html',
  styleUrls: ['./pide-telefono-dialog.component.css']
})
export class PideTelefonoDialogComponent implements OnInit, OnDestroy {

  public telefonoPedido: string = null;
  public clientes: (Cliente[] | ClienteMasterTelefono[]) = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public clienteMaster: ClienteMaster;
  public tiposDomicilio: TipoDomicilio[] = [];
  public tipoDomicilioSelected: TipoDomicilio = null;
  public direccionSelected: ClienteMasterDireccionResponse = null;
  public datosFacturacionSelected: ClienteMasterCliente = null;
  public varDireccionEntrega = `${GLOBAL.rtDireccionEntrega}_`;
  public varTipoDomicilio = `${GLOBAL.rtTipoDomicilio}_`;
  public varClienteFactura = `${GLOBAL.rtClienteFactura}_`;

  private esListaDeFacturacion = false;
  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<PideTelefonoDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clienteSrvc: ClienteService,
    public dialog: MatDialog,
    private ls: LocalstorageService,
    private clienteMasterSrvc: ClienteMasterService,
    private tipoDomicilioSrvc: TipoDomicilioService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.clienteMaster = {
      cliente_master: null, nombre: null, correo: null, fecha_nacimiento: null
    };

    if (this.data.mesa && this.data.mesa.mesa) {
      this.varDireccionEntrega += `${this.data.mesa.mesa}`;
      this.varTipoDomicilio += `${this.data.mesa.mesa}`;
      this.varClienteFactura += `${this.data.mesa.mesa}`;
    }

    this.loadTiposDomicilio();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  validateKey = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  loadTiposDomicilio = () => this.endSubs.add(this.tipoDomicilioSrvc.get().subscribe(res => this.tiposDomicilio = res));

  cancelar = () => this.dialogRef.close();

  buscar = () => {
    this.telefonoPedido = this.telefonoPedido.trim().toUpperCase().replace(/[^0-9]/gi, '');
    if (this.telefonoPedido && this.telefonoPedido.length >= 8) {
      this.endSubs.add(
        this.clienteMasterSrvc.getTelefonosClienteMaster({ numero: this.telefonoPedido, _notas: 1, _direcciones: 1, _facturacion: 1 }).subscribe((res: ClienteMasterTelefono[]) => {
          if (res && res.length > 0) {
            this.clientes = res;
          } else {
            this.endSubs.add(
              this.clienteSrvc.get({ telefono: this.telefonoPedido }).subscribe((res: Cliente[]) => {
                if (res && res.length > 0) {
                  this.clientes = res;
                  this.esListaDeFacturacion = true;
                } else {
                  // En caso que no exista el cliente, se crea uno nuevo
                  const cmdRef = this.dialog.open(ClienteMasterDialogComponent, {
                    maxWidth: '100vw', maxHeight: '85vh', width: '99vw', height: '85vh',
                    disableClose: true,
                    data: {
                      clienteMaster: { cliente_master: null, nombre: null, correo: null, fecha_nacimiento: null },
                      numero: this.telefonoPedido
                    }
                  });

                  this.endSubs.add(
                    cmdRef.afterClosed().subscribe(async (resDiaCliMas) => {
                      const cliRet = await this.clienteMasterSrvc.getTelefonosClienteMaster({ numero: this.telefonoPedido, cliente_master: resDiaCliMas.cliente_master, _direcciones: 1, _facturacion: 1 }).toPromise();
                      this.addDireccionSeleccionadaToLocalStorage(cliRet[0]);
                      this.addDatosFacturacionToLocalStorage(cliRet[0]);
                      this.dialogRef.close(cliRet[0]);
                    })
                  );
                }
              })
            );
          }
        })
      );
    } else {
      this.snackBar.open('Favor ingresar un número de teléfono válido.', 'Pedido', { duration: 5000 });
    }
  }

  seleccionarCliente = (cli: (Cliente | ClienteMasterTelefono)) => {
    // console.log(cli);
    // return;
    if (this.esListaDeFacturacion) {
      const elCliente = cli as Cliente;
      this.clienteMaster.nombre = elCliente.nombre;
      this.clienteMaster.correo = elCliente.correo;
      this.snackBar.open('Este cliente fue encontrado en los datos de facturación. Se intentará agregar como cliente de call center automáticamente.', 'Cliente Call Center', { duration: 3000 });
      this.endSubs.add(
        this.clienteMasterSrvc.save(this.clienteMaster).subscribe(async (resCliMast) => {
          if (resCliMast.exito) {
            const tel: Object = {
              numero: elCliente.telefono,
              cliente_master: resCliMast.cliente_master.cliente_master,
            };
            await this.clienteMasterSrvc.saveTelefonosClienteMaster(tel).toPromise();
            const clienteMasterDir: ClienteMasterDireccion = {
              cliente_master_direccion: null,
              cliente_master: resCliMast.cliente_master.cliente_master,
              tipo_direccion: 1,
              direccion1: elCliente.direccion,
              debaja: 0
            }
            await this.clienteMasterSrvc.saveDireccionClienteMaster(clienteMasterDir).toPromise();
            this.snackBar.open('Se agregaron los datos a call center, por favor verifique la información.', 'Cliente Call Center', { duration: 3000 });

            const cmdRef = this.dialog.open(ClienteMasterDialogComponent, {
              maxWidth: '100vw', maxHeight: '85vh', width: '99vw', height: '85vh',
              disableClose: true,
              data: { clienteMaster: resCliMast.cliente_master }
            });

            this.endSubs.add(
              cmdRef.afterClosed().subscribe(async () => {
                const cliRet = await this.clienteMasterSrvc.getTelefonosClienteMaster({ numero: this.telefonoPedido, cliente_master: resCliMast.cliente_master.cliente_master, _direcciones: 1, _facturacion: 1 }).toPromise();
                this.addTipoDomicilioToLocalStorage();
                this.addDireccionSeleccionadaToLocalStorage(cliRet[0]);
                this.addDatosFacturacionToLocalStorage(cliRet[0]);
                this.dialogRef.close(cliRet[0]);
              })
            );
          } else {
            this.snackBar.open(resCliMast.mensaje, 'Cliente Call Center', { duration: 5000 });
          }
        })
      );
    } else {
      this.addTipoDomicilioToLocalStorage();
      this.addDireccionSeleccionadaToLocalStorage(cli);
      this.addDatosFacturacionToLocalStorage(cli);
      this.dialogRef.close(cli);
    }
  }

  seleccionarDireccion = (cli: (Cliente | ClienteMasterTelefono)) => {
    const selectDirRef = this.dialog.open(DialogClienteMasterDireccionComponent, {
      width: '70vw',
      disableClose: true,
      data: cli as ClienteMasterTelefono
    });

    this.endSubs.add(
      selectDirRef.afterClosed().subscribe((dirEntSel: ClienteMasterDireccionResponse) => {
        this.direccionSelected = dirEntSel;
        if (dirEntSel && dirEntSel.cliente_master_direccion) {
          this.checkDireccionExistsOrAdd(cli as ClienteMasterTelefono, dirEntSel);
        }
      })
    );
  }

  checkDireccionExistsOrAdd = (cli: ClienteMasterTelefono, dirNueva: ClienteMasterDireccionResponse) => {
    const idx = cli.direcciones.findIndex(dir => +dir.cliente_master_direccion === +dirNueva.cliente_master_direccion);
    if (idx < 0) {
      cli.direcciones.push(dirNueva);
    }
  }

  selecctionTipoDomicilio = (tipoDom: TipoDomicilio) => this.tipoDomicilioSelected = tipoDom;

  addTipoDomicilioToLocalStorage = () => {
    if (this.tipoDomicilioSelected) {
      this.ls.set(this.varTipoDomicilio, this.tipoDomicilioSelected);
    }
  }

  addDireccionSeleccionadaToLocalStorage = (cli: (Cliente | ClienteMasterTelefono)) => {
    const cliSel = cli as ClienteMasterTelefono;
    if (!this.direccionSelected || (+cliSel.cliente_master !== +this.direccionSelected.cliente_master.cliente_master)) {
      this.direccionSelected = cliSel?.direcciones[0] || null;
    }
    this.ls.set(this.varDireccionEntrega, this.direccionSelected);
  }

  addDatosFacturacionToLocalStorage = (cli: (Cliente | ClienteMasterTelefono)) => {
    const cliSel = cli as ClienteMasterTelefono;
    if (!this.datosFacturacionSelected || (+cliSel.cliente_master !== +this.datosFacturacionSelected.cliente_master)) {
      this.datosFacturacionSelected = cliSel?.datos_facturacion[0] || null;
    }
    this.ls.set(this.varClienteFactura, this.datosFacturacionSelected);
  }

  seleccionarDatosFacturacion = (cli: (Cliente | ClienteMasterTelefono)) => {
    const selectDirRef = this.dialog.open(DialogClienteMasterClienteComponent, {
      width: '70vw',
      disableClose: true,
      data: cli as ClienteMasterTelefono
    });

    this.endSubs.add(
      selectDirRef.afterClosed().subscribe((factSel: ClienteMasterCliente) => {
        this.datosFacturacionSelected = factSel;
        if (factSel && factSel.cliente_master_cliente) {
          this.checkFacturacionExistsOrAdd(cli as ClienteMasterTelefono, factSel);
        }
      })
    );
  }

  checkFacturacionExistsOrAdd = (cli: ClienteMasterTelefono, datosFactNuevo: ClienteMasterCliente) => {
    const idx = cli.datos_facturacion.findIndex(dfact => +dfact.cliente_master_cliente === +datosFactNuevo.cliente_master_cliente);
    if (idx < 0) {
      cli.datos_facturacion.push(datosFactNuevo);
    }
  }
}
