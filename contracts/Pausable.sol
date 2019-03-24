pragma solidity ^0.4.24;

import "./Ownable.sol";


contract Pausable is Ownable {
  bool public paused;
  bool public pausedMetaTx;

  modifier whenNotPaused() {
    require(paused == false);
    _;
  }

  modifier whenMetaTxNotPaused() {
    require(pausedMetaTx == false);
    _;
  }

  function pause() external onlyOwner {
    paused = true;
  }

  function pauseMetaTx() external onlyOwner {
    pausedMetaTx = true;
  }

  function unpause() external onlyOwner {
    paused = false;
  }

  function unpauseMetaTx() external onlyOwner {
    pausedMetaTx = false;
  }
}