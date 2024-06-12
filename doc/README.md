# Guía de Instalación y Configuración

## Antes de empezar

Debes de asegurarte de que en tu equipo hay instalado:
- Node.js, versión 20.12.2 o mayor
- PHP, versión 8.2.15 o mayor
- Composer, versión 2.7.0 o mayor

## Instalación de Dependencias

Una vez comprobado que tienes todo instalado, ejecuta los siguientes comandos:

<!-- - En Frontend/my-app:  -->
- En Frontend/my-app: `npm i`
- En Backend/CivicAid: `composer install`
- En Backend/node: `npm i`

## Configurar aplicación
### Archivos .env
Antes de poder iniciar la aplicación, debes configurar los 3 archivos .env que hay.

#### Archivo .env de React
En my-app hay un .env con las URLs de Laravel y Node. La URL de Laravel debe ser http://localhost:8000 (cambia el puerto si es necesario, pero Laravel se ejecuta automáticamente en el puerto 8000). La URL de Node debe ser http://localhost:7500 o el puerto que tú le quieras especificar en el index.js de Node.

#### Archivo .env de Node
En este .env, igual que en el de React, debes poner la misma URL de Laravel, es decir, http://localhost:8000.

#### Archivo .env de Laravel
- Aquí debes configurar la conexión de tu Base de Datos y el servicio de Mail:

```bash
    DB_CONNECTION=mysql
    DB_HOST=
    DB_PORT=3306
    DB_DATABASE=nombre_BBDD
    DB_USERNAME=usuario_BBDD
    DB_PASSWORD=password_BBDD

    MAIL_MAILER=smtp
    MAIL_HOST=daw.inspedralbes.cat
    MAIL_PORT=587
    MAIL_USERNAME=usuario_mail
    MAIL_PASSWORD=password_mail
    MAIL_ENCRYPTION=tls
    MAIL_FROM_ADDRESS="usuarioEmail_que_envia_los_emails"
    MAIL_FROM_NAME="${APP_NAME}"
```

## Iniciar la Aplicación
Una vez los archivos .env están configurados correctamente, debemos iniciar React, Laravel y Node.js.

- React: Dirígete a Frontend/my-app, abre un terminal y ejecuta: `npm start`
- Laravel: Dirígete a Backend/CivicAid, abre un terminal y ejecuta: `php artisan migrate` para crear las tablas en la base de datos. Cuando termine de crear las tablas, ejecuta: `php artisan db:seed` para rellenar las tablas de sectores y provincias. Por último, ejecuta: `php artisan serve` para ejecutar Laravel.
- Node: Dirígete a Backend/node, abre un terminal y ejecuta: `node index.js`

Siguiendo estos pasos, tendrás tu aplicación configurada y en funcionamiento localmente.


## Manual de Producción

### Antes de empezar
Desde el panel de tu proveedor de hosting debes abrir/levantar los puertos: 80, 443, 7500, 8000 y 8080. Si no lo haces, la aplición, no funcionará.
Asegurate de que el cortafuegos esta desactivado: `sudo iptables -F`
Debes de asegurarte de que en tu servidor hay instalado:
- Node.js, versión 12.22.9 o mayor
- PHP, versión 8.3.6 o mayor
- Composer, versión 2.7.0 o mayor

### Nginx
En este caso vamos a utilizar Nginx como servidor web, aquí tienes una guía de instalación de este: https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubu (asegurate de llegar hasta el paso 5)

(El siguiente paso es recomendable hacerlo con WinSCP, simplemente, si no lo tienes instalalo, abrelo e importa el sitio de Putty)
1. React: 
    - En el archivo .env de react, asegurate de que la URL de Laravel apunte a "https://civic.civicaid.daw.inspedralbes.cat/laravel" y la de node a "https://civic.civicaid.daw.inspedralbes.cat"
    - Ejecuta `npm run build` en la carpeta de React
    - Ve a `/var/www/html` en tu servidor. En esta carpeta debes soltar el CONTENIDO, no la carpeta, del build de React

2. Laravel:
    - En la misma ruta (`/var/www/html`) crea una carpeta llamada "laravel". Entra en ella
    - Arrastra todo el CONTENIDO de Laravel dentro (el proceso de subida tardará un rato)
    - Una vez subido debemos asignar los permisos correctos para el usuario "www-data", el usuario por defecto del servidor web Apache y Nginx. Para esto vamos a `/var/www/html` y ejecutamos `sudo chown -R www-data:www-data laravel`. Cambia el grupo propietario de las carpetas "storage"  y "bootstrap" por tu usuario. Digamos que tu usuario es "ubuntu", en la carpeta "laravel" debes ejecutar: `sudo chgrp -R ubuntu storage` y `sudo chgrp -R ubuntu bootstrap`.
    - Archivo .env. En la variable APP_URL del archivo .env debe apuntar a tu dominio, como por ejemplo: APP_URL=https://civic.civicaid.daw.inspedralbes.cat. Y la variable APP_DEBUG debe ser igual a `false`
    - Generar clave. En la carpeta "laravel" ejecuta `php artisan key:generate` para generar una nueva clave. Esto va bien para asegurar la encriptación de datos, la sesión del usuario y otros aspectos de seguridad en la aplicación.
    - Optimizar los archivos de Laravel. Para ello sigue la documentación oficial de Laravel (https://laravel.com/docs/11.x/deployme), pero OJO, haz solo la parte de "OPTIMIZATION" y solo las partes que hagan falta. No queremos configurar nada de Nginx, todavía

3. Node:
    - En la misma ruta (`/var/www/html`) crea una carpeta llamada "node". Entra en ella
    - Arrastra todo el CONTENIDO de Node dentro
    - Abre un terminal en `/var/www/html/node` y ejecuta `node index.js`


#### Archivo de configuración de tu dominio en Nginx
En `/etc/nginx/sites-available/` debes tener el archivo de tu dominio que has creado anteriormente en la instalación de Nginx. El contenido de ese archivo debe ser el siguiente:
```bash
    server {
        listen 80;
        listen [::]:80;

        server_name nombre_de_tu_dominio www.nombre_de_tu_dominio;

        root /var/www/html/;

        index index.html index.php index.nginx-debian.html;

        # Configuración para React
        location / {
            try_files $uri $uri/ /index.php?$query_string;

        }

        # Configuración para Laravel
        location ^~ /laravel {
            alias /var/www/html/laravel/public;
            try_files $uri $uri/ @laravel;
            

            # Manejo de archivos PHP con PHP-FPM para Laravel
            location ~ \.php$ {
                fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
                fastcgi_param SCRIPT_FILENAME $request_filename;
                include fastcgi_params;
            
                fastcgi_hide_header X-Powered-By;

            }
        }

        location @laravel {
            rewrite /laravel/(.*)$ /laravel/index.php?/$1 last;
        }


        location ~ /\.ht {
            deny all;
        }

        # Proxy inverso para Node.js
        location /node {
            proxy_pass http://127.0.0.1:7500;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
```

## Estilos de Tailwind
Practicamente todas las animaciones con Tailwind avanzado están sacadas de aqui: https://tw-elements.com/












