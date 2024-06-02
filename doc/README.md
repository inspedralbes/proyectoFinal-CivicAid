<!-- # Documentació bàsica del projecte
Ha d'incloure, com a mínim
## Instruccions per desplegar el projecte a producció
Quins fitxers s'han d'editar i com (típicament per connectar la BD etc...)

## Instruccions per seguir codificant el projecte
eines necessaries i com es crea l'entorn per que algú us ajudi en el vostre projecte.

## API / Endpoints / punts de comunicació
Heu d'indicar quins són els punts d'entrada de la API i quins són els JSON que s'envien i es reben a cada endpoint -->

# Guía de Instalación y Configuración

## Antes de empezar

Debes de asegurarte de que en tu equipo hay instalado:
- Node.js, versión 20.12.2 o mayor
- PHP, versión 8.2.15 o mayor
- Composer, versión 2.7.0 o mayor

## Instalación de Dependencias

Una vez comprobado que tienes todo instalado, ejecuta los siguientes comandos:

<!-- - En Frontend/my-app:  -->
`proyectoFinal-CivicAid\Frontend\my-app> npm i`
- En Backend/CivicAid: `composer install`
- En Backend/node: `npm i`

## Configurar aplicación
### Archivos .env
Antes de poder iniciar la aplicación, debes configurar los 2 archivos .env que hay.

#### Archivo .env frontend
En my-app hay un .env con las URLs de Laravel y Node. La URL de Laravel debe ser http://localhost:8000 (cambia el puerto si es necesario, pero Laravel se ejecuta automáticamente en el puerto 8000). La URL de Node debe ser http://localhost:7500 o el puerto que tú le quieras especificar en el index.js de Node.

#### Archivo .env de Laravel
- Aquí debes configurar la conexión de tu Base de Datos y el servicio de Mail:

```bash
    DB_CONNECTION=mysql
    DB_HOST=daw.inspedralbes.cat
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
    MAIL_FROM_ADDRESS="cuentaEmail_que_envia_los_emails"
    MAIL_FROM_NAME="${APP_NAME}"
```

#### Archivo .env de Node
En este .env, igual que en el de React, debes poner la misma URL de Laravel, es decir, http://localhost:8000.

## Iniciar la Aplicación
Una vez los archivos .env están configurados correctamente, debemos iniciar React, Laravel y Node.js.

- React: Dirígete a Frontend/my-app, abre un terminal y ejecuta: `npm start`
- Laravel: Dirígete a Backend/CivicAid, abre un terminal y ejecuta: `php artisan migrate` para crear las tablas en la base de datos. Cuando termine de crear las tablas, ejecuta: `php artisan db:seed` para rellenar las tablas de sectores y provincias. Por último, ejecuta: `php artisan serve` para ejecutar Laravel.
- Node: Dirígete a Backend/node, abre un terminal y ejecuta: `node index.js`

Siguiendo estos pasos, tendrás tu aplicación configurada y en funcionamiento.














