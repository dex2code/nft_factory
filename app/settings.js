
const logPrefix = 'NFT Factory';
const walletDownloadURL = 'https://metamask.io/download/';


var activeWalletAccount = null;
var displayWalletAccount = null;


const appDebug = true;


const appSmartContract = '0x5d219F6Ccc32A812f2268200A0614EB7654c8E48';


/*
const appChainId = '0x89';
const appChainName = 'Polygon Mainnet';
const appChainRPC = 'https://polygon-rpc.com/';
const appChainExplorer = 'https://polygonscan.com';
const appChainCurrency = {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
};
*/

const appChainId = '0x13881';
const appChainName = 'Polygon Mumbai';
const appChainRPC = 'https://rpc-mumbai.polygon.technology/';
const appChainExplorer = 'https://mumbai.polygonscan.com';
const appChainCurrency = {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
};


const nftStorageKey = null;

const ipfsGateway = 'https://ipfs.io/ipfs/';
