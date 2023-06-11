import test from "ava";
import { AddressState } from "../src/state";
import { Addresses, Address } from "../src//types/address";

class PassingAddressStateTests {
  //Initialize Sample Address
  address1: Address = {
    name: "User1",
    address: "0x123456",
    chain_id: "1",
  };

  address2: Address = {
    name: "User2",
    address: "0xabcdef",
    chain_id: "2",
  };

  //Initialize Sample Address Book
  SampleAddresses = new Addresses([this.address1, this.address2]);

  // Mock the Metamask snap object and its request method
  snapMock = {
    request: (params: any) => {
      if (
        params.method === "snap_manageState" &&
        params.params.operation === "get"
      ) {
        return {
          addresses: this.SampleAddresses.string(),
        };
      }

      if (
        params.method === "snap_manageState" &&
        params.params.operation === "update"
      ) {
        // Modify the SampleAddresses and return true
        this.SampleAddresses.addresses = JSON.parse(
          params.params.newState.addresses
        );
        return true;
      }
    },
  };

  constructor() {
    test.before(() => {
      (globalThis as any).snap = this.snapMock;
    });
  }

  //getAddressBook function should return current state of address book
  async getAddressBookPassTest(t: any) {
    //get current state of AddressBook
    const result = await AddressState.getAddressBook();

    t.deepEqual(result, [
      {
        address: "0x123456",
        chain_id: "1",
        name: "User1",
      },
      {
        address: "0xabcdef",
        chain_id: "2",
        name: "User2",
      },
    ]);
  }

  //getAddress function should return the address with matching chain_id
  async getAddressPassTest(t: any) {
    //get the address matching given chain_id
    const result = await AddressState.getAddress("2");

    t.deepEqual(result, {
      address: "0xabcdef",
      chain_id: "2",
      name: "User2",
    });
  }

  //addAddress function should add address to current state of Address Book
  async addAddressPassTest(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User3",
      address: "0x456789",
      chain_id: "3",
    };

    //Add new address to Address Book
    await AddressState.addAddress(new_address);

    //Get updated Address Book
    const result = await AddressState.getAddressBook();

    t.deepEqual(result, [
      { chain_id: "1", address: "0x123456", name: "User1" },
      { chain_id: "2", address: "0xabcdef", name: "User2" },
      { chain_id: "3", address: "0x456789", name: "User3" },
    ]);
  }

  //removeAddress function should delete the address matching the given chain_id
  async removeAddressPassTest(t: any) {
    await AddressState.removeAddress("3");

    const result = await AddressState.getAddressBook();

    t.deepEqual(result, [
      { chain_id: "1", address: "0x123456", name: "User1" },
      { chain_id: "2", address: "0xabcdef", name: "User2" },
    ]);
  }

  //addAddresses function should replace the current Address book with a new one
  async addAddressesPassTest(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User4",
      address: "0xghijkl",
      chain_id: "4",
    };

    //Initialize new address book
    let new_address_book = new Addresses([new_address]);

    //Add new address to Address Book
    await AddressState.addAddresses(new_address_book);

    //Get updated Address Book
    const result = await AddressState.getAddressBook();

    t.deepEqual(result, [
      {
        name: "User4",
        address: "0xghijkl",
        chain_id: "4",
      },
    ]);
  }
}

const tests = new PassingAddressStateTests();

test.serial("AddressState Tests", async (t) => {
  await tests.getAddressBookPassTest(t);
  await tests.getAddressPassTest(t);
  await tests.addAddressPassTest(t);
  await tests.removeAddressPassTest(t);
  await tests.addAddressesPassTest(t);
});