export namespace HTTP {
    export namespace INFORMATIONAL {
        /**
         * 100 Continue: Indicates that the initial part of a request has been received and has not yet been rejected by the server.
         */
        export const CONTINUE = 100;

        /**
         * 101 Switching Protocols: Indicates that the server is switching protocols as requested by the client.
         */
        export const SWITCHING_PROTOCOLS = 101;

        /**
         * 102 Processing: Indicates that the server has received and is processing the request, but no response is available yet.
         */
        export const PROCESSING = 102;

        /**
         * 103 Early Hints: Used to return some response headers before the final response, often used with preloading.
         */
        export const EARLY_HINTS = 103;
    }

    export namespace SUCCESS {
        /**
         * 200 OK: Indicates that the request has succeeded.
         */
        export const OK = 200;

        /**
         * 201 Created: Indicates that the request has succeeded and a new resource has been created.
         */
        export const CREATED = 201;

        /**
         * 202 Accepted: Indicates that the request has been accepted for processing, but the processing is not complete.
         */
        export const ACCEPTED = 202;

        /**
         * 203 Non-Authoritative Information: Indicates that the request was successful but the returned meta-information is not from the origin server.
         */
        export const NON_AUTHORITATIVE_INFORMATION = 203;

        /**
         * 204 No Content: Indicates that the server successfully processed the request, but is not returning any content.
         */
        export const NO_CONTENT = 204;

        /**
         * 205 Reset Content: Indicates that the server successfully processed the request and the user agent should reset the document view.
         */
        export const RESET_CONTENT = 205;

        /**
         * 206 Partial Content: Indicates that the server is delivering only part of the resource due to a range header sent by the client.
         */
        export const PARTIAL_CONTENT = 206;

        /**
         * 207 Multi-Status: Used for WebDAV; provides information about multiple resources in a single response.
         */
        export const MULTI_STATUS = 207;

        /**
         * 208 Already Reported: Used in WebDAV; indicates that the members of a DAV binding have already been enumerated in a previous reply.
         */
        export const ALREADY_REPORTED = 208;

        /**
         * 226 IM Used: Indicates that the server has fulfilled a request for the resource and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
         */
        export const IM_USED = 226;
    }

    export namespace REDIRECTION {
        /**
         * 300 Multiple Choices: Indicates that there are multiple options for the resource that the client may follow.
         */
        export const MULTIPLE_CHOICES = 300;

        /**
         * 301 Moved Permanently: Indicates that the resource has been permanently moved to a new URL.
         */
        export const MOVED_PERMANENTLY = 301;

        /**
         * 302 Found: Indicates that the resource is temporarily located at a different URL.
         */
        export const FOUND = 302;

        /**
         * 303 See Other: Indicates that the response to the request can be found at another URI using a GET method.
         */
        export const SEE_OTHER = 303;

        /**
         * 304 Not Modified: Indicates that the resource has not been modified since the last request.
         */
        export const NOT_MODIFIED = 304;

        /**
         * 305 Use Proxy: Indicates that the requested resource must be accessed through a proxy.
         */
        export const USE_PROXY = 305;

        /**
         * 306 Switch Proxy: No longer used; previously indicated that subsequent requests should use a different proxy.
         */
        export const SWITCH_PROXY = 306; // Deprecated

        /**
         * 307 Temporary Redirect: Indicates that the resource is temporarily located at a different URL, and the client should use the same method for the next request.
         */
        export const TEMPORARY_REDIRECT = 307;

        /**
         * 308 Permanent Redirect: Indicates that the resource has been permanently moved to a new URL, and the client should use the same method for future requests.
         */
        export const PERMANENT_REDIRECT = 308;
    }

    export namespace CLIENT_ERROR {
        /**
         * 400 Bad Request: Indicates that the server cannot or will not process the request due to a client error.
         */
        export const BAD_REQUEST = 400;

        /**
         * 401 Unauthorized: Indicates that the request requires user authentication.
         */
        export const UNAUTHORIZED = 401;

        /**
         * 402 Payment Required: Reserved for future
        /**
         * 402 Payment Required: Reserved for future use; indicates that payment is required to access the resource.
         */
        export const PAYMENT_REQUIRED = 402;

        /**
         * 403 Forbidden: Indicates that the server understood the request, but refuses to authorize it.
         */
        export const FORBIDDEN = 403;

        /**
         * 404 Not Found: Indicates that the server can't find the requested resource.
         */
        export const NOT_FOUND = 404;

        /**
         * 405 Method Not Allowed: Indicates that the request method is not supported for the requested resource.
         */
        export const METHOD_NOT_ALLOWED = 405;

        /**
         * 406 Not Acceptable: Indicates that the server cannot produce a response matching the list of acceptable values defined in the request's headers.
         */
        export const NOT_ACCEPTABLE = 406;

        /**
         * 407 Proxy Authentication Required: Indicates that the client must first authenticate itself with the proxy.
         */
        export const PROXY_AUTHENTICATION_REQUIRED = 407;

        /**
         * 408 Request Timeout: Indicates that the server timed out waiting for the request.
         */
        export const REQUEST_TIMEOUT = 408;

        /**
         * 409 Conflict: Indicates that the request could not be completed due to a conflict with the current state of the resource.
         */
        export const CONFLICT = 409;

        /**
         * 410 Gone: Indicates that the resource requested is no longer available and will not be available again.
         */
        export const GONE = 410;

        /**
         * 411 Length Required: Indicates that the server refuses to accept the request without a defined Content-Length.
         */
        export const LENGTH_REQUIRED = 411;

        /**
         * 412 Precondition Failed: Indicates that one or more conditions given in the request header fields evaluated to false.
         */
        export const PRECONDITION_FAILED = 412;

        /**
         * 413 Payload Too Large: Indicates that the request is larger than the server is willing or able to process.
         */
        export const PAYLOAD_TOO_LARGE = 413;

        /**
         * 414 URI Too Long: Indicates that the URI provided was too long for the server to process.
         */
        export const URI_TOO_LONG = 414;

        /**
         * 415 Unsupported Media Type: Indicates that the request entity has a media type which the server or resource does not support.
         */
        export const UNSUPPORTED_MEDIA_TYPE = 415;

        /**
         * 416 Range Not Satisfiable: Indicates that the server cannot provide the requested range for the resource.
         */
        export const RANGE_NOT_SATISFIABLE = 416;

        /**
         * 417 Expectation Failed: Indicates that the server cannot meet the requirements of the Expect request-header field.
         */
        export const EXPECTATION_FAILED = 417;

        /**
         * 418 I'm a teapot: An April Fools' joke; indicates that the server is a teapot and cannot brew coffee.
         */
        export const I_AM_A_TEAPOT = 418; // April Fools' joke

        /**
         * 421 Misdirected Request: Indicates that the request was directed at a server that is not able to produce a response.
         */
        export const MISDIRECTED_REQUEST = 421;

        /**
         * 422 Unprocessable Entity: Indicates that the server understands the content type of the request entity, but was unable to process the contained instructions.
         */
        export const UNPROCESSABLE_ENTITY = 422;

        /**
         * 423 Locked: Indicates that the resource that is being accessed is locked.
         */
        export const LOCKED = 423;

        /**
         * 424 Failed Dependency: Indicates that the request failed due to failure of a previous request.
         */
        export const FAILED_DEPENDENCY = 424;

        /**
         * 425 Too Early: Indicates that the server is unwilling to risk processing a request that might be replayed.
         */
        export const TOO_EARLY = 425;

        /**
         * 426 Upgrade Required: Indicates that the client should switch to a different protocol.
         */
        export const UPGRADE_REQUIRED = 426;

        /**
         * 428 Precondition Required: Indicates that the origin server requires the request to be conditional.
         */
        export const PRECONDITION_REQUIRED = 428;

        /**
         * 429 Too Many Requests: Indicates that the user has sent too many requests in a given amount of time.
         */
        export const TOO_MANY_REQUESTS = 429;

        /**
         * 431 Request Header Fields Too Large: Indicates that the server is unwilling to process the request because its header fields are too large.
         */
        export const REQUEST_HEADER_FIELDS_TOO_LARGE = 431;

        /**
         *
        /**
         * 451 Unavailable For Legal Reasons: Indicates that the server is denying access to the resource as a consequence of a legal demand.
         */
        export const UNAVAILABLE_FOR_LEGAL_REASONS = 451;
    }

    export namespace SERVER_ERROR {
        /**
         * 500 Internal Server Error: Indicates that the server encountered an unexpected condition that prevented it from fulfilling the request.
         */
        export const INTERNAL_SERVER_ERROR = 500;

        /**
         * 501 Not Implemented: Indicates that the server does not support the functionality required to fulfill the request.
         */
        export const NOT_IMPLEMENTED = 501;

        /**
         * 502 Bad Gateway: Indicates that the server, while acting as a gateway or proxy, received an invalid response from the upstream server.
         */
        export const BAD_GATEWAY = 502;

        /**
         * 503 Service Unavailable: Indicates that the server is currently unable to handle the request due to temporary overload or maintenance.
         */
        export const SERVICE_UNAVAILABLE = 503;

        /**
         * 504 Gateway Timeout: Indicates that the server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.
         */
        export const GATEWAY_TIMEOUT = 504;

        /**
         * 505 HTTP Version Not Supported: Indicates that the server does not support the HTTP protocol version that was used in the request.
         */
        export const HTTP_VERSION_NOT_SUPPORTED = 505;

        /**
         * 506 Variant Also Negotiates: Indicates that the server has an internal configuration error and cannot negotiate a variant for the requested resource.
         */
        export const VARIANT_ALSO_NEGOTIATES = 506;

        /**
         * 507 Insufficient Storage: Indicates that the server is unable to store the representation needed to complete the request.
         */
        export const INSUFFICIENT_STORAGE = 507;

        /**
         * 508 Loop Detected: Indicates that the server detected an infinite loop while processing a request.
         */
        export const LOOP_DETECTED = 508;

        /**
         * 510 Not Extended: Indicates that further extensions to the request are required for the server to fulfill it.
         */
        export const NOT_EXTENDED = 510;

        /**
         * 511 Network Authentication Required: Indicates that the client needs to authenticate to gain network access.
         */
        export const NETWORK_AUTHENTICATION_REQUIRED = 511;
    }
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function getSpanMs(span: { days: number, hours: number, minutes: number, seconds: number, millis: number } = { days: 0, hours: 0, minutes: 0, seconds: 0, millis: 0 }): number {
    return span.days * DAY + span.hours * HOUR + span.minutes * MINUTE + span.seconds * SECOND + span.millis;
}