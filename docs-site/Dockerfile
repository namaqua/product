# Documentation Site Dockerfile
FROM nginx:alpine

# Copy documentation files
COPY ./docs /usr/share/nginx/html/docs
COPY ./docs-site/index.html /usr/share/nginx/html/index.html
COPY ./docs-site/nginx.conf /etc/nginx/nginx.conf

# Create non-root user for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]