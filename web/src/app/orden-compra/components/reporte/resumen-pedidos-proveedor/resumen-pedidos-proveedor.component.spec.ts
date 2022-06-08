import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenPedidosProveedorComponent } from './resumen-pedidos-proveedor.component';

describe('ResumenPedidosProveedorComponent', () => {
  let component: ResumenPedidosProveedorComponent;
  let fixture: ComponentFixture<ResumenPedidosProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumenPedidosProveedorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenPedidosProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
