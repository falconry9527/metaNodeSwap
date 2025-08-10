// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
// pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./libraries/LiquidityAmounts.sol";
import "./libraries/TickMath.sol";
import "./libraries/FixedPoint128.sol";

import "./interfaces/IPositionManager.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IPoolManager.sol";

contract PositionManager is IPositionManager, ERC721 {
    // 保存 PoolManager 合约地址
    IPoolManager public poolManager;

    constructor(address _poolManger) ERC721("MetaNodeSwapPosition", "MNSP") {
        poolManager = IPoolManager(_poolManger);
    }

    /// positions 的角标, solidity 的 mapping 没有长度，所以自己维护一个角标
    uint176 private _nextId = 1;

    // 用一个 mapping 来存放所有 Position 的信息
    mapping(uint256 => PositionInfo) public positions;

    // 获取全部的 Position 信息
    function getAllPositions()
        external
        view
        override
        returns (PositionInfo[] memory positionInfo)
    {
        positionInfo = new PositionInfo[](_nextId - 1);
        for (uint32 i = 0; i < _nextId - 1; i++) {
            positionInfo[i] = positions[i + 1];
        }
        return positionInfo;
    }

    function getSender() public view returns (address) {
        return msg.sender;
    }

    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    modifier checkDeadline(uint256 deadline) {
        require(_blockTimestamp() <= deadline, "Transaction too old");
        _;
    }

    function mint(
        MintParams calldata params
    )
        external
        payable
        override
        checkDeadline(params.deadline)
        returns (
            uint256 positionId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {


    }

    function burn(
        uint256 positionId
    ) external override returns (uint256 amount0, uint256 amount1) {

    }

    function collect(
        uint256 positionId,
        address recipient
    ) external override returns (uint256 amount0, uint256 amount1) {
        
    }

    function mintCallback(
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override {}
}
