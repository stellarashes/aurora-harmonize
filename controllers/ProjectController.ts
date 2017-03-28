import {ArgumentError, POST, Route} from "ts-chassis";
import {Project} from "../models/Project";

@Route('/project')
export class ProjectController {
    @Route('/:key')
    @POST
    public async createProject(key: string, body: any) {
        let existing = await Project.findOne({
            where: {
                key: key
            }
        });

        if (existing !== null) {
            throw new ArgumentError('Project already exists');
        }

        return Project.create({
            key: key,
            query: body.query
        });
    }
}