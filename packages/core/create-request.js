const apiConfig = require('./api-config');

const API_HOST = 'http://localhost:3000';

const compileUrl = (url, params) => {
    const resultArr = [];
    const options = Object.assign({}, params);

    const pathArr = url.split('/');

    pathArr.forEach((item) => {
        if (item[0] === ':') {
            if (item[item.length - 1] === '?') {
                const key = item.substring(1, item.length - 1);
                if (options[key]) {
                    resultArr.push(options[key]);
                    delete options[key];
                }
            } else {
                const key = item.substring(1);
                if (options[key]) {
                    resultArr.push(options[key]);
                    delete options[key];
                } else {
                    // eslint-disable-next-line no-console
                    console.error(new Error('can not find parameter'));
                }
            }
        } else {
            resultArr.push(item);
        }
    });

    let resultString = resultArr.join('/');

    Object.keys(options).forEach((key, index) => {
        resultString += `${index === 0 ? '&' : '?'}${key}=${options[key]}`;
    });

    return resultString;
};

module.exports = (requestName, queryOptions, body) => {
    const options = apiConfig[requestName];

    if (!options) {
        return Promise.reject();
    }

    return new Promise((resolve) => {
        const requestUrl = API_HOST + compileUrl(options.path, queryOptions);

        fetch(requestUrl, {
            headers: new Headers({
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }),
            method: options.method || 'GET',
            //mode: 'no-cors',
            body: body ? JSON.stringify(body) : undefined,
        })
            .then((response) => response.json())
            .then((response) => {
                console.log(response);
                response.messages = response.messages || [];
                resolve(response);
            })
            .catch(() => {
                // eslint-disable-next-line no-console
                console.log({
                    status: 'BAD_REQUEST',
                    messages: [{ type: 'ERROR', code: 'BAD_REQUEST' }],
                });
                resolve({
                    status: 'BAD_REQUEST',
                    messages: [{ type: 'ERROR', code: 'BAD_REQUEST' }],
                });
            });
    });
};