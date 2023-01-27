import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL, procesarNIT, procesarCUI, procesarPasaporte, isNotNullOrUndefined } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Cliente } from '@admin-interfaces/cliente';
import { ClienteService } from '@admin-services/cliente.service';
import { ClienteMasterService } from '@callcenter-services/cliente-master.service';
import { Municipio } from '@admin-interfaces/municipio';
import { MunicipioService } from '@admin-services/municipio.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-agregar-cliente',
  templateUrl: './dialog-agregar-cliente.component.html',
  styleUrls: ['./dialog-agergar-cliente.component.css']
})
export class DialogAgregarClienteComponent implements OnInit, OnDestroy {

  get nitValido(): boolean {
    return isNotNullOrUndefined(procesarNIT(this.cliente?.nit));
  }

  get cuiValido(): boolean {
    return isNotNullOrUndefined(procesarCUI(this.cliente?.cui, this.municipios || []));
  }

  get pasaporteValido(): boolean {
    return isNotNullOrUndefined(procesarPasaporte(this.cliente?.pasaporte));
  }

  get receptorValido(): boolean {
    const esValido = this.nitValido || this.cuiValido || this.pasaporteValido;
    return esValido;
  }

  @Input() cliente: Cliente;
  @Input() inicializoCliente = true;
  @Input() verTodos = true;
  @Output() clienteSavedEv = new EventEmitter();
  @ViewChild('txtNitCliente') txtNitCliente: MatInput;
  public esDialogo = false;
  public esMovil = false;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public municipios: Municipio[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private clienteSrvc: ClienteService,
    private ls: LocalstorageService,
    private clienteMasterSrvc: ClienteMasterService,
    private municipioSrvc: MunicipioService,
    public dialogRef: MatDialogRef<DialogAgregarClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    if (this.inicializoCliente) {
      this.resetCliente();
    }

    if (this.data.nit) {
      this.cliente.nit = this.data.nit;
    }
    this.loadMunicipios();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadMunicipios = () => {
    this.endSubs.add(
      this.municipioSrvc.get().subscribe(res => this.municipios = res)
    );
  }

  resetCliente = () => this.cliente = {
    cliente: null, nombre: null, direccion: null, nit: this.data?.nit || null, telefono: null, correo: null,
    codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null, cui: null, pasaporte: null
  }

  onSubmit = () => {
    if (this.cliente.correo && this.cliente.correo.length > 0) {
      if (this.cliente.correo.match(GLOBAL.FORMATO_EMAIL)) {
        this.guardarCliente();
      } else {
        this.snackBar.open(`El correo '${this.cliente.correo}' no es válido.`, 'Cliente', { duration: 3000 });
      }
    } else {
      this.guardarCliente();
    }
  }

  /**
   * This method is to asociate cliente_master with cliente in cliente_master_cliente table
   */
  asociarClienteMasterCliente = (client) => {
    this.endSubs.add(
      this.clienteMasterSrvc.asasociarClienteMasterCliente({
        cliente_master: this.data.clienteMaster.cliente_master, nit: client.cliente.nit
      }).subscribe(res => {
        this.snackBar.open(`${res.exito ? '' : 'ERROR:'} ${res.mensaje}`, 'Datos', { duration: 5000 });
        this.dialogRef.close({ recargar: true, cliente: res.datos_facturacion || null });
      })
    );

    // this.dialogRef.close({recargar: true, cliente: client.cliente});
  }

  guardarCliente = () => {
    if (this.validarReceptor()) {
      this.endSubs.add(
        this.clienteSrvc.save(this.cliente).subscribe(res => {
          if (res.exito) {
            this.clienteSavedEv.emit(res.cliente);
            this.resetCliente();
            this.snackBar.open(res.mensaje, 'Cliente', { duration: 3000 });

            if (this.data.fromClienteMaster) {
              this.asociarClienteMasterCliente(res);
            }

          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cliente', { duration: 7000 });
          }
        })
      );
    } else {
      this.snackBar.open('El documento del receptor no es válido, por favor revise la información.', 'Cliente', { duration: 7000 });
    }
  }

  loadInfoContribuyente = (nit: string) => {
    const tmpnit = nit.trim().toUpperCase().replace(/[^0-9KkcCfF]/gi, '');
    if (tmpnit !== 'CF') {
      this.endSubs.add(
        this.clienteSrvc.getInfoContribuyente(tmpnit).subscribe(res => {
          if (res.exito) {
            this.cliente.nombre = res.contribuyente.nombre;
            this.cliente.nit = tmpnit;
            this.cliente.direccion = res.contribuyente.direccion;
          } else {
            this.snackBar.open(`ERROR: ${res.mensaje}`, 'Cliente', { duration: 7000 });
            this.cliente.nombre = null;
            this.cliente.nit = tmpnit;
            this.cliente.direccion = null;
            this.txtNitCliente.focus();
          }
        })
      );
    }
  }

  validatePhone = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9 +()-]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  validateEmail = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[a-zA-Z0-9_@.]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  cancelar = () => this.dialogRef.close({ recargar: false, cliente: null });

  validarReceptor = (): boolean => {
    this.cliente.nit = procesarNIT(this.cliente?.nit);
    this.cliente.cui = procesarCUI(this.cliente?.cui, this.municipios || []);
    this.cliente.pasaporte = procesarPasaporte(this.cliente?.pasaporte);
    this.cliente.nombre = this.cliente?.nombre.replace(/[^0-9a-zñ*-.,/() ]+/gi, '').trim();
    return this.receptorValido;
  }

}
