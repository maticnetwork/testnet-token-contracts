pragma solidity 0.5.2;

import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title MaticTokenAirdrop
 */
contract MaticTokenAirdrop is Ownable {

  function airdropTokens(address token, address[] calldata _recipient, uint256[] calldata _amount) external onlyOwner {
    require(_recipient.length == _amount.length, "Invalid Input");
    for(uint256 i = 0; i < _recipient.length; i++) {
      require(
        IERC20(token).transfer(_recipient[i], _amount[i] * (10 ** 18)),
        "Transfer failed"
      );
    }
  }
}
