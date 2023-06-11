import test from 'ava';
import { AddressState } from '../src/state'
import { Addresses, Address } from '../src//types/address'


//Initialize Sample Address
const address1: Address = {
  name: "User1",
  address: "0x123456",
  chain_id: "1"
};

const address2: Address = {
  name: "User2",
  address: "0xabcdef",
  chain_id: "2"
};

//Initialize Sample Address Book
let SampleAddresses = new Addresses ([address1, address2]);


test.serial('getAddressBook function should return current state of address book', async t => {
  
  // Mock the Metamask snap object and its request method
  globalThis.snap = {
    request: params => {

      // Check that the snap.request method was called with the correct parameters
      t.deepEqual(params, {
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      
      //return current state of address book
      return {
        addresses: SampleAddresses.string(),
      };
    },
  };

  //get current state of AddressBook
  const result = await AddressState.getAddressBook();

  t.deepEqual(result,[
                        {
                          address: '0x123456',
                          chain_id: '1',
                          name: 'User1',
                        },
                        {
                          address: '0xabcdef',
                          chain_id: '2',
                          name: 'User2',
                        },
                      ])

});


test.serial('getAddress function should return the address matching the given chain_id', async t => {
  
  // Mock the Metamask snap object and its request method
  globalThis.snap = {
    request: params => {

      // Check that the snap.request method was called with the correct parameters
      t.deepEqual(params, {
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      
      //return current state of address book
      return {
        addresses: SampleAddresses.string(),
      };
    },
  };

  //get the address matching given chain_id
  const result = await AddressState.getAddress('2');

  t.deepEqual(result, {
                        address: '0xabcdef',
                        chain_id: '2',
                        name: 'User2',
                      })
});

test.serial('addAddress function should add address ', async t => {
  
  // Mock the Metamask snap object and its request method
  globalThis.snap = {
    request: params => {

      // Check the Operation type 
      if (
        params.method === 'snap_manageState' &&
        params.params.operation === 'get'
      ) {
        //return current state of Addressbook for 'get' operation
        return {
          addresses: SampleAddresses.string(),
        };
      }

      if (
        params.method === 'snap_manageState' &&
        params.params.operation === 'update'
      ) {
        // Modify the SampleAddresses and return true 
        SampleAddresses.addresses = JSON.parse(params.params.newState.addresses);
        return true;
      }
    }
  };

  //Initialize new address
  const new_address: Address = {
    name: "User3",
    address: "0x456789",
    chain_id: "3"
  };


  //Add new address to Address Book
  await AddressState.addAddress(new_address);
  
  //Get updated Address Book
  const result = await AddressState.getAddressBook();

  t.deepEqual(result, [
    { chain_id: '1', address: '0x123456', name: 'User1'},
    { chain_id: '2', address: '0xabcdef', name: 'User2'},
    { chain_id: '3', address: '0x456789', name: 'User3'},
  ])

});



test.serial('removeAddress function should delete the address matching the given chain_id', async t => {
  // Mock the Metamask snap object and its request method
  globalThis.snap = {
    request: params => {
      if (
        params.method === 'snap_manageState' &&
        params.params.operation === 'get'
      ) {
        return {
          addresses: SampleAddresses.string(),
        };
      }

      if (
        params.method === 'snap_manageState' &&
        params.params.operation === 'update'
      ) {
        // Modify the SampleAddresses and return true 
        SampleAddresses.addresses = JSON.parse(params.params.newState.addresses);
        return true;
      }
    }
  };

  await AddressState.removeAddress('3');

  const result = await AddressState.getAddressBook();

  t.deepEqual(result, [
    { chain_id: '1', address: '0x123456', name: 'User1'},
    { chain_id: '2', address: '0xabcdef', name: 'User2'},
  ])
});


//TODO
test.serial('addAddresses function should replace the current Address book with a new one', async t => {
  t.true(true);
})

