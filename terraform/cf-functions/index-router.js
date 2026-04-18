// CloudFront Function — runs on every viewer request (runtime: cloudfront-js-2.0)
// Next.js static export with trailingSlash:true generates /about/index.html
// CloudFront's DefaultRootObject only handles the root "/", not sub-paths.
// This function appends index.html to bare directory requests before S3 lookup.

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri.endsWith('/')) {
        // /about/ → /about/index.html
        request.uri += 'index.html';
    } else if (!uri.includes('.')) {
        // /about → /about/index.html  (no file extension = directory route)
        request.uri += '/index.html';
    }

    return request;
}
