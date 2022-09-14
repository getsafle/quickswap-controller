const axios = require('axios');
const { ChainId, Token, TokenAmount, Route, TradeType, Trade, Fetcher, WETH } = require('quickswap-sdk')

const { ethers, Contract } = require('ethers')
const { SWAP_ROUTER_ADDRESS, ETHEREUM_ADDRESS, INFURA_RPC, ERROR_MESSAGES: { NULL_ROUTE, INVARIANT_ADDRESS, QUOTE_OF_NULL, TOKEN_PAIR_DOESNOT_EXIST, INSUFFICIENT_BALANCE } } = require('./const')
const web3Utils = require('web3-utils')
const { TOKEN_CONTRACT_ABI } = require('./tokenABI')
const { SWAP_CONTRACT_ABI } = require('./swapABI')

const getRequest = async ({ url }) => {
    try {
        const response = await axios({
            url: `${url}`,
            method: 'GET',
        });
        return { response: response.data };
    } catch (error) {
        return { error: [{ name: 'server', message: `There is some issue, Please try after some time. ${error.message && error.message}`, data: error.response && error.response.data ? error.response.data : {} }] };
    }
};

const isAddressETH = (address) => {
    if (address.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase() || address.toLowerCase() === 'eth'.toLowerCase())
        return true;
    else
        return false;
}

const transactionBuilder = async ({
    walletAddress,
    _toContractAddress,
    toContractDecimal,
    _fromContractAddress,
    fromContractDecimal,
    toQuantity,
    fromQuantity,
    slippageTolerance
}) => {
    try {
        const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_RPC);
        const WRAPPED_ETHEREUM_ADDRESS = WETH[ChainId.MATIC].address

        let fromEth = false, toEth = false, swapTokens = false;
        let toContractAddress = _toContractAddress, fromContractAddress = _fromContractAddress;

        if (isAddressETH(_fromContractAddress)) {
            fromEth = true;
            fromContractAddress = WRAPPED_ETHEREUM_ADDRESS
        }
        else if (isAddressETH(_toContractAddress)) {
            toEth = true;
            toContractAddress = WRAPPED_ETHEREUM_ADDRESS
        }
        else swapTokens = true;

        let fromToken = new Token(
            ChainId.MATIC,
            fromContractAddress,
            fromContractDecimal
        );

        let toToken = new Token(
            ChainId.MATIC,
            toContractAddress,
            toContractDecimal
        );
        const pair_from_to = await Fetcher.fetchPairData(fromToken, toToken)
        const route_from_to = new Route([pair_from_to], fromToken)

        console.log(route_from_to.midPrice.toSignificant(6)) // 201.306
        console.log(route_from_to.midPrice.invert().toSignificant(6)) // 0.00496756

        const trade = new Trade(route_from_to, new TokenAmount(fromToken, `${fromQuantity}`), TradeType.EXACT_INPUT)

        console.log(trade)

        console.log(trade.executionPrice.toSignificant(6))
        console.log(trade.nextMidPrice.toSignificant(6))

        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
        const amountInMax = trade.maximumAmountIn(slippageTolerance).raw // needs to be converted to e.g. hex
        const path = [fromContractAddress, toContractAddress]
        const to = ethers.utils.getAddress(SWAP_ROUTER_ADDRESS) // should be a checksummed recipient address
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
        const value = trade.inputAmount.raw // // needs to be converted to e.g. hex

        const contract = new Contract(SWAP_ROUTER_ADDRESS, SWAP_CONTRACT_ABI, web3Provider);

        let data, gas;
        if (fromEth) {
            data = contract.interface.encodeFunctionData('swapExactETHForTokens', [amountOutMin, path, to, deadline])
            gas = web3Utils.hexToNumber((await contract.estimateGas.swapExactETHForTokens(amountOutMin, path, to, deadline, { from: walletAddress }))._hex)
        }
        else if (toEth) {
            data = contract.interface.encodeFunctionData('swapTokensForExactETH', [amountOutMin, amountInMax, path, to, deadline])
            gas = web3Utils.hexToNumber((await contract.estimateGas.swapTokensForExactETH(amountOutMin, amountInMax, path, to, deadline, { from: walletAddress }))._hex)
        }
        else if (swapTokens) {
            data = contract.interface.encodeFunctionData('swapTokensForExactTokens', [amountOutMin, amountInMax, path, to, deadline])
            gas = web3Utils.hexToNumber((await contract.estimateGas.swapTokensForExactTokens(amountOutMin, amountInMax, path, to, deadline, { from: walletAddress }))._hex)
        }

        const tx = {
            from: walletAddress,
            to,
            data,
            gas,
            gasPrice: web3Utils.hexToNumber((await web3Provider.getGasPrice())._hex),
            value
        };

        return { tx, outputAmount: amountOutMin };
    } catch (error) {
        throw error
    }
}

const rawTransaction = async ({
    walletAddress,
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    toQuantity,
    fromQuantity,
    slippageTolerance
}) => {
    try {
        await checkBalance(fromContractAddress, walletAddress, fromQuantity)
        const { tx: transaction } = await transactionBuilder({
            walletAddress,
            toContractAddress,
            toContractDecimal,
            fromContractAddress,
            fromContractDecimal,
            toQuantity,
            fromQuantity,
            slippageTolerance
        })
        if (!transaction)
            throw new Error(NULL_ROUTE)
        return { transaction };
    } catch (error) {
        throw error
    }
}

const getExchangeRate = async ({
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    fromQuantity,
    slippageTolerance
}) => {
    try {
        const { tx: transaction, outputAmount } = await transactionBuilder({
            walletAddress: null,
            toContractAddress,
            toContractDecimal,
            fromContractAddress,
            fromContractDecimal,
            toQuantity: 0,
            fromQuantity,
            slippageTolerance
        })
        if (!transaction)
            throw new Error(NULL_ROUTE)
        const response = {
            toTokenAmount: outputAmount,
            fromTokenAmount: fromQuantity.toString(),
            estimatedGas: transaction.gas
        };
        return { response };
    } catch (error) {
        throw error
    }
}

const getEstimatedGas = async ({
    toContractAddress,
    toContractDecimal,
    fromContractAddress,
    fromContractDecimal,
    fromQuantity,
    slippageTolerance
}) => {
    try {
        const { tx: transaction } = await transactionBuilder({
            walletAddress: null,
            toContractAddress,
            toContractDecimal,
            fromContractAddress,
            fromContractDecimal,
            toQuantity: 0,
            fromQuantity,
            slippageTolerance
        })
        if (!transaction)
            throw new Error(NULL_ROUTE)
        const response = {
            estimatedGas: transaction.gas
        };
        return { response };
    } catch (error) {
        throw error
    }
}

const setErrorResponse = (err) => {
    switch (err.message) {
        case INVARIANT_ADDRESS:
        case QUOTE_OF_NULL:
        case NULL_ROUTE:
            return { err, message: TOKEN_PAIR_DOESNOT_EXIST }
        case INSUFFICIENT_BALANCE:
            return { err, message: INSUFFICIENT_BALANCE }
        default:
            return { err, message: err.message }
    }
}

const checkBalance = async (fromContractAddress, walletAddress, fromQuantity) => {
    try {
        let tokenBalance;
        const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_RPC);
        if (isAddressETH(fromContractAddress)) {
            tokenBalance = await web3Provider.getBalance(walletAddress)
        } else {
            const contract = new Contract(fromContractAddress, TOKEN_CONTRACT_ABI, web3Provider);
            tokenBalance = await contract.balanceOf(walletAddress);
        }
        if (Number(tokenBalance) < fromQuantity)
            throw new Error(INSUFFICIENT_BALANCE)
        else
            return true
    } catch (err) {
        throw err
    }
}

const approvalRawTransaction = async ({
    fromContractAddress, walletAddress, fromQuantity
}) => {
    try {
        await checkBalance(fromContractAddress, walletAddress, fromQuantity)
        if (isAddressETH(fromContractAddress))
            return { response: true }
        else {
            const web3Provider = new ethers.providers.JsonRpcProvider(INFURA_RPC);
            const contract = new Contract(fromContractAddress, TOKEN_CONTRACT_ABI, web3Provider);
            const checkAllowance = await contract.allowance(walletAddress, SWAP_ROUTER_ADDRESS);
            if (Number(checkAllowance) < fromQuantity) {
                const tx = {
                    from: walletAddress,
                    to: fromContractAddress,
                    data: contract.interface.encodeFunctionData('approve', [SWAP_ROUTER_ADDRESS, fromQuantity]),
                    gas: web3Utils.hexToNumber((await contract.estimateGas.approve(SWAP_ROUTER_ADDRESS, fromQuantity, { from: walletAddress }))._hex),
                    gasPrice: web3Utils.hexToNumber((await web3Provider.getGasPrice())._hex),
                    value: '0'
                };
                return { response: tx }
            }
            else
                return { response: true }
        }
    } catch (err) {
        throw err
    }
}

module.exports = { getRequest, rawTransaction, getExchangeRate, getEstimatedGas, setErrorResponse, approvalRawTransaction };

