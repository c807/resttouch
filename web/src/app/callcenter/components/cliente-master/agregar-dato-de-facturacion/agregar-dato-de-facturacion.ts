import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ClienteMaster, ClienteMasterCliente } from '@callcenter-interfaces/cliente-master';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';
import { Cliente } from '@admin-interfaces/cliente';
import { DialogAgregarClienteComponent } from '@callcenter-components/cliente-master/dialog-agregar-cliente/dialog-agregar-cliente.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agregar-dato-de-facturacion',
  templateUrl: './agregar-dato-de-facturacion.component.html',
  styleUrls: ['./agregar-dato-de-facturacion.component.css']
})
export class AgregarDatoDeFacturacionComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
  @Input() returnNuevoDatoFactura = false;
  @Output() returnDatoFacturaEv: EventEmitter<ClienteMasterCliente> = new EventEmitter();
  public lstClmCL: ClienteMasterCliente[] = [];
  public ClientefrmDirC: Cliente;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService,
    private clienteMasterSrvc: ClienteMasterService,
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetTelefono();
    if (+this.clienteMaster.cliente_master > 0) {
      this.loadClienteMasterCliente();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  validateDocumentoReceptor = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9a-z]/gi.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  resetTelefono = () => this.ClientefrmDirC = { cliente: 0, nombre: '', nit: null };

  loadClienteMasterCliente = () => {
    this.cargando = true;
    this.endSubs.add(
      this.clienteMasterSrvc.getClienteClienteMasterCliente({ cliente_master: this.clienteMaster.cliente_master }).subscribe(res => {
        this.lstClmCL = res;
        this.cargando = false;
      })
    );
  }

  agregarCliente = () => {
    const cmdRef = this.dialog.open(DialogAgregarClienteComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: false,
      data: { clienteMaster: this.clienteMaster, fromClienteMaster: true, nit: null }
    });
    cmdRef.afterClosed().subscribe((res: any) => {
      if (res.recargar) {
        this.loadClienteMasterCliente();
        this.ClientefrmDirC.nit = null;
        if (this.returnNuevoDatoFactura && res.cliente) {
          this.returnDatoFacturaEv.emit(res.cliente);
        }
      }
    });
  }

  asociarClienteMaster = () => {
    this.cargando = true;
    const numberNit: string = this.ClientefrmDirC.nit;
    this.endSubs.add(
      this.clienteMasterSrvc.asasociarClienteMasterCliente({ cliente_master: this.clienteMaster.cliente_master, nit: numberNit }).subscribe(res => {
        this.loadClienteMasterCliente();
        this.snackBar.open(`${res.exito ? '' : 'ERROR:'} ${res.mensaje}`, 'Datos', { duration: 5000 });
        if (!res.exist) {
          this.agregarCliente();
        } else {
          this.ClientefrmDirC.nit = null;
          if (this.returnNuevoDatoFactura && res.datos_facturacion) {
            this.returnDatoFacturaEv.emit(res.datos_facturacion);
          }
        }
        this.cargando = false;
      })
    );
  }

  desasociarClienteM = (tel: ClienteMasterCliente) => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Desasociar los datos',
        `Esto desasociará el dato de facturación ${tel.cliente.nit} de ${tel.cliente.nombre}. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });


    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.clienteMasterSrvc.desasociarClienteMasterCliente(tel.cliente_master_cliente).subscribe(res => {
              this.loadClienteMasterCliente();
              this.snackBar.open(`${res.exito ? '' : 'ERROR:'} ${res.mensaje}`, 'Datos', { duration: 5000 });
              this.cargando = false;
            })
          );
        }
      })
    );
  }

}
