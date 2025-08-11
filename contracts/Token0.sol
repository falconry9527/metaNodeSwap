// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token0 is ERC20, ERC20Permit, Ownable {
    constructor() ERC20("MYToken0", "Token0") ERC20Permit("MYToken0") Ownable(msg.sender) {
        _mint(msg.sender, 100000 * 10 ** 18);
    }
    function mint() external  {
        _mint(msg.sender, 100000 * 10 ** 18);
    }

}