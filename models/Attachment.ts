import {DataModel, Column, Table} from "ts-chassis";

@Table()
export class Attachment extends DataModel {

	@Column()
	fileName: string;

	@Column()
	url: string;

	public static fromXMLObject(object: any): Attachment {
		let result = new Attachment();
		result.fileName = object.file_name[0];
		result.url = object.url[0];
		return result;
	}
}