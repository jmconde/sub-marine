"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRequestMessage(method, params) {
    return {
        methodCall: {
            methodName: method,
            params: params.map(d => { return { param: { value: { string: d } } }; })
        }
    };
}
exports.getRequestMessage = getRequestMessage;
//# sourceMappingURL=opensubtitle-utils.js.map