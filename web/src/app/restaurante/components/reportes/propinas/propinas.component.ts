import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportePdfService } from '@restaurante-services/reporte-pdf.service';
import { saveAs } from 'file-saver';
import { ConfiguracionBotones } from '@shared-interfaces/config-reportes';

import { Subscription } from 'rxjs';
import { openInNewTab } from '@shared/global';

@Component({
  selector: 'app-propinas',
  templateUrl: './propinas.component.html',
  styleUrls: ['./propinas.component.css']
})

export class PropinasComponent implements OnInit, OnDestroy {
  public params: any = {};
  public titulo = 'Propinas';
  public configBotones: ConfiguracionBotones = {
    isHtmlDisabled: true, isPdfDisabled: false, isExcelDisabled: false, showHtml: false, showExcel: true, showPdf: true
  };
  public cargando = false;
  // public archivo_pdf: string = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private pdfServicio: ReportePdfService
  ) { }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  resetParams = () => {
    this.params = {};
    // this.archivo_pdf = null;
    this.cargando = false;    
  }

  onSubmit() {
    this.params._excel = 0;
    this.cargando = true;
    this.endSubs.add(      
      this.pdfServicio.getReportePropina(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: 'application/pdf' });          
          openInNewTab(URL.createObjectURL(blob));
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
      })
    );
  }

  excelClick() {
    this.params._excel = 1;
    this.cargando = true;
    this.endSubs.add(      
      this.pdfServicio.getReportePropina(this.params).subscribe(res => {
        this.cargando = false;
        if (res) {
          const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
          saveAs(blob, `${this.titulo}.xls`);
        } else {
          this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
        }
      })
    );
  }

}
