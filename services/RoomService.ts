import Namespace = SocketIO.Namespace;
import {Room} from "../models/Room";
import {SocketService} from "./SocketService";
import {RoomParticipant} from "../models/RoomParticipant";
export class RoomService {
	private io;
	private namespace: string;
	private room: Room;

	public initialize(room: Room, socket: SocketService) {
		this.room = room;
		this.namespace = '/' + room.id;
		this.io = socket.createNamespace(this.namespace);
		this.io.on('connection', socket => socket.join(this.namespace));
	}

	public getRoomInfo() {
		return Promise.resolve(this.room);
	}

	public async joinRoom(user: string) {
		let participant = <RoomParticipant>(await RoomParticipant.create({
			name: user
		}));
		if (!this.room.participants) {
			this.room.participants = [];
		}
		this.room.participants.push(participant);
		this.room.save();
	}
}