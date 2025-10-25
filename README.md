### hardhat 基础命令
```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/deploy_swap.ts
```

###  hardhat 依赖安装
```shell
npm install --save-dev hardhat
npm install -D hardhat-deploy
npm install  @openzeppelin/hardhat-upgrades 
npm install  @openzeppelin/contracts
npm install @chainlink/contracts
```

###  hardhat 常用命令
```shell
npm cache clean --force
npm config set registry https://mirrors.cloud.tencent.com/npm/

```

### 部署和升级脚本
```shell
npx hardhat clean && npx hardhat compile

npx hardhat ignition deploy ./ignition/modules/deploy_swap.ts --network sepolia

```

