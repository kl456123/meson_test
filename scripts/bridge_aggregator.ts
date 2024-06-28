import { ethers, network } from "hardhat";
import { BigNumberish, parseUnits, Signer, BytesLike, Contract } from "ethers";
import axios from "axios";
import { AxiosError } from "axios";
import { getSwapId, getStatus, getSwapRequest } from "../src/meson_utils";
import {
  encodeUniversalRouterCalldata,
  encodePath,
} from "../src/universal_router_helper";
import {
  usdcAddress,
  wethAddress,
  univesalRouterAddr,
  baseApiUrl,
  bridgeAggregatorInMultiChain,
} from "../src/constants";
import {
  BridgeRequest,
  SwapAndBridgeRequest,
  CrossChainMessageData,
  ToChainSwapRequest,
} from "../src/types";

const abi = [
  "function bridgeToViaMeson(tuple(address fromToken,address receiver,uint256 toChainId,uint256 fromTokenAmount,uint256 protocolFee,uint256 affiliateFee,address affiliator,bytes message) bridgeRequest, tuple(uint256 encodedSwap,address initiator) mesonData) external",
  "function swapAndBridgeToViaMeson(tuple(address fromToken,address toToken,address receiver,uint256 toChainId,uint256 fromTokenAmount,uint256 protocolFee,uint256 affiliateFee,address affiliator,uint256 toTokenMinAmount,address dexRouter,bytes dexData) swapRequest,tuple(uint256 encodedSwap,address initiator) mesonData) external payable",
  "function swapOnToChain(tuple(address fromToken,address toToken,address receiver,uint256 fromTokenAmount,uint256 gasFeeAmount,address dexRouter,bytes dexData,bytes message) swapRequest) external",
  "function refund(tuple(address token,address receiver,uint256 refundedAmount,uint256 gasFeeAmount,bytes message) refundRequest) external",
];
const recipient = "0x0049747162a7118a3f18b872f3766d862d51c6c0";

async function bridgeTest(bridgeAggregator: Contract) {
  // make sure the adaptor contract is deployed already
  const swapRequest = await getSwapRequest({
    from: "base:usdc",
    to: "bnb:usdc",
    amount: "2",
    fromAddress: await bridgeAggregator.getAddress(),
    fromContract: true,
    recipient,
  });
  // note that use initiator provided by api to generate release signature
  const bridgeRequest: BridgeRequest = {
    fromToken: usdcAddress,
    receiver: recipient,
    toChainId: 56,
    fromTokenAmount: ethers.parseUnits("2", 6),
    protocolFee: 0,
    affiliateFee: 0,
    affiliator: ethers.ZeroAddress,
    // useless
    message: "0x",
  };
  const mesonData = {
    encodedSwap: swapRequest.encoded,
    initiator: swapRequest.initiator,
  };
  await (
    await bridgeAggregator.bridgeToViaMeson(bridgeRequest, mesonData)
  ).wait();
  const swapId = getSwapId(swapRequest.encoded, swapRequest.initiator);
  console.log(`swapId: ${swapId}`);
  console.log("status: ", await getStatus(swapId));
}

async function swapAndBridgeTest(bridgeAggregator: Contract) {
  const fromTokenAmount = ethers.parseEther("0.005");
  // usdc
  // TODO(get quote using quoter contract on chain)
  const amount = "16.7";
  const amountOutMinimum = ethers.parseUnits(amount, 6);
  const fromToken = wethAddress;
  const toToken = usdcAddress;
  const dexData = encodeUniversalRouterCalldata(
    await bridgeAggregator.getAddress(),
    fromTokenAmount,
    amountOutMinimum,
    encodePath([fromToken, toToken], ["0x64"]),
    "0x0000000000000000000000000000000000000001",
  );
  // note that use initiator provided by api to generate release signature
  const swapAndBridgeRequest: SwapAndBridgeRequest = {
    fromToken,
    toToken,
    toTokenMinAmount: amountOutMinimum,
    receiver: recipient,
    toChainId: 56,
    fromTokenAmount,
    protocolFee: 0,
    affiliateFee: 0,
    affiliator: ethers.ZeroAddress,
    dexRouter: univesalRouterAddr,
    dexData,
  };
  const swapRequest = await getSwapRequest({
    from: "base:usdc",
    to: "bnb:usdc",
    amount,
    fromAddress: await bridgeAggregator.getAddress(),
    fromContract: true,
    recipient,
  });
  const mesonData = {
    encodedSwap: swapRequest.encoded,
    initiator: swapRequest.initiator,
  };
  const recipit = await (
    await bridgeAggregator.swapAndBridgeToViaMeson(
      swapAndBridgeRequest,
      mesonData,
    )
  ).wait();
  console.log("status: ", await getStatus(recipit.hash));
}

async function generateMessageDataAndSignature(
  signer: Signer,
  receiver: string,
  token: string,
  tokenAmount: BigNumberish,
  routerAddr: string,
): Promise<string> {
  const message: CrossChainMessageData = {
    sourceChainId: 1,
    sourceTxHash: ethers.randomBytes(32),
    receiver,
    // allow operator to handle only these tokens for user
    token,
    tokenAmount,
    // check data source and its signature to make sure the data is correct
    signature: "",
  };
  const { chainId } = await ethers.provider.getNetwork();
  const types = {
    CrossChainMessage: [
      { name: "sourceChainId", type: "uint256" },
      { name: "sourceTxHash", type: "bytes32" },
      { name: "receiver", type: "address" },
      { name: "token", type: "address" },
      { name: "tokenAmount", type: "uint256" },
    ],
  };
  const domain = {
    name: "binance bridge aggregator",
    version: "0.1.0",
    chainId,
    verifyingContract: routerAddr,
  };
  message.signature = await signer.signTypedData(domain, types, message);
  const coder = ethers.AbiCoder.defaultAbiCoder();
  return coder.encode(
    [
      "tuple(uint256 sourceChainId,bytes32 sourceTxHash,address receiver,address token,uint256 tokenAmount,bytes signature)",
    ],
    [message],
  );
}

async function swapOnToChainTest(bridgeAggregator: Contract, signer: Signer) {
  // make sure the adaptor contract is deployed already
  // const fromTokenAmount = ethers.parseEther("0.005");
  const fromTokenAmount = ethers.parseUnits("16", 6);
  // weth=>usdc
  // const tokenAmount = ethers.parseEther("0.005");
  // const fromToken = wethAddress;
  // const toToken = usdcAddress;
  // const amountOutMinimum = ethers.parseUnits("16", 6);

  // usdc => weth
  const tokenAmount = ethers.parseUnits("16", 6);
  const fromToken = usdcAddress;
  const toToken = wethAddress;
  const amountOutMinimum = ethers.parseEther("0.004");

  const dexData = encodeUniversalRouterCalldata(
    recipient,
    fromTokenAmount,
    amountOutMinimum,
    encodePath([fromToken, toToken], ["0x64"]),
    // set to zero when using native tokens, it means to pay from router
    "0x0000000000000000000000000000000000000001",
  );
  const message = await generateMessageDataAndSignature(
    signer,
    recipient,
    wethAddress,
    tokenAmount,
    await bridgeAggregator.getAddress(),
  );
  // note that use initiator provided by api to generate release signature
  const swapRequest: ToChainSwapRequest = {
    fromToken,
    toToken,
    receiver: recipient,
    fromTokenAmount,
    gasFeeAmount: 0,
    dexRouter: univesalRouterAddr,
    dexData,
    message,
  };
  const recipit = await (
    await bridgeAggregator.swapOnToChain(swapRequest)
  ).wait();
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const bridgeAggregatorAddr = bridgeAggregatorInMultiChain[network.name];
  const bridgeAggregator = new ethers.Contract(
    bridgeAggregatorAddr,
    abi,
    deployer,
  );
  // bridgeTest();
  // swapAndBridgeTest();
  await swapOnToChainTest(bridgeAggregator, deployer);
}

main();
