import pgp from "pg-promise";

// Port
export default interface RideDAO {
	saveRide (ride: any): Promise<any>;
	getRideById (rideId: string): Promise<any>;
	getRidesByPassengerIdAndStatusNotCompleted (passengerId: string): Promise<any>;
}

// Adapter
export class RideDAODatabase implements RideDAO {
	
	async saveRide (ride: any) {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		await connection.query("insert into ccca.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", 
			[ride.rideId, ride.passengerId, ride.driverId, ride.status, ride.fare, ride.distance, ride.from.lat, ride.from.long, ride.to.lat, ride.to.long, ride.date]);
		await connection.$pool.end();
	}
	
	async getRideById (rideId: string) {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		const [rideData] = await connection.query("select * from ccca.ride where ride_id = $1", [rideId]);
		await connection.$pool.end();
		return rideData;
	}
	
	
	async getRidesByPassengerIdAndStatusNotCompleted (rideId: string) {
		const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		const [rideData] = await connection.query("select * from ccca.ride where passenger_id = $1 and status != $2", [rideId, 'COMPLETED']);
		await connection.$pool.end();
		return rideData;
	}
}
