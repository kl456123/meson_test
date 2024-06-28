import axios from "axios";
import { AxiosError } from "axios";
import { ethers, Wallet, Contract } from "ethers";
import { baseApiUrl } from "./constants";

export function getSwapId(encoded: string, initiator: string) {
  const swapId = ethers.solidityPackedKeccak256(
    ["bytes32", "address"],
    [encoded, initiator],
  );
  return swapId;
}

export async function getSwapRequest(params: {}) {
  try {
    const res = await axios.post(`${baseApiUrl}/swap`, params);
    return res.data.result;
  } catch (err) {
    const error = err as unknown as AxiosError;
    console.log(error!.response!.data);
  }
}

export async function submit(
  encodedSwap: string,
  signature: string,
  addr: string,
) {
  try {
    const res = await axios.post(`${baseApiUrl}/swap/${encodedSwap}`, {
      fromAddress: addr,
      recipient: addr,
      signature,
    });
    return res.data.result;
  } catch (err) {
    const error = err as unknown as AxiosError;
    return error!.response!.data;
  }
}

export async function getStatus(fromTxHash: string) {
  try {
    const res = await axios.get(`${baseApiUrl}/swap`, {
      params: { hash: fromTxHash },
    });
    return res.data.result;
  } catch (err) {
    const error = err as unknown as AxiosError;
    return error!.response!.data;
  }
}

export async function approveToken(
  token: Contract,
  wallet: Wallet,
  addr: string,
) {}
