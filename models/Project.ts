import {Column, DataModel, Table} from "ts-chassis";

@Table()
export class Project extends DataModel {
    @Column()
    key: string;

    @Column()
    query: string;
}