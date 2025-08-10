import { ethers } from "hardhat";

describe("Factory", function () {

  it("token", async function () {
    // 获取合约工厂和账户
    // 1. 部署 token
    const MyTokenF = await ethers.getContractFactory('MyToken')
    const myToken = await MyTokenF.deploy()
    console.log("deploying MyToken...");

    await myToken.waitForDeployment();
    const myTokenAddress = await myToken.getAddress();
    console.log("stake MyToken to:", myTokenAddress);
  });

});
