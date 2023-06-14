import test from "ava";
import { onRpcRequest } from "../src/index";
import { Address, Addresses } from "../src/types/address";
import { Json, JsonRpcRequest } from "@metamask/utils";
import { boolean } from "superstruct";

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

  constructor() {
    test.before(() => {
      (globalThis as any).snap = this.snapMock;
    });
  }

  //onRpcRequet function should handle the "addAddress" case correctly
  async caseAddAddress(t: any) {
    //Initialize new address
    const new_address: Address = {
      name: "User3",
      address: "0x456789",
      chain_id: "3",
    };

    const origin = "test-origin";

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
  async caseDeleteAddress(t: any) {
    const origin = "test-origin";

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
  async caseGetAddresses(t: any) {
    const origin = "test-origin";

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

const tests = new PassingOnRpcRequestTests();

test.serial("onRpcRequest Tests", async (t) => {
  await tests.caseGetAddresses(t);
  await tests.caseAddAddress(t);
  await tests.caseDeleteAddress(t);
});
