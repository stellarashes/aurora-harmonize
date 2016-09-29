/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NameService } from './name.service';

describe('Service: Name', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NameService]
    });
  });

  it('should ...', inject([NameService], (service: NameService) => {
    expect(service).toBeTruthy();
  }));
});
