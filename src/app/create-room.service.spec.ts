/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RoomService } from './create-room.service';

describe('Service: CreateRoom', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoomService]
    });
  });

  it('should ...', inject([RoomService], (service: RoomService) => {
    expect(service).toBeTruthy();
  }));
});
