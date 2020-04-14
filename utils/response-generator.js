exports.getResponseWithMessage = function (errorCode, message) {
    return {
        statusCode: errorCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            message: message
        })
    }
}