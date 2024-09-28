import AccountDAO from "./AccountDAO";
import RideDAO from "./RideDAO";

export default class GetRide {

    constructor(readonly rideDao: RideDAO, readonly accountDao: AccountDAO){}

    async execute(rideId: string) {
        const ride = await this.rideDao.getRideById(rideId);
        if (!ride) throw new Error("Ride not found!");
        const passenger = await this.accountDao.getAccountById(ride.passenger_id);
        return {
            rideId: ride.ride_id,
            status: ride.status,
            from: {
                lat: parseFloat(ride.from_lat),
                long: parseFloat(ride.from_long),
            },
            to: {
                lat: parseFloat(ride.to_lat),
                long: parseFloat(ride.to_long),
            },
            date: ride.date,
            passenger: {
                accountId: passenger.account_id,
                name: passenger.name,
                email: passenger.email,
                cpf: passenger.cpf,
                password: passenger.password,
                isPassenger: passenger.is_passenger,
            },
            driver: null,
        };
    }
}