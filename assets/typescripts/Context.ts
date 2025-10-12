import { AnalysisResult, Words, Category, User, Unite } from './types';


export default class Context {

    private context: User | Unite | null = null;

    constructor() {
        return this;
    }

    public getContext() {
        return this.context;
    }

    public setContext(context: User | Unite) {
        this.context = context;
        return this;
    }
}