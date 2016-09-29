import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {RoomService} from "../create-room.service";
import {SocketService} from "../shared/socket.service";

@Component({
	selector: 'app-view-room',
	templateUrl: './view-room.component.html',
	styleUrls: ['./view-room.component.css'],
	providers: [RoomService, SocketService]
})
export class ViewRoomComponent implements OnInit {

	private roomInfo = {cards: []};

	constructor(private route: ActivatedRoute,
	            private roomService: RoomService,
	            private socketService: SocketService) {
	}

	ngOnInit() {
		this.route.params
			.subscribe(data => this.initRoom(data['id']));
	}

	initRoom(roomNumber) {
		this.roomService.getRoomInfo(roomNumber)
			.subscribe(data => {
				this.roomInfo = data.json();
				console.log(this.roomInfo);
				this.socketService.start(roomNumber)
					.subscribe(data => {
						console.log(data);
					});
			});
	}

}
