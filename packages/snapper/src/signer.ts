import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { AccountData, AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { getAccountInfo, signAmino, signDirect, DEFAULT_SNAP_ID } from './snap.js';

export class CosmJSOfflineSigner implements OfflineDirectSigner {
  readonly chainId: string;
  readonly snapId: string;

  constructor(chainId: string, snapId?: string) {
    this.chainId = chainId;
    if (!snapId) {
      this.snapId = DEFAULT_SNAP_ID
    } else {
      this.snapId = snapId
    }
  }

  async getAccounts(): Promise<AccountData[]> {
    let address = await getAccountInfo(this.chainId, this.snapId);

    return [
        {
          address: address.address,
          algo: address.algo,
          pubkey: new Uint8Array(Object.values(address.pubkey))
        }
    ];
  }

  async signDirect(
    signerAddress: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error('Chain IDs do not match');
    }
    const accounts = await this.getAccounts();

    let account = accounts[0];

    if (account.address !== signerAddress) {
      throw new Error('Signer address does not match wallet address');
    }

    let signRes = signDirect(this.chainId, account.address, signDoc, this.snapId);

    return signRes;
  }

  // This has been added as a placeholder.
  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {

    if (this.chainId !== signDoc.chain_id) {
      throw new Error('Chain IDs do not match');
    }
    const accounts = await this.getAccounts();

    let account = accounts[0];

    if (account.address !== signerAddress) {
      throw new Error('Signer address does not match wallet address');
    }

    let signRes = signAmino(this.chainId, account.address, signDoc, this.snapId);

    return signRes;
  }
}