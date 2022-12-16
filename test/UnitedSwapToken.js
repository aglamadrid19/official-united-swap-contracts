const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UnitedSwap Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployUnitedSwapTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const UnitedSwapToken = await ethers.getContractFactory("UnitedSwapToken");
    const unitedswaptoken = await UnitedSwapToken.deploy();

    unitedswaptoken.deployed()

    return { unitedswaptoken, owner, otherAccount };
  }

  describe("Basic checks", function () {
    it("Should set the right owner", async function () {
      const {
        unitedswaptoken,
        owner
      } = await loadFixture(deployUnitedSwapTokenFixture);

      expect(await unitedswaptoken.owner()).to.equal(owner.address);
    });

    it("Should set the right name and ticker", async function () {
      const { 
        unitedswaptoken
      } = await loadFixture(deployUnitedSwapTokenFixture);

      expect(await unitedswaptoken.name()).to.equal("UnitedSwap Token");
      expect(await unitedswaptoken.symbol()).to.equal("US");
    });

    it("Should set initial supply to 0", async function () {
      const { 
        unitedswaptoken
      } = await loadFixture(deployUnitedSwapTokenFixture);

      expect(await unitedswaptoken.totalSupply()).to.equal("0");
    });

    it("Should mint if called by owner", async function () {
      const { 
        unitedswaptoken,
        owner
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await unitedswaptoken['mint(uint256)'](mintAmount);
      await unitedswaptoken["mint(address,uint256)"](owner.address, mintAmount);
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount.mul(2));
    });

    it("Should not mint if called by otherAccount", async function () {
      const { 
        unitedswaptoken,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await expect(unitedswaptoken.connect(otherAccount)['mint(uint256)'](mintAmount)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should be able to transfer/transferFrom back and forth", async function () {
      const { 
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await unitedswaptoken['mint(uint256)'](mintAmount);

      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);

      await unitedswaptoken.transfer(otherAccount.address, mintAmount.div(2));
      expect(await unitedswaptoken.balanceOf(otherAccount.address)).to.equal(mintAmount.div(2));
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount.div(2));

      await unitedswaptoken.connect(otherAccount).transfer(owner.address, mintAmount.div(2));
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);
      expect(await unitedswaptoken.balanceOf(otherAccount.address)).to.equal(0);

      await unitedswaptoken.approve(otherAccount.address, mintAmount);
      await unitedswaptoken.connect(otherAccount).transferFrom(owner.address, otherAccount.address, mintAmount);
    });
  });
  describe("Solidity Coverage", function () {
    it("Should set the right owner", async function () {
      const {
        unitedswaptoken,
        owner
      } = await loadFixture(deployUnitedSwapTokenFixture);

      expect(await unitedswaptoken.getOwner()).to.equal(owner.address);
    });

    it("Should set the right decimals", async function () {
      const {
        unitedswaptoken,
      } = await loadFixture(deployUnitedSwapTokenFixture);

      expect(await unitedswaptoken.decimals()).to.equal(18);
    });

    it("Should check, set, increase, and decrease approve/allowance", async function () {
      const {
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const approveAmmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.allowance(owner.address, otherAccount.address)).to.equal(0);
      await unitedswaptoken.approve(otherAccount.address, approveAmmount)
      expect(await unitedswaptoken.allowance(owner.address, otherAccount.address)).to.equal(approveAmmount);
      await unitedswaptoken.increaseAllowance(otherAccount.address, approveAmmount.mul(2))
      await unitedswaptoken.decreaseAllowance(otherAccount.address, approveAmmount.div(2))
    });

    it("Should check, set, increase, and decrease approve/allowance", async function () {
      const {
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const approveAmmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.allowance(owner.address, otherAccount.address)).to.equal(0);
      await unitedswaptoken.approve(otherAccount.address, approveAmmount)
      expect(await unitedswaptoken.allowance(owner.address, otherAccount.address)).to.equal(approveAmmount);
      await unitedswaptoken.increaseAllowance(otherAccount.address, approveAmmount.mul(2))
      await unitedswaptoken.decreaseAllowance(otherAccount.address, approveAmmount.div(2))
    });
  });
});
