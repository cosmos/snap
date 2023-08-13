import test from "ava";
import { onRpcRequest } from "../src/index";
import { Address, Addresses } from "../src/types/address";
import { Json, JsonRpcRequest } from "@metamask/utils";
import { Result } from "../src/types/result";
import { Chains, Chain } from "../src/types/chains";
import chainsJson from "./public/chain-test.json";

const origin = "test-origin";

class ChainsPassingOnRpcRequestTests{
    //Initialize Sample Chains
    chain1: Chain = chainsJson[0];
    chain2: Chain = chainsJson[1];
  
    //Initialize Sample Chains
    SampleChains = new Chains([this.chain1, this.chain2]);

    // Mock the Metamask snap object and its request method
  snapMock = {
    request: (params: any) => {
      if (
        params.method === "snap_manageState" &&
        params.params.operation === "get"
      ) {
        return {
          chains: this.SampleChains.string(),
        };
      }

      if (
        params.method === "snap_manageState" &&
        params.params.operation === "update"
      ) {
        // Modify the SampleChains and return true
        this.SampleChains.chains = JSON.parse(params.params.newState.chains);
        return true;
      }

            
      if (
        params.method === "snap_dialog" &&
        params.params.type === "confirmation"
      ) {
        return true;
      }
    },
  };

  //onRpcRequet function should handle the "getChains" case correctly
  async casePassGetChains(t: any) {
    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "getChains",
      jsonrpc: "2.0",
      id: null,
      params: [],
    };

    let result  = await onRpcRequest({ origin, request });


    // Check that the correct result is returned
    t.deepEqual(result, {
      data: new Chains([chainsJson[0], chainsJson[1]]),
      statusCode: 200,
      success: true
    });

  }


  //onRpcRequet function should handle the "addChain" case correctly
  async casePassAddChain(t: any) {

    //Initialize new chain
    const new_chain: Chain = chainsJson[2];

    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "addChain",
      jsonrpc: "2.0",
      id: null,
      params: {
        chain_info : JSON.stringify(new_chain)
      }
    };

    let result = await onRpcRequest({ origin, request });

    // Check that the correct result is returned  
    t.deepEqual(result, {
      data: new Chains (chainsJson),
      statusCode: 201,
      success: true
    });
  }

  //onRpcRequet function should handle the "deleteChain" case correctly
  async casePassDeleteChain(t: any) {

    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "deleteChain",
      jsonrpc: "2.0",
      id: null,
      params: {
        chain_id : "cosmoshub-4"
      }
    };

    let result = await onRpcRequest({ origin, request });

    // Check that the correct result is returned  
    t.deepEqual(result, {
      data: new Chains ([chainsJson[0], chainsJson[2]]),
      statusCode: 201,
      success: true
    });
  }

}

class ChainsFailingOnRpcRequestTests {
  //Mock snap object for Invalid Chains data
  snapMock1 = {
    request: (params: any) => {
      return {
        chains: undefined,
      };
    },
  };

  //Mock snap object for declining confirmation
  snapMock2 = {
    request: (params: any) => {
      if (
        params.method === "snap_dialog" &&
        params.params.type === "confirmation"
      ) {
        return false;
      }
    },
  };

  async caseFailGetChains(t: any, message: string){

    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "getChains",
      jsonrpc: "2.0",
      id: null,
      params: []
    };

    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error, message: message }
    );
  }

  async caseFailAddChain(t: any, message: string){
    //Initialize new chain
    const new_chain: Chain = chainsJson[2];

    let request: JsonRpcRequest<Json[] | Record<string, Json>>;

    // Define the JSON-RPC request variable for different snap objects
    if ((globalThis as any).snap === this.snapMock2) {
      request = {
        method: "addChain",
        jsonrpc: "2.0",
        id: null,
        params: {
          chain_info: JSON.stringify(new_chain)
        },
      };
    } else {
      request = {
        method: "addChain",
        jsonrpc: "2.0",
        id: null,
        params: {
          chain_info : 1
        },
      };
    }
    
    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error, message: message }
    );

  }

  async caseFailDeleteChain(t: any, message: string){

    let request: JsonRpcRequest<Json[] | Record<string, Json>>;

    // Define the JSON-RPC request variable for different snap objects
    if ((globalThis as any).snap === this.snapMock2) {
      request = {
        method: "deleteChain",
        jsonrpc: "2.0",
        id: null,
        params: {
          chain_id: "cosmoshub-4"
        },
      };
    } else {
      request = {
        method: "deleteChain",
        jsonrpc: "2.0",
        id: null,
        params: {
          chain_id : 123
        },
      };
    }


    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error, message: message }
    );

  }

}

class AddressPassingOnRpcRequestTests {
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

      if (
        params.method === "snap_dialog" &&
        params.params.type === "confirmation"
      ) {
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
        address: new_address.name,
        chain_id: new_address.chain_id,
        name: new_address.name,
      },
    };

    let value = await onRpcRequest({ origin, request });
    let result: Result;
    result = value as Result;

    let addr = [
      { name: "User1", address: "0x123456", chain_id: "1" },
      { name: "User2", address: "0xabcdef", chain_id: "2" },
      { name: "User3", address: "User3", chain_id: "3" },
    ];

    // Check that the correct result is returned
    t.deepEqual(result, {
      data: new Addresses(addr),
      success: true,
      statusCode: 201,
    });
  }

  //onRpcRequet function should handle the "deleteAddress" case correctly
  async casePassDeleteAddress(t: any) {
    // Define the JSON-RPC request variable{}
    let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
      method: "deleteAddress",
      jsonrpc: "2.0",
      id: null,
      params: {
        address: "0x456789",
      },
    };

    let value = await onRpcRequest({ origin, request });
    let result: Result;
    result = value as Result;

    let addr = [
      { name: "User1", address: "0x123456", chain_id: "1" },
      { name: "User2", address: "0xabcdef", chain_id: "2" },
      { name: "User3", address: "User3", chain_id: "3" },
    ];

    // Check that the correct result is returned
    t.deepEqual(result, {
      data: new Addresses(addr),
      success: true,
      statusCode: 201,
    });
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
    t.deepEqual(result, {
      data: [
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
      ],
      statusCode: 200,
      success: true,
    });
  }
}

class AddressFailingOnRpcRequestTests {
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

  //Mock snap object for declining confirmation
  snapMock3 = {
    request: (params: any) => {
      if (
        params.method === "snap_dialog" &&
        params.params.type === "confirmation"
      ) {
        return false;
      }
    },
  };

  //onRpcRequet function should throw error on "addAddress" case
  async caseFailAddAddress(t: any, message: string) {
    let request: JsonRpcRequest<Json[] | Record<string, Json>>;

    // Define the JSON-RPC request variable for different snap objects
    if ((globalThis as any).snap === this.snapMock3) {
      request = {
        method: "addAddress",
        jsonrpc: "2.0",
        id: null,
        params: {
          name: "user_test",
          address: "test_address",
          chain_id: "chain_id_test",
        },
      };
    } else {
      request = {
        method: "addAddress",
        jsonrpc: "2.0",
        id: null,
        params: [],
      };
    }

    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error, message: message }
    );
  }

  //onRpcRequet function should throw error on "deleteAddress" case
  async caseFailDeleteAddress(t: any, message: string) {
    let request: JsonRpcRequest<Json[] | Record<string, Json>>;

    // Define the JSON-RPC request variable for different snap objects
    if ((globalThis as any).snap === this.snapMock3) {
      request = {
        method: "deleteAddress",
        jsonrpc: "2.0",
        id: null,
        params: {
          address: "0x456789",
        },
      };
    } else {
      request = {
        method: "deleteAddress",
        jsonrpc: "2.0",
        id: null,
        params: [],
      };
    }

    await t.throwsAsync(
      async () => {
        await onRpcRequest({ origin, request });
      },
      { instanceOf: Error, message: message }
    );
  }

  //onRpcRequest function should throw error on "getAddresses" case
  async caseFailGetAddresses(t: any, message: string) {
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
      { instanceOf: Error, message: message }
    );
  }
}

const address_passing_tests = new AddressPassingOnRpcRequestTests();
const address_failing_tests = new AddressFailingOnRpcRequestTests();
const chains_passing_tests = new ChainsPassingOnRpcRequestTests();
const chains_failing_tests = new ChainsFailingOnRpcRequestTests();


test.serial("onRpcRequest Passing Tests for Address Book operations", async (t) => {
  (globalThis as any).snap = address_passing_tests.snapMock;

  await address_passing_tests.casePassGetAddresses(t);
  await address_passing_tests.casePassAddAddress(t);
  await address_passing_tests.casePassDeleteAddress(t);
});

test.serial("onRpcRequest Failing Tests for Address Book operations", async (t) => {
  (globalThis as any).snap = address_failing_tests.snapMock1;

  await address_failing_tests.caseFailGetAddresses(
    t,
    "Address book was not found. Add an address to address book to initialize."
  );
  await address_failing_tests.caseFailAddAddress(t, "Invalid addAddress request");
  await address_failing_tests.caseFailDeleteAddress(t, "Invalid deleteAddress request");

  (globalThis as any).snap = address_failing_tests.snapMock2;
  await address_failing_tests.caseFailAddAddress(t, "Invalid addAddress request");
  await address_failing_tests.caseFailDeleteAddress(t, "Invalid deleteAddress request");

  (globalThis as any).snap = address_failing_tests.snapMock3;

  await address_failing_tests.caseFailAddAddress(t, "Add address action declined");
  await address_failing_tests.caseFailDeleteAddress(
    t,
    "Delete address action declined"
  );
});

test.serial("onRpcRequest Passing Tests for Chains operations", async (t) => {
  (globalThis as any).snap = chains_passing_tests.snapMock;

  await chains_passing_tests.casePassGetChains(t);
  await chains_passing_tests.casePassAddChain(t);
  await chains_passing_tests.casePassDeleteChain(t);
})


test.serial("onRpcRequest Failing Tests for Chains operations", async(t) => {
  (globalThis as any).snap = chains_failing_tests.snapMock1;

  await chains_failing_tests.caseFailGetChains(t, "Snap has not been initialized. Please initialize snap.");
  await chains_failing_tests.caseFailAddChain(t, "Invalid addChain request");
  await chains_failing_tests.caseFailDeleteChain(t, "Invalid deleteChain request");

  (globalThis as any).snap = chains_failing_tests.snapMock2;
  await chains_failing_tests.caseFailAddChain(t, "Chain addition was denied.");
  await chains_failing_tests.caseFailDeleteChain(t, "Chain deletion was denied.");


})