<x-mail::message>
    # Hola, {{ $name }}

    Tu solicitud de registro ha sido aceptada. Aquí te dejamos los datos de tu usuario:

    # Email: {{ $email }}
    # Constraseña: {{ $password }}
    Gracias por tu paciencia,
    
    {{ config('app.name') }}
</x-mail::message>

