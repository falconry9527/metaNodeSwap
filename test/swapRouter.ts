import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { TickMath, encodeSqrtRatioX96 } from "@uniswap/v3-sdk";


describe("deploySimpleStorageFixture", function () {
  async function deploySimpleStorageFixture() {
    // 随机获取一些用户
    const [owner, addr1, addr2] = await ethers.getSigners();

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

    // 部署 SwapRouter 合约
    const SwapRouter = await ethers.getContractFactory("SwapRouter");
    const swapRouter = await SwapRouter.deploy(poolAddress);
    console.log("deploying swapRouter ...");
    await swapRouter.waitForDeployment();
    const swapRouterAddress = await swapRouter.getAddress();
    console.log("stake swapRouter to:", swapRouterAddress);

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

    return { poolManager, positionManager, swapRouter, token0, token1, owner, addr1, addr2 };
  }

  it("SwapRouter function", async function () {
    const { poolManager, positionManager, swapRouter, token0, token1, owner, addr1, addr2 } = await loadFixture(deploySimpleStorageFixture);
    // 1.   创建两个不同费率的池子

    const token0Adress = await token0.getAddress();
    const token1Adress = await token1.getAddress();
    const pool = await poolManager.connect(owner).createAndInitializePoolIfNecessary(
      {
        token0: token0Adress,
        token1: token1Adress,
        fee: 3000,
        tickLower: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1)),
        tickUpper: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(10000, 1)),
        sqrtPriceX96: BigInt(encodeSqrtRatioX96(100, 1).toString()),
      }
    );
    console.log("create pool=======", pool)


    const pool2 = await poolManager.connect(owner).createAndInitializePoolIfNecessary(
      {
        token0: token0Adress,
        token1: token1Adress,
        fee: 5000,
        tickLower: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1)),
        tickUpper: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(10000, 1)),
        sqrtPriceX96: BigInt(encodeSqrtRatioX96(100, 1).toString()),
      }
    );
    console.log("create pool2=======", pool2)
    // 2. mint 给两个池子添加流动性 
    await token0.connect(addr1).mint(); 
    await token0.connect(addr1).approve(positionManager, 5000n * 10n ** 18n);
    await token1.connect(addr1).mint();
    await token1.connect(addr1).approve(positionManager, 5000n * 10n ** 18n);
    console.log("token0.balanceOf(addr1)  mint=======", await token0.balanceOf(addr1))
    console.log("token1.balanceOf(addr1)  mint=======", await token1.balanceOf(addr1))
    await positionManager.connect(addr1).mint(
      {
        token0: token0Adress,
        token1: token1Adress,
        index: 0,
        recipient: addr1.address,
        amount0Desired: 1000n * 10n ** 18n,
        amount1Desired: 1000n * 10n ** 18n,
        deadline: BigInt(Date.now() + 3000),
      },
    );

    await positionManager.connect(addr1).mint(
      {
        token0: token0Adress,
        token1: token1Adress,
        index: 1,
        recipient: addr1.address,
        amount0Desired: 1000n * 10n ** 18n,
        amount1Desired: 1000n * 10n ** 18n,
        deadline: BigInt(Date.now() + 3000),
      },
    );

    console.log("mint  =======")
    console.log("token0.balanceOf(addr1)  mint1=======", await token0.balanceOf(addr1))
    console.log("token1.balanceOf(addr1)  mint1=======", await token1.balanceOf(addr1))
    console.log("nft  =======", await positionManager.ownerOf(1n))

    // 3. swap in
    await token0.connect(addr2).mint();
    await token0.connect(addr2).approve(positionManager, 3000n * 10n ** 18n);
    await token1.connect(addr2).mint();
    await token1.connect(addr2).approve(positionManager, 3000n * 10n ** 18n);
    console.log("token0.balanceOf(addr2)  mint2=======", await token0.balanceOf(addr2))
    console.log("token1.balanceOf(addr2)  mint2=======", await token1.balanceOf(addr2))

    await swapRouter.connect(addr2).exactInput(
      {
        tokenIn: token0Adress,
        tokenOut: token1Adress,
        indexPath: [0, 1],
        recipient: addr2,
        amountIn: 10n * 10n ** 18n,
        amountOutMinimum: 1n,
        sqrtPriceLimitX96: BigInt(encodeSqrtRatioX96(50, 1).toString()),
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1000),
      },
    );
    console.log("token0.balanceOf(addr2)  exactInput=======", await token0.balanceOf(addr2))
    console.log("token1.balanceOf(addr2)  exactInput =======", await token1.balanceOf(addr2))


  });


});
