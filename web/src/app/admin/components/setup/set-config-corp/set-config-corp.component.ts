import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { EsquemasClientes } from '@admin-interfaces/setup';
import { SetupService } from '@admin-services/setup.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-set-config-corp',
  templateUrl: './set-config-corp.component.html',
  styleUrls: ['./set-config-corp.component.css']
})
export class SetConfigCorpComponent implements OnInit, OnDestroy {

  public esquemasClientes: EsquemasClientes[] = [];
  public esquemaCliente: EsquemasClientes;
  public configuracionCorporacion: any[] = [];
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private setupSrvc: SetupService
  ) { }

  ngOnInit(): void {
    this.loadEsquemasClientes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadEsquemasClientes = () => {
    this.endSubs.add(
      this.setupSrvc.get_esquemas_clientes().subscribe(res => this.esquemasClientes = res)
    );
  }

  esquemaSelected = (obj: MatSelectChange) => {
    this.esquemaCliente = obj.value as EsquemasClientes;
    this.loadConfiguraciones(this.esquemaCliente);
  };

  loadConfiguraciones = (esquemaSel: EsquemasClientes) => {
    this.configuracionCorporacion = [];
    this.endSubs.add(
      this.setupSrvc.get_configuracion_corporacion({ esquema: esquemaSel.db_database }).subscribe(res => {
        res.forEach(r => {
          this.configuracionCorporacion.push({
            configuracion: r.configuracion,
            campo: r.campo,
            tipo: r.tipo,
            valor: +r.tipo === 1 ? +r.valor : r.valor,
            fhcreacion: r.fhcreacion,
            descripcion: r.descripcion            
          });
        });        
      })
    );
  }

  validarSoloNumeros = (e: any) => {
    const inp = String.fromCharCode(e.keyCode);
    if (/[0-9]/.test(inp)) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }
  
  guardarConfig = (conf: any) => {
    conf.esquema = this.esquemaCliente.db_database;    
    this.cargando = true;    
    this.endSubs.add(
      this.setupSrvc.guardar_configuracion_corporacion(conf).subscribe(res => {
        this.cargando = false;        
        this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Configuración de corporación', { duration: 7000 });
      })
    );
  }
}
