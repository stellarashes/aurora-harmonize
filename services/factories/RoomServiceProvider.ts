import {SocketService} from "../SocketService";
import {RoomService} from "../RoomService";
import {Container, Singleton} from "typescript-ioc";
import {Room} from "../../models/Room";

@Singleton
export class RoomServiceProvider {
	private socket: SocketService;
	public setSocket(socket: SocketService) {
		this.socket = socket;
	}

	public async createOrFindRoom(roomId?: string): Promise<RoomService> {
		let room = null;
		if (roomId) {
			room = await this.findRoom(roomId);
		}

		if (room === null) {
			room = await Room.create();
		}

		let roomService = Container.get(RoomService);
		roomService.initialize(room, this.socket);
		return roomService;
	}

	public async findRoom(roomId: string) {
		let room = await Room.findById(roomId);
		let roomService = Container.get(RoomService);
		roomService.initialize(room, this.socket);
		return roomService;
	}
}