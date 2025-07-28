import { ethers } from "ethers";
import ActivityLoggerABI from "/workspaces/Hackathon/contracts/ActivityLogger.json";
import HealthIDABI from "/workspaces/Hackathon/contracts/HealthID.json";
import PriceOracleABI from "/workspaces/Hackathon/contracts/PriceOracle.json";
import RewardEngineABI from "/workspaces/Hackathon/contracts/RewardEngine.json";
import RPMABI from "/workspaces/Hackathon/contracts/RewardPoolManager.json";

const addresses = {
  ActivityLogger: "0x4e76CB15C8A88a47e5210bf4b1ECE6A9036894ef",  // replace with actual deployed addresses
  HealthID: "0x60c928ea4f6f73e129f0a9c2d940bc3dbb721250",
  PriceOracle: "0xfda8f534cc264f711b56975065338e3605b08dc8",
  RewardEngine: "0xfd7877b7c1fd6ef4250b0bb5e4a83c4b65bc0905",
  RPM: "0x18389e0e5c069a5d1f77bd20899510e31fcfdd8c",
};

const getProviderAndSigner = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not found");
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

export const getContract = async (name) => {
  const { signer } = await getProviderAndSigner();

  switch (name) {
    case "ActivityLogger":
      return new ethers.Contract(addresses.ActivityLogger, ActivityLoggerABI, signer);
    case "HealthID":
      return new ethers.Contract(addresses.HealthID, HealthIDABI, signer);
    case "PriceOracle":
      return new ethers.Contract(addresses.PriceOracle, PriceOracleABI, signer);
    case "RewardEngine":
      return new ethers.Contract(addresses.RewardEngine, RewardEngineABI, signer);
    case "RPM":
      return new ethers.Contract(addresses.RPM, RPMABI, signer);
    default:
      throw new Error("Unknown contract name");
  }
};
