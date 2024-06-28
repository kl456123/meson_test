import { ethers } from "hardhat";

async function main() {
  const { chainId } = await ethers.provider.getNetwork();
  const wallet = ethers.Wallet.createRandom();
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
    name: "",
    version: "0.1.0",
    chainId,
    verifyingContract: ethers.ZeroAddress,
  };

  const message = {
    types,
    domain,
    primaryType: "CrossChainMessage",
    value: {
      sourceChainId: 1,
      sourceTxHash: ethers.ZeroHash,
      receiver: ethers.ZeroAddress,
      token: ethers.ZeroAddress,
      tokenAmount: 123,
    },
  };
  const signature = await wallet.signTypedData(
    message.domain,
    message.types,
    message.value,
  );
}

main();
