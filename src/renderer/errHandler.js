function determineErrMessageInAlert(err) {
  console.error(err);
  const errResponse = err.response;
  if (errResponse) {
    const statusCode = errResponse.status;
    // Why '||'? On the BE some JS files return err responses with message field in data obj.
    const errResponseData = errResponse.data.message || errResponse.data;
    const statusText = errResponse.statusText;
    const errMsg = errResponseData ? errResponseData : statusText;
    // const status = err.response.status;
    // console.log(errResponse.statusText);
    return `Error ${statusCode}: ${errMsg}`;
  }
  const errMessage = err.message;
  if (errMessage === "Network Error") {
    return "Network Error. Check Internet connection or contact sys admin regarding server availability.";
  }
  window.electronAPI.addLog(err.message + " ; " + err.stack);
  return "An unknown error occured. Contact sys admin.";
}

export { determineErrMessageInAlert };
