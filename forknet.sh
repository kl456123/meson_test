#!/bin/bash
# NETWORK=sepolia
# BLOCK_HEIGHT=5852921

NETWORK=base
BLOCK_HEIGHT=14920523

RPC_URL=https://base.llamarpc.com
yarn hardhat node --fork ${RPC_URL} --fork-block-number ${BLOCK_HEIGHT}
