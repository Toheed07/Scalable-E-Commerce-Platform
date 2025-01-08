FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

RUN echo "<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>Server Error</h1><p>Sorry, something went wrong.</p></body></html>" > /usr/share/nginx/html/50x.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]