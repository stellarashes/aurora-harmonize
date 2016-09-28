import {SocketService} from "../SocketService";
import {RoomService} from "../RoomService";
import {Container, Singleton} from "typescript-ioc";
import {Room} from "../../models/Room";

@Singleton
export class RoomServiceProvider {
	private allRooms: Map<string, RoomService>;
	private socket: SocketService;
	public setSocket(socket: SocketService) {
		this.socket = socket;
	}

	public async createOrFindRoom(roomNumber?: string): Promise<RoomService> {
		if (roomNumber) {
			if (this.allRooms.has(roomNumber))
				return this.allRooms.get(roomNumber);
		}

		let roomService = Container.get(RoomService);
		let room;
		while (!room || this.allRooms.has(room.roomNumber)) {
			room = new Room();
		}
		await roomService.initialize(room, this.socket);
		this.allRooms.set(room.roomNumber, roomService);
		return roomService;
	}

	public async findRoom(roomId: string) {
		return this.allRooms.get(roomId);
	}
}