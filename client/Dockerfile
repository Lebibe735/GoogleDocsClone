# Përdor versionin më të vogël dhe të lehtë të NGINX
FROM nginx:alpine

# Fshi faqet default të nginx
RUN rm -rf /usr/share/nginx/html/*

# Kopjo frontend-in statik (HTML, CSS, JS) në nginx folderin e shërbimit
COPY . /usr/share/nginx/html

# Eksporto portin që përdor nginx
EXPOSE 80

# Nisi nginx në foreground
CMD ["nginx", "-g", "daemon off;"]
