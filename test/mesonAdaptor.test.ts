import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("MesonAdaptor Test", function () {
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const mesonAdaptor = await (
      await hre.ethers.getContractFactory("TransferToMesonContract")
    ).deploy("0x0d12d15b26a32e72A3330B2ac9016A22b1410CB6");

    return { mesonAdaptor, owner, otherAccount };
  }
  const swapRequest = {
    encoded:
      "0x0100001e848098000000000004830d6e000013d620006651cbcd02ca21210501",
    fromContract: "0xc4708269962125441cad8d243b5d0a4c95e09f13",
    recipient: "0x0049747162a7118a3f18b872f3766d862d51c6c0",
    initiator: "0x1731d54225da9213e4b0bf5db0d4e62a592aa85e",
    fee: { serviceFee: "0.5", lpFee: "1.3", totalFee: "1.8" },
  };
  it("base test", async () => {
    const { mesonAdaptor } = await loadFixture(deployOneYearLockFixture);
    await (
      await mesonAdaptor.transferToMeson(
        swapRequest.encoded,
        swapRequest.initiator,
      )
    ).wait();
  });
});
