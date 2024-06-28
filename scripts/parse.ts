import { ethers } from "hardhat";
import { Contract } from "ethers";
import { mesonAddress } from "../src/constants";

// source: base chain
const iface = new ethers.Interface([
  "function postSwap(uint256 encodedSwap, bytes32 r, bytes32 yParityAndS, uint200 postingValue)",
  "function directExecuteSwap(uint256 encodedSwap,bytes32 r,bytes32 yParityAndS,address initiator,address recipient)",
  "function directRelease(uint256 encodedSwap,bytes32 r,bytes32 yParityAndS,address initiator,address recipient)",
  "function executeSwap(uint256 encodedSwap,bytes32 r,bytes32 yParityAndS,address recipient,bool depositToPool)",
  "function tokenForIndex(uint8) view returns(address)",
  "function indexOfToken(address) view returns(uint8)",
]);
async function parseCallData() {
  // const calldata = '0xc8173c440100009896809800000000001111088e000013d620006650286c02ca21210501442417a7050d8818d8f9f8e814c2a0f026691f5ad65a3280515bc8e02953ae5f0755334fcbd2f3508fda3be71c293e6c9405ed44056a6cdcd5d4445e824e4d4a0000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c00000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c0'
  // const {encodedSwap, r, yParityAndS, initiator, recipient} = iface.decodeFunctionData('directExecuteSwap', calldata)
  // console.log(encodedSwap)
  // console.log('release signature: ', r, yParityAndS)

  // base => bsc
  const calldata =
    "0x827c87cc0100001e8480980000000000340230f8000013d620006651ebae02ca21210501770b56d28231cd7bba1d939553c5219414eecc67b72eba3a6757adca72be1a04bc655caf7207c0f77955d112bfa3ec1eb232d9765e0e44866c97d3de0680f2c40000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c00000000000000000000000000000000000000000000000000000000000000001";
  const { encodedSwap, r, yParityAndS, recipient, depositToPool } =
    iface.decodeFunctionData("executeSwap", calldata);
  console.log(encodedSwap, recipient);
}

async function getMesonContract() {
  const meson = new ethers.Contract(mesonAddress, iface, ethers.provider);
  return meson;
}

function parseSalt(salt: string) {
  const saltNum = ethers.getBigInt(salt);
  const toEOA = (saltNum & 0x80000000000000000000n) !== 0n;
  const waiveFee = (saltNum & 0x40000000000000000000n) !== 0n;
  const mesonTo = (saltNum & 0x20000000000000000000n) !== 0n;
  // get data from api
  const fromAPI = (saltNum & 0x10000000000000000000n) !== 0n;
  const useNonTypedSigning = (saltNum & 0x08000000000000000000n) !== 0n;
  // core token
  const swapForCoreToken = (saltNum & 0x04000000000000000000n) !== 0n;
  const coreTokenPrice = saltNum & 0xfffff00000000000n;
  const coreTokenAmount = saltNum & 0x00000fff00000000n;

  // share to partner
  const shareToPartnet = (saltNum & 0x02000000000000000000n) !== 0n;
  const poolIndexToShare = saltNum & (0xffff000000000000n + 65536n);
  const amountToShare = saltNum & 0x0000ffff00000000n;

  const customizedData = ethers.toBeHex(saltNum & 0x0000ffffffffffffffffn);
  return {
    toEOA,
    waiveFee,
    mesonTo,
    fromAPI,

    useNonTypedSigning,

    swapForCoreToken,
    coreTokenPrice,
    coreTokenAmount,

    shareToPartnet,
    poolIndexToShare,
    amountToShare,
    customizedData,
  };
}

async function parseEncodedSwap(meson: Contract, encodedSwap: string) {
  // the first two characters is "0x"
  // version:uint8|amount:uint40|salt:uint80|fee:uint40|expireTs:uint40|outChain:uint16|outToken:uint8|inChain:uint16|inToken:uint8
  const version = ethers.dataSlice(encodedSwap, 0, 1);
  // with decimals
  const amount = BigInt(ethers.dataSlice(encodedSwap, 1, 6));

  const encodedSalt = ethers.dataSlice(encodedSwap, 6, 16);
  const fee = BigInt(ethers.dataSlice(encodedSwap, 16, 21));
  const expireTs = BigInt(ethers.dataSlice(encodedSwap, 21, 26));
  // 2 bytes of SLIP-44
  const outChain = ethers.dataSlice(encodedSwap, 26, 28);
  // out token index
  const outToken = await meson.tokenForIndex(
    BigInt(ethers.dataSlice(encodedSwap, 28, 29)),
  );
  // 2 bytes of SLIP-44
  const inChain = ethers.dataSlice(encodedSwap, 29, 31);
  // in token index
  const inToken = await meson.tokenForIndex(
    BigInt(ethers.dataSlice(encodedSwap, 31, 32)),
  );

  const salt = parseSalt(encodedSalt);
  const decodedSwap = {
    version,
    amount,
    salt,
    fee,
    expireTs,
    outChain,
    outToken,
    inChain,
    inToken,
  };
  console.log(decodedSwap);
}

function encodeSwap() {}

async function main() {
  const meson = await getMesonContract();
  const encodedSwap =
    "0x0100001e8480980000000000340230f8000013d620006651ebae02ca21210501";
  // const encodedSwap = 452312852697233469746004417435618397383065724298071471935158334911333058047n;
  // const encodedSwap = ethers.toBeHex(encodedSwap, 32)
  await parseEncodedSwap(meson, encodedSwap);
}

main();
