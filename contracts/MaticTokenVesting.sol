pragma solidity 0.5.2;

import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";


/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract MaticTokenVesting is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 private maticToken;
    uint256 private tokensToVest = 0;
    uint256 private vestingId = 0;

    string private constant INSUFFICIENT_BALANCE = "Insufficient balance";
    string private constant INVALID_VESTING_ID = "Invalid vesting id";
    string private constant VESTING_ALREADY_RELEASED = "Vesting already released";
    string private constant INVALID_BENEFICIARY = "Invalid beneficiary address";
    string private constant NOT_VESTED = "Tokens have not vested yet";

    struct Vesting {
        uint256 releaseTime;
        uint256 amount;
        address beneficiary;
        bool released;
    }
    mapping(uint256 => Vesting) public vestings;

    event TokenVestingReleased(uint256 indexed vestingId, address indexed beneficiary, uint256 amount);
    event TokenVestingAdded(uint256 indexed vestingId, address indexed beneficiary, uint256 amount);
    event TokenVestingRemoved(uint256 indexed vestingId, address indexed beneficiary, uint256 amount);

    constructor(IERC20 _token) public {
        require(address(_token) != address(0x0), "Matic Token isn't deployed");
        maticToken = _token;
        // test data
        uint256 SCALING_FACTOR = 10 ** 18;
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 1900000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 117990560 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 117990560 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 184000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 184000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 220110000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 220110000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 24, 226780000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 132000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 132000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 136000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 6, 495000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 495000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 510000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 0, 1200000000 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 24, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 30, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 36, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 42, 354836500 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 12, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 18, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 24, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 30, 266666666 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 36, 266666600 * SCALING_FACTOR);
        addVesting(0x9fB29AAc15b9A4B7F17c3385939b007540f4d791, now + 42, 266666616 * SCALING_FACTOR);
    }

    function token() public view returns (IERC20) {
        return maticToken;
    }

    function beneficiary(uint256 _vestingId) public view returns (address) {
        return vestings[_vestingId].beneficiary;
    }

    function releaseTime(uint256 _vestingId) public view returns (uint256) {
        return vestings[_vestingId].releaseTime;
    }

    function vestingAmount(uint256 _vestingId) public view returns (uint256) {
        return vestings[_vestingId].amount;
    }

    function removeVesting(uint256 _vestingId) public onlyOwner {
        Vesting storage vesting = vestings[_vestingId];
        require(vesting.beneficiary != address(0x0), INVALID_VESTING_ID);
        require(!vesting.released , VESTING_ALREADY_RELEASED);
        vesting.released = true;
        tokensToVest = tokensToVest.sub(vesting.amount);
        emit TokenVestingRemoved(_vestingId, vesting.beneficiary, vesting.amount);
    }

    function addVesting(address _beneficiary, uint256 _releaseTime, uint256 _amount) public onlyOwner {
        require(_beneficiary != address(0x0), INVALID_BENEFICIARY);
        tokensToVest = tokensToVest.add(_amount);
        vestingId = vestingId.add(1);
        vestings[vestingId] = Vesting({
            beneficiary: _beneficiary,
            releaseTime: _releaseTime,
            amount: _amount,
            released: false
        });
        emit TokenVestingAdded(vestingId, _beneficiary, _amount);
    }

    function release(uint256 _vestingId) public {
        Vesting storage vesting = vestings[_vestingId];
        require(vesting.beneficiary != address(0x0), INVALID_VESTING_ID);
        require(!vesting.released , VESTING_ALREADY_RELEASED);
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= vesting.releaseTime, NOT_VESTED);

        require(maticToken.balanceOf(address(this)) >= vesting.amount, INSUFFICIENT_BALANCE);
        vesting.released = true;
        tokensToVest = tokensToVest.sub(vesting.amount);
        maticToken.safeTransfer(vesting.beneficiary, vesting.amount);
        emit TokenVestingReleased(_vestingId, vesting.beneficiary, vesting.amount);
    }

    function retrieveExcessTokens(uint256 _amount) public onlyOwner {
        require(_amount <= maticToken.balanceOf(address(this)).sub(tokensToVest), INSUFFICIENT_BALANCE);
        maticToken.safeTransfer(owner(), _amount);
    }
}
