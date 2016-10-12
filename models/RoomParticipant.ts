import {Table, Column, DataModel} from "ts-chassis";
@Table()
export class RoomParticipant extends DataModel {
	id: string;

	@Column()
	name: string;

	@Column()
	role: string;

	currentVote: string;
	currentVoteTime: Date;
	canVote: boolean;
	socketSessionId: string;

}