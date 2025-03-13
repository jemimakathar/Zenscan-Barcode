import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPricingComponent } from './admin-pricing.component';

describe('AdminPricingComponent', () => {
  let component: AdminPricingComponent;
  let fixture: ComponentFixture<AdminPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPricingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
