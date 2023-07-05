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
    await AddressState.removeAddress("0x456789");

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
  //Mock snap object for 'data?.addresses == undefined'
  snapMock1 = {
    request: (params: any) => {
      return {
        addresses: undefined,
      };
    },
  };

  //Mock snap object for 'typeof data?.addresses !== "string"'
  snapMock2 = {
    request: (params: any) => {
      return {
        addresses: 1,
      };
    },
  };

  //Mock snap object for 'chain_id not found'
  snapMock3 = {
    request: (params: any) => {
      return {
        addresses: "",
      };
    },
  };

  //getAddressBook function should throw error
  async getAddressBookFailTest(t: any, message: string) {
    await t.throwsAsync(
      async () => {
        await AddressState.getAddressBook();
      },
      { instanceOf: Error, message: message }
    );
  }

  //getAddress function should throw error
  async getAddressFailTest(t: any, chain_id: string, message: string) {
    await t.throwsAsync(
      async () => {
        await AddressState.getAddress(chain_id);
      },
      { instanceOf: Error, message: message }
    );
  }

  //addAddress function should throw error
  async addAddressFailTest(t: any, message: string) {
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
      { instanceOf: Error, message: message }
    );
  }

  //removeAddress function should throw error
  async removeAddressFailTest(t: any, message: string) {
    await t.throwsAsync(
      async () => {
        await AddressState.removeAddress("1");
      },
      { instanceOf: Error, message: message }
    );
  }

  //addAddresses function should throw error
  async addAddressesFailTest(t: any, message: string) {
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
      { instanceOf: Error, message: message }
    );
  }
}

//Intialize test classes
const passing_tests = new PassingAddressStateTests();
const failing_tests = new FailingAddressStateTests();

//tests for all passing scenarios of AddressState functions
test.serial("AddressState Passing Tests", async (t) => {
  (globalThis as any).snap = passing_tests.snapMock;

  await passing_tests.getAddressBookPassTest(t);
  await passing_tests.getAddressPassTest(t);
  await passing_tests.addAddressPassTest(t);
  await passing_tests.removeAddressPassTest(t);
  await passing_tests.addAddressesPassTest(t);
});

//tests for all failing scenarios of AddressState functions
test.serial("AddressState Failing Tests", async (t) => {
  (globalThis as any).snap = failing_tests.snapMock1;

  await failing_tests.getAddressBookFailTest(
    t,
    "Address book was not found. Add an address to address book to initialize."
  );
  await failing_tests.getAddressFailTest(
    t,
    "1",
    "Address book was not found. Add an address to address book to initialize."
  );
  await failing_tests.addAddressFailTest(
    t,
    "Invalid address book data. Addresses should be a string."
  );
  await failing_tests.removeAddressFailTest(
    t,
    "Snap has not been initialized. Please initialize snap."
  );
  await failing_tests.addAddressesFailTest(
    t,
    "Invalid address book data. Addresses should be a string."
  );

  (globalThis as any).snap = failing_tests.snapMock2;
  let error = "Invalid address book data. Addresses should be a string.";
  let errorJson =
    "Invalid address book data. Addresses should be a JSON string.";

  await failing_tests.getAddressBookFailTest(t, errorJson);
  await failing_tests.getAddressFailTest(t, "1", error);
  await failing_tests.addAddressFailTest(t, error);
  await failing_tests.removeAddressFailTest(t, error);
  await failing_tests.addAddressesFailTest(t, error);

  (globalThis as any).snap = passing_tests.snapMock;
  await failing_tests.getAddressFailTest(
    t,
    "5",
    "5 is not found. Add the address to your address book at https://wallet.mysticlabs.xyz"
  );
});
