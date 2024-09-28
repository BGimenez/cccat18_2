import Sinon from "sinon";
import { AccountDAODatabase, AccountDAOMemory } from "../src/AccountDAO";
import GetRide from "../src/GetRide";
import { MailerGatewayMemory } from "../src/MailerGateway";
import RequestRide from "../src/RequestRide";
import { RideDAODatabase } from "../src/RideDAO";
import Signup from "../src/Signup";

let signup: Signup;
let requestRide: RequestRide;
let getRide: GetRide;

beforeEach(() => {
    const accountDao = new AccountDAODatabase();
    const mailerGateway = new MailerGatewayMemory();
    signup = new Signup(accountDao, mailerGateway);
    const rideDao = new RideDAODatabase();
    requestRide = new RequestRide(rideDao, accountDao);
    getRide = new GetRide(rideDao, accountDao);
});


test("Should request a ride", async function() {
    const passenger = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		isPassenger: true
	};
	const outputSignup = await signup.execute(passenger);
	expect(outputSignup.accountId).toBeDefined();
    
    const input = {
        passengerId: outputSignup.accountId,
        from: {lat: 123, long: 321},
        to: {lat: 123, long: 321},
    };

    const outputRequestRide = await requestRide.execute(input);
    expect(outputRequestRide.rideId).toBeDefined();
    const outputGetRide = await getRide.execute(outputRequestRide.rideId);
    expect(outputGetRide.passenger.accountId).toBe(outputSignup.accountId);
    expect(outputGetRide.passenger.name).toBe(passenger.name);
    expect(outputGetRide.passenger.email).toBe(passenger.email);
    expect(outputGetRide.passenger.cpf).toBe(passenger.cpf);
    expect(outputGetRide.passenger.password).toBe(passenger.password);
    expect(outputGetRide.passenger.isPassenger).toBeTruthy();
    expect(outputGetRide.from.lat).toBe(input.from.lat);
    expect(outputGetRide.from.long).toBe(input.from.long);
    expect(outputGetRide.to.lat).toBe(input.to.lat);
    expect(outputGetRide.to.long).toBe(input.to.long);
    expect(outputGetRide.status).toBe("REQUESTED");
    expect(outputGetRide.date).toBeDefined();
    expect(outputGetRide.driver).toBeNull();
})

test("Should throw exception when account not is a passenger", async function() {
    const passenger = {
        name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		is_passenger: false,
	};
    const signupStub = Sinon.stub(Signup.prototype, "execute").resolves({accountId: 123});
    const accountDAOStub = Sinon.stub(AccountDAODatabase.prototype, "getAccountById").resolves(passenger);
	const outputSignup = await signup.execute(passenger);
	expect(outputSignup.accountId).toBeDefined();
    const input = {
        accountId: outputSignup.accountId,
        from: {lat: 123, long: 321},
        to: {lat: 123, long: 321},
    };
    await expect(() => requestRide.execute(input)).rejects.toThrow(new Error("Account not is passenger!"));
    signupStub.restore();
    accountDAOStub.restore();
})

test("Should throw exception when account does not exists", async function() {
    const input = {
        accountId: '',
        from: {lat: 123, long: 321},
        to: {lat: 123, long: 321},
    };
    await expect(() => requestRide.execute(input)).rejects.toThrow(new Error("Account does not exists!"));
})

test("Should throw exception when aready exists a ride not completed", async function() {
    const passenger = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		password: "123456",
		isPassenger: true,
	};
    const outputSignup = await signup.execute(passenger);
	expect(outputSignup.accountId).toBeDefined();
    const input = {
        passengerId: outputSignup.accountId,
        from: {lat: 123, long: 321},
        to: {lat: 123, long: 321},
    };
    await requestRide.execute(input);
    await expect(requestRide.execute(input)).rejects.toThrow(new Error("Aready exists a ride not completed to passenger!"));
})