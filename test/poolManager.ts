import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TickMath, encodeSqrtRatioX96 } from "@uniswap/v3-sdk";


describe("deploySimpleStorageFixture", function () {
  async function deploySimpleStorageFixture() {
    // 随机获取一些用户
    const [owner, addr1] = await ethers.getSigners();
    // 部署 poolManager 合约
    const PoolManager = await ethers.getContractFactory("PoolManager");
    const poolManager = await PoolManager.deploy();
    console.log("deploying PoolManager ...");
    await poolManager.waitForDeployment();
    const myTokenAddress = await poolManager.getAddress();
    console.log("stake PoolManager to:", myTokenAddress);

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

    return { poolManager, token0, token1, owner };
  }

  it("createPool", async function () {
    const { poolManager, token0, token1, owner } = await loadFixture(deploySimpleStorageFixture);
    const token = poolManager.connect(owner).sortToken(token0, token1);
    console.log("=======", token)

    // 创建一个 pool
    const token0Adress = await token0.getAddress();
    const token1Adress = await token1.getAddress();

    const hash = await poolManager.connect(owner).createAndInitializePoolIfNecessary(
      {
        token0: token1Adress,
        token1: token0Adress,
        fee: 3000,
        tickLower: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1)),
        tickUpper: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(10000, 1)),
        sqrtPriceX96: BigInt(encodeSqrtRatioX96(100, 1).toString()),
      }
    );
    console.log("hash=======", hash)

    // get pool
    const pools= await poolManager.connect(owner).getAllPools()
    console.log("getPool=======", pools)

  });


});
