import test from "ava";
import { onRpcRequest } from "../src/index";
import { Address, Addresses } from "../src/types/address";
import { Json, JsonRpcRequest } from "@metamask/utils";

const origin = "test-origin";

class PassingOnRpcRequestTests {
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

  //onRpcRequet function should handle the "addAddress" case correctly
  async casePassAddAddress(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User3",
      address: "0x456789",
      chain_id: "3",
    };

    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "addAddress",
      jsonrpc: "2.0",
      id: null,
      params: {
        address: JSON.stringify(new_address),
      },
    };

    let result = await onRpcRequest({ origin, request });

    // Check that the correct result is returned
    t.deepEqual(result, true);
  }

  //onRpcRequet function should handle the "deleteAddress" case correctly
  async casePassDeleteAddress(t: any) {
    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "deleteAddress",
      jsonrpc: "2.0",
      id: null,
      params: {
        chain_id: "3",
      },
    };

    let result = await onRpcRequest({ origin, request });

    // Check that the correct result is returned
    t.deepEqual(result, true);
  }

  //onRpcRequest function should handle the "getAddresses" case correctly
  async casePassGetAddresses(t: any) {
    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "getAddresses",
      jsonrpc: "2.0",
      id: null,
      params: [],
    };

    let result = await onRpcRequest({ origin, request });

    // Check that the correct result is returned
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
}

class FailingOnRpcRequestTests {
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

  //onRpcRequet function should throw error on "addAddress" case
  async caseFailAddAddress(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User3",
      address: "0x456789",
      chain_id: "3",
    };

    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "addAddress",
      jsonrpc: "2.0",
      id: null,
      params: {
        address: JSON.stringify(new_address),
      },
    };

    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error }
    );
  }

  //onRpcRequet function should throw error on "deleteAddress" case
  async caseFailDeleteAddress(t: any) {
    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "deleteAddress",
      jsonrpc: "2.0",
      id: null,
      params: {
        chain_id: "3",
      },
    };

    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error }
    );
  }

  //onRpcRequest function should throw error on "getAddresses" case
  async caseFailGetAddresses(t: any) {
    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "getAddresses",
      jsonrpc: "2.0",
      id: null,
      params: [],
    };

    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error }
    );
  }
}

const passing_tests = new PassingOnRpcRequestTests();
const failing_tests = new FailingOnRpcRequestTests();

test.serial("onRpcRequest Passing Tests", async (t) => {
  (globalThis as any).snap = passing_tests.snapMock;

  await passing_tests.casePassGetAddresses(t);
  await passing_tests.casePassAddAddress(t);
  await passing_tests.casePassDeleteAddress(t);
});

test.serial("onRpcRequest Failing Tests", async (t) => {
  (globalThis as any).snap = failing_tests.snapMock1;

  await failing_tests.caseFailGetAddresses(t);
  await failing_tests.caseFailAddAddress(t);
  await failing_tests.caseFailDeleteAddress(t);

  (globalThis as any).snap = failing_tests.snapMock2;

  await failing_tests.caseFailGetAddresses(t);
  await failing_tests.caseFailAddAddress(t);
  await failing_tests.caseFailDeleteAddress(t);
});
