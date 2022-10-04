const request = (url, options) => {
    const abortController = new AbortController()

    const promise = new Promise((resolve, reject) => {
        fetch(url, {
            ...options,
            credentials: 'include',
            redirect: 'manual',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
                ...options.headers,
            },
            signal: abortController.signal,
        })
            .then((response) => {
                if (response.status !== 200) {
                    reject('Request failed', response.statusText)
                    return
                }
                try {
                    resolve(response.json())
                } catch (e) {
                    resolve(response.text())
                }
            })
            .catch((e) => {
                console.error('Network error: ', e)
                reject('Network error')
            })
    })

    promise.abort = () => abortController.abort()
    return promise
}

export const get = (url) => request(url, { method: 'GET' })
export const post = (url, body) =>
    request(url, {
        method: 'POST',
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

const checkAuthenticationStatus = async (server) => {
    try {
        await get(`${server}/api/me?fields=username`)
        return true
    } catch {
        // Note: this also fails if the server is down or gives any error
        return false
    }
}

export const attemptLogin = async ({
    server,
    username,
    password,
    mfaToken,
    onSuccess,
    onFailure,
}) => {
    try {
        const authData = {
            j_username: username,
            j_password: password,
            '2fa': mfaToken ? '2fa' : undefined,
            '2fa_code': mfaToken || undefined,
        }
        const postBody = Object.entries(authData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&')
        await post(`${server}/dhis-web-commons-security/login.action`, postBody)
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                'TODO: This will always error and cancel the request until we get a real login endpoint!'
            )
        }
    }

    const succeeded = await checkAuthenticationStatus(server)
    if (succeeded) {
        console.log(`Login successful for ${username} (${server})`)
        onSuccess()
    } else {
        console.log(`Login attempt failed for ${username} (${server})`)
        onFailure()
    }
}
