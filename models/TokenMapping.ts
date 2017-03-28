import {Column, DataModel, Eager, HasOne, Table} from "ts-chassis";
import {Project} from "./Project";

@Table()
export class TokenMapping extends DataModel {
    @HasOne(Project)
    @Eager()
    project: Project;

    @Column()
    token: string;
}