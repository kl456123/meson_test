import * as dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { AxiosError } from "axios";
import { Wallet, Contract, keccak256 } from "ethers";
import { ethers } from "hardhat";
import { baseApiUrl } from "../src/constants";
import {
  getSwapRequest,
  submit,
  getStatus,
  getSwapId,
} from "../src/meson_utils";

async function fromEOA(wallet: Wallet) {
  const swapRequest = await getSwapRequest({
    from: "base:usdc",
    to: "bnb:usdc",
    amount: "2",
    fromAddress: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
    recipient: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
  });
  console.log("swapRequest: ", swapRequest);
  const signature = await wallet.signMessage(
    ethers.getBytes(
      ethers.solidityPacked(
        ["bytes32", "address"],
        [swapRequest.encoded, wallet.address],
      ),
    ),
  );
  console.log("signature: ", signature);
  // submit the swap
  const { swapId } = await submit(
    swapRequest.encoded,
    signature,
    wallet.address,
  );
  console.log("swapId: ", swapId);
  // listen to the swap status
  console.log("status: ", await getStatus(swapId));
}

async function fromContract(wallet: Wallet) {
  const mesonAdaptorAddr = "0xe5128e639Bc1033C436906a53bf198B46d1f67f0";
  const mesonAdaptor = await ethers.getContractAt(
    "TransferToMesonContract",
    mesonAdaptorAddr,
  );
  // make sure the adaptor contract is deployed already
  const swapRequest = await getSwapRequest({
    from: "base:eth",
    to: "bnb:usdc",
    amount: "0.000001",
    fromAddress: mesonAdaptorAddr,
    fromContract: true,
    recipient: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
  });
  // note that use initiator provided by api to generate release signature
  await (
    await mesonAdaptor.transferToMeson(
      swapRequest.encoded,
      swapRequest.initiator,
    )
  ).wait();
  const swapId = getSwapId(swapRequest.encoded, swapRequest.initiator);
  console.log("status: ", await getStatus(swapId));
}

async function main() {
  const wallet = new Wallet(process.env.PRIVATE_KEY as string);
  await fromContract(wallet);
  // await fromEOA(wallet);
}

main();
