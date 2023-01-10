import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sede, Empresa } from '../../../interfaces/sede';
import { Certificador } from '../../../interfaces/certificador';
import { SedeService } from '../../../services/sede.service';
import { CertificadorService } from '../../../services/certificador.service';
import { GLOBAL } from '../../../../shared/global';

@Component({
  selector: 'app-form-sede',
  templateUrl: './form-sede.component.html',
  styleUrls: ['./form-sede.component.css']
})
export class FormSedeComponent implements OnInit {

  public sedes: Sede[] = [];
  public certificadores: Certificador[] = [];

  @Input() sede: Sede;
  @Input() empresa: Empresa;
  @Output() sedeSavedEv = new EventEmitter();

  constructor(
    private snackBar: MatSnackBar,
    private sedeSrvc: SedeService,
    private certificadorSrvc: CertificadorService
  ) { }

  ngOnInit() {
    this.getSedes();
    this.getCertificador();
  }

  getSedes = () => {
    this.sedeSrvc.get().subscribe((lst: Sede[]) => {
      if (lst) {
        if (lst.length > 0) {
          this.sedes = lst;
        }
      }
    });
  }

  getCertificador = () => {
    this.certificadorSrvc.getCertificador().subscribe(res => {
      this.certificadores = res;
    });
  }

  resetSede = () => this.sede = {
    sede: null,
    empresa: null,
    sede_padre: null,
    nombre: null,
    certificador_fel: null,
    fel_establecimiento: null,
    direccion: null,
    telefono: null,
    correo: null,
    codigo: null,
    cuenta_contable: null, codigo_postal: null, municipio: null, departamento: null, pais_iso_dos: null
  }

  onSubmit = () => {
    if(this.sede.correo && this.sede.correo.length > 0) {
      if (this.sede.correo.match(GLOBAL.FORMATO_EMAIL)) {
        this.guardarSede();
      } else {
        this.snackBar.open(`El correo '${this.sede.correo}' no es válido.`, 'Sede', { duration: 3000 });
      }
    } else {
      this.guardarSede();
    }
  }

  guardarSede = () => {
    this.sede.empresa = this.empresa.empresa;  
    this.sedeSrvc.saveSede(this.sede).subscribe(res => {
      if (res.exito) {
        this.sedeSavedEv.emit();
        this.resetSede();
        this.getSedes();
        this.snackBar.open('Sede guardada exitosamente.', 'Sede', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Sede', { duration: 3000 });
      }
    });
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

}
