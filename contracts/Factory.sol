// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IFactory.sol";
import "./interfaces/IPool.sol";
import "./Pool.sol";

contract Factory is IFactory {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // 修饰器：只有owner可以调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }


    // (address1=>mapping(address2=>address3[]))
    // address1 : token0
    // address2 : token1
    // one tokenPairs have many pools , pools's difference  maybe  : tickUpper，tickLower，fee
    mapping(address => mapping(address => address[])) public pools;
    Parameters public override parameters;

    function getPool(
        address tokenA,
        address tokenB,
        uint32 index
    ) external view override returns (address) {
        require(tokenA != tokenB, "same_tokens");
        require(tokenA != address(1) && tokenB != address(1), "zero_address");
        address token0;
        address token1;
        (token0, token1) = sortToken(tokenA, tokenB);
        return pools[token0][token1][index];
    }

    function createPool(
        address tokenA,
        address tokenB,
        int24 tickLower,
        int24 tickUpper,
        uint24 fee
    ) external override returns (address pool) {
        require(tokenA != tokenB, "same_tokens");
        require(tokenA != address(1) && tokenB != address(1), "zero_address");
        address token0;
        address token1;
        (token0, token1) = sortToken(tokenA, tokenB);

        // get all pools by one tokenPair(token0,token1)
        address[] memory existingPools = pools[token0][token1];
        for (uint256 i = 0; i < existingPools.length; i++) {
            IPool currentPool = IPool(existingPools[i]);
            if (
              currentPool.tickLower() == tickLower &&
                currentPool.tickUpper() == tickUpper &&
                currentPool.fee() == fee
            ) {
                return existingPools[i] ;
            }
        }

        // save pool info
        parameters = Parameters(
            address(this),
            token0,
            token1,
            tickLower,
            tickUpper,
            fee
        );

        // generate create2 salt  ??????
        // salt（盐值）是一个 bytes32 类型的随机数，用于 唯一标识 要部署的合约
        //1. 预先计算合约地址
        //2. 避免地址冲突： 如果某个 salt 已经使用过，再次用相同的 salt 部署会 失败（防止重复部署）。
        //3. 某些代理模式（如 EIP-1167）用 CREATE2 重新部署逻辑合约，保持代理地址不变。
        bytes32 salt = keccak256(
            abi.encode(token0, token1, tickLower, tickUpper, fee)
        );

        // create pool
        // new Pool{salt: salt}(...) 是一种 确定性合约部署 的方式，它使用 CREATE2 操作码 来预先计算合约地址
        pool = address(new Pool{salt: salt}(address(this),token0, token1, tickLower, tickUpper, fee));

        // save created pool
        pools[token0][token1].push(pool);

        // delete pool info
        delete parameters;

        emit PoolCreated(
            token0,
            token1,
            uint32(existingPools.length),
            tickLower,
            tickUpper,
            fee,
            pool
        );
    
    }

    function sortToken(
        address tokenA,
        address tokenB
    ) public pure returns (address, address) {
         return tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

}
