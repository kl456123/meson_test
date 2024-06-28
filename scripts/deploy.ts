import { ethers } from "hardhat";
import * as hre from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const mesonAddress = "0x25ab3efd52e6470681ce037cd546dc60726948d3";
  const mesonAdaptorAddr = "0xe5128e639Bc1033C436906a53bf198B46d1f67f0";
  const mesonAdaptor = await ethers.getContractAt(
    "TransferToMesonContract",
    mesonAdaptorAddr,
  );
  // await mesonAdaptor.transferToMeson(encodedSwap, initiator)
  // const contract = await (await ethers.getContractFactory("TransferToMesonContract")).deploy(mesonAddress)
  // const mesonAdaptor = await contract.waitForDeployment()
  // const mesonAdaptorAddr = await mesonAdaptor.getAddress()
  console.log(`deployed to ${mesonAdaptorAddr}`);

  // verify proxy and official guardian
  await hre.run("verify:verify", {
    address: mesonAdaptorAddr,
    constructorArguments: [mesonAddress],
  });
}

main();
