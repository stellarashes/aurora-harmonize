import { Component, OnInit } from '@angular/core';
import {CreateRoomService} from "../create-room.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
  providers: [CreateRoomService]
})
export class RoomComponent implements OnInit {

  roomName: string;
  mingleProject: string;

  constructor(private createRoomService: CreateRoomService, private router: Router) { }

  ngOnInit() {
  }

  createRoom() {
    this.createRoomService.createRoom(this.roomName, this.mingleProject)
        .subscribe(res => this.router.navigateByUrl('/room/' + res.json().roomNumber));
  }

}
