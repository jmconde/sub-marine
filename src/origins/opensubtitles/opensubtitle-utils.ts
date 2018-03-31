export function getRequestMessage (method: string, params: string[]): any {
  return  {
    methodCall: {
      methodName: method,
      params: params.map(d => {return { param: { value: {string: d}}}})
    }
  };
}