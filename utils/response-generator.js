exports.getResponseWithMessage = function (statusCode, message) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            message: message
        })
    };
};

exports.getResponseWithObject = function (statusCode, values) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(values)
    };
};

exports.getUnauthorizedResponse = function () {
    return {
        statusCode: 400,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            message: "Access Denied"
        })
    }
}