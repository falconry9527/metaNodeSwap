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


问题解答：
```
1. calldata 起到什么作用 （IPoolManager.createAndInitializePoolIfNecessary 方法） ？
只读且临时：calldata 是只读的，数据不会被修改，存储成本低。
直接传递：对于外部函数（external），使用 calldata 比 memory 更省 Gas（因为不需要拷贝数据）。

2.sqrtPriceX96 是什么 ？
- sqrtPriceX96: 它是一个 uint160 类型的整数，存储的是 当前价格的平方根，并放大 2^96 倍（即 X96 后缀的含义
- 当前价格: 指 token1 相对于 token0 的价格，即 1 单位 token0 = X 单位 token1
- fee：以 1,000,000 为基底的手续费费率，Uniswap支持四种手续费费率（0.01%，0.05%、0.30%、1.00%），对于一般的交易对推荐 0.30%，fee 取值即 3000；



```