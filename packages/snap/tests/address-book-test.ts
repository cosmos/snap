import test from 'ava';
import { AddressState } from '../src/state'
import { Addresses, Address } from '../src//types/address'

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

let SampleAddresses = new Addresses ([address1, address2]);

test('getAddressBook function should return current state of address book', async t => {
  const origin = 'test-origin';

  // Mock the Metamask snap object and its request method
  global.snap = {
    request: params => {

      // Check that the snap.request method was called with the correct parameters
      t.deepEqual(params, {
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      
      //return current state of address book
      return SampleAddresses;
    },
  };

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
                      ]
            )

});

test('addAddress function should add address ', async t => {
  const origin = 'test-origin';

  // Mock the Metamask snap object and its request method
  global.snap = {
    request: params => {

      // Check that the snap.request method was called with the correct parameters
      t.deepEqual(params, {
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      
      //return current state of address book
      return SampleAddresses
    }
  };

  const new_address: Address = {
    name: "User3",
    address: "0x456789",
    chain_id: "3"
  };

  await AddressState.addAddress(new_address);

  const result = AddressState.getAddressBook();

  t.deepEqual(result, [
    { chain_id: '1', address: '0x123456', name: 'User1'},
    { chain_id: '2', address: '0xabcdef', name: 'User2'},
    { chain_id: '3', address: '0x456789', name: 'User3'},
  ])

});

test('deleteAddress function', async t => {
    t.true(true);
});

test('getAddresses function', async t => {
    t.true(true);
});