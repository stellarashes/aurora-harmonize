import Namespace = SocketIO.Namespace;
import {Room} from "../models/Room";
import {SocketService} from "./SocketService";
import {RoomParticipant} from "../models/RoomParticipant";
import {MingleService} from "./MingleService";
import {Container} from "typescript-ioc";
export class RoomService {
	private io;
	private namespace: string;
	private room: Room;

	public async initialize(room: Room, socket: SocketService) {
		this.room = room;
		this.namespace = '/' + room.roomNumber;
		this.io = socket.createNamespace(this.namespace);
		return Promise.all([
			this.setupIO(),
			this.getCards(),
		]);
	}

	public getRoomInfo() {
		return Promise.resolve(this.room);
	}

	public async joinRoom(user: any) {
		let participant = new RoomParticipant();
		participant.name = user.name;
		participant.role = user.role;
		this.room.participants.push(participant);
		return this.broadcastToRoom('userHasJoined', user);
	}

	public async leaveRoom(user: any) {
		this.room.participants = this.room.participants.filter(x => x.name !== user.name);
		await this.broadcastToRoom('userHasLeft', user);
	}

	private async getCards() {
		let service = Container.get(MingleService);
		this.room.cards = await service.getCards(this.room.mingleProject);
	}

	private async setupIO() {
		this.io.on('connection', socket => {
			let connectionUser;
			socket.join(this.namespace);
			socket.on('join', user => {
				connectionUser = user;
				this.joinRoom(user);
			});
			socket.on('disconnect', () => {
				if (connectionUser) {
					this.leaveRoom(connectionUser);
				}
			});
		});
	}

	public broadcastToRoom(msg: string, param?: any) {
		this.io.to(this.namespace).emit(msg, param);
	}

	private getParticipantById(id: string) {
		let candidates = this.room.participants.filter(x => x.socketSessionId === id);
		if (candidates && candidates.length) {
			return candidates[0];
		} else {
			return null;
		}
	}
}