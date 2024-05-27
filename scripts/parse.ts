import { ethers } from "ethers";

// destination: bnb chain
function main() {
  // source: base chain
  const calldata =
    "0xc8173c440100009896809800000000001111088e000013d620006650286c02ca21210501442417a7050d8818d8f9f8e814c2a0f026691f5ad65a3280515bc8e02953ae5f0755334fcbd2f3508fda3be71c293e6c9405ed44056a6cdcd5d4445e824e4d4a0000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c00000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c0";

  const iface = new ethers.Interface([
    "function postSwap(uint256 encodedSwap, bytes32 r, bytes32 yParityAndS, uint200 postingValue)",
    "function directExecuteSwap(uint256 encodedSwap,bytes32 r,bytes32 yParityAndS,address initiator,address recipient)",
  ]);
  const { encodedSwap, r, yParityAndS, initiator, recipient } =
    iface.decodeFunctionData("directExecuteSwap", calldata);
  // console.log(encodedSwap)
  console.log("release signature: ", r, yParityAndS);
}

main();
