pragma solidity ^0.4.24;

import "./ERC20.sol";
import "./TokenVesting.sol";

/**
 * @title ERC20Detailed token
 * @dev The decimals are only for visualization purposes.
 * All the operations are done using the smallest and indivisible token unit,
 * just as on Ethereum all the operations are done in wei.
 */
contract Token is ERC20 {

    constructor (string name, string symbol, uint8 decimals, uint256 totalSupply)
    public
    ERC20 (name, symbol, decimals, totalSupply) {
        _balances[msg.sender] = totalSupply * (uint256(10) ** decimals);

    // vesting Example
    // address tokenVesting = new TokenVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, 1552314037, 10, 2);
    // _transfer(msg.sender, 0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, 100);

    }

}
