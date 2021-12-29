import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../shared/global';
import { LocalstorageService } from '../../../admin/services/localstorage.service';

import { ClienteService } from '../../../admin/services/cliente.service';
import { Cliente } from '../../../admin/interfaces/cliente';
// import { FormClienteDialogComponent } from '../../../admin/components/cliente/form-cliente-dialog/form-cliente-dialog.component';
import { ClienteMaster, ClienteMasterTelefono, ClienteMasterDireccion } from '../../interfaces/cliente-master';
import { ClienteMasterService } from '../../services/cliente-master.service';
import { ClienteMasterDialogComponent } from '../cliente-master/cliente-master-dialog/cliente-master-dialog.component';
// import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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

  private esListaDeFacturacion = false;
  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<PideTelefonoDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clienteSrvc: ClienteService,
    public dialog: MatDialog,
    private ls: LocalstorageService,
    private clienteMasterSrvc: ClienteMasterService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.clienteMaster = {
      cliente_master: null, nombre: null, correo: null, fecha_nacimiento: null
    };
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

  cancelar = () => this.dialogRef.close();

  buscar = () => {
    this.telefonoPedido = this.telefonoPedido.trim().toUpperCase().replace(/[^0-9]/gi, '');
    if (this.telefonoPedido && this.telefonoPedido.length >= 8) {
      this.endSubs.add(
        this.clienteMasterSrvc.getTelefonosClienteMaster({ numero: this.telefonoPedido, _notas: 1 }).subscribe((res: ClienteMasterTelefono[]) => {
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
                      const cliRet = await this.clienteMasterSrvc.getTelefonosClienteMaster({ numero: this.telefonoPedido, cliente_master: resDiaCliMas.cliente_master }).toPromise();
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
                const cliRet = await this.clienteMasterSrvc.getTelefonosClienteMaster({ numero: this.telefonoPedido, cliente_master: resCliMast.cliente_master.cliente_master }).toPromise();
                this.dialogRef.close(cliRet[0]);
              })
            );
          } else {
            this.snackBar.open(resCliMast.mensaje, 'Cliente Call Center', { duration: 5000 });
          }
        })
      );
    } else {
      this.dialogRef.close(cli);
    }
  }

}
