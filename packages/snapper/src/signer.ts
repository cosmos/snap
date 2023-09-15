import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { AccountData, AminoSignResponse, StdSignDoc } from '@cosmjs/amino';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { getAccountInfo, signAmino, signDirect, DEFAULT_SNAP_ID } from './snap.js';
import Long from 'long';

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

  public async getAccounts(): Promise<readonly AccountData[]> {
    let address = await getAccountInfo(this.chainId, this.snapId);
    return [
      {
        algo: "secp256k1",
        address: address.address,
        pubkey: new Uint8Array(Object.values(address.pubkey)),
      },
    ];
  }

  public async signDirect(
    signerAddress: string,
    signDoc: SignDoc,
  ): Promise<any> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error('Chain IDs do not match.');
    }
    const accounts = await this.getAccounts();

    let account = accounts[0];

    if (account.address !== signerAddress) {
      throw new Error('Signer address and wallet address do not match.');
    }

    let signRes = await signDirect(this.chainId, signerAddress, signDoc, this.snapId);

    const { accountNumber } = signDoc;

    const accountNumberLong = new Long(accountNumber?.low || 0, accountNumber?.high, accountNumber?.unsigned, );
  
    const sign = {
      signature: signRes.signature,
      signed: {
        ...signRes.signed,
        accountNumber: `${accountNumberLong.toString()}`,
        authInfoBytes: new Uint8Array(
          Object.values(signRes.signed.authInfoBytes),
        ),
        bodyBytes: new Uint8Array(Object.values(signRes.signed.bodyBytes)),
      },
    };
  
    return sign;
  }

  // This has been added as a placeholder.
  public async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {

    if (this.chainId !== signDoc.chain_id) {
      throw new Error('Chain IDs do not match');
    }
    const accounts = await this.getAccounts();

    let account = accounts[0];

    if (account.address !== signerAddress) {
      throw new Error('Signer address and wallet address do not match.');
    }

    let signRes = await signAmino(this.chainId, account.address, signDoc, this.snapId);

    return signRes;
  }
}