const config = require('./config');
const helper = require('./utils/helper')
const web3Utils = require('web3-utils')

class Uniswap {

    constructor() { }

    async getSupportedTokens() {
        try {
            const { response } = await helper.getRequest({ url: config.SUPPORTED_TOKENS_URL });
            return response;
        } catch (error) {
            throw helper.setErrorResponse(error)
        }
    }

    async getExchangeRate({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance }) {
        try {
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const { response } = await helper.getExchangeRate(
                {
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

    async getEstimatedGas({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance }) {
        try {
            const _toContractAddress = web3Utils.toChecksumAddress(toContractAddress)
            const _fromContractAddress = web3Utils.toChecksumAddress(fromContractAddress)
            const { response } = await helper.getEstimatedGas({
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

module.exports = Uniswap;