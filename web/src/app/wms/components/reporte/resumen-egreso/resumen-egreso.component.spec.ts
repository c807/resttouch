import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenEgresoComponent } from './resumen-egreso.component';

describe('ResumenEgresoComponent', () => {
  let component: ResumenEgresoComponent;
  let fixture: ComponentFixture<ResumenEgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumenEgresoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenEgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
