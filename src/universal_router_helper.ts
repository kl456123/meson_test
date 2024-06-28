import { ethers, BigNumberish } from "ethers";

enum CommandType {
  V3SwapExactInput = "0x00",
  WrapETH = "0x0b",
}

export function decodedPath(path: string) {
  const pathLength = (ethers.dataLength(path) + 3) / 23 - 1;
  const tokens = [];
  const fees = [];
  // 20 bytes token --> 3 bytes fee --> 20 bytes token
  for (let i = 0; i < pathLength; ++i) {
    tokens.push(ethers.dataSlice(path, i * 23, i * 23 + 20));
    fees.push(
      ethers.getBigInt(ethers.dataSlice(path, i * 23 + 20, (i + 1) * 23)),
    );
  }
  tokens.push(ethers.dataSlice(path, pathLength * 23));
  return { tokens, fees, raw: path };
}

export function encodePath(tokens: string[], fees: string[]): string {
  if (tokens.length !== fees.length + 1)
    throw new Error(`tokens and fees are mismatched`);
  // let path = ethers.getBytes(tokens[0])
  const path = [ethers.getBytes(tokens[0])];
  for (let i = 0; i < fees.length; ++i) {
    path.push(ethers.getBytes(fees[i]));
    path.push(ethers.getBytes(tokens[i + 1]));
  }
  return ethers.concat(path);
}

const iface = new ethers.Interface([
  "function execute(bytes commands,bytes[] inputs)",
]);

const abiMaps: {
  [key in CommandType]: string[];
} = {
  [CommandType.V3SwapExactInput]: [
    "address",
    "uint256",
    "uint256",
    "bytes",
    "address",
  ],
  [CommandType.WrapETH]: ["address", "uint256"],
};

export function parseUniversalRouterCalldata(calldata: string) {
  const { commands, inputs } = iface.decodeFunctionData("execute", calldata);
  const subcommands = [];
  if (ethers.dataLength(commands) !== inputs.length) {
    throw new Error(`inputs is not matched with commands`);
  }
  const coder = ethers.AbiCoder.defaultAbiCoder();

  for (let i = 0; i < inputs.length; ++i) {
    const subcommand = ethers.dataSlice(commands, i, i + 1);
    switch (subcommand) {
      case CommandType.V3SwapExactInput: {
        const [recipient, amountIn, amountOutMinimum, path, payer] =
          coder.decode(abiMaps[CommandType.V3SwapExactInput], inputs[i]);
        console.log({
          recipient,
          amountIn,
          amountOutMinimum,
          path: decodedPath(path),
          payer,
        });
        break;
      }
      case CommandType.WrapETH: {
        const [recipient, amount] = coder.decode(
          abiMaps[CommandType.WrapETH],
          inputs[i],
        );
        console.log({ recipient, amount });
        break;
      }
      default: {
        console.log("default");
      }
    }
  }
}

// fromToken: string, toToken: string,
export function encodeUniversalRouterCalldata(
  diamondRouter: string,
  fromTokenAmount: BigNumberish,
  amountOutMinimum: BigNumberish,
  path: string,
  payer: string,
) {
  const commands = "0x00";
  const coder = ethers.AbiCoder.defaultAbiCoder();
  const inputs = [
    coder.encode(abiMaps[CommandType.V3SwapExactInput], [
      diamondRouter,
      fromTokenAmount,
      amountOutMinimum,
      path,
      payer,
    ]),
  ];
  return iface.encodeFunctionData("execute", [commands, inputs]);
}
