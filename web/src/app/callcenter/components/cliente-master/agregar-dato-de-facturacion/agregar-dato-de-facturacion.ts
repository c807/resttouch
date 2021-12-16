import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import {ClienteMaster, ClienteMasterCliente, ClienteMasterTelefono} from '../../../interfaces/cliente-master';
import { Telefono } from '../../../interfaces/telefono';
import { ClienteMasterService } from '../../../services/cliente-master.service';
import { SeleccionaTelefonoComponent } from '../selecciona-telefono/selecciona-telefono.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { Subscription } from 'rxjs';
import {Cliente} from '../../../../admin/interfaces/cliente';
import {AgregaDireccionComponent} from "../agrega-direccion/agrega-direccion.component";
import {FormClienteComponent} from "../../../../admin/components/cliente/form-cliente/form-cliente.component";
import {DialogAgregarClienteComponent} from "../dialog-agregar-cliente/dialog-agregar-cliente.component";

@Component({
  selector: 'app-agregar-dato-de-facturacion',
  templateUrl: './agregar-dato-de-facturacion.component.html',
  styleUrls: ['./agregar-dato-de-facturacion.component.css']
})
export class AgregarDatoDeFacturacionComponent implements OnInit, OnDestroy {

  @Input() clienteMaster: ClienteMaster;
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

  validatePhone = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  resetTelefono = () => this.ClientefrmDirC = { cliente: 0 , nombre : '', nit: null };

  loadClienteMasterCliente = () => {
    this.cargando = true;
    this.endSubs.add(
      this.clienteMasterSrvc.getClienteClienteMasterCliente({ cliente_master: this.clienteMaster.cliente_master }).subscribe(res => {
        this.lstClmCL = res;
        this.cargando = false;
      })
    );
  }

  checkTelefono = () => {

  }

  agregarCliente = () => {
    const cmdRef = this.dialog.open(DialogAgregarClienteComponent, {
      maxWidth: '90vw', maxHeight: '75vh', width: '99vw', height: '85vh',
      disableClose: false,
      data: {clienteMaster: this.clienteMaster, fromClienteMaster: true}
    });
    cmdRef.afterClosed().subscribe(() => {
      // Do stuff after the dialog has closed
      this.loadClienteMasterCliente();
    });
  }

  asociarClienteMaster = () => {
    this.cargando = true;
    const numberNit = +this.ClientefrmDirC.nit;
    this.endSubs.add(
      this.clienteMasterSrvc.asasociarClienteMasterCliente({ cliente_master: this.clienteMaster.cliente_master, nit: numberNit }).subscribe(res => {
        this.loadClienteMasterCliente();
        this.snackBar.open(`${res.exito ? '' : 'ERROR:'} ${res.mensaje}`, 'Datos', { duration: 5000 });
        if(!res.exist){
          this.agregarCliente();
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
        `Esto desasociará el dato de facturacion ${tel.cliente.nit} de ${tel.cliente.nombre}. ¿Desea continuar?`,
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
