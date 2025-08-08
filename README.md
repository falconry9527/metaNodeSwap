hardhat 基础命令
```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

hardhat 依赖安装
```
npm install --save-dev hardhat
npm install -D hardhat-deploy
npm install  @openzeppelin/hardhat-upgrades 
npm install  @openzeppelin/contracts
npm install @chainlink/contracts
```

hardhat 常用命令
```
npm cache clean --force
npm config set registry https://mirrors.cloud.tencent.com/npm/

```

部署和升级脚本
```
npx hardhat clean && npx hardhat compile

npx hardhat run scripts/deploy_stake.js --network sepolia
npx hardhat deploy   --tags deployNftAuction --network sepolia 
npx hardhat deploy   --tags upgradeNftAuction --network sepolia 


```


PoolManager 和 Factory 相关问题：
```
1. calldata 起到什么作用 （IPoolManager.createAndInitializePoolIfNecessary 方法） ？
只读且临时：calldata 是只读的，数据不会被修改，存储成本低。
直接传递：对于外部函数（external），使用 calldata 比 memory 更省 Gas（因为不需要拷贝数据）。

2.sqrtPriceX96 是什么 ？
- sqrtPriceX96: 它是一个 uint160 类型的整数，存储的是 当前价格的平方根，并放大 2^96 倍（即 X96 后缀的含义
- 当前价格: 指 token1 相对于 token0 的价格，即 1 单位 token0 = X 单位 token1
- fee：以 1,000,000 为基底的手续费费率，Uniswap支持四种手续费费率（0.01%，0.05%、0.30%、1.00%），对于一般的交易对推荐 0.30%，fee 取值即 3000；

3. tick 
定义：tick 是价格的最小刻度单位，代表价格变动的最小间隔。可以根据 sqrtPriceX96算出来，过程相当复杂，了解一下就行了

4. salt
salt（盐值）是一个 bytes32 类型的随机数，用于 唯一标识 要部署的合约
1. 预先计算合约地址
2. 避免地址冲突： 如果某个 salt 已经使用过，再次用相同的 salt 部署会 失败（防止重复部署）。
3. 某些代理模式（如 EIP-1167）用 CREATE2 重新部署逻辑合约，保持代理地址不变。
new Pool{salt: salt}(...) 是一种 确定性合约部署 的方式，它使用 CREATE2 操作码来预先计算合约地址，而不是传统的 CREATE 随机地址生成方式。
CREATE2 可以预先知道要部署的合约的地址 

5. 为什么提供方法： PoolManager. getPairs()  
合约为了防止消耗过多gas ，数组类子暴露 aa[i] 方法，获取所有交易对要自己写方法
注意： 这里只是测试这样写，线上都是保存在数据库中，以免消耗过度的gas


```

pool 相关问题：
```
```
