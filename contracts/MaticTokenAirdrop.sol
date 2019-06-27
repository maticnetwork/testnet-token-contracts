pragma solidity 0.5.2;

import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";


/**
 * @title MaticTokenAirdrop
 */
contract MaticTokenAirdrop is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 private maticToken;
  uint256 SCALING_FACTOR = 10 ** 18;

  constructor(IERC20 _token) public {
    maticToken = _token;
  }

  function airdropTokens(address[] calldata _recipient, uint256[] calldata _amount) external onlyOwner {
    require(_recipient.length == _amount.length, "Invalid Input");
    for(uint256 i = 0; i < _recipient.length; i++) {
      maticToken.safeTransfer(_recipient[i], _amount[i] * SCALING_FACTOR);
    }
  }
}
