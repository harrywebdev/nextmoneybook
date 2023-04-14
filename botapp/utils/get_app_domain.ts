import * as process from "process";

export default function getAppDomain(withProtocol = true) {
    const appDomain = process.env.APP_DOMAIN || "";

    if (withProtocol) {
        if (appDomain.indexOf('http') >= 0) {
            return appDomain;
        }

        return `https://${appDomain}`;
    }

    // strip protocol
    return appDomain.replace(/http:\/\/|https:\/\//i, '');
}