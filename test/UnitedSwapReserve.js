const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UnitedSwap Reserve", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployUnitedSwapReserveFixture() {
    const [owner, burnAdmin, otherAccount] = await ethers.getSigners();

    const UnitedSwapToken = await ethers.getContractFactory("UnitedSwapToken");
    const unitedswaptoken = await UnitedSwapToken.deploy();

    unitedswaptoken.deployed()

    const UnitedSwapReserve = await ethers.getContractFactory("UnitedSwapReserve");
    const unitedswapreserve = await UnitedSwapReserve.deploy(unitedswaptoken.address, burnAdmin.address);

    await unitedswapreserve.deployed()
    await unitedswaptoken.transferOwnership(unitedswapreserve.address)

    return { unitedswapreserve, unitedswaptoken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should be deployed", async function () {
      const {
        unitedswaptoken,
        owner
      } = await loadFixture(deployUnitedSwapReserveFixture);

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
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await unitedswaptoken['mint(uint256)'](mintAmount)
      ownerBalance = await unitedswaptoken.balanceOf(owner.address)
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);
    });

    it("Should not mint if called by otherAccount", async function () {
      const { 
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");
      let ownerBalance;

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await expect(unitedswaptoken.connect(otherAccount)['mint(uint256)'](mintAmount)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should be able to transfer back and forth", async function () {
      const { 
        unitedswaptoken,
        owner,
        otherAccount
      } = await loadFixture(deployUnitedSwapTokenFixture);

      const mintAmount = ethers.utils.parseUnits("100");

      expect(await unitedswaptoken.totalSupply()).to.equal("0");

      await unitedswaptoken['mint(uint256)'](mintAmount);

      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);

      await unitedswaptoken.transfer(otherAccount.address, mintAmount);
      expect(await unitedswaptoken.balanceOf(otherAccount.address)).to.equal(mintAmount);
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(0);

      await unitedswaptoken.connect(otherAccount).transfer(owner.address, mintAmount);
      expect(await unitedswaptoken.balanceOf(owner.address)).to.equal(mintAmount);
      expect(await unitedswaptoken.balanceOf(otherAccount.address)).to.equal(0);
    });
  });
});
