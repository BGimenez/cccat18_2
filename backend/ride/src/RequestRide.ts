/***UC3 - Solicitar corrida**

Ator: Passageiro

Input: passenger_id (account_id), from (lat, long), to (lat, long)

Output: ride_id

Regras:

- deve verificar se o account_id tem is_passenger true - OK
- deve verificar se já não existe uma corrida do passageiro em status diferente de "completed", se existir lançar um erro - OK
- deve gerar o ride_id (uuid) - OK
- deve definir o status como "requested" - OK
- deve definir date com a data atual - OK
*/

import crypto from "crypto";
import AccountDAO from "./AccountDAO";
import RideDAO from "./RideDAO";

export default class RequestRide {

    constructor(readonly rideDao: RideDAO, readonly accountDao: AccountDAO){}
    
    async execute(ride: any) {
        await this.verifyIsPassenger(ride.passengerId);
        await this.verifyRidesNotCompleted(ride.passengerId);
        ride.rideId = crypto.randomUUID();
        ride.status = "REQUESTED";
        ride.date = new Date();
        await this.rideDao.saveRide(ride);
        return {
            rideId: ride.rideId,
        }
    }

    async verifyIsPassenger(passengerId: string) {
        const passenger = await this.accountDao.getAccountById(passengerId);
        if (!passenger) throw new Error('Account does not exists!');
        if (!passenger.is_passenger) throw new Error("Account not is passenger!");
    }

    async verifyRidesNotCompleted(passengerId: string) {
        const ridesPassengerNotCompleted = await this.rideDao.getRidesByPassengerIdAndStatusNotCompleted(passengerId);
        if (ridesPassengerNotCompleted) throw new Error("Aready exists a ride not completed to passenger!");
    }
}
