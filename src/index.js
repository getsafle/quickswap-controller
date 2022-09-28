const helper = require('./utils/helper')
const web3Utils = require('web3-utils')
const tokenList = require('@getsafle/safle-token-lists')

class Quickswap {

    constructor(chain) { 
        this.chain = chain;
    }

  
    async getSupportedTokens() {
        const tokens = await tokenList.getTokensOneInch(this.chain);
        return tokens;
    }

    async getExchangeRate({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance, walletAddress }) {
        try {
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
            const { response } = await helper.getExchangeRate(
                {
                    walletAddress: _walletAddress,
                    toContractAddress: _toContractAddress,
                    toContractDecimal,
                    fromContractAddress: _fromContractAddress,
                    fromContractDecimal,
                    fromQuantity,
                    slippageTolerance
                }
            );
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }

    async getEstimatedGas({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance }) {
        try {
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
            const { response } = await helper.getEstimatedGas({
                walletAddress: _walletAddress,
                toContractAddress: _toContractAddress,
                toContractDecimal,
                fromContractAddress: _fromContractAddress,
                fromContractDecimal,
                fromQuantity,
                slippageTolerance
            });
            return { estimatedGas: response.estimatedGas };
        } catch (error) {
            throw helper.setErrorResponse(error)
        }

    }

    async getRawTransaction({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, toQuantity, fromQuantity, slippageTolerance }) {
        try {
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
            const { response } = await helper.rawTransaction(
                {
                    walletAddress: _walletAddress,
                    toContractAddress: _toContractAddress,
                    toContractDecimal,
                    fromContractAddress: _fromContractAddress,
                    fromContractDecimal,
                    toQuantity,
                    fromQuantity,
                    slippageTolerance
                });
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }

    async approvalRawTransaction({ fromContractAddress, walletAddress, fromQuantity }) {
        try {
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const _walletAddress = web3Utils.toChecksumAddress(walletAddress)
            const { response } = await helper.approvalRawTransaction(
                {
                    walletAddress: _walletAddress,
                    fromContractAddress: _fromContractAddress,
                    fromQuantity,
                });
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }
}

module.exports = Quickswap;