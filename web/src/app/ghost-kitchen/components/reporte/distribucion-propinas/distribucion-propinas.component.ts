import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';

import { ReporteGkService } from '@ghost-kitchen-services/reporte-gk.service';

@Component({
  selector: 'app-distribucion-propinas',
  templateUrl: './distribucion-propinas.component.html',
  styleUrls: ['./distribucion-propinas.component.css']
})
export class DistribucionPropinasComponent implements OnInit, OnDestroy {

  get configuracion() {
    return {
      isRequiredFDel: true,
      isRequiredFAl: true
    }
  }

  get confBotones() {
    return {
      isHtmlDisabled: true, isPdfDisabled: true, isExcelDisabled: false,
      showHtml: false, showPdf: false, showExcel: true
    }
  }

  public params: any;
  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private rptGkSrvc: ReporteGkService
  ) { }

  ngOnInit(): void {
    this.resetParams();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetParams = () => this.params = {
    _fdel: moment().startOf('month').format(GLOBAL.dbDateFormat),
    _fal: moment().endOf('month').format(GLOBAL.dbDateFormat),
    _porexpo: 10
  }

  getRptExcel = () => {
    this.endSubs.add(
      this.rptGkSrvc.propinas(this.params).subscribe(res => {
        if (res) {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
          saveAs(blob, `DistPropGK_${moment().format('DDMMYYYYHHmmss')}.xls`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', 'DistPropGK', { duration: 3000 });
        }
      })
    );
  }

}
