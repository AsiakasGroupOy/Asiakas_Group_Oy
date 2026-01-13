from flask import request, g
import time
import logging

logger = logging.getLogger("app")


def init_request_logging(app):
    @app.before_request
    def before_request():
        g.start_time = time.time()
        logger.info(
            "Request started: ip=%s method=%s path=%s",
                request.remote_addr,
                request.method,
                request.path,
        )

    @app.after_request
    def after_request(response):
        duration = round(time.time() - g.start_time, 3)

        logger.info(
            "Request finished method=%s path=%s status=%s duration=%ss",
            request.method,
            request.path,
            response.status_code,
            duration
        )
        return response