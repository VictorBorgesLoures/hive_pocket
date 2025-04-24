import {v1} from 'uuid';

export interface UserConstructor {
    name: string,
}

export class User {
    id: string;
    name: string;

    constructor(args: UserConstructor) {
        this.id = v1();
        this.name = args.name
    }
}