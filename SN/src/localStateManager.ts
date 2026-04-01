import logger from "./logger";


export class LocalStateManager{
    serverState: any
    workersState: any 
    rooms: any 
    leaderLock: boolean

    constructor (){
        this.serverState = {}
        this.workersState = {}
        this.rooms = {}
        this.leaderLock = false;
    }
    updateLeaderLock(newLeaderLock: boolean){
        if (this.leaderLock!=newLeaderLock){
            this.leaderLock = newLeaderLock;
            logger.info(`LocalStateManager:LeaderLock state changed to ${newLeaderLock}`);
            
        }
    }
}