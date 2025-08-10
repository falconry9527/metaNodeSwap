import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("Factory", function () {

  it("createPool", async function () {
    // 随机获取一些用户
    const [owner, addr1, addr2] = await ethers.getSigners();
    // 部署 Factory 合约
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    console.log("deploying MyToken...");
    await factory.waitForDeployment();
    const myTokenAddress = await factory.getAddress();
    console.log("stake MyToken to:", myTokenAddress);

    // 部署 2个erc20 合约
    const Token0 = await ethers.getContractFactory("Token0");
    const token0 = await Token0.deploy();
    await token0.waitForDeployment();
    const token0Adress = await token0.getAddress();
    console.log("stake token0 Adress to:", token0Adress);

    const Token1 = await ethers.getContractFactory("Token1");
    const token1 = await Token1.deploy();
    await token1.waitForDeployment();
    const token1Adress = await token1.getAddress();
    console.log("stake token1 Adress to:", token1Adress);

    // 创建一个 pool
    // const hash = factory.connect(owner).createPool([
    //   token0Adress,
    //   token1Adress,
    //   1,
    //   100000,
    //   3000,
    // ]);


  });

});
