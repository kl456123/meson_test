import * as dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { Wallet, Contract, keccak256 } from "ethers";
import { ethers } from "hardhat";

// for testnet
// const baseApiUrl = 'https://testnet-relayer.meson.fi/api/v1'
const baseApiUrl = "https://relayer.meson.fi/api/v1";

// base chain
const mesonAddress = "0x25ab3efd52e6470681ce037cd546dc60726948d3";

async function approveToken(token: Contract, wallet: Wallet, addr: string) {}

function getSwapId(encoded: string, initiator: string) {
  const swapId = ethers.solidityPackedKeccak256(
    ["bytes32", "address"],
    [encoded, initiator],
  );
  return swapId;
}

async function getSwapRequest() {
  const res = await axios.post(`${baseApiUrl}/swap`, {
    from: "base:usdc",
    to: "bnb:usdc",
    amount: "2",
    fromAddress: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
    recipient: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
  });
  return res.data.result;
}

async function submit(encodedSwap: string, signature: string, addr: string) {
  const res = await axios.post(`${baseApiUrl}/swap/${encodedSwap}`, {
    fromAddress: addr,
    recipient: addr,
    signature,
  });
  return res.data.result;
}

async function getStatus(swapId: string) {
  const res = await axios.get(`${baseApiUrl}/swap/${swapId}`);
  return res.data.result;
}

async function fromEOA(wallet: Wallet) {
  const swapRequest = await getSwapRequest();
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
  const mesonAdaptorAddr = "0x992415e37304e030024d66722594fb79be62dbe1";
  const mesonAdaptor = await ethers.getContractAt(
    "TransferToMesonContract",
    mesonAdaptorAddr,
  );
  const res = await axios.post(`${baseApiUrl}/swap`, {
    from: "base:usdc",
    to: "bnb:usdc",
    amount: "2",
    fromAddress: mesonAdaptorAddr,
    fromContract: true,
    recipient: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
  });
  const swapRequest = res.data.result;
  console.log(swapRequest);

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
  await fromEOA(wallet);
}

main();
