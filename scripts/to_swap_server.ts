enum BridgingStatus {
  Failed,
  Pending,
  Success,
}

interface BridgingProgress {
  status: BridgingStatus;
}

async function checkBridgingProgress(
  sourceTxHash: string,
  destTxhash: string,
): Promise<BridgingProgress> {
  return { status: BridgingStatus.Failed };
}

async function signByOracleSource(
  bridginProgress: BridgingProgress,
): Promise<string> {
  return "";
}

async function swapOnToChainWithSignature(swapRequest: {}, signature: string) {}

async function main() {
  // check bridge event happened on source chain
  const sourceTxHash = "";
  const destTxhash = "";
  const bridginProgress = await checkBridgingProgress(sourceTxHash, destTxhash);

  // check tokens received on dest chain and the connection between source tx and dest tx
  // oracle source sign signature for conformation
  const signature = await signByOracleSource(bridginProgress);
  // relayer swap with the oracle source's signature on dest chain to complete the bridge request totally
  const swapRequest = {};
  await swapOnToChainWithSignature(swapRequest, signature);
}

main();
