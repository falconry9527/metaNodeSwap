import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("Factory", function () {
  async function deploySimpleStorageFixture() {
    // 随机获取一些用户
    const [owner, addr1] = await ethers.getSigners();
    // 部署 Factory 合约
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    console.log("deploying Factory ...");
    await factory.waitForDeployment();
    const myTokenAddress = await factory.getAddress();
    console.log("stake Factory to:", myTokenAddress);

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

    return { factory, token0, token1, owner, addr1 };
  }

  it("createPool", async function () {
    const { factory, token0, token1, owner, addr1 } = await loadFixture(deploySimpleStorageFixture);
    const token = factory.connect(owner).sortToken(token0, token1);
    console.log("=======", token)

    // 创建一个 pool
    const token0Adress = await token0.getAddress();
    const token1Adress = await token1.getAddress();

    const hash = await factory.connect(owner).createPool(token0Adress,token1Adress,1,100000,3000)
    console.log("hash=======", hash)

    // 报错原因看看是否一致
    await expect(
      factory.connect(owner).createPool(token0Adress,token0Adress,1,100000,3000)
    ).to.be.rejectedWith("same_tokens");



  });

});
