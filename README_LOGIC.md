
dex 相关问题
```
自动做市商（AMM）机制：x∗y=k
流动性池是一个持有两种不同 token 的合约， x 和 y 分别代表 token0 的数目和 token1 的数目， k 是它们的乘积，当 swap 发生时，token0 和 token1 的数量都会发生变化，但二者乘积保持不变，仍然为 k 。
```


PoolManager 和 Factory 相关问题
```
1. calldata 起到什么作用 （IPoolManager.createAndInitializePoolIfNecessary 方法） ？
只读且临时：calldata 是只读的，数据不会被修改，存储成本低。
直接传递：对于外部函数（external），使用 calldata 比 memory 更省 Gas（因为不需要拷贝数据）。

2. salt
salt（盐值）是一个 bytes32 类型的随机数，用于 唯一标识 要部署的合约
1. 预先计算合约地址
2. 避免地址冲突： 如果某个 salt 已经使用过，再次用相同的 salt 部署会 失败（防止重复部署）。
3. 某些代理模式（如 EIP-1167）用 CREATE2 重新部署逻辑合约，保持代理地址不变。
new Pool{salt: salt}(...) 是一种 确定性合约部署 的方式，它使用 CREATE2 操作码来预先计算合约地址，而不是传统的 CREATE 随机地址生成方式。
CREATE2 可以预先知道要部署的合约的地址 

3. 为什么提供方法： PoolManager. getPairs()  
合约为了防止消耗过多gas ，数组类子暴露 aa[i] 方法，获取所有交易对要自己写方法
注意： 这里只是测试这样写，线上都是保存在数据库中，以免消耗过度的gas

```

pool 各种方法作用
```
mint(铸币) : 添加流动性
burn（烧伤）: 燃烧流动性(换取token0 和 token1)
collect(收集) : 取出代币 (token0 或 token1)
swap(交换) :  交换代币 （token0 换 token1 ，token1 换 token0）

```


pool 相关问题
```
1.sqrtPriceX96 是什么 ？
- sqrtPriceX96: 它是一个 uint160 类型的整数，存储的是 当前价格的平方根，并放大 2^96 倍（即 X96 后缀的含义）
- 当前价格: 指 token1 相对于 token0 的价格，即 1 单位 token0 = X 单位 token1
- -  可以根据sqrtPriceX96算出: tick = TickMath.getTickAtSqrtPrice(state.sqrtPriceX96);

2. tick ， tickSpacing 和 fee
tick： 是价格的最小刻度单位，代表价格变动的最小间隔。一般是 当前价格 的万分之一，所以可以根据 sqrtPriceX96 算出来
tickSpacing（刻度间隔）： 每次交易间隔几个 tick
fee： 交易手续费，tickSpacing越大，波动越大，fee 一般越大
fee：以 1,000,000 为基底的手续费费率，Uniswap支持四种手续费费率（0.01%，0.05%、0.30%、1.00%），对于一般的交易对推荐 0.30%，fee 取值即 3000；

3.Position 流动性头寸
当用户在某个池子（如 ETH/USDC）的特定价格区间内存入代币时，系统会生成一个 NFT（Non-Fungible Token） 代表该头寸

4.Liquidity
Position 的流动性（Liquidity） 是一个核心概念，它决定了用户在特定价格区间内提供的资金对交易的影响能力
        // sqrtPriceX96 : sqrt(price) * 2^96，其中price = token1 / token0
        // sqrtRatioAX96 : 流动性区间的下限（lower tick）对应的价格的平方根
        // sqrtRatioBX96 : 流动性区间的上限（upper tick）对应的价格的平方根
        // amount0Desired : 你希望提供的 token0 的最大数量
        // amount1Desired : 你希望提供的 token1 的最大数量
        liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtPriceX96,
            sqrtRatioAX96,
            sqrtRatioBX96,
            params.amount0Desired,
            params.amount1Desired
        );

5. feeGrowthGlobal0X128 和 feeGrowthGlobal1X128
feeGrowthGlobal0X128 : token0 全局累积手续费
feeGrowthGlobal1X128 : token1 全局累积手续费

6. using SafeCast for uint256; 
balance0Before.add(amount0)： 当精度丢失的时候，程序报错且停止

```


流程整理
```
Factory.pools :
mapping(address => mapping(address => address[])) public pools;
1.参数： address1 : token0 ; address2 :token1 ; address3: pool 的地址(不同的费率)
2.存入数据: PoolManager.createAndInitializePoolIfNecessary -> Factory.createPool

pool.positions ：positionManager合约地址 对应的全局 positions
mapping(address => Position) public positions;
1. 存入和读取都在方法: mint -> pool._modifyPosition(写入)

PositionManager.positions ： PositionManager 对应的用户 positions
mapping(uint256 => PositionInfo) public positions;
1. 存入在 mint ，burn


positionManager调用流程:
mint （
        address token0;
        address token1;
        uint32 index;
        uint256 amount0Desired;
        uint256 amount1Desired;
        address recipient; // nft 授权的地址
        uint256 deadline;
）:
1. 创建的时候会传入 PoolManager ，绑定 PoolManager
2. 找到 交易对 对应的 pool: 调用的时候，传入 index（不同的费率） -> poolManager.getPool(token0,toknen1,index) -> Factory.pools 
3. 创建并更新全局 pool.positions:   pool.mint(address(this), liquidity, data)
4. 更新用户 PositionManager.positions: positions[positionId] = PositionInfo

burn(positionId):
1. 创建的时候会传入 PoolManager ，绑定 PoolManager
2. 找到 positions ：PositionManager.positions[positionId]
3. 找到 交易对 对应的 pool :  poolManager.getPool(token0,toknen1,index) -> Factory.pools 
4. 更新全局 ： (amount0, amount1) = pool.burn(_liquidity);
5. 更新用户 PositionManager.positions  

ISwapRouter调用流程:
1. 创建的时候会传入 PoolManager ，绑定 PoolManager
2. 遍历 交易对 对应的 pool（根据传入的index数组） :  poolManager.getPool(token0,toknen1,index) -> Factory.pools  
2. 调用 pool.swap 
  a. 更新全局 pool.positions :  SwapMath.computeSwapStep
  b. 更新个人数据

```

回调
```
1. IMintCallback.mintCallback
mint 的时候，回调 让用户存入 token0 和 token1
触发方法： PositionManager.mint ->  pool.mint(address(this), liquidity, data);

2.ISwapCallback.swapCallback
swap 的时候，回调 让用户存入 token0 或 token1
触发方法： SwapRouter.exactInput  -> this.swapInPool


wsm 要回调用，pool 只是管理全局流动性的地方，转账功能要隔离到对应的业务逻辑

```