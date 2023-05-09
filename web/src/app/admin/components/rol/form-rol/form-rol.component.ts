import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { Rol, RolAcceso } from '@admin-interfaces/rol';
import { ModuloRol } from '@admin-interfaces/menu';
import { RolService } from '@admin-services/rol.service';

import { Subscription } from 'rxjs';

interface TreeNode {
  id: number;
  name: string;
  idrol?: number;
  idmodulo?: number;
  idsubmodulo?: number;
  incluido?: number;
  children?: TreeNode[];
}

@Component({
  selector: 'app-form-rol',
  templateUrl: './form-rol.component.html',
  styleUrls: ['./form-rol.component.css']
})
export class FormRolComponent implements OnInit, OnDestroy {

  @Input() rol: Rol;
  @Output() rolSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public detalleRol: ModuloRol[] = [];
  public nodes: TreeNode[] = [];
  public treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  public dataSource = new MatTreeNestedDataSource<TreeNode>();
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private rolSrvc: RolService,
    private ls: LocalstorageService
  ) { }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetRol() {
    this.rol = { rol: null, descripcion: null };
    this.detalleRol = [];
    this.nodes = [];
    this.dataSource.data = this.nodes;
  }

  onSubmit() {
    this.endSubs.add(
      this.rolSrvc.save(this.rol).subscribe((res) => {
        if (res.exito) {
          this.resetRol();
          this.rolSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Rol', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Rol', { duration: 7000 });
        }
      })
    );
  }

  convertToTreeNodes = (detRol: ModuloRol[]): TreeNode[] => {
    let tn: TreeNode[] = [];
    for (let dr of detRol) {
      tn.push({
        id: dr.modulo,
        name: dr.descripcion,
        children: []
      });
      const mk = tn.length - 1;
      for (let sm of dr.submodulos) {
        tn[mk].children.push({
          id: sm.submodulo,
          name: sm.descripcion,
          children: []
        });
        const smk = tn[mk].children.length - 1;
        for (let op of sm.opciones) {
          tn[mk].children[smk].children.push({
            id: op.opcion,
            name: op.descripcion,
            idrol: +this.rol.rol,
            idmodulo: +dr.modulo,
            idsubmodulo: +sm.submodulo,
            incluido: op.incluido
          });
        }
      }
    }
    return tn;
  }

  loadDetalleRol = (idRol: number) => {
    this.endSubs.add(
      this.rolSrvc.getDetalleRol(idRol).subscribe((res: ModuloRol[]) => {
        this.detalleRol = res;
        this.nodes = this.convertToTreeNodes(this.detalleRol);
        this.dataSource.data = this.nodes;
      })
    );
  }

  seIncluyeEnElRol = (nodo: TreeNode): boolean =>  nodo && +nodo?.incluido === 1;  

  toggleIncluidoEnRol = (nodo: TreeNode, obj: MatCheckboxChange) => {    
    const ra: RolAcceso = {
      rol_acceso: null,
      rol: nodo.idrol,
      modulo: nodo.idmodulo,
      submodulo: nodo.idsubmodulo,
      opcion: nodo.id,
      incluido: obj.checked ? 1 : 0
    }

    this.cargando = true;
    this.endSubs.add(
      this.rolSrvc.saveDetalleRol(ra).subscribe(res => {
        if (res.exito) {          
          this.snackBar.open('Permiso actualizado con éxito.', 'Rol', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Rol', { duration: 7000 });
        }
        this.cargando = false;
      })
    );

    
  }
}

