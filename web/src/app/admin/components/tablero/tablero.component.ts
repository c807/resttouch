import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDataOptions, FieldListService, PivotView } from '@syncfusion/ej2-angular-pivotview';
import { Button } from '@syncfusion/ej2-buttons';
import { TableroService } from '../../services/tablero.service';
import * as moment from 'moment';
import { GLOBAL } from '../../../shared/global';
// import { SedeService } from '../../../admin/services/sede.service';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
// import { Sede } from '../../../admin/interfaces/sede';
import { UsuarioSede } from '../../../admin/interfaces/acceso';
import { AccesoUsuarioService } from '../../../admin/services/acceso-usuario.service';
// import { Global } from '@syncfusion/ej2-ng-grids';
import { VentasComponent } from './graficas/ventas/ventas.component';

import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
    selector: 'app-tablero',
    providers: [FieldListService],
    templateUrl: './tablero.component.html',
    styleUrls: ['./tablero.component.css']
})

export class TableroComponent implements OnInit {
    public pivotData: IDataOptions;
    public button: Button;

    public params: any = {
        sede: []
    };
    public titulo = 'Tablero';
    public ultimosDias = '';
    public estadistica: any[] = [];
    public cargando = false;
    public datosGraficas: any = {};
    public sedes: UsuarioSede[] = [];
    public grupos = GLOBAL.grupos;
    public chartTooltips: Object = { 
        callbacks: {
            label: (item, data) => {
                let label = data.datasets[item.datasetIndex].labels[item.index] || '';
                let value = data.datasets[item.datasetIndex].data[item.index] || 0;

                if (label) {
                    label += ': ';
                }

                label += parseFloat(value).toLocaleString('en');

                return label;
            }
        }
    }

    public chartOptions: Object = {
        responsive: true,
        legend: { display: false },
        maintainAspectRatio: false,
        tooltips: this.chartTooltips
    }

    public horizontalOptions: Object = {
        responsive: true,
        legend: { display: false },
        maintainAspectRatio: false,
        aspectRatio: 1,
        tooltips: this.chartTooltips
    }
    
    public pieOptions: Object = {
        responsive: true,
        legend: {
            position: 'left',
            align: 'start'
        },
        maintainAspectRatio: true,
        tooltips: this.chartTooltips
    }

    public semanaLabels: string[] = [];
    public semanaData: any[] = [];

    public domicilioLabels: string[] = [];
    public domicilioData: any[] = [];

    public horarioData: any[] = [];
    public horarioLabels: string[] = [];
    
    public popularData: any[] = [];
    public popularLabels: string[] = [];

    public meseroData: any[] = [];
    public meseroLabels: string[] = [];

    public sedeData: any[] = [];
    public sedeLabels: string[] = [];

    public diasData: any[] = [];
    public diasLabels: string[] = [];

    public wlistaData: any[] = [];
    public wlistaLabels: string[] = [];

    @ViewChild('pivotview') public pivotGridObj: PivotView;
    @ViewChild('cmpGraficas') public cmpGraficas: VentasComponent;

    constructor(
        private snackBar: MatSnackBar,
        private tableroService: TableroService,
        private sedeSrvc: AccesoUsuarioService,
        private ls: LocalstorageService
    ) { }

    ngOnInit(): void {
        this.getSede();

        this.button = new Button({ isPrimary: true });
        this.button.appendTo('#export');

        this.button.element.onclick = (): void => { this.pivotGridObj.excelExport(); };

        if (!this.params.fdel) {
            this.params.fdel = moment().subtract(1, 'week').format(GLOBAL.dbDateFormat);
        }

        if (!this.params.sede && this.params.sede.length === 0) {
            this.params.sede.push(this.ls.get(GLOBAL.usrTokenVar).sede);
        }

        if (!this.params.fal) {
            this.params.fal = moment().format(GLOBAL.dbDateFormat);
        }

        this.onSubmit();
    }

    setPivotData (data) {
        this.pivotData = {
            dataSource: data,
            type: 'JSON',
            expandAll: false,
            filters: [],
            columns: [{ name: 'dia', caption: 'Día' }],
            rows: [
                { name: 'grupo', caption: 'Grupo' },
                { name: 'descripcion', caption: 'Producto' }
            ],
            values: [{ name: 'total', caption: 'Monto' }],
            formatSettings: [{ name: 'total', format: 'N2' }]
        };
    }

    getSede = (params: any = {}) => {
        this.sedeSrvc.getSedes(params).subscribe(res => {
            this.sedes = res;
        });
    }

    onSubmit() {
        this.cargando = true;
        // this.pivotGridObj.engineModule.fieldList = {};

        this.tableroService.getTableroDatos(this.params).subscribe(res => {
            if (res.exito) {
                this.setPivotData(res.datos);

                this.ultimosDias = res.ultimos_dias;
                this.estadistica = res.estadistica;

                this.semanaLabels = res.pie_semana.labels;
                this.semanaData = [res.pie_semana];

                this.domicilioLabels = res.pie_domicilio.labels;
                this.domicilioData = [res.pie_domicilio];

                this.horarioData = [res.bar_horario];
                this.horarioLabels = res.bar_horario.labels;

                this.popularData = [res.bar_popular];
                this.popularLabels = res.bar_popular.labels;

                this.meseroData = [res.bar_mesero];
                this.meseroLabels = res.bar_mesero.labels;

                this.sedeData = [res.bar_sede];
                this.sedeLabels = res.bar_sede.labels;

                this.diasData = [res.line_dias];
                this.diasLabels = res.line_dias.labels;

                this.wlistaData = [res.line_wlista];
                this.wlistaLabels = res.line_wlista.labels;
            } else {
                this.snackBar.open('No se pudo generar el reporte...', this.titulo, { duration: 3000 });
            }

            this.cargando = false;
        });
        this.loadDataGraficas();
    }

    loadDataGraficas = () => {
        this.tableroService.getDataGraficas(this.params).subscribe((res: any) => {
            this.cargando = false;
            if (res.exito) {
                this.datosGraficas.porDia = res.pordia;
                this.datosGraficas.porCategoria = res.porcategoria;
                this.datosGraficas.porTurno = res.porturno;
                this.datosGraficas.porMesero = res.pormesero;
                this.cmpGraficas.setGraficas();
            } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Graficas', { duration: 7000 });
            }
        });
    }
}
