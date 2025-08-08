// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IFactory.sol";
import "./interfaces/IPool.sol";
import "./Pool.sol";

contract Factory is IFactory {
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
        bytes32 salt = keccak256(
            abi.encode(token0, token1, tickLower, tickUpper, fee)
        );

        // create pool
        pool = address(new Pool{salt: salt}());

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
    ) private pure returns (address, address) {
        // return tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        // sorted ： two tokenPiar is same
        // do not sorted :  two tokenPiar is different
        return (tokenA, tokenB);
    }
}
