import { Component, OnInit } from '@angular/core';
import {RoomService} from "../create-room.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  providers: [RoomService]
})
export class RoomComponent implements OnInit {

  roomName: string = "room";
  mingleProject: string;

  constructor(private createRoomService: RoomService, private router: Router) { }

  ngOnInit() {
  }

  createRoom() {
    this.createRoomService.createRoom(this.roomName, this.mingleProject)
        .subscribe(res => this.router.navigateByUrl('/room/' + res.json().roomNumber));
  }

}
