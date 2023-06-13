import test from 'ava';
import { onRpcRequest } from '../src/index';
import { Address, Addresses } from '../src/types/address'
import { Json, JsonRpcRequest } from '@metamask/utils';

class PassingOnRpcRequestTests{
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
        console.log("check")
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

    //onRpcRequest function should handle the "getAddresses" case correctly
    async caseGetAddresses(t: any){
        const origin = 'test-origin';
        // Define the JSON-RPC request variable{}
        const method : Json = "addAddress"

        let request: JsonRpcRequest<Json[] | Record<string, Json>> = {
            method: "getAddresses",
            jsonrpc: '2.0',
            id: null,
            params: []
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

});
