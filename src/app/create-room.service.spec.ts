/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CreateRoomService } from './create-room.service';

describe('Service: CreateRoom', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateRoomService]
    });
  });

  it('should ...', inject([CreateRoomService], (service: CreateRoomService) => {
    expect(service).toBeTruthy();
  }));
});
