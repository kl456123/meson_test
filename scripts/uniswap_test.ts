import { parseUniversalRouterCalldata } from "../src/universal_router_helper";

async function main() {
  const data =
    "0x24856bc30000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000006cb442acf35158d5eda88fe602221b67b400be3e00000000000000000000000000000000000000000000000000470de4df82000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c000000000000000000000000000000000000000000000000000470de4df82000000000000000000000000000000000000000000000000000000000000044627d700000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000064833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000";
  // "0x24856bc300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000049747162a7118a3f18b872f3766d862d51c6c000000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000000000000000422b1bc00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000064833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000"
  // "0x24856bc30000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000006cb442acf35158d5eda88fe602221b67b400be3e00000000000000000000000000000000000000000000000000470de4df82000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000007fa9385be102ac3eac297483dd6233d62b3e149600000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000006cb442acf35158d5eda88fe602221b67b400be3e000000000000000000000000000000000000000000000000000000000000002b4200000000000000000000000000000000000006000064833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000"
  parseUniversalRouterCalldata(data);
}

main();
