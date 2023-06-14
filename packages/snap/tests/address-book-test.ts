import test from "ava";
import { AddressState } from "../src/state";
import { Addresses, Address } from "../src//types/address";

class PassingAddressStateTests {
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

class FailingAddressStateTests {
  //getAddressBook function should throw error
  async getAddressBookFailTest(t: any) {
    await t.throwsAsync(
      async () => {
        await AddressState.getAddressBook();
      },
      { instanceOf: Error }
    );
  }

  //getAddress function should throw error
  async getAddressFailTest(t: any) {
    await t.throwsAsync(
      async () => {
        await AddressState.getAddress("1");
      },
      { instanceOf: Error }
    );
  }

  //addAddress function should throw error
  async addAddressFailTest(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User4",
      address: "0xghijkl",
      chain_id: "4",
    };

    await t.throwsAsync(
      async () => {
        await AddressState.addAddress(new_address);
      },
      { instanceOf: Error }
    );
  }

  //removeAddress function should throw error
  async removeAddressFailTest(t: any) {
    await t.throwsAsync(
      async () => {
        await AddressState.removeAddress("1");
      },
      { instanceOf: Error }
    );
  }

  //addAddresses function should throw error
  async addAddressesFailTest(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User4",
      address: "0xghijkl",
      chain_id: "4",
    };

    //Initialize new address book
    let new_address_book = new Addresses([new_address]);

    await t.throwsAsync(
      async () => {
        await AddressState.addAddresses(new_address_book);
      },
      { instanceOf: Error }
    );
  }
}

//Intialize test classes
const passing_tests = new PassingAddressStateTests();
const failing_tests = new FailingAddressStateTests();

test.serial("AddressState Passing Tests", async (t) => {
  //Initialize Sample Address
  const address1: Address = {
    name: "User1",
    address: "0x123456",
    chain_id: "1",
  };

  const address2: Address = {
    name: "User2",
    address: "0xabcdef",
    chain_id: "2",
  };

  //Initialize Sample Address Book
  const SampleAddresses = new Addresses([address1, address2]);

  // Mock the Metamask snap object and its request method
  const snapMock = {
    request: (params: any) => {
      if (
        params.method === "snap_manageState" &&
        params.params.operation === "get"
      ) {
        return {
          addresses: SampleAddresses.string(),
        };
      }

      if (
        params.method === "snap_manageState" &&
        params.params.operation === "update"
      ) {
        // Modify the SampleAddresses and return true
        SampleAddresses.addresses = JSON.parse(
          params.params.newState.addresses
        );
        return true;
      }
    },
  };

  (globalThis as any).snap = snapMock;

  await passing_tests.getAddressBookPassTest(t);
  await passing_tests.getAddressPassTest(t);
  await passing_tests.addAddressPassTest(t);
  await passing_tests.removeAddressPassTest(t);
  await passing_tests.addAddressesPassTest(t);
});

test.serial("AddressState Failing Tests", async (t) => {
  // test data?.addresses == undefined
  //Mock snap object
  const snapMock1 = {
    request: (params: any) => {
      return {
        addresses: undefined,
      };
    },
  };

  (globalThis as any).snap = snapMock1;

  await failing_tests.getAddressBookFailTest(t);
  await failing_tests.getAddressFailTest(t);
  await failing_tests.addAddressFailTest(t);
  await failing_tests.removeAddressFailTest(t);
  await failing_tests.addAddressesFailTest(t);

  // test typeof data?.addresses !== "string"
  //Mock snap object
  const snapMock2 = {
    request: (params: any) => {
      return {
        addresses: 1,
      };
    },
  };

  (globalThis as any).snap = snapMock2;

  await failing_tests.getAddressBookFailTest(t);
  await failing_tests.getAddressFailTest(t);
  await failing_tests.addAddressFailTest(t);
  await failing_tests.removeAddressFailTest(t);
  await failing_tests.addAddressesFailTest(t);
});
