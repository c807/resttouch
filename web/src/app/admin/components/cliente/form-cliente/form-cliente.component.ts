import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInput } from '@angular/material/input';
import { GLOBAL, procesarNIT, procesarCUI, procesarPasaporte, isNotNullOrUndefined } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Cliente } from '@admin-interfaces/cliente';
import { ClienteService } from '@admin-services/cliente.service';
import { TipoCliente } from '@admin-interfaces/tipo-cliente';
import { TipoClienteService } from '@admin-services/tipo-cliente.service';
import { Municipio } from '@admin-interfaces/municipio';
import { MunicipioService } from '@admin-services/municipio.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-cliente',
  templateUrl: './form-cliente.component.html',
  styleUrls: ['./form-cliente.component.css']
})
export class FormClienteComponent implements OnInit, OnDestroy {

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
  public tiposCliente: TipoCliente[] = [];
  public municipios: Municipio[] = [];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private clienteSrvc: ClienteService,
    private ls: LocalstorageService,
    private tipoClienteSrvc: TipoClienteService,
    private municipioSrvc: MunicipioService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    if (this.inicializoCliente) {
      this.resetCliente();
    }
    this.loadTiposCliente();
    this.loadMunicipios();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadTiposCliente = () => {
    this.endSubs.add(
      this.tipoClienteSrvc.get().subscribe(res => this.tiposCliente = res)
    );
  }

  loadMunicipios = () => {
    this.endSubs.add(
      this.municipioSrvc.get().subscribe(res => this.municipios = res)
    );
  }

  resetCliente = () => this.cliente = {
    cliente: null, nombre: null, direccion: null, nit: null, telefono: null, correo: null,
    codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null, tipo_cliente: null
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

  guardarCliente = () => {
    if (this.validarReceptor()) {
      // console.log(this.cliente); return;      
      this.endSubs.add(
        this.clienteSrvc.save(this.cliente).subscribe(res => {
          // console.log(res);
          if (res.exito) {
            if (isNotNullOrUndefined(this.cliente.cliente) && +this.cliente.cliente > 0) {
              const idx = this.clienteSrvc.lstClientes.findIndex(c => +c.cliente === +this.cliente.cliente);
              if (idx > 0) {
                this.clienteSrvc.lstClientes[idx] = {...(res.cliente as Cliente)}
              }
            } else if (this.clienteSrvc.lstClientes.length > 0) {
              this.clienteSrvc.lstClientes.push(res.cliente as Cliente);
            }
            this.clienteSavedEv.emit(res.cliente);
            this.resetCliente();
            this.snackBar.open(res.mensaje, 'Cliente', { duration: 3000 });
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

  validarReceptor = (): boolean => {
    this.cliente.nit = procesarNIT(this.cliente?.nit);
    this.cliente.cui = procesarCUI(this.cliente?.cui, this.municipios || []);
    this.cliente.pasaporte = procesarPasaporte(this.cliente?.pasaporte);
    this.cliente.nombre = this.cliente?.nombre.replace(/[^0-9a-zñáéíóúüÁÉÍÓÚÜ*-.,/() ]+/gi, '').trim();
    return this.receptorValido;
  }

}
