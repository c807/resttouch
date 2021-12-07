import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../shared/global';

import { Cuenta } from '../../interfaces/cuenta';

interface IDataDialog {
  cuentas: Cuenta[];
  comensales: number;
}

@Component({
  selector: 'app-pide-datos-cuentas',
  templateUrl: './pide-datos-cuentas.component.html',
  styleUrls: ['./pide-datos-cuentas.component.css']
})
export class PideDatosCuentasComponent implements OnInit {

  public displayedColumns: string[] = ['numero', 'nombre'];
  public dataSource: MatTableDataSource<Cuenta>;
  public esMovil = false;
  public keyboardLayout: string;

  constructor(
    public dialogRef: MatDialogRef<PideDatosCuentasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataDialog,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.keyboardLayout = GLOBAL.IDIOMA_TECLADO;
    this.setTableDataSource();
    this.data.cuentas[0].nombre = 'Cuenta #01';
    for (let i = 0; i < (+this.data.comensales - 1); i++) {
      this.agregarFila();
    }
    // console.log(this.data);
  }

  todosConNombre(ctas: Cuenta[]): number {
    for (let i = 0; i < ctas.length; i++) {
      if (!ctas[i].nombre) {
        return i;
      }
    }
    return -1;
  }

  terminar = () => {
    const tcn = this.todosConNombre(this.data.cuentas);
    if (tcn < 0) {
      this.dialogRef.close(this.data.cuentas);
    } else {
      this.snackBar.open(`Favor ingresar nombre a la cuenta #${this.data.cuentas[tcn].cuenta}...`, 'Cuentas', { duration: 5000 });
    }
  }

  setTableDataSource = () => this.dataSource = new MatTableDataSource(this.data.cuentas);

  agregarFila() {
    this.data.cuentas.push(
      {
        cuenta: 0,
        numero: this.data.cuentas.length + 1,
        nombre: `Cuenta #${(this.data.cuentas.length + 1) >= 10 ? '' : '0'}${(this.data.cuentas.length + 1)}`,
        productos: []
      }
    );
    this.dataSource.data = this.data.cuentas;
  }

  eliminarFila = (obj: Cuenta) => {
    const idx = this.data.cuentas.findIndex(cta => +cta.numero === +obj.numero);
    if (idx > 0) {
      this.data.cuentas.splice(idx, 1);
      this.data.cuentas.map((cta, i) => cta.numero = (i + 1));
      this.dataSource.data = this.data.cuentas;
    } else {
      // console.log('ELIMINAR = ', obj);
      // console.log('CUENTAS = ', this.data.cuentas);
      console.log('No se encuentra esta cuenta...');
    }
  }
}
