import {SocketService} from "../SocketService";
import {RoomService} from "../RoomService";
import {Container, Singleton} from "typescript-ioc";
import {Room} from "../../models/Room";

@Singleton
export class RoomServiceProvider {
	private allRooms: Map<string, RoomService> = new Map<string, RoomService>();
	private socket: SocketService;
	public setSocket(socket: SocketService) {
		this.socket = socket;
	}

	public async createOrFindRoom(options?: any): Promise<RoomService> {
		if (options && options.roomNumber) {
			if (this.allRooms.has(options.roomNumber))
				return this.allRooms.get(options.roomNumber);
		}

		let roomService = Container.get(RoomService);
		let room;
		while (!room || this.allRooms.has(room.roomNumber)) {
			room = new Room();
			room.mingleProject = options.project || '';
			room.deliveryStatus = options.deliveryStatus;
		}
		await roomService.initialize(room, this.socket);
		this.allRooms.set(room.roomNumber, roomService);
		return roomService;
	}

	public async findRoom(roomId: string) {
		return this.allRooms.get(roomId);
	}
}