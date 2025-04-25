import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotListComponent } from './bot-list.component';

describe('BotListComponent', () => {
  let component: BotListComponent;
  let fixture: ComponentFixture<BotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
