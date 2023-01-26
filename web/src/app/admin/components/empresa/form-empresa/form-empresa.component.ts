import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Corporacion, Empresa } from '@admin-interfaces/sede';
import { SedeService } from '@admin-services/sede.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-empresa',
  templateUrl: './form-empresa.component.html',
  styleUrls: ['./form-empresa.component.css']
})
export class FormEmpresaComponent implements OnInit, OnDestroy {

  @Input() corporacion: Corporacion;
  @Input() empresa: Empresa;
  @Output() empresaSavedEv = new EventEmitter();
  public metodoCosteo: any[] = [
    {
      "id": 1,
      "descripcion": "Ultima compra"
    },
    {
      "id": 2,
      "descripcion": "Promedio"
    }
  ];

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private sedeSrvc: SedeService,
  ) { }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetEmpresa = () => this.empresa = {
    empresa: null,
    corporacion: null,
    nombre: null,
    numero_acceso: null,
    afiliacion_iva: null,
    codigo_establecimiento: null,
    correo_emisor: null,
    nit: null,
    nombre_comercial: null,
    direccion: null,
    codigo_postal: null,
    municipio: null,
    departamento: null,
    pais_iso_dos: null,
    agente_retenedor: 0,
    porcentaje_iva: 0.00,
    visa_merchant_id: null,
    visa_transaction_key: null,
    codigo: null,
    metodo_costeo: 1,
    leyenda_isr: null
  }

  onSubmit = () => {
    this.empresa.corporacion = this.corporacion.corporacion;

    this.endSubs.add(
      this.sedeSrvc.saveEmpresa(this.empresa).subscribe(res => {
        if (res.exito) {
          this.empresaSavedEv.emit();
          this.resetEmpresa();
          this.snackBar.open('Empresa guardada exitosamente.', 'Empresa', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Empresa', { duration: 3000 });
        }
      })
    );
  }

}
