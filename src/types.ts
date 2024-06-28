import { BigNumberish, BytesLike } from "ethers";

export interface ToChainSwapRequest {
  fromToken: string;
  toToken: string;
  receiver: string;
  fromTokenAmount: BigNumberish;
  gasFeeAmount: BigNumberish; // tx gas fee slash from fromToken
  dexRouter: string;
  dexData: BytesLike;
  message: BytesLike;
}

export interface CrossChainMessageData {
  sourceChainId: number;
  sourceTxHash: BytesLike;
  receiver: string;
  // allow operator to handle only these tokens for user
  token: string;
  tokenAmount: BigNumberish;
  // check data source and its signature to make sure the data is correct
  signature: BytesLike;
}

export interface RefundRequest {
  token: string;
  receiver: string;
  refundedAmount: BigNumberish;
  gasFeeAmount: BigNumberish; // tx gas fee slash from fromToken
  message: BytesLike;
}

export interface BridgeRequest {
  fromToken: string;
  receiver: string;
  toChainId: number;
  fromTokenAmount: BigNumberish;
  // fees params
  // including relay fee in to chain and service fee, deduct by protocol
  protocolFee: BigNumberish;
  affiliateFee: BigNumberish;
  affiliator: string;
  // cross-chain data to consumed on to-chain
  message: BytesLike;
}

export interface SwapAndBridgeRequest {
  fromToken: string;
  toToken: string;
  receiver: string;
  toChainId: number;
  fromTokenAmount: BigNumberish;
  // fees params
  // including relay fee in to chain and service fee, deduct by protocol
  protocolFee: BigNumberish;
  affiliateFee: BigNumberish;
  affiliator: string;
  // extra data for swap
  toTokenMinAmount: BigNumberish;
  dexRouter: string;
  dexData: BytesLike;
}

export interface MesonData {
  encodedSwap: BigNumberish;
  initiator: string;
}
