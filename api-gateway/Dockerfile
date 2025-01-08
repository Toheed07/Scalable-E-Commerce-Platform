# Use the official nginx image as base
FROM nginx:alpine

# Remove the default nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Create directory for error pages
RUN mkdir -p /usr/share/nginx/html

# Create a simple 50x error page
RUN echo "<!DOCTYPE html><html><head><title>Server Error</title></head><body><h1>Server Error</h1><p>Sorry, something went wrong.</p></body></html>" > /usr/share/nginx/html/50x.html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]