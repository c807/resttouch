import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import { AreaDesignerComponent } from '../area-designer/area-designer.component';

import { Area } from '../../../interfaces/area';
import { Impresora } from '../../../../admin/interfaces/impresora';
import { AreaService } from '../../../services/area.service';
import { ImpresoraService } from '../../../../admin/services/impresora.service';

@Component({
  selector: 'app-form-area',
  templateUrl: './form-area.component.html',
  styleUrls: ['./form-area.component.css']
})
export class FormAreaComponent implements OnInit {

  @Input() entidad: Area;
  @Output() entidadSavedEv = new EventEmitter();
  public sedeUsr = 0;
  public lstAreas: Area[] = [];
  public esMovil = false;
  public impresoras: Impresora[] = [];

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private entidadSrvc: AreaService,
    private impresoraSrvc: ImpresoraService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.sedeUsr = this.ls.get(GLOBAL.usrTokenVar).sede || 0;
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetEntidad();
    this.loadAreas();
    this.loadImpresoras();
  }

  loadAreas = () => this.entidadSrvc.get({ sede: this.sedeUsr, debaja: 1 }).subscribe(res => this.lstAreas = res);

  loadImpresoras = () => this.impresoraSrvc.get().subscribe(res => this.impresoras = res);

  resetEntidad = () => this.entidad = { area: null, sede: this.sedeUsr, nombre: null, mesas: [], impresora_factura: null, impresora: null, escallcenter: null };

  onSubmit = () => {
    // console.log(this.entidad); return;
    this.entidadSrvc.save(this.entidad).subscribe(res => {
      if (res.exito) {
        this.snackBar.open(`${res.mensaje}`, 'Área', { duration: 3000 });
        this.resetEntidad();
        this.loadAreas();
        this.entidadSavedEv.emit();
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Área', { duration: 3000 });
      }
    });
  }

  openDesigner = () => {
    const areaDesignerRef = this.dialog.open(AreaDesignerComponent, {
      width: '800px',
      disableClose: true,
      data: { area: +this.entidad.area, mesas: this.entidad.mesas || [] }
    });

    areaDesignerRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // console.log(result);
        this.entidadSavedEv.emit();
        this.entidadSrvc.get({ area: +this.entidad.area, debaja: 1 }).subscribe(res => {
          if (res && res.length > 0) {
            this.entidad = res[0];
          }
        });
      }
    });
  }

}
