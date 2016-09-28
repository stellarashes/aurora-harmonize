import {Table, Column, DataModel} from "ts-chassis";
@Table()
export class RoomParticipant extends DataModel {
	@Column()
	name: string;
}