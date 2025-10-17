
// === Wallet RPC Guard v1 (clean) ===
(function strictRpcGuard(){
  const ALLOW = new Set([
    "eth_requestAccounts","eth_accounts",
    "eth_chainId","net_version",
    "eth_getBalance","eth_getCode","eth_blockNumber",
    "eth_call",
    "eth_getTransactionByHash","eth_getTransactionReceipt",
    "eth_getBlockByNumber","eth_getBlockByHash",
    "eth_estimateGas","eth_gasPrice","eth_feeHistory","eth_maxPriorityFeePerGas",
    "wallet_switchEthereumChain","wallet_requestPermissions","wallet_getPermissions"
  ]);

  const BLOCK = new Set([
    "eth_sendTransaction","eth_sendRawTransaction",
    "personal_sign","eth_sign","eth_signTypedData","eth_signTypedData_v3","eth_signTypedData_v4",
    "wallet_addEthereumChain","wallet_watchAsset"
  ]);

  const ERR_CODE_USER_REJECTED = 4001;

  function reject(method){
    const e = new Error(`Blocked by site policy: ${method}`);
    e.code = ERR_CODE_USER_REJECTED;
    return Promise.reject(e);
  }

  function wrap(eth){
    if (!eth) return eth;
    if (eth.__rpcGuardWrapped) return eth;

    const origRequest = typeof eth.request === "function" ? eth.request.bind(eth) : null;
    eth.request = (args) => {
      const method = args && args.method || "";
      if (BLOCK.has(method)) return reject(method);
      if (!ALLOW.has(method)) return reject(method);
      return origRequest ? origRequest(args) : Promise.reject(new Error("Provider does not support request()"));
    };

    // Some libs call send/sendAsync
    const origSend = typeof eth.send === "function" ? eth.send.bind(eth) : null;
    eth.send = (methodOrPayload, params) => {
      try {
        let method, payload;
        if (typeof methodOrPayload === "string") {
          method = methodOrPayload;
          payload = { method, params: params || [] };
        } else if (methodOrPayload && typeof methodOrPayload === "object") {
          payload = methodOrPayload;
          method = payload.method || "";
        } else {
          method = "";
          payload = { method: "" };
        }
        if (BLOCK.has(method) || !ALLOW.has(method)) {
          if (typeof params === "function") {
            const cb = params;
            setTimeout(()=>cb({ code: ERR_CODE_USER_REJECTED, message: `Blocked by site policy: ${method}` }, null), 0);
            return;
          }
          return reject(method);
        }
        return origSend ? origSend(methodOrPayload, params) : eth.request(payload);
      } catch(e) {
        return Promise.reject(e);
      }
    };

    const origSendAsync = typeof eth.sendAsync === "function" ? eth.sendAsync.bind(eth) : null;
    eth.sendAsync = (payload, cb) => {
      const method = payload && payload.method || "";
      if (BLOCK.has(method) || !ALLOW.has(method)) {
        const err = { code: ERR_CODE_USER_REJECTED, message: `Blocked by site policy: ${method}` };
        if (typeof cb === "function") setTimeout(()=>cb(err, null), 0);
        return;
      }
      if (origSendAsync) return origSendAsync(payload, cb);
      // emulate via request
      return eth.request(payload).then(
        (res)=>cb && cb(null, { id: payload && payload.id, jsonrpc: "2.0", result: res }),
        (err)=>cb && cb(err, null)
      );
    };

    eth.__rpcGuardWrapped = true;
    return eth;
  }

  function install(){
    if (window.ethereum) window.ethereum = wrap(window.ethereum);
    const iv = setInterval(()=>{
      if (window.ethereum && !window.ethereum.__rpcGuardWrapped) {
        window.ethereum = wrap(window.ethereum);
      }
    }, 100);
    setTimeout(()=>clearInterval(iv), 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
