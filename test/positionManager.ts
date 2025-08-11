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
    const poolAddress = await poolManager.getAddress();

    // 部署 positionManager 合约
    const PositionManagerF = await ethers.getContractFactory("PositionManager");
    const positionManager = await PositionManagerF.deploy(poolAddress);
    console.log("deploying positionManager ...");
    await positionManager.waitForDeployment();
    const myTokenAddress = await positionManager.getAddress();
    console.log("stake positionManager to:", myTokenAddress);

    // 部署 2个erc20 合约
    const Token0 = await ethers.getContractFactory("Token0");
    const tokenA = await Token0.deploy();
    await tokenA.waitForDeployment();
    const tokenAdress = await tokenA.getAddress();

    const Token1 = await ethers.getContractFactory("Token1");
    const tokenB = await Token1.deploy();
    await tokenB.waitForDeployment();
    const tokenBdress = await tokenB.getAddress();

    const token0 = tokenAdress < tokenBdress ? tokenA : tokenB;
    const token1 = tokenAdress < tokenBdress ? tokenB : tokenA;

    return { poolManager,positionManager, token0, token1, owner, addr1 };
  }

  it("positionManager function", async function () {
    const {poolManager, positionManager, token0, token1, owner, addr1 } = await loadFixture(deploySimpleStorageFixture);
    // 1. 创建一个 pool
    const token0Adress = await token0.getAddress();
    const token1Adress = await token1.getAddress();
    const pool = await poolManager.connect(owner).createAndInitializePoolIfNecessary(
      {
        token0: token0Adress ,
        token1: token1Adress,
        fee: 3000,
        tickLower: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1)),
        tickUpper: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(10000, 1)),
        sqrtPriceX96: BigInt(encodeSqrtRatioX96(100, 1).toString()),
      }
    );
    console.log("create pool=======", pool)

    // 2. mint
    // 要先授权
    await token0.connect(addr1).mint();
    await token0.connect(addr1).approve( positionManager, 2000n * 10n ** 18n);
    await token1.connect(addr1).mint();
    await token1.connect(addr1).approve( positionManager, 2000n * 10n ** 18n);
    console.log("token0.balanceOf(addr1)  =======",await token0.balanceOf(addr1) )
    console.log("token1.balanceOf(addr1)  =======",await token1.balanceOf(addr1) )
     
    const hash = await positionManager.connect(addr1).mint(
      {
        token0: token0Adress ,
        token1: token1Adress,
        index: 0,
        recipient: addr1.address,
        amount0Desired: 1000n * 10n ** 18n,
        amount1Desired: 1000n * 10n ** 18n,
        deadline: BigInt(Date.now() + 3000),
      },
    );
    console.log("mint  =======" )
    console.log("token0.balanceOf(addr1)  =======",await token0.balanceOf(addr1) )
    console.log("token1.balanceOf(addr1)  =======",await token1.balanceOf(addr1) )
    console.log("nft  =======",await positionManager.ownerOf(1n)  )

    // 3.  burn 
    await positionManager.connect(addr1).burn(1);
    console.log("burn  =======" )
    console.log("token0.balanceOf(addr1)  =======",await token0.balanceOf(addr1) )
    console.log("token1.balanceOf(addr1)  =======",await token1.balanceOf(addr1) )
    console.log("nft  =======",await positionManager.ownerOf(1n)  )

    // 4. collect
    await positionManager.connect(addr1).collect(1n,addr1);
    console.log("collect  =======" )
    console.log("token0.balanceOf(addr1)  =======",await token0.balanceOf(addr1) )
    console.log("token1.balanceOf(addr1)  =======",await token1.balanceOf(addr1) )
    // console.log("nft  =======",await positionManager.ownerOf(1n)  )

  });


});
